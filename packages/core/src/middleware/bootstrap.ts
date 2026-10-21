import { Context, Next } from "hono";
import { loadCollectionConfigs } from "../services/collection-loader";
import { getCollectionRegistry } from "../services/collection-registry";
import { MigrationService } from "../services/migrations";
import { PluginBootstrapService } from "../services/plugin-bootstrap";
import { bootstrapDocumentTypes, autoRegisterCollectionDocumentTypes, bootstrapDefaultContent } from "../services/document-types-seed";
import { getHookSystem, hasHookSystem } from "../plugins/hooks/hook-system-singleton";
import { getTelemetryService } from "../services/telemetry-service"
import { SONICJS_VERSION } from "../utils/version";
import type { SonicJSConfig } from "../app";
import { setBranchLabel } from "../templates/layouts/admin-layout-catalyst.template";

type Bindings = {
  DB: D1Database;
  KV?: KVNamespace;
  CACHE_KV?: KVNamespace;
  JWT_SECRET?: string;
  CORS_ORIGINS?: string;
  ENVIRONMENT?: string;
};

// Track if bootstrap has been run in this worker instance
let bootstrapComplete = false;

/**
 * The bootstrap currently running on this isolate, if any.
 *
 * `bootstrapComplete` is only set at the *end* of the work, so it cannot keep a second request
 * out while the first is still going. Every request that arrived on a cold isolate before the
 * first one finished therefore saw `false` and ran the whole bootstrap again — concurrently, on a
 * single-threaded isolate, against the same D1. The cost is not N parallel bootstraps but N
 * interleaved ones: each copy's serial D1 round trips queue behind every other copy's, so all N
 * requests take roughly N times the ~3-9s a cold bootstrap costs on its own.
 *
 * That is reachable from ordinary traffic — a dashboard load fires five fragment requests at once
 * — and it is what a four-worker Playwright run hitting a freshly spawned isolate does on every
 * cold start. It showed up as whole batches of unrelated requests, browser and API client alike,
 * stalling past 30s on preview deployments with nothing in the logs: no errors, no 429s, just an
 * isolate spending its time redoing work it had already started.
 *
 * So hold the first caller's promise and let everyone else wait on it. One bootstrap per isolate,
 * and the requests that would have duplicated it now cost a single `await`.
 */
let bootstrapInFlight: Promise<void> | null = null;

// KV key for cross-isolate bootstrap state. Version-keyed so a code deployment
// (SONICJS_VERSION bump) automatically invalidates the cached flag and forces a fresh full
// bootstrap on the next cold start.
//
// Also HOST-keyed, because the flag describes one D1 database and the KV namespace is shared by
// everything deployed from the same wrangler.toml. CI makes that concrete: `pr-tests.yml` deletes
// and recreates the D1 for every PR run but leaves `kv_namespaces.id` alone, so each preview read
// a `'1'` written by a sibling preview against a database it has never seen. The stale-flag guard
// below then deleted the key — out from under the preview that legitimately owned it — and both
// deployments fell back to the full cold bootstrap, concurrently, on a brand-new D1. That is the
// shape behind the 90s hangs on `GET /api/collections`.
//
// The host is the cheapest discriminator that is already per-deployment (`sonicjs-pr-<branch>.…`
// vs the demo's own hostname). A worker reachable on two hostnames simply bootstraps once per
// hostname, which costs one extra cold start and never serves stale state.
//
// A forged Host cannot be used to force repeated bootstraps: `bootstrapComplete` short-circuits
// above this, without reading KV at all, so an isolate that has bootstrapped once never consults
// the key again whatever Host arrives. The worst a junk Host can do is what a missing flag
// already does today — one bootstrap on one cold isolate.
const BOOTSTRAP_KV_KEY = (host?: string) =>
  `_sonicjs_bootstrap_v${SONICJS_VERSION}${host ? `:${host}` : ''}`

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

