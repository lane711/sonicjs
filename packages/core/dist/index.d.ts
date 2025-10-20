export { B as Bindings, R as ROUTES_INFO, b as SonicJSApp, S as SonicJSConfig, V as Variables, c as createSonicJSApp, s as setupCoreMiddleware, a as setupCoreRoutes } from './index-bInbQd0u.js';
import { r as schema } from './plugin-bootstrap-B2bovEyv.js';
export { aa as Collection, ac as Content, C as CorePlugin, ai as DbPlugin, ak as DbPluginHook, n as LogCategory, au as LogConfig, o as LogEntry, p as LogFilter, m as LogLevel, L as Logger, ae as Media, e as Migration, M as MigrationService, h as MigrationStatus, ab as NewCollection, ad as NewContent, av as NewLogConfig, af as NewMedia, aj as NewPlugin, ar as NewPluginActivityLog, ap as NewPluginAsset, al as NewPluginHook, an as NewPluginRoute, at as NewSystemLog, a9 as NewUser, ah as NewWorkflowHistory, aq as PluginActivityLog, ao as PluginAsset, q as PluginBootstrapService, am as PluginRoute, P as PluginServiceClass, as as SystemLog, a8 as User, ag as WorkflowHistory, z as apiTokens, d as cleanupRemovedCollections, t as collections, w as content, x as contentVersions, f as fullCollectionSync, g as getAvailableCollectionNames, j as getLogger, c as getManagedCollections, k as initLogger, N as insertCollectionSchema, Q as insertContentSchema, a6 as insertLogConfigSchema, S as insertMediaSchema, a2 as insertPluginActivityLogSchema, a0 as insertPluginAssetSchema, Y as insertPluginHookSchema, _ as insertPluginRouteSchema, W as insertPluginSchema, a4 as insertSystemLogSchema, J as insertUserSchema, U as insertWorkflowHistorySchema, i as isCollectionManaged, a as loadCollectionConfig, l as loadCollectionConfigs, I as logConfig, y as media, G as pluginActivityLog, F as pluginAssets, D as pluginHooks, E as pluginRoutes, B as plugins, O as selectCollectionSchema, R as selectContentSchema, a7 as selectLogConfigSchema, T as selectMediaSchema, a3 as selectPluginActivityLogSchema, a1 as selectPluginAssetSchema, Z as selectPluginHookSchema, $ as selectPluginRouteSchema, X as selectPluginSchema, a5 as selectSystemLogSchema, K as selectUserSchema, V as selectWorkflowHistorySchema, b as syncCollection, s as syncCollections, H as systemLogs, u as users, v as validateCollectionConfig, A as workflowHistory } from './plugin-bootstrap-B2bovEyv.js';
export { AuthManager, Permission, PermissionManager, UserPermissions, bootstrapMiddleware, cacheHeaders, compressionMiddleware, detailedLoggingMiddleware, getActivePlugins, isPluginActive, logActivity, loggingMiddleware, optionalAuth, performanceLoggingMiddleware, requireActivePlugin, requireActivePlugins, requireAnyPermission, requireAuth, requirePermission, requireRole, securityHeaders, securityLoggingMiddleware } from './middleware.js';
export { HookSystemImpl, HookUtils, PluginManager as PluginManagerClass, PluginRegistryImpl, PluginValidator as PluginValidatorClass, ScopedHookSystem as ScopedHookSystemClass } from './plugins.js';
export { AlertData, ConfirmationDialogOptions, Filter, FilterBarData, FilterOption, FormData, FormField, PaginationData, TableColumn, TableData, getConfirmationDialogScript, renderAlert, renderConfirmationDialog, renderFilterBar, renderForm, renderFormField, renderPagination, renderTable } from './templates.js';
export { b as CollectionConfig, c as CollectionConfigModule, C as CollectionSchema, d as CollectionSyncResult, a as FieldConfig, F as FieldType } from './collection-config-FLlGtsh9.js';
export { A as AuthService, C as ContentService, u as HOOKS, k as HookContext, H as HookHandler, t as HookName, l as HookSystem, M as MediaService, P as Plugin, g as PluginAdminPage, q as PluginBuilderOptions, h as PluginComponent, b as PluginConfig, a as PluginContext, j as PluginHook, p as PluginLogger, n as PluginManager, i as PluginMenuItem, d as PluginMiddleware, e as PluginModel, m as PluginRegistry, c as PluginRoutes, f as PluginService, o as PluginStatus, s as PluginValidationResult, r as PluginValidator, S as ScopedHookSystem } from './plugin-UzmDImQc.js';
export { PluginManifest } from './types.js';
export { FilterCondition, FilterGroup, FilterOperator, QueryFilter, QueryFilterBuilder, QueryResult, TemplateRenderer, buildQuery, escapeHtml, metricsTracker, renderTemplate, sanitizeInput, sanitizeObject, templateRenderer } from './utils.js';
import * as drizzle_orm_d1 from 'drizzle-orm/d1';
import 'hono/types';
import 'hono';
import '@cloudflare/workers-types';
import 'drizzle-zod';
import 'drizzle-orm/sqlite-core';
import 'zod';

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
 * - Week 3: Routes, Templates (COMPLETED ✓)
 * - Week 4: Integration & Testing (COMPLETED ✓)
 *
 * Test Coverage:
 * - Utilities: 48 tests (sanitize, query-filter, metrics)
 * - Middleware: 51 tests (auth, logging, security, performance)
 * - Total: 99 tests passing
 */

declare const VERSION = "2.0.0-alpha.3";

export { VERSION, createDb };
