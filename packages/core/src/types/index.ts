/**
 * Types Module Exports
 *
 * TypeScript type definitions for SonicJS
 */

// Collection Configuration Types
export type {
  FieldType,
  FieldConfig,
  BlockDefinition,
  BlockDefinitions,
  CollectionSchema,
  CollectionConfig,
  CollectionConfigModule,
  CollectionSyncResult
} from './collection-config'

// Plugin System Types
export type {
  Plugin,
  PluginContext,
  PluginConfig,
  PluginRoutes,
  PluginMiddleware,
  PluginModel,
  ModelRelationship,
  PluginService,
  PluginAdminPage,
  PluginComponent,
  PluginMenuItem,
  PluginHook,
  HookHandler,
  HookContext,
  HookSystem,
  ScopedHookSystem,
  PluginRegistry,
  PluginManager,
  PluginStatus,
  AuthService,
  ContentService,
  MediaService,
  PluginLogger,
  PluginBuilderOptions,
  PluginValidator,
  PluginValidationResult,
  HookName
} from './plugin'

export { HOOKS } from './plugin'

// Plugin Manifest Types
export type { PluginManifest } from './plugin-manifest'

// Telemetry Types
export type {
  TelemetryEvent,
  TelemetryProperties,
  TelemetryConfig,
  TelemetryIdentity
} from './telemetry'

// Re-export global types that are defined in global.d.ts
// Note: These are ambient declarations and don't need to be re-exported
// They are available globally once the file is included in the TypeScript project
