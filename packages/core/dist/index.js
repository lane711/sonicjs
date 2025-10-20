import './chunk-4URGXJP7.js';
export { AuthManager, PermissionManager, bootstrapMiddleware, cacheHeaders, compressionMiddleware, detailedLoggingMiddleware, getActivePlugins, isPluginActive, logActivity, loggingMiddleware, optionalAuth, performanceLoggingMiddleware, requireActivePlugin, requireActivePlugins, requireAnyPermission, requireAuth, requirePermission, requireRole, securityHeaders, securityLoggingMiddleware } from './chunk-PTQZ5FEI.js';
import { schema_exports } from './chunk-CXZDAR6S.js';
export { Logger, MigrationService, PluginBootstrapService, PluginService as PluginServiceClass, apiTokens, cleanupRemovedCollections, collections, content, contentVersions, fullCollectionSync, getAvailableCollectionNames, getLogger, getManagedCollections, initLogger, insertCollectionSchema, insertContentSchema, insertLogConfigSchema, insertMediaSchema, insertPluginActivityLogSchema, insertPluginAssetSchema, insertPluginHookSchema, insertPluginRouteSchema, insertPluginSchema, insertSystemLogSchema, insertUserSchema, insertWorkflowHistorySchema, isCollectionManaged, loadCollectionConfig, loadCollectionConfigs, logConfig, media, pluginActivityLog, pluginAssets, pluginHooks, pluginRoutes, plugins, selectCollectionSchema, selectContentSchema, selectLogConfigSchema, selectMediaSchema, selectPluginActivityLogSchema, selectPluginAssetSchema, selectPluginHookSchema, selectPluginRouteSchema, selectPluginSchema, selectSystemLogSchema, selectUserSchema, selectWorkflowHistorySchema, syncCollection, syncCollections, systemLogs, users, validateCollectionConfig, workflowHistory } from './chunk-CXZDAR6S.js';
export { ROUTES_INFO } from './chunk-HD7R6T6I.js';
export { getConfirmationDialogScript, renderAlert, renderConfirmationDialog, renderFilterBar, renderForm, renderFormField, renderPagination, renderTable } from './chunk-KRJMGD4E.js';
export { HookSystemImpl, HookUtils, PluginManager as PluginManagerClass, PluginRegistryImpl, PluginValidator as PluginValidatorClass, ScopedHookSystem as ScopedHookSystemClass } from './chunk-NRSL6BQI.js';
export { QueryFilterBuilder, TemplateRenderer, buildQuery, escapeHtml, metricsTracker, renderTemplate, sanitizeInput, sanitizeObject, templateRenderer } from './chunk-JIINOD2W.js';
export { HOOKS } from './chunk-LOUJRBXV.js';
import './chunk-G3PMV62Z.js';
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
  if (config.routes) {
    for (const route of config.routes) {
      app.route(route.path, route.handler);
    }
  }
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