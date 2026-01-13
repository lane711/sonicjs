export { B as Bindings, b as SonicJSApp, S as SonicJSConfig, V as Variables, c as createSonicJSApp, s as setupCoreMiddleware, a as setupCoreRoutes } from './app-Db0AfT5F.js';
import { s as schema } from './plugin-bootstrap-CDh0JHtW.js';
export { ab as Collection, ad as Content, C as CorePlugin, aj as DbPlugin, al as DbPluginHook, p as LogCategory, av as LogConfig, q as LogEntry, t as LogFilter, o as LogLevel, L as Logger, af as Media, m as Migration, M as MigrationService, n as MigrationStatus, ac as NewCollection, ae as NewContent, aw as NewLogConfig, ag as NewMedia, ak as NewPlugin, as as NewPluginActivityLog, aq as NewPluginAsset, am as NewPluginHook, ao as NewPluginRoute, au as NewSystemLog, aa as NewUser, ai as NewWorkflowHistory, ar as PluginActivityLog, ap as PluginAsset, k as PluginBootstrapService, an as PluginRoute, P as PluginServiceClass, at as SystemLog, a9 as User, ah as WorkflowHistory, A as apiTokens, e as cleanupRemovedCollections, w as collections, x as content, y as contentVersions, f as fullCollectionSync, g as getAvailableCollectionNames, h as getLogger, d as getManagedCollections, j as initLogger, O as insertCollectionSchema, R as insertContentSchema, a7 as insertLogConfigSchema, T as insertMediaSchema, a3 as insertPluginActivityLogSchema, a1 as insertPluginAssetSchema, Z as insertPluginHookSchema, $ as insertPluginRouteSchema, X as insertPluginSchema, a5 as insertSystemLogSchema, K as insertUserSchema, V as insertWorkflowHistorySchema, i as isCollectionManaged, a as loadCollectionConfig, l as loadCollectionConfigs, J as logConfig, z as media, H as pluginActivityLog, G as pluginAssets, E as pluginHooks, F as pluginRoutes, D as plugins, r as registerCollections, Q as selectCollectionSchema, S as selectContentSchema, a8 as selectLogConfigSchema, U as selectMediaSchema, a4 as selectPluginActivityLogSchema, a2 as selectPluginAssetSchema, _ as selectPluginHookSchema, a0 as selectPluginRouteSchema, Y as selectPluginSchema, a6 as selectSystemLogSchema, N as selectUserSchema, W as selectWorkflowHistorySchema, c as syncCollection, b as syncCollections, I as systemLogs, u as users, v as validateCollectionConfig, B as workflowHistory } from './plugin-bootstrap-CDh0JHtW.js';
export { AuthManager, Permission, PermissionManager, UserPermissions, bootstrapMiddleware, cacheHeaders, compressionMiddleware, detailedLoggingMiddleware, getActivePlugins, isPluginActive, logActivity, loggingMiddleware, optionalAuth, performanceLoggingMiddleware, requireActivePlugin, requireActivePlugins, requireAnyPermission, requireAuth, requirePermission, requireRole, securityHeaders, securityLoggingMiddleware } from './middleware.js';
export { H as HookSystemImpl, a as HookUtils, b as PluginManagerClass, P as PluginRegistryImpl, c as PluginValidatorClass, S as ScopedHookSystemClass } from './plugin-manager-Baa6xXqB.js';
export { ROUTES_INFO, adminApiRoutes, adminCheckboxRoutes, adminCodeExamplesRoutes, adminCollectionsRoutes, adminContentRoutes, adminDashboardRoutes, adminDesignRoutes, adminLogsRoutes, adminMediaRoutes, adminPluginRoutes, adminSettingsRoutes, adminTestimonialsRoutes, adminUsersRoutes, apiContentCrudRoutes, apiMediaRoutes, apiRoutes, apiSystemRoutes, authRoutes } from './routes.js';
export { A as AlertData, C as ConfirmationDialogOptions, k as Filter, j as FilterBarData, l as FilterOption, h as FormData, F as FormField, P as PaginationData, T as TableColumn, i as TableData, g as getConfirmationDialogScript, d as renderAlert, e as renderConfirmationDialog, f as renderFilterBar, r as renderForm, a as renderFormField, c as renderPagination, b as renderTable } from './filter-bar.template-By4jeiw_.js';
export { b as CollectionConfig, c as CollectionConfigModule, C as CollectionSchema, d as CollectionSyncResult, a as FieldConfig, F as FieldType } from './collection-config-FLlGtsh9.js';
export { A as AuthService, C as ContentService, v as HOOKS, k as HookContext, H as HookHandler, u as HookName, l as HookSystem, p as MediaService, P as Plugin, g as PluginAdminPage, r as PluginBuilderOptions, h as PluginComponent, b as PluginConfig, a as PluginContext, j as PluginHook, q as PluginLogger, n as PluginManager, i as PluginMenuItem, d as PluginMiddleware, e as PluginModel, m as PluginRegistry, c as PluginRoutes, f as PluginService, o as PluginStatus, t as PluginValidationResult, s as PluginValidator, S as ScopedHookSystem } from './plugin-zvZpaiP5.js';
export { P as PluginManifest } from './plugin-manifest-Dpy8wxIB.js';
export { c as FilterCondition, d as FilterGroup, F as FilterOperator, f as QueryFilter, Q as QueryFilterBuilder, h as QueryResult, S as SONICJS_VERSION, T as TemplateRenderer, b as buildQuery, e as escapeHtml, g as getCoreVersion, m as metricsTracker, r as renderTemplate, s as sanitizeInput, a as sanitizeObject, t as templateRenderer } from './version-vktVAxhe.js';
import * as drizzle_orm_d1 from 'drizzle-orm/d1';
import 'hono';
import '@cloudflare/workers-types';
import 'drizzle-zod';
import 'drizzle-orm/sqlite-core';
import 'hono/types';
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

declare const VERSION: string;

export { VERSION, createDb };
