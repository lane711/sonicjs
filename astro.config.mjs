import { defineConfig } from "astro/config";
import { hooks } from './src/hooks';
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), hooks],
  security: {
    checkOrigin: false,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: cloudflare(),
});