// Better Auth stateless session/auth API paths that must never carry the
// cold-start bootstrap tax (they only touch auth_* migration tables). Matched
// as `/auth/<seg>` prefixes so `/auth/sign-in/email`, `/auth/callback/github`,
// etc. are all covered. Deliberately excludes `/auth/login` (page render) and
// `/auth/seed-admin` (self-seeds its own prerequisites).
const BETTER_AUTH_SESSION_SEGMENTS = [
  "sign-in",
  "sign-up",
  "sign-out",
  "get-session",
  "callback",
  "token",
] as const;

export function isBetterAuthSessionPath(path: string): boolean {
  return BETTER_AUTH_SESSION_SEGMENTS.some(
    (seg) => path === `/auth/${seg}` || path.startsWith(`/auth/${seg}/`)
  );
}

// Per-isolate memo so verifySecurityConfig logs warnings once but throws on
// every production request with a bad JWT_SECRET.
let lastSecurityBindings: string | null = null
let lastSecurityError: Error | null = null
let securityWarned = false

function verifySecurityConfigMemoized(env: Bindings): void {
  const sig = `${env.JWT_SECRET ?? ''}|${env.CORS_ORIGINS ?? ''}|${env.ENVIRONMENT ?? ''}`
  if (sig !== lastSecurityBindings) {
    lastSecurityBindings = sig
    lastSecurityError = null
    securityWarned = false
  }
  if (lastSecurityError) throw lastSecurityError
  if (securityWarned) return
  try {
    verifySecurityConfig(env)
    securityWarned = true
  } catch (e) {
    lastSecurityError = e instanceof Error ? e : new Error(String(e))
    throw lastSecurityError
  }
}

/**
 * Bootstrap middleware that ensures system initialization
 * Runs once per worker instance
 */
