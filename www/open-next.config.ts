import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Optional: Configure R2 for incremental cache if needed
  // incrementalCache: r2IncrementalCache,
});
