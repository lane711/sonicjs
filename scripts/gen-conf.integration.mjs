import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { loadEnv } from "vite";

/**
 * Generate deployment configuration files using environment variables.
 *
 * @returns {import('astro').AstroIntegration}
 */
export default function genConfig() {
  return {
    name: "gen-conf",
    hooks: {
      "astro:build:done": async ({ logger }) => {
        logger.info("⚡️ Loading environment variables...");
        const {
          CLOUDFLARE_PROJECT_NAME,
          CLOUDFLARE_KV_ID,
          CLOUDFLARE_KV_PREVIEW_ID,
          CLOUDFLARE_D1_ID,
          CLOUDFLARE_D1_PREVIEW_ID,
        } = loadEnv(process.env.NODE_ENV, process.cwd(), "");

        const missing = (name) =>
          logger.warn(
            `⚠️ The environment variable ${name} is not set. Skipping deployment config generation...`,
          );

        if (!CLOUDFLARE_PROJECT_NAME) return missing("CLOUDFLARE_PROJECT_NAME");
        if (!CLOUDFLARE_KV_ID) return missing("CLOUDFLARE_KV_ID");
        if (!CLOUDFLARE_D1_ID) return missing("CLOUDFLARE_D1_ID");

        const kvConfig = (id) => [{ binding: "KV", id }];
        const d1Config = (id) => [
          {
            binding: "D1",
            database_name: "sonicjs",
            database_id: id,
            migrations_dir: "./migrations",
          },
        ];

        // Config files to generate
        const configs = {
          // https://developers.cloudflare.com/workers/wrangler/configuration/#generated-wrangler-configuration
          ".wrangler/deploy/config.json": {
            configPath: "../../wrangler.deploy.jsonc",
          },
          // Deployment config targeting production.
          // Please check `.env.example` file Make sure those env vars are correctly set.
          "wrangler.deploy.jsonc": {
            name: CLOUDFLARE_PROJECT_NAME,
            pages_build_output_dir: "./dist",
            compatibility_date: "2025-03-14",
            compatibility_flags: ["nodejs_compat"],
            vars: { DISABLE_CACHE: true },
            env: {
              preview: {
                kv_namespaces: kvConfig(CLOUDFLARE_KV_PREVIEW_ID),
                d1_databases: d1Config(CLOUDFLARE_D1_PREVIEW_ID),
              },
              production: {
                kv_namespaces: kvConfig(CLOUDFLARE_KV_ID),
                d1_databases: d1Config(CLOUDFLARE_D1_ID),
              },
            },
          },
        };

        for (const [path, data] of Object.entries(configs)) {
          logger.info(`💾 Generating ${path}...`);
          // Ensure the directory exists
          mkdirSync(dirname(path), { recursive: true });
          // Write the configs
          writeFileSync(path, JSON.stringify(data, null, 2));
        }
        logger.info("✅ Wrangler deployment config generated!");
      },
    },
  };
}
