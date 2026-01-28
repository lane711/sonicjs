/**
 * Events Collection
 *
 * Stores all telemetry events from SonicJS installations
 */

import type { CollectionConfig } from "@sonicjs-cms/core";

export default {
  name: "events",
  displayName: "Events",
  description: "Telemetry events",
  icon: "📊",

  schema: {
    type: "object",
    properties: {
      installation_id: {
        type: "string",
        title: "Installation ID",
        required: true,
        maxLength: 100,
        helpText: "Anonymous UUID of the installation",
      },
      event_type: {
        type: "select",
        title: "Event Type",
        required: true,
        enum: ["installation_started", "installation_completed", "installation_failed"],
        enumLabels: ["Installation Started", "Installation Completed", "Installation Failed"],
      },
      properties: {
        type: "json",
        title: "Properties",
        helpText: "JSON object with event-specific data",
      },
      timestamp: {
        type: "string",
        title: "Timestamp",
        helpText: "ISO timestamp of the event",
      },
    },
    required: ["installation_id", "event_type"],
  },

  // List view configuration
  listFields: ["installation_id", "event_type", "timestamp", "createdAt"],
  searchFields: ["installation_id", "event_type"],
  defaultSort: "createdAt",
  defaultSortOrder: "desc",

  // Note: Access control for public create will be configured via middleware
  // The /v1/events endpoint should allow POST without auth

  managed: true,
  isActive: true,
} satisfies CollectionConfig;
