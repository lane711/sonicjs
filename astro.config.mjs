import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";


// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [tailwind(), react()],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  security: {
		checkOrigin: false
	}
});