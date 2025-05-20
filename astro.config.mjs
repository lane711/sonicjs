import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import { hooks } from './src/hooks';

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [tailwind(), react(), hooks],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  security: {
    checkOrigin: false,
  },
  vite: {},
});
