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
    checkOrigin: false,
  },
});

console.log("\nWelcome to ...");
console.log("  _________              __            ____       ");
console.log(" /   _____/ ____   ____ |__| ____     |    | ______");
console.log(" \\_____  \\ /  _ \\ /    \\|  |/ ___\\    |    |/  ___/");
console.log(" /        (  <_> )   |  \\  \\  \\___/\\__|    |\\___ \\ ");
console.log("/_______  /\\____/|___|  /__|\\___  >________/____  >");
console.log("        \\/            \\/        \\/              \\/ ");
console.log("\n");
console.log("The World's Fastest API Framework!\n");
