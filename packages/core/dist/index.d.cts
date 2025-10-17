import { Hono, Context } from 'hono';
import { D1Database as D1Database$1, KVNamespace, R2Bucket } from '@cloudflare/workers-types';
import { s as schema } from './index-D45jaIlr.cjs';
export { aa as Collection, ac as Content, C as CorePlugin, ai as DbPlugin, ak as DbPluginHook, p as LogCategory, au as LogConfig, q as LogEntry, r as LogFilter, o as LogLevel, L as Logger, ae as Media, m as Migration, M as MigrationService, n as MigrationStatus, ab as NewCollection, ad as NewContent, av as NewLogConfig, af as NewMedia, aj as NewPlugin, ar as NewPluginActivityLog, ap as NewPluginAsset, al as NewPluginHook, an as NewPluginRoute, at as NewSystemLog, a9 as NewUser, ah as NewWorkflowHistory, aq as PluginActivityLog, ao as PluginAsset, k as PluginBootstrapService, am as PluginRoute, P as PluginServiceClass, as as SystemLog, a8 as User, ag as WorkflowHistory, z as apiTokens, e as cleanupRemovedCollections, t as collections, w as content, x as contentVersions, f as fullCollectionSync, g as getAvailableCollectionNames, h as getLogger, d as getManagedCollections, j as initLogger, N as insertCollectionSchema, Q as insertContentSchema, a6 as insertLogConfigSchema, S as insertMediaSchema, a2 as insertPluginActivityLogSchema, a0 as insertPluginAssetSchema, Y as insertPluginHookSchema, _ as insertPluginRouteSchema, W as insertPluginSchema, a4 as insertSystemLogSchema, J as insertUserSchema, U as insertWorkflowHistorySchema, i as isCollectionManaged, a as loadCollectionConfig, l as loadCollectionConfigs, I as logConfig, y as media, G as pluginActivityLog, F as pluginAssets, D as pluginHooks, E as pluginRoutes, B as plugins, O as selectCollectionSchema, R as selectContentSchema, a7 as selectLogConfigSchema, T as selectMediaSchema, a3 as selectPluginActivityLogSchema, a1 as selectPluginAssetSchema, Z as selectPluginHookSchema, $ as selectPluginRouteSchema, X as selectPluginSchema, a5 as selectSystemLogSchema, K as selectUserSchema, V as selectWorkflowHistorySchema, c as syncCollection, b as syncCollections, H as systemLogs, u as users, v as validateCollectionConfig, A as workflowHistory } from './index-D45jaIlr.cjs';
export { AuthManager, Permission, PermissionManager, UserPermissions, bootstrapMiddleware, cacheHeaders, compressionMiddleware, detailedLoggingMiddleware, getActivePlugins, isPluginActive, logActivity, loggingMiddleware, optionalAuth, performanceLoggingMiddleware, requireActivePlugin, requireActivePlugins, requireAnyPermission, requireAuth, requirePermission, requireRole, securityHeaders, securityLoggingMiddleware } from './middleware.cjs';
export { HookSystemImpl, HookUtils, PluginManager as PluginManagerClass, PluginRegistryImpl, PluginValidator as PluginValidatorClass, ScopedHookSystem as ScopedHookSystemClass } from './plugins.cjs';
export { b as CollectionConfig, c as CollectionConfigModule, C as CollectionSchema, d as CollectionSyncResult, a as FieldConfig, F as FieldType } from './collection-config-FLlGtsh9.cjs';
export { A as AuthService, C as ContentService, u as HOOKS, k as HookContext, H as HookHandler, t as HookName, l as HookSystem, M as MediaService, P as Plugin, g as PluginAdminPage, q as PluginBuilderOptions, h as PluginComponent, b as PluginConfig, a as PluginContext, j as PluginHook, p as PluginLogger, n as PluginManager, i as PluginMenuItem, d as PluginMiddleware, e as PluginModel, m as PluginRegistry, c as PluginRoutes, f as PluginService, o as PluginStatus, s as PluginValidationResult, r as PluginValidator, S as ScopedHookSystem } from './plugin-UzmDImQc.cjs';
export { PluginManifest } from './types.cjs';
export { FilterCondition, FilterGroup, FilterOperator, QueryFilter, QueryFilterBuilder, QueryResult, TemplateRenderer, buildQuery, escapeHtml, metricsTracker, renderTemplate, sanitizeInput, sanitizeObject, templateRenderer } from './utils.cjs';
import * as drizzle_orm_d1 from 'drizzle-orm/d1';
import 'drizzle-zod';
import 'drizzle-orm/sqlite-core';
import 'zod';

