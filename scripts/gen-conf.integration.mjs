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
      "astro:build:done": async () => {
        console.log("⚡️ Loading environment variables...", process.cwd());
        const {
          CLOUDFLARE_PROJECT_NAME,
          CLOUDFLARE_KV_ID,
          CLOUDFLARE_KV_PREVIEW_ID,
          CLOUDFLARE_D1_ID,
          CLOUDFLARE_D1_PREVIEW_ID,
        } = loadEnv(process.env.NODE_ENV, process.cwd(), "");

        const missing = (name) =>
          `⚠️ The environment variable ${name} is not set. This will cause your application to fail when deploying to Cloudflare.`;
        if (!CLOUDFLARE_PROJECT_NAME)
          console.warn(missing("CLOUDFLARE_PROJECT_NAME"));
        if (!CLOUDFLARE_KV_ID) console.warn(missing("CLOUDFLARE_KV_ID"));
        if (!CLOUDFLARE_D1_ID) console.warn(missing("CLOUDFLARE_D1_ID"));

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
            kv_namespaces: [
              {
                binding: "KV",
                id: CLOUDFLARE_KV_ID,
                preview_id: CLOUDFLARE_KV_PREVIEW_ID,
              },
            ],
            d1_databases: [
              {
                binding: "D1",
                database_name: "sonicjs",
                database_id: CLOUDFLARE_D1_ID,
                preview_database_id: CLOUDFLARE_D1_PREVIEW_ID,
                migrations_dir: "./migrations",
              },
            ],
            vars: {
              DISABLE_CACHE: true,
            },
          },
        };

        for (const [path, data] of Object.entries(configs)) {
          console.log(`💾 Generating ${path}...`);
          // Ensure the directory exists
          mkdirSync(dirname(path), { recursive: true });
          // Write the configs
          writeFileSync(path, JSON.stringify(data, null, 2));
        }
        console.log("✅ Wrangler deployment config generated!");
      },
    },
  };
}
