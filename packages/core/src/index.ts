/**
 * @sonicjs/core - Main Entry Point
 *
 * Core framework for SonicJS headless CMS
 * Built for Cloudflare's edge platform with TypeScript
 *
 * Phase 2 Migration Status:
 * - Week 1: Types, Utils, Database (in progress)
 * - Week 2: Services, Middleware, Plugins (pending)
 * - Week 3: Routes, Templates (pending)
 * - Week 4: Integration & Testing (pending)
 */

// ============================================================================
// Main Application API (Phase 2 Week 1)
// ============================================================================

export { createSonicJSApp, setupCoreMiddleware, setupCoreRoutes } from './app'
export type { SonicJSConfig, SonicJSApp, Bindings, Variables } from './app'

// ============================================================================
// Placeholders - To be populated in Phase 2
// ============================================================================

// Services - Week 2
// export { CollectionLoader, CollectionSync, MigrationService } from './services'

// Middleware - Week 2
// export { requireAuth, optionalAuth, requireRole } from './middleware'

// Routes - Week 3
// export { apiRoutes, adminRoutes, authRoutes } from './routes'

// Templates - Week 3
// export { renderDashboard } from './templates'

// Types - Week 1 (COMPLETED)
export type {
  // Collection types
  FieldType,
  FieldConfig,
  CollectionSchema,
  CollectionConfig,
  CollectionConfigModule,
  CollectionSyncResult,
  // Plugin types
  Plugin,
  PluginContext,
  PluginConfig,
  PluginRoutes,
  PluginMiddleware,
  PluginModel,
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
  HookName,
  // Plugin manifest
  PluginManifest,
} from './types'

export { HOOKS } from './types'

// Utils - Week 1 (COMPLETED)
export {
  // Sanitization
  escapeHtml,
  sanitizeInput,
  sanitizeObject,
  // Template rendering
  TemplateRenderer,
  templateRenderer,
  renderTemplate,
  // Query filtering
  QueryFilterBuilder,
  buildQuery,
  // Metrics
  metricsTracker,
} from './utils'

export type {
  FilterOperator,
  FilterCondition,
  FilterGroup,
  QueryFilter,
  QueryResult,
} from './utils'

// Database - Week 1 (COMPLETED)
export {
  createDb,
  // Schema exports
  users,
  collections,
  content,
  contentVersions,
  media,
  apiTokens,
  workflowHistory,
  plugins,
  pluginHooks,
  pluginRoutes,
  pluginAssets,
  pluginActivityLog,
  systemLogs,
  logConfig,
  // Zod validation schemas
  insertUserSchema,
  selectUserSchema,
  insertCollectionSchema,
  selectCollectionSchema,
  insertContentSchema,
  selectContentSchema,
  insertMediaSchema,
  selectMediaSchema,
  insertWorkflowHistorySchema,
  selectWorkflowHistorySchema,
  insertPluginSchema,
  selectPluginSchema,
  insertPluginHookSchema,
  selectPluginHookSchema,
  insertPluginRouteSchema,
  selectPluginRouteSchema,
  insertPluginAssetSchema,
  selectPluginAssetSchema,
  insertPluginActivityLogSchema,
  selectPluginActivityLogSchema,
  insertSystemLogSchema,
  selectSystemLogSchema,
  insertLogConfigSchema,
  selectLogConfigSchema,
} from './db'

export type {
  User,
  NewUser,
  Collection,
  NewCollection,
  Content,
  NewContent,
  Media,
  NewMedia,
  WorkflowHistory,
  NewWorkflowHistory,
  Plugin as DbPlugin,
  NewPlugin,
  PluginHook as DbPluginHook,
  NewPluginHook,
  PluginRoute,
  NewPluginRoute,
  PluginAsset,
  NewPluginAsset,
  PluginActivityLog,
  NewPluginActivityLog,
  SystemLog,
  NewSystemLog,
  LogConfig,
  NewLogConfig,
} from './db'

// Plugins - Week 2
// export { PluginBuilder, HookSystem } from './plugins/sdk'

// ============================================================================
// Version
// ============================================================================

export const VERSION = '1.0.0-alpha.1'

// ============================================================================
// Phase 2 Migration Notes
// ============================================================================

/**
 * This is a work-in-progress package being extracted from the main SonicJS codebase.
 *
 * Current Phase: 2 (Core Module Migration)
 * Current Week: 1 (Types, Utils, Database)
 *
 * Expected completion: 4 weeks from 2025-01-17
 *
 * DO NOT USE IN PRODUCTION - Alpha release for development only
 */
