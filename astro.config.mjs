import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

import genConfig from "./scripts/gen-conf.integration.mjs";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [tailwind(), react(), genConfig()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  security: {
		checkOrigin: false
	}
});