/**
 * Main Application Factory
 *
 * Creates a configured SonicJS application with all core functionality
 */

interface Bindings {
    DB: D1Database$1;
    CACHE_KV: KVNamespace;
    MEDIA_BUCKET: R2Bucket;
    ASSETS: Fetcher;
    EMAIL_QUEUE?: Queue;
    SENDGRID_API_KEY?: string;
    DEFAULT_FROM_EMAIL?: string;
    IMAGES_ACCOUNT_ID?: string;
    IMAGES_API_TOKEN?: string;
    ENVIRONMENT?: string;
}
interface Variables {
    user?: {
        userId: string;
        email: string;
        role: string;
        exp: number;
        iat: number;
    };
    requestId?: string;
    startTime?: number;
    appVersion?: string;
}
interface SonicJSConfig {
    collections?: {
        directory?: string;
        autoSync?: boolean;
    };
    plugins?: {
        directory?: string;
        autoLoad?: boolean;
    };
    routes?: Array<{
        path: string;
        handler: Hono;
    }>;
    middleware?: {
        beforeAuth?: Array<(c: Context, next: () => Promise<void>) => Promise<void>>;
        afterAuth?: Array<(c: Context, next: () => Promise<void>) => Promise<void>>;
    };
    version?: string;
    name?: string;
}
type SonicJSApp = Hono<{
    Bindings: Bindings;
    Variables: Variables;
}>;
/**
 * Create a SonicJS application with core functionality
 *
 * @param config - Application configuration
 * @returns Configured Hono application
 *
 * @example
 * ```typescript
 * import { createSonicJSApp } from '@sonicjs/core'
 *
 * const app = createSonicJSApp({
 *   collections: {
 *     directory: './src/collections',
 *     autoSync: true
 *   },
 *   plugins: {
 *     directory: './src/plugins',
 *     autoLoad: true
 *   }
 * })
 *
 * export default app
 * ```
 */
declare function createSonicJSApp(config?: SonicJSConfig): SonicJSApp;
/**
 * Setup core middleware (backward compatibility)
 *
 * @param _app - Hono application
 * @deprecated Use createSonicJSApp() instead
 */
declare function setupCoreMiddleware(_app: SonicJSApp): void;
/**
 * Setup core routes (backward compatibility)
 *
 * @param _app - Hono application
 * @deprecated Use createSonicJSApp() instead
 */
declare function setupCoreRoutes(_app: SonicJSApp): void;

declare function createDb(d1: D1Database): drizzle_orm_d1.DrizzleD1Database<typeof schema> & {
    $client: D1Database;
};

/**
 * @sonicjs/core - Main Entry Point
 *
 * Core framework for SonicJS headless CMS
 * Built for Cloudflare's edge platform with TypeScript
 *
 * Phase 2 Migration Status:
 * - Week 1: Types, Utils, Database (COMPLETED ✓)
 * - Week 2: Services, Middleware, Plugins (COMPLETED ✓)
 * - Week 3: Routes, Templates (pending)
 * - Week 4: Integration & Testing (pending)
 */

declare const VERSION = "1.0.0-alpha.2";

export { type Bindings, type SonicJSApp, type SonicJSConfig, VERSION, type Variables, createDb, createSonicJSApp, setupCoreMiddleware, setupCoreRoutes };
