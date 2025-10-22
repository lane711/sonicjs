import { api_default, api_media_default, api_system_default, admin_api_default, admin_content_default, adminMediaRoutes, adminPluginRoutes, adminLogsRoutes, userRoutes, auth_default } from './chunk-JETM2U2D.js';
export { ROUTES_INFO, adminCheckboxRoutes, admin_code_examples_default as adminCodeExamplesRoutes, admin_content_default as adminContentRoutes, adminDesignRoutes, admin_faq_default as adminFAQRoutes, adminLogsRoutes, adminMediaRoutes, adminPluginRoutes, admin_testimonials_default as adminTestimonialsRoutes, userRoutes as adminUsersRoutes, api_media_default as apiMediaRoutes, api_default as apiRoutes, auth_default as authRoutes } from './chunk-JETM2U2D.js';
import './chunk-3MNMOLSA.js';
export { AuthManager, PermissionManager, bootstrapMiddleware, cacheHeaders, compressionMiddleware, detailedLoggingMiddleware, getActivePlugins, isPluginActive, logActivity, loggingMiddleware, optionalAuth, performanceLoggingMiddleware, requireActivePlugin, requireActivePlugins, requireAnyPermission, requireAuth, requirePermission, requireRole, securityHeaders, securityLoggingMiddleware } from './chunk-WESS2U3K.js';
import { schema_exports } from './chunk-7N3HK7ZK.js';
export { Logger, MigrationService, PluginBootstrapService, PluginService as PluginServiceClass, apiTokens, cleanupRemovedCollections, collections, content, contentVersions, fullCollectionSync, getAvailableCollectionNames, getLogger, getManagedCollections, initLogger, insertCollectionSchema, insertContentSchema, insertLogConfigSchema, insertMediaSchema, insertPluginActivityLogSchema, insertPluginAssetSchema, insertPluginHookSchema, insertPluginRouteSchema, insertPluginSchema, insertSystemLogSchema, insertUserSchema, insertWorkflowHistorySchema, isCollectionManaged, loadCollectionConfig, loadCollectionConfigs, logConfig, media, pluginActivityLog, pluginAssets, pluginHooks, pluginRoutes, plugins, selectCollectionSchema, selectContentSchema, selectLogConfigSchema, selectMediaSchema, selectPluginActivityLogSchema, selectPluginAssetSchema, selectPluginHookSchema, selectPluginRouteSchema, selectPluginSchema, selectSystemLogSchema, selectUserSchema, selectWorkflowHistorySchema, syncCollection, syncCollections, systemLogs, users, validateCollectionConfig, workflowHistory } from './chunk-7N3HK7ZK.js';
export { renderFilterBar, renderForm, renderFormField } from './chunk-LU6J53IX.js';
export { getConfirmationDialogScript, renderAlert, renderConfirmationDialog, renderPagination, renderTable } from './chunk-P3VS4DV3.js';
export { HookSystemImpl, HookUtils, PluginManager as PluginManagerClass, PluginRegistryImpl, PluginValidator as PluginValidatorClass, ScopedHookSystem as ScopedHookSystemClass } from './chunk-BITQ4MFX.js';
export { QueryFilterBuilder, TemplateRenderer, buildQuery, escapeHtml, metricsTracker, renderTemplate, sanitizeInput, sanitizeObject, templateRenderer } from './chunk-JIINOD2W.js';
export { HOOKS } from './chunk-LOUJRBXV.js';
import './chunk-V4OQ3NZ2.js';
import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';

function createSonicJSApp(config = {}) {
  const app = new Hono();
  const appVersion = config.version || "1.0.0";
  const appName = config.name || "SonicJS";
  app.use("*", async (c, next) => {
    c.set("appVersion", appVersion);
    await next();
  });
  app.use("*", async (_c, next) => {
    await next();
  });
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
var VERSION = "2.0.0-alpha.3";

export { VERSION, createDb, createSonicJSApp, setupCoreMiddleware, setupCoreRoutes };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map