export function bootstrapMiddleware(config: SonicJSConfig = {}, allPlugins?: Array<{ name?: string; id?: string }>) {
  return async (c: Context<{ Bindings: Bindings; Variables: { hookSystem?: unknown } }>, next: Next) => {
    // Attach the hook system to the request BEFORE any heavy bootstrap work
    // runs, so anything that emits a hook during bootstrap (cron cold starts,
    // RBAC seed, document-type registration, plugin onBoot via createPluginWirer)
    // sees a live bus instead of a no-op. The process singleton was published at
    // app-factory time (app.ts); we only forward it onto the request here.
    if (hasHookSystem()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Variables typed loosely here; concrete type lives in app.ts
      (c as any).set("hookSystem", getHookSystem());
    }

    // Security check runs on EVERY request — before any short-circuit.
    // Production with a bad/missing JWT_SECRET must fail closed.
    verifySecurityConfigMemoized(c.env as Bindings);

    // Skip if already bootstrapped in this worker instance
    if (bootstrapComplete) {
      return next();
    }

    // Path-based short-circuits come FIRST — above the KV fast-path below, not under it.
    //
    // The "fast" path is only fast relative to a cold full bootstrap: it still costs a KV read,
    // a `SELECT COUNT(*) FROM document_types`, a collection-config load and three serial D1
    // bootstrap calls. Sitting underneath it, these two skips were dead in the steady state —
    // the KV flag is present on any deployment that has served one request, so every health
    // check, every .js/.css/.png and every Better Auth sign-in paid the whole thing on a cold
    // isolate. Measured on a preview deployment: ~9s cold vs ~0.5s warm, and a Playwright run
    // spreads over enough isolates that this stacks into 90s test timeouts.
    //
    // Both blocks must stay below verifySecurityConfigMemoized — a bad JWT_SECRET still has to
    // fail closed on every request — and below the bootstrapComplete check, which is cheaper.

    // Skip bootstrap for static assets and health checks
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

    // Skip the heavy D1 bootstrap for Better Auth's stateless session API. These
    // endpoints only read/write the auth_* tables (created by migration 0001) —
    // they never need the collection registry, document types, or RBAC seed. On
    // a cold isolate the ~10s bootstrap otherwise runs on the same request as
    // Better Auth's scrypt password verify, exhausting the Worker's CPU/time
    // budget and returning a bare 500. Login is the first request in most flows,
    // so this is exactly the request that must not carry the bootstrap tax.
    // (Not /auth/login or /auth/seed-admin: the former is a page render, the
    // latter self-seeds its own prerequisites — neither is a hot cold-start path
    // that 500s.) The full bootstrap still runs on the next non-auth request.
    if (isBetterAuthSessionPath(path)) {
      return next();
    }

    // Somebody else is already doing this. Wait for them rather than starting a second copy.
    // The promise below is only ever resolved, never rejected — every failure path inside the
    // bootstrap is already caught and logged — so there is nothing to catch here.
    if (bootstrapInFlight) {
      await bootstrapInFlight;
      return next();
    }

    let releaseBootstrap: () => void = () => {};
    bootstrapInFlight = new Promise<void>((resolve) => {
      releaseBootstrap = resolve;
    });

    // `try` so that the gate is released on *every* exit, including a throw from somewhere that
    // is not already wrapped. Leaking it would park every later request on this isolate forever.
    try {
    const host = c.req.header('host') || '';

    // Fast KV check: if a previous isolate already ran the full bootstrap for this app version
    // AND this hostname, skip the expensive D1 operations entirely. KV reads are ~10ms vs 5-10s
    // for cold D1. Version- and host-keyed so deployments auto-invalidate the flag — see
    // BOOTSTRAP_KV_KEY for why the host matters.
    try {
      const cacheKv = (c.env as any).CACHE_KV as KVNamespace | undefined
      if (cacheKv) {
        const kvDone = await cacheKv.get(BOOTSTRAP_KV_KEY(host))
        if (kvDone === '1') {
          // Guard against stale KV key + fresh D1 (e.g. CI re-creates D1 each run but
          // reuses KV). If document_types is empty the KV flag is lying — fall through
          // to full bootstrap so autoRegisterCollectionDocumentTypes runs.
          const d1Fresh = await (c.env.DB as D1Database)
            .prepare('SELECT COUNT(*) n FROM document_types LIMIT 1')
            .first<{ n: number }>()
            .then(r => !r || r.n === 0)
            .catch(() => true)
          if (!d1Fresh) {
            // D1 has data — fast-path is valid.
            try {
              const kv = (c.env as any).CACHE_KV as KVNamespace
              const { setGlobalKVNamespace } = await import("../plugins/cache/services/cache")
              setGlobalKVNamespace(kv)
              const { setGlobalCatalogKv, loadKvCatalog } = await import("../plugins/cache/services/catalog")
              setGlobalCatalogKv(kv)
              c.executionCtx.waitUntil(loadKvCatalog())
            } catch { /* KV wiring optional */ }
            try {
              const configs = await loadCollectionConfigs()
              getCollectionRegistry().register(configs)
            } catch { /* registry optional in fast-path */ }
            // Sync document types to D1 even on KV fast-path — idempotent no-ops when
            // nothing changed, but ensures newly added code collections reach D1 without
            // requiring a version bump or full cold-start bootstrap.
            await bootstrapDocumentTypes(c.env.DB).catch((e) =>
              console.error("[Bootstrap] KV fast-path: error syncing document types:", e)
            )
            await autoRegisterCollectionDocumentTypes(c.env.DB).catch((e) =>
              console.error("[Bootstrap] KV fast-path: error auto-registering collection types:", e)
            )
            await bootstrapDefaultContent(c.env.DB).catch((e) =>
              console.error("[Bootstrap] KV fast-path: error seeding default content:", e)
            )
            bootstrapComplete = true
            return next()
          }
          // D1 is fresh — delete the stale KV key so the next cold start also re-bootstraps.
          // Host-keyed, so this only ever discards this deployment's own flag.
          cacheKv.delete(BOOTSTRAP_KV_KEY(host)).catch(() => {})
        }
      }
    } catch { /* KV unavailable — fall through to full bootstrap */ }

    // Show branch label automatically on localhost — no env var needed
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    const gitBranch = (c.env as any).GIT_BRANCH as string | undefined;
    setBranchLabel(isLocalhost && gitBranch ? gitBranch : undefined);

    try {
      console.log("[Bootstrap] Starting system initialization...");

      // 1. Run idempotent schema compatibility repairs. Migration state and
      // migration execution are owned by Cloudflare D1/Wrangler.
      console.log("[Bootstrap] Checking schema compatibility...");
      const migrationService = new MigrationService(c.env.DB);
      await migrationService.ensureSchemaCompatibility();

      // 1a. Wire the CACHE_KV binding into the cache plugin's singleton store so
      // cache writes survive isolate evictions. Memory-only cache is per-isolate
      // and ephemeral, which makes /admin/cache appear "empty" after restarts.
      try {
        const kv = (c.env as any).CACHE_KV;
        if (kv) {
          const { setGlobalKVNamespace } = await import(
            "../plugins/cache/services/cache"
          );
          setGlobalKVNamespace(kv);
          const { setGlobalCatalogKv, loadKvCatalog } = await import(
            "../plugins/cache/services/catalog"
          );
          setGlobalCatalogKv(kv);
          c.executionCtx.waitUntil(loadKvCatalog());
        }
      } catch (error) {
        console.error("[Bootstrap] Error wiring CACHE_KV namespace:", error);
      }

      // 2. Populate the in-memory collection registry from code-defined configs.
      // This is the source of truth going forward; the DB `collections` table is
      // being decommissioned (see docs/ai/plans/drop-db-collections-plan.md).
      console.log("[Bootstrap] Populating collection registry...");
      try {
        const configs = await loadCollectionConfigs();
        getCollectionRegistry().register(configs);
        console.log(`[Bootstrap] Registry populated with ${configs.length} collection(s)`);
      } catch (error) {
        console.error("[Bootstrap] Error populating collection registry:", error);
      }

      // 3–4. Independent D1 operations — run in parallel to minimise cold-start latency.
      // Each step has its own error handling so one failure doesn't block the others.
      console.log("[Bootstrap] Registering document types and seeding system data...");
      const { RbacService } = await import("../services/rbac");
      const rbacService = new RbacService(c.env.DB, (c.env as any).CACHE_KV);

      await Promise.all([
        // 3. Register document types (idempotent)
        bootstrapDocumentTypes(c.env.DB).catch((e) =>
          console.error("[Bootstrap] Error registering document types:", e)
        ),

        // 3b. Make every content collection document-backed.
        autoRegisterCollectionDocumentTypes(c.env.DB)
          .then((auto) => {
            if (auto.length) console.log(`[Bootstrap] Document-backed collections registered: ${auto.join(", ")}`)
          })
          .catch((e) => console.error("[Bootstrap] Error auto-registering collection document types:", e)),

        // 2c. Repair legacy credential accounts.
        repairMissingCredentialAccounts(c.env.DB).catch((e) =>
          console.error("[Bootstrap] Error repairing credential accounts:", e)
        ),

        // 3a. Seed system RBAC roles/verbs/grants.
        rbacService.ensureSystemRbacSeed().catch((e) =>
          console.error("[Bootstrap] Error seeding RBAC documents:", e)
        ),

        // 4. Bootstrap core plugins.
        config.plugins?.disableAll
          ? Promise.resolve()
          : (async () => {
              const bootstrapService = new PluginBootstrapService(c.env.DB)
              const needsBootstrap = await bootstrapService.isBootstrapNeeded()
              if (needsBootstrap) {
                console.log("[Bootstrap] Bootstrapping core plugins...")
                await bootstrapService.bootstrapCorePlugins()
              }
            })().catch((e) => console.error("[Bootstrap] Error bootstrapping plugins:", e)),
      ])

      // Seed starter content after types are registered (idempotent no-op when present).
      await bootstrapDefaultContent(c.env.DB).catch((e) =>
        console.error("[Bootstrap] Error seeding default content:", e)
      )

      // Mark bootstrap as complete for this worker instance and persist to KV
      // so subsequent cold-start isolates can skip the D1 work entirely.
      bootstrapComplete = true;
      console.log("[Bootstrap] System initialization completed");
      try {
        const cacheKv = (c.env as any).CACHE_KV as KVNamespace | undefined
        if (cacheKv) {
          // 24h TTL — long enough that hot instances never re-bootstrap, short
          // enough that a DB reset auto-heals within a day.
          await cacheKv.put(BOOTSTRAP_KV_KEY(host), '1', { expirationTtl: 86400 })
        }
      } catch { /* KV write failure is non-fatal */ }

      // Fire project snapshot telemetry (fire-and-forget, never blocks boot)
      try {
        const registry = getCollectionRegistry();
        const collections = registry.listActive();

        // Count docs per collection type from D1
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

        // Field type histogram across all collection schemas
        const fieldTypeHistogram: Record<string, number> = {};
        for (const col of collections) {
          const props = (col.schema as any)?.properties ?? {};
          for (const field of Object.values(props) as any[]) {
            const ft: string = field?.type ?? 'unknown';
            fieldTypeHistogram[ft] = (fieldTypeHistogram[ft] ?? 0) + 1;
          }
        }

        // Plugin names — use allPlugins (all registered, including core) when available
        const pluginSource = allPlugins ?? (config.plugins?.register ?? []) as Array<{ name?: string; id?: string }>;
        const activePlugins = pluginSource.map((p) => p.name ?? String(p.id ?? 'unknown'));

        // Stable installation ID via KV (generated once, persisted)
        let installationId = 'unknown';
        try {
          const kv = (c.env.CACHE_KV ?? c.env.KV) as KVNamespace | undefined;
          if (kv) {
            installationId = (await kv.get('_sonicjs_installation_id')) ?? '';
            if (!installationId) {
              installationId = crypto.randomUUID();
              await kv.put('_sonicjs_installation_id', installationId);
            }
          }
        } catch { /* KV not available */ }

        // Extract deploy origin (scheme + host only — no path, no query, no PII)
        let deployUrl: string | undefined;
        try {
          const u = new URL(c.req.url);
          deployUrl = u.origin; // e.g. "https://example.com"
        } catch { /* malformed URL — skip */ }

        const telemetry = getTelemetryService();
        await telemetry.trackProjectSnapshot({
          installation_id: installationId,
          collection_names: collections.map(c => c.name),
          collection_counts: countMap,
          active_plugins: activePlugins,
          field_type_histogram: fieldTypeHistogram,
          doc_total: docTotal,
          sonicjs_version: SONICJS_VERSION,
          deploy_url: deployUrl,
        });
      } catch { /* silent — telemetry must never break boot */ }
    } catch (error) {
      console.error("[Bootstrap] Error during system initialization:", error);
      // Don't prevent the app from starting, but log the error
    }
    } finally {
      // Clear the holder too: on success `bootstrapComplete` keeps everyone out, and on failure
      // the next request should be free to try again rather than inherit a settled promise.
      releaseBootstrap();
      bootstrapInFlight = null;
    }

    return next();
  };
}

/**
 * Reset bootstrap flag (useful for testing)
 */
export function resetBootstrap(complete?: boolean) {
  bootstrapComplete = complete ?? false;
  bootstrapInFlight = null;
  lastSecurityBindings = null
  lastSecurityError = null
  securityWarned = false
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
