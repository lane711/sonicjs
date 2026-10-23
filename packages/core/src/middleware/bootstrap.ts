import { Context, Next } from "hono";
import { loadCollectionConfigs } from "../services/collection-loader";
import { getCollectionRegistry } from "../services/collection-registry";
import { MigrationService } from "../services/migrations";
import { PluginBootstrapService } from "../services/plugin-bootstrap";
import { bootstrapDocumentTypes, autoRegisterCollectionDocumentTypes } from "../services/document-types-seed";
import { getHookSystem, hasHookSystem } from "../plugins/hooks/hook-system-singleton";
import { getTelemetryService } from "../services/telemetry-service"
import { SONICJS_VERSION } from "../utils/version";
import type { SonicJSConfig } from "../app";
import { setBranchLabel } from "../templates/layouts/admin-layout-catalyst.template";

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  JWT_SECRET?: string;
  CORS_ORIGINS?: string;
  ENVIRONMENT?: string;
};

// Track if bootstrap has been run in this worker instance
let bootstrapComplete = false;
const BOOTSTRAP_DEADLINE_MS = 20_000
let bootstrapInFlight: Promise<void> | null = null

/**
 * Verify security-critical environment configuration at startup.
 * Logs warnings in development, throws in production to prevent
 * insecure deployments from silently running.
 */
export function verifySecurityConfig(env: Bindings): void {
  const warnings: string[] = [];

  // Check JWT secret
  if (!env.JWT_SECRET) {
    warnings.push(
      "JWT_SECRET is not set — using hardcoded fallback. Set via `wrangler secret put JWT_SECRET`"
    );
  } else if (env.JWT_SECRET.includes("change-in-production")) {
    warnings.push(
      "JWT_SECRET contains the default value — tokens are forgeable. Generate a strong random secret"
    );
  }

  // Check CORS origins
  if (!env.CORS_ORIGINS) {
    warnings.push(
      "CORS_ORIGINS is not set — all cross-origin API requests will be rejected"
    );
  }

  // Check environment designation
  if (!env.ENVIRONMENT) {
    warnings.push(
      "ENVIRONMENT is not set — HSTS header will not be applied. Set to \"production\" or \"development\""
    );
  }

  if (warnings.length === 0) {
    return;
  }

  const isProduction = env.ENVIRONMENT === "production";

  for (const warning of warnings) {
    console.warn(`[SonicJS Security] ${warning}`);
  }

  if (isProduction) {
    // In production, a missing or default JWT_SECRET is a hard failure —
    // every token issued would be forgeable by anyone reading the source code.
    const hasCritical =
      !env.JWT_SECRET || env.JWT_SECRET.includes("change-in-production");
    if (hasCritical) {
      throw new Error(
        "[SonicJS Security] CRITICAL: Production deployment is missing a secure JWT_SECRET. " +
          "Set it via `wrangler secret put JWT_SECRET` before deploying."
      );
    }
  }
}

export function isBetterAuthSessionPath(path: string): boolean {
  const BETTER_AUTH_PREFIXES = [
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/sign-out',
    '/auth/get-session',
    '/auth/callback/',
    '/auth/token',
  ]
  // Must match exactly or as a segment prefix (e.g. /auth/sign-in/email), not as a substring
  // (/auth/sign-in-history must NOT match /auth/sign-in).
  return BETTER_AUTH_PREFIXES.some(p => {
    if (p.endsWith('/')) return path === p || path.startsWith(p)
    return path === p || path.startsWith(p + '/')
  })
}

/**
 * Bootstrap middleware that ensures system initialization
 * Runs once per worker instance
 */
