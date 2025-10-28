import { api_default, api_media_default, api_system_default, admin_api_default, router, adminCollectionsRoutes, adminSettingsRoutes, admin_content_default, adminMediaRoutes, adminPluginRoutes, adminLogsRoutes, userRoutes, auth_default } from './chunk-RIKLAIXY.js';
export { ROUTES_INFO, admin_api_default as adminApiRoutes, adminCheckboxRoutes, admin_code_examples_default as adminCodeExamplesRoutes, adminCollectionsRoutes, admin_content_default as adminContentRoutes, router as adminDashboardRoutes, adminDesignRoutes, admin_faq_default as adminFAQRoutes, adminLogsRoutes, adminMediaRoutes, adminPluginRoutes, adminSettingsRoutes, admin_testimonials_default as adminTestimonialsRoutes, userRoutes as adminUsersRoutes, api_content_crud_default as apiContentCrudRoutes, api_media_default as apiMediaRoutes, api_default as apiRoutes, api_system_default as apiSystemRoutes, auth_default as authRoutes } from './chunk-RIKLAIXY.js';
import { schema_exports } from './chunk-LH4Z7QID.js';
export { Logger, apiTokens, collections, content, contentVersions, getLogger, initLogger, insertCollectionSchema, insertContentSchema, insertLogConfigSchema, insertMediaSchema, insertPluginActivityLogSchema, insertPluginAssetSchema, insertPluginHookSchema, insertPluginRouteSchema, insertPluginSchema, insertSystemLogSchema, insertUserSchema, insertWorkflowHistorySchema, logConfig, media, pluginActivityLog, pluginAssets, pluginHooks, pluginRoutes, plugins, selectCollectionSchema, selectContentSchema, selectLogConfigSchema, selectMediaSchema, selectPluginActivityLogSchema, selectPluginAssetSchema, selectPluginHookSchema, selectPluginRouteSchema, selectPluginSchema, selectSystemLogSchema, selectUserSchema, selectWorkflowHistorySchema, systemLogs, users, workflowHistory } from './chunk-LH4Z7QID.js';
import { metricsMiddleware, bootstrapMiddleware } from './chunk-2WA6LK6M.js';
export { AuthManager, PermissionManager, bootstrapMiddleware, cacheHeaders, compressionMiddleware, detailedLoggingMiddleware, getActivePlugins, isPluginActive, logActivity, loggingMiddleware, optionalAuth, performanceLoggingMiddleware, requireActivePlugin, requireActivePlugins, requireAnyPermission, requireAuth, requirePermission, requireRole, securityHeaders, securityLoggingMiddleware } from './chunk-2WA6LK6M.js';
export { MigrationService, PluginBootstrapService, PluginService as PluginServiceClass, cleanupRemovedCollections, fullCollectionSync, getAvailableCollectionNames, getManagedCollections, isCollectionManaged, loadCollectionConfig, loadCollectionConfigs, syncCollection, syncCollections, validateCollectionConfig } from './chunk-CDBVZEWR.js';
export { renderFilterBar } from './chunk-RYQCT2IV.js';
export { getConfirmationDialogScript, renderAlert, renderConfirmationDialog, renderForm, renderFormField, renderPagination, renderTable } from './chunk-3LZ6TLPC.js';
export { HookSystemImpl, HookUtils, PluginManager as PluginManagerClass, PluginRegistryImpl, PluginValidator as PluginValidatorClass, ScopedHookSystem as ScopedHookSystemClass } from './chunk-EAELJXRV.js';
import { package_default, getCoreVersion } from './chunk-WKGONLHK.js';
export { QueryFilterBuilder, SONICJS_VERSION, TemplateRenderer, buildQuery, escapeHtml, getCoreVersion, renderTemplate, sanitizeInput, sanitizeObject, templateRenderer } from './chunk-WKGONLHK.js';
export { metricsTracker } from './chunk-FICTAGD4.js';
export { HOOKS } from './chunk-LOUJRBXV.js';
import './chunk-V4OQ3NZ2.js';
import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';

function createSonicJSApp(config = {}) {
  const app = new Hono();
  const appVersion = config.version || getCoreVersion();
  const appName = config.name || "SonicJS AI";
  app.use("*", async (c, next) => {
    c.set("appVersion", appVersion);
    await next();
  });
  app.use("*", metricsMiddleware());
  app.use("*", bootstrapMiddleware());
  if (config.middleware?.beforeAuth) {
    for (const middleware of config.middleware.beforeAuth) {
      app.use("*", middleware);
    }
  }
  app.use("*", async (_c, next) => {
    await next();
  });
  app.use("*", async (_c, next) => {
    await next();
  });
  if (config.middleware?.afterAuth) {
    for (const middleware of config.middleware.afterAuth) {
      app.use("*", middleware);
    }
  }
  app.route("/api", api_default);
  app.route("/api/media", api_media_default);
  app.route("/api/system", api_system_default);
  app.route("/admin/api", admin_api_default);
  app.route("/admin/dashboard", router);
  app.route("/admin/collections", adminCollectionsRoutes);
  app.route("/admin/settings", adminSettingsRoutes);
  app.route("/admin/content", admin_content_default);
  app.route("/admin/media", adminMediaRoutes);
  app.route("/admin/plugins", adminPluginRoutes);
  app.route("/admin/logs", adminLogsRoutes);
  app.route("/admin", userRoutes);
  app.route("/auth", auth_default);
  if (config.routes) {
    for (const route of config.routes) {
      app.route(route.path, route.handler);
    }
  }
  app.get("/", (c) => {
    return c.redirect("/auth/login");
  });
  app.get("/health", (c) => {
    return c.json({
      name: appName,
      version: appVersion,
      status: "running",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.notFound((c) => {
    return c.json({ error: "Not Found", status: 404 }, 404);
  });
  app.onError((err, c) => {
    console.error(err);
    return c.json({ error: "Internal Server Error", status: 500 }, 500);
  });
  return app;
}
function setupCoreMiddleware(_app) {
  console.warn("setupCoreMiddleware is deprecated. Use createSonicJSApp() instead.");
}
function setupCoreRoutes(_app) {
  console.warn("setupCoreRoutes is deprecated. Use createSonicJSApp() instead.");
}
function createDb(d1) {
  return drizzle(d1, { schema: schema_exports });
}

// src/index.ts
var VERSION = package_default.version;

export { VERSION, createDb, createSonicJSApp, setupCoreMiddleware, setupCoreRoutes };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map