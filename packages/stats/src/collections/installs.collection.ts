/**
 * Installs Collection
 *
 * Tracks unique SonicJS installations with anonymous IDs
 */

import type { CollectionConfig } from "@sonicjs-cms/core";

export default {
  name: "installs",
  displayName: "Installs",
  description: "Anonymous installation records",
  icon: "📦",

  schema: {
    type: "object",
    properties: {
      installation_id: {
        type: "string",
        title: "Installation ID",
        required: true,
        maxLength: 100,
        helpText: "Anonymous UUID for this installation",
      },
      first_seen: {
        type: "string",
        title: "First Seen",
        helpText: "ISO timestamp of first event",
      },
      last_seen: {
        type: "string",
        title: "Last Seen",
        helpText: "ISO timestamp of last event",
      },
      os: {
        type: "string",
        title: "Operating System",
        helpText: "darwin, linux, or win32",
      },
      node_version: {
        type: "string",
        title: "Node Version",
        helpText: "e.g., v20.10",
      },
      package_manager: {
        type: "string",
        title: "Package Manager",
        helpText: "npm, yarn, pnpm, or bun",
      },
    },
    required: ["installation_id"],
  },

  // List view configuration
  listFields: ["installation_id", "os", "node_version", "package_manager", "first_seen"],
  searchFields: ["installation_id", "os"],
  defaultSort: "createdAt",
  defaultSortOrder: "desc",

  // Note: Access control for public create will be configured via middleware
  // The /v1/installs endpoint should allow POST without auth

  managed: true,
  isActive: true,
} satisfies CollectionConfig;