export function bootstrapMiddleware(config: SonicJSConfig = {}) {
  return async (c: Context<{ Bindings: Bindings; Variables: { hookSystem?: unknown } }>, next: Next) => {
    if (hasHookSystem()) {
      (c as any).set("hookSystem", getHookSystem());
    }

    if (bootstrapComplete) {
      return next();
    }

    const path = c.req.path;
    if (
      path.startsWith("/images/") ||
      path.startsWith("/assets/") ||
      path === "/health" ||
      path.endsWith(".js") ||
      path.endsWith(".css") ||
      path.endsWith(".png") ||
      path.endsWith(".jpg") ||
      path.endsWith(".ico")
    ) {
      return next();
    }

    // Better Auth stateless session paths must not pay the cold-bootstrap tax.
    // These endpoints only touch auth_* tables (already migrated) and don't need
    // document types, collections, or plugins to be seeded.
    if (isBetterAuthSessionPath(path)) {
      return next();
    }

    const host = c.req.header('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    const gitBranch = (c.env as any).GIT_BRANCH as string | undefined;
    setBranchLabel(isLocalhost && gitBranch ? gitBranch : undefined);

    const cacheKv = (c.env as any).CACHE_KV as { get(k: string): Promise<string | null>; put(k: string, v: string, opts?: { expirationTtl?: number }): Promise<void>; delete(k: string): Promise<void> } | undefined;
    const bootstrapKey = `_sonicjs_bootstrap_v${SONICJS_VERSION}:${host}`;
    const syncedKey = `${bootstrapKey}:synced`;

    // Single-flight: collapse concurrent cold-start requests into one bootstrap.
    if (bootstrapInFlight) {
      try {
        await Promise.race([
          bootstrapInFlight,
          new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('bootstrap deadline')), BOOTSTRAP_DEADLINE_MS)
          ),
        ]);
      } catch {
        // Holder timed out or failed — give the next request a chance to take over.
        if (!bootstrapComplete) {
          bootstrapInFlight = null;
        }
      }
      if (bootstrapComplete) return next();
    }

    // Take the single-flight gate if nobody else holds it.
    if (!bootstrapInFlight) {
      let ownFlight: Promise<void>;
      let resolve!: () => void;
      ownFlight = new Promise<void>((r) => { resolve = r; });
      bootstrapInFlight = ownFlight;

      let fastPathTaken = false;

      try {
        // KV fast path: an isolate that has already bootstrapped this version can
        // skip the full cold bootstrap and only run the lightweight document-type
        // syncs (offloaded to waitUntil so they don't block the request).
        if (cacheKv) {
          try {
            const [flagVal, syncedVal] = await Promise.all([
              cacheKv.get(bootstrapKey),
              cacheKv.get(syncedKey),
            ]);

            if (flagVal === '1') {
              // Verify the flag is not stale (D1 could have been wiped on a new preview).
              let docTypeCount = 0;
              try {
                const row = await c.env.DB.prepare(
                  `SELECT COUNT(*) AS n FROM document_types`
                ).first<{ n: number }>();
                docTypeCount = row?.n ?? 0;
              } catch { /* DB not ready */ }

              if (docTypeCount === 0) {
                // Flag is stale — wipe it and fall through to full bootstrap.
                await cacheKv.delete(bootstrapKey);
              } else {
                // Fast path: syncs still run but off the critical path.
                if (syncedVal !== '1') {
                  const syncWork = async () => {
                    try {
                      await cacheKv.put(syncedKey, '1', { expirationTtl: 60 });
                      await bootstrapDocumentTypes(c.env.DB);
                      await autoRegisterCollectionDocumentTypes(c.env.DB);
                      // bootstrapDefaultContent is optional — only exists in some configurations
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const dts = await import('../services/document-types-seed') as any;
                      if (typeof dts.bootstrapDefaultContent === 'function') {
                        await dts.bootstrapDefaultContent(c.env.DB);
                      }
                    } catch { /* non-fatal */ }
                  };

                  let executionCtx: { waitUntil(p: Promise<unknown>): void } | undefined;
                  try {
                    executionCtx = c.executionCtx;
                  } catch { /* app.request() test helper throws */ }

                  if (executionCtx) {
                    executionCtx.waitUntil(syncWork());
                  } else {
                    void syncWork();
                  }
                }
                bootstrapComplete = true;
                fastPathTaken = true;
              }
            }
          } catch { /* KV unavailable — fall through */ }
        }

        if (!fastPathTaken) {
          console.log("[Bootstrap] Starting system initialization...");

          console.log("[Bootstrap] Checking schema compatibility...");
          const migrationService = new MigrationService(c.env.DB);
          await migrationService.ensureSchemaCompatibility();

          try {
            const kv = (c.env as any).CACHE_KV;
            if (kv) {
              const { setGlobalKVNamespace } = await import(
                "../plugins/cache/services/cache"
              );
              setGlobalKVNamespace(kv);
            }
          } catch (error) {
            console.error("[Bootstrap] Error wiring CACHE_KV namespace:", error);
          }

          console.log("[Bootstrap] Populating collection registry...");
          try {
            const configs = await loadCollectionConfigs();
            getCollectionRegistry().register(configs);
            console.log(`[Bootstrap] Registry populated with ${configs.length} collection(s)`);
          } catch (error) {
            console.error("[Bootstrap] Error populating collection registry:", error);
          }

          console.log("[Bootstrap] Registering document types...");
          try {
            await bootstrapDocumentTypes(c.env.DB);
          } catch (error) {
            console.error("[Bootstrap] Error registering document types:", error);
          }

          try {
            await repairMissingCredentialAccounts(c.env.DB)
          } catch (error) {
            console.error('[Bootstrap] Error repairing credential accounts:', error)
          }

          try {
            const { RbacService } = await import("../services/rbac");
            await new RbacService(c.env.DB, (c.env as any).CACHE_KV).ensureSystemRbacSeed();
          } catch (error) {
            console.error("[Bootstrap] Error seeding RBAC documents:", error);
          }

          try {
            const auto = await autoRegisterCollectionDocumentTypes(c.env.DB);
            if (auto.length) console.log(`[Bootstrap] Document-backed collections registered: ${auto.join(", ")}`);
          } catch (error) {
            console.error("[Bootstrap] Error auto-registering collection document types:", error);
          }

          if (!config.plugins?.disableAll) {
            console.log("[Bootstrap] Bootstrapping core plugins...");
            const bootstrapService = new PluginBootstrapService(c.env.DB);
            const needsBootstrap = await bootstrapService.isBootstrapNeeded();
            if (needsBootstrap) {
              await bootstrapService.bootstrapCorePlugins();
            }
          } else {
            console.log("[Bootstrap] Plugin bootstrap skipped (disableAll is true)");
          }

          bootstrapComplete = true;
          console.log("[Bootstrap] System initialization completed");

          // Write KV flag so future isolates can take the fast path.
          if (cacheKv) {
            try {
              await cacheKv.put(bootstrapKey, '1');
            } catch { /* non-fatal */ }
          }

          try {
            const registry = getCollectionRegistry();
            const collections = registry.listActive();
            const countResult = await c.env.DB.prepare(
              `SELECT type_id, COUNT(*) AS cnt FROM documents
               WHERE is_current_draft = 1 AND deleted_at IS NULL GROUP BY type_id`
            ).all<{ type_id: string; cnt: number }>();
            const countMap: Record<string, number> = {};
            let docTotal = 0;
            for (const row of (countResult.results ?? [])) {
              countMap[row.type_id] = row.cnt;
              docTotal += row.cnt;
            }
            const fieldTypeHistogram: Record<string, number> = {};
            for (const col of collections) {
              const props = (col.schema as any)?.properties ?? {};
              for (const field of Object.values(props) as any[]) {
                const ft: string = field?.type ?? 'unknown';
                fieldTypeHistogram[ft] = (fieldTypeHistogram[ft] ?? 0) + 1;
              }
            }
            const activePlugins = (config.plugins?.register ?? []).map((p: any) => p.name ?? 'unknown');
            let installationId = 'unknown';
            try {
              const kv = c.env.KV as KVNamespace | undefined;
              if (kv) {
                installationId = (await kv.get('_sonicjs_installation_id')) ?? '';
                if (!installationId) {
                  installationId = crypto.randomUUID();
                  await kv.put('_sonicjs_installation_id', installationId);
                }
              }
            } catch { /* KV not available */ }
            const telemetry = getTelemetryService();
            await telemetry.trackProjectSnapshot({
              installation_id: installationId,
              collection_names: collections.map(c => c.name),
              collection_counts: countMap,
              active_plugins: activePlugins,
              field_type_histogram: fieldTypeHistogram,
              doc_total: docTotal,
              sonicjs_version: SONICJS_VERSION,
            });
          } catch { /* silent — telemetry must never break boot */ }
        }
      } catch (error) {
        console.error("[Bootstrap] Error during system initialization:", error);
      } finally {
        resolve();
        if (bootstrapInFlight === ownFlight) {
          bootstrapInFlight = null;
        }
      }
    }

    verifySecurityConfig(c.env as Bindings);
    return next();
  };
}

