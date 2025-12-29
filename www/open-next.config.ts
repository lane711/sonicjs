import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  // Use static assets cache for prerendered blog posts and pages
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