/**
 * Reset bootstrap flag (useful for testing)
 */
export function resetBootstrap() {
  bootstrapComplete = false;
  bootstrapInFlight = null;
}

/**
 * Find auth_user rows that have a password_hash but no auth_account credential
 * row (created before Better Auth migration) and repair them. Idempotent —
 * INSERT OR IGNORE means re-runs are safe.
 */
async function repairMissingCredentialAccounts(db: D1Database): Promise<void> {
  const { results } = await db.prepare(`
    SELECT u.id, u.password_hash
    FROM auth_user u
    WHERE u.password_hash IS NOT NULL AND u.password_hash != ''
    AND NOT EXISTS (
      SELECT 1 FROM auth_account a
      WHERE a.user_id = u.id AND a.provider_id = 'credential'
    )
  `).all()

  if (!results.length) return

  console.log(`[Bootstrap] Repairing ${results.length} user(s) missing credential auth_account rows`)
  const nowSec = Math.floor(Date.now() / 1000)
  for (const user of results as Array<{ id: string; password_hash: string }>) {
    await db.prepare(`
      INSERT OR IGNORE INTO auth_account (id, user_id, account_id, provider_id, password, created_at, updated_at)
      VALUES (?, ?, ?, 'credential', ?, ?, ?)
    `).bind(`cred-${user.id}`, user.id, user.id, user.password_hash, nowSec, nowSec).run()
  }
  console.log(`[Bootstrap] Credential account repair complete (${results.length} repaired)`)
}
