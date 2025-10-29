'use strict';

var chunkWLQAHDR4_cjs = require('./chunk-WLQAHDR4.cjs');
var chunk3NVJ6W27_cjs = require('./chunk-3NVJ6W27.cjs');
var chunkIM5SDXOE_cjs = require('./chunk-IM5SDXOE.cjs');
var chunk3JMOWGUU_cjs = require('./chunk-3JMOWGUU.cjs');
var chunk5APKEYFK_cjs = require('./chunk-5APKEYFK.cjs');
var chunk3SPQ3J4N_cjs = require('./chunk-3SPQ3J4N.cjs');
var chunkHJZOA2O5_cjs = require('./chunk-HJZOA2O5.cjs');
var chunkBRPONFW6_cjs = require('./chunk-BRPONFW6.cjs');
var chunkRCQ2HIQD_cjs = require('./chunk-RCQ2HIQD.cjs');
var chunkKYGRJCZM_cjs = require('./chunk-KYGRJCZM.cjs');
require('./chunk-IGJUBJBW.cjs');
var hono = require('hono');
var d1 = require('drizzle-orm/d1');

function createSonicJSApp(config = {}) {
  const app = new hono.Hono();
  const appVersion = config.version || chunkBRPONFW6_cjs.getCoreVersion();
  const appName = config.name || "SonicJS AI";
  app.use("*", async (c, next) => {
    c.set("appVersion", appVersion);
    await next();
  });
  app.use("*", chunkIM5SDXOE_cjs.metricsMiddleware());
  app.use("*", chunkIM5SDXOE_cjs.bootstrapMiddleware());
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
  app.route("/api", chunkWLQAHDR4_cjs.api_default);
  app.route("/api/media", chunkWLQAHDR4_cjs.api_media_default);
  app.route("/api/system", chunkWLQAHDR4_cjs.api_system_default);
  app.route("/admin/api", chunkWLQAHDR4_cjs.admin_api_default);
  app.route("/admin/dashboard", chunkWLQAHDR4_cjs.router);
  app.route("/admin/collections", chunkWLQAHDR4_cjs.adminCollectionsRoutes);
  app.route("/admin/settings", chunkWLQAHDR4_cjs.adminSettingsRoutes);
  app.route("/admin/content", chunkWLQAHDR4_cjs.admin_content_default);
  app.route("/admin/media", chunkWLQAHDR4_cjs.adminMediaRoutes);
  app.route("/admin/plugins", chunkWLQAHDR4_cjs.adminPluginRoutes);
  app.route("/admin/logs", chunkWLQAHDR4_cjs.adminLogsRoutes);
  app.route("/admin", chunkWLQAHDR4_cjs.userRoutes);
  app.route("/auth", chunkWLQAHDR4_cjs.auth_default);
  app.get("/files/*", async (c) => {
    try {
      const url = new URL(c.req.url);
      const pathname = url.pathname;
      const objectKey = pathname.replace(/^\/files\//, "");
      if (!objectKey) {
        return c.notFound();
      }
      const object = await c.env.MEDIA_BUCKET.get(objectKey);
      if (!object) {
        return c.notFound();
      }
      const headers = new Headers();
      object.httpMetadata?.contentType && headers.set("Content-Type", object.httpMetadata.contentType);
      object.httpMetadata?.contentDisposition && headers.set("Content-Disposition", object.httpMetadata.contentDisposition);
      headers.set("Cache-Control", "public, max-age=31536000");
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      headers.set("Access-Control-Allow-Headers", "Content-Type");
      return new Response(object.body, {
        headers
      });
    } catch (error) {
      console.error("Error serving file:", error);
      return c.notFound();
    }
  });
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
function createDb(d1$1) {
  return d1.drizzle(d1$1, { schema: chunk3NVJ6W27_cjs.schema_exports });
}

// src/index.ts
var VERSION = chunkBRPONFW6_cjs.package_default.version;

Object.defineProperty(exports, "ROUTES_INFO", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.ROUTES_INFO; }
});
Object.defineProperty(exports, "adminApiRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.admin_api_default; }
});
Object.defineProperty(exports, "adminCheckboxRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.adminCheckboxRoutes; }
});
Object.defineProperty(exports, "adminCodeExamplesRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.admin_code_examples_default; }
});
Object.defineProperty(exports, "adminCollectionsRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.adminCollectionsRoutes; }
});
Object.defineProperty(exports, "adminContentRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.admin_content_default; }
});
Object.defineProperty(exports, "adminDashboardRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.router; }
});
Object.defineProperty(exports, "adminDesignRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.adminDesignRoutes; }
});
Object.defineProperty(exports, "adminFAQRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.admin_faq_default; }
});
Object.defineProperty(exports, "adminLogsRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.adminLogsRoutes; }
});
Object.defineProperty(exports, "adminMediaRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.adminMediaRoutes; }
});
Object.defineProperty(exports, "adminPluginRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.adminPluginRoutes; }
});
Object.defineProperty(exports, "adminSettingsRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.adminSettingsRoutes; }
});
Object.defineProperty(exports, "adminTestimonialsRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.admin_testimonials_default; }
});
Object.defineProperty(exports, "adminUsersRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.userRoutes; }
});
Object.defineProperty(exports, "apiContentCrudRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.api_content_crud_default; }
});
Object.defineProperty(exports, "apiMediaRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.api_media_default; }
});
Object.defineProperty(exports, "apiRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.api_default; }
});
Object.defineProperty(exports, "apiSystemRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.api_system_default; }
});
Object.defineProperty(exports, "authRoutes", {
  enumerable: true,
  get: function () { return chunkWLQAHDR4_cjs.auth_default; }
});
Object.defineProperty(exports, "Logger", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.Logger; }
});
Object.defineProperty(exports, "apiTokens", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.apiTokens; }
});
Object.defineProperty(exports, "collections", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.collections; }
});
Object.defineProperty(exports, "content", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.content; }
});
Object.defineProperty(exports, "contentVersions", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.contentVersions; }
});
Object.defineProperty(exports, "getLogger", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.getLogger; }
});
Object.defineProperty(exports, "initLogger", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.initLogger; }
});
Object.defineProperty(exports, "insertCollectionSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.insertCollectionSchema; }
});
Object.defineProperty(exports, "insertContentSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.insertContentSchema; }
});
Object.defineProperty(exports, "insertLogConfigSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.insertLogConfigSchema; }
});
Object.defineProperty(exports, "insertMediaSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.insertMediaSchema; }
});
Object.defineProperty(exports, "insertPluginActivityLogSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.insertPluginActivityLogSchema; }
});
Object.defineProperty(exports, "insertPluginAssetSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.insertPluginAssetSchema; }
});
Object.defineProperty(exports, "insertPluginHookSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.insertPluginHookSchema; }
});
Object.defineProperty(exports, "insertPluginRouteSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.insertPluginRouteSchema; }
});
Object.defineProperty(exports, "insertPluginSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.insertPluginSchema; }
});
Object.defineProperty(exports, "insertSystemLogSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.insertSystemLogSchema; }
});
Object.defineProperty(exports, "insertUserSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.insertUserSchema; }
});
Object.defineProperty(exports, "insertWorkflowHistorySchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.insertWorkflowHistorySchema; }
});
Object.defineProperty(exports, "logConfig", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.logConfig; }
});
Object.defineProperty(exports, "media", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.media; }
});
Object.defineProperty(exports, "pluginActivityLog", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.pluginActivityLog; }
});
Object.defineProperty(exports, "pluginAssets", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.pluginAssets; }
});
Object.defineProperty(exports, "pluginHooks", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.pluginHooks; }
});
Object.defineProperty(exports, "pluginRoutes", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.pluginRoutes; }
});
Object.defineProperty(exports, "plugins", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.plugins; }
});
Object.defineProperty(exports, "selectCollectionSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.selectCollectionSchema; }
});
Object.defineProperty(exports, "selectContentSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.selectContentSchema; }
});
Object.defineProperty(exports, "selectLogConfigSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.selectLogConfigSchema; }
});
Object.defineProperty(exports, "selectMediaSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.selectMediaSchema; }
});
Object.defineProperty(exports, "selectPluginActivityLogSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.selectPluginActivityLogSchema; }
});
Object.defineProperty(exports, "selectPluginAssetSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.selectPluginAssetSchema; }
});
Object.defineProperty(exports, "selectPluginHookSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.selectPluginHookSchema; }
});
Object.defineProperty(exports, "selectPluginRouteSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.selectPluginRouteSchema; }
});
Object.defineProperty(exports, "selectPluginSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.selectPluginSchema; }
});
Object.defineProperty(exports, "selectSystemLogSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.selectSystemLogSchema; }
});
Object.defineProperty(exports, "selectUserSchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.selectUserSchema; }
});
Object.defineProperty(exports, "selectWorkflowHistorySchema", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.selectWorkflowHistorySchema; }
});
Object.defineProperty(exports, "systemLogs", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.systemLogs; }
});
Object.defineProperty(exports, "users", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.users; }
});
Object.defineProperty(exports, "workflowHistory", {
  enumerable: true,
  get: function () { return chunk3NVJ6W27_cjs.workflowHistory; }
});
Object.defineProperty(exports, "AuthManager", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.AuthManager; }
});
Object.defineProperty(exports, "PermissionManager", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.PermissionManager; }
});
Object.defineProperty(exports, "bootstrapMiddleware", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.bootstrapMiddleware; }
});
Object.defineProperty(exports, "cacheHeaders", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.cacheHeaders; }
});
Object.defineProperty(exports, "compressionMiddleware", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.compressionMiddleware; }
});
Object.defineProperty(exports, "detailedLoggingMiddleware", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.detailedLoggingMiddleware; }
});
Object.defineProperty(exports, "getActivePlugins", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.getActivePlugins; }
});
Object.defineProperty(exports, "isPluginActive", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.isPluginActive; }
});
Object.defineProperty(exports, "logActivity", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.logActivity; }
});
Object.defineProperty(exports, "loggingMiddleware", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.loggingMiddleware; }
});
Object.defineProperty(exports, "optionalAuth", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.optionalAuth; }
});
Object.defineProperty(exports, "performanceLoggingMiddleware", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.performanceLoggingMiddleware; }
});
Object.defineProperty(exports, "requireActivePlugin", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.requireActivePlugin; }
});
Object.defineProperty(exports, "requireActivePlugins", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.requireActivePlugins; }
});
Object.defineProperty(exports, "requireAnyPermission", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.requireAnyPermission; }
});
Object.defineProperty(exports, "requireAuth", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.requireAuth; }
});
Object.defineProperty(exports, "requirePermission", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.requirePermission; }
});
Object.defineProperty(exports, "requireRole", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.requireRole; }
});
Object.defineProperty(exports, "securityHeaders", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.securityHeaders; }
});
Object.defineProperty(exports, "securityLoggingMiddleware", {
  enumerable: true,
  get: function () { return chunkIM5SDXOE_cjs.securityLoggingMiddleware; }
});
Object.defineProperty(exports, "MigrationService", {
  enumerable: true,
  get: function () { return chunk3JMOWGUU_cjs.MigrationService; }
});
Object.defineProperty(exports, "PluginBootstrapService", {
  enumerable: true,
  get: function () { return chunk3JMOWGUU_cjs.PluginBootstrapService; }
});
Object.defineProperty(exports, "PluginServiceClass", {
  enumerable: true,
  get: function () { return chunk3JMOWGUU_cjs.PluginService; }
});
Object.defineProperty(exports, "cleanupRemovedCollections", {
  enumerable: true,
  get: function () { return chunk3JMOWGUU_cjs.cleanupRemovedCollections; }
});
Object.defineProperty(exports, "fullCollectionSync", {
  enumerable: true,
  get: function () { return chunk3JMOWGUU_cjs.fullCollectionSync; }
});
Object.defineProperty(exports, "getAvailableCollectionNames", {
  enumerable: true,
  get: function () { return chunk3JMOWGUU_cjs.getAvailableCollectionNames; }
});
Object.defineProperty(exports, "getManagedCollections", {
  enumerable: true,
  get: function () { return chunk3JMOWGUU_cjs.getManagedCollections; }
});
Object.defineProperty(exports, "isCollectionManaged", {
  enumerable: true,
  get: function () { return chunk3JMOWGUU_cjs.isCollectionManaged; }
});
Object.defineProperty(exports, "loadCollectionConfig", {
  enumerable: true,
  get: function () { return chunk3JMOWGUU_cjs.loadCollectionConfig; }
});
Object.defineProperty(exports, "loadCollectionConfigs", {
  enumerable: true,
  get: function () { return chunk3JMOWGUU_cjs.loadCollectionConfigs; }
});
Object.defineProperty(exports, "syncCollection", {
  enumerable: true,
  get: function () { return chunk3JMOWGUU_cjs.syncCollection; }
});
Object.defineProperty(exports, "syncCollections", {
  enumerable: true,
  get: function () { return chunk3JMOWGUU_cjs.syncCollections; }
});
Object.defineProperty(exports, "validateCollectionConfig", {
  enumerable: true,
  get: function () { return chunk3JMOWGUU_cjs.validateCollectionConfig; }
});
Object.defineProperty(exports, "renderFilterBar", {
  enumerable: true,
  get: function () { return chunk5APKEYFK_cjs.renderFilterBar; }
});
Object.defineProperty(exports, "getConfirmationDialogScript", {
  enumerable: true,
  get: function () { return chunk3SPQ3J4N_cjs.getConfirmationDialogScript; }
});
Object.defineProperty(exports, "renderAlert", {
  enumerable: true,
  get: function () { return chunk3SPQ3J4N_cjs.renderAlert; }
});
Object.defineProperty(exports, "renderConfirmationDialog", {
  enumerable: true,
  get: function () { return chunk3SPQ3J4N_cjs.renderConfirmationDialog; }
});
Object.defineProperty(exports, "renderForm", {
  enumerable: true,
  get: function () { return chunk3SPQ3J4N_cjs.renderForm; }
});
Object.defineProperty(exports, "renderFormField", {
  enumerable: true,
  get: function () { return chunk3SPQ3J4N_cjs.renderFormField; }
});
Object.defineProperty(exports, "renderPagination", {
  enumerable: true,
  get: function () { return chunk3SPQ3J4N_cjs.renderPagination; }
});
Object.defineProperty(exports, "renderTable", {
  enumerable: true,
  get: function () { return chunk3SPQ3J4N_cjs.renderTable; }
});
Object.defineProperty(exports, "HookSystemImpl", {
  enumerable: true,
  get: function () { return chunkHJZOA2O5_cjs.HookSystemImpl; }
});
Object.defineProperty(exports, "HookUtils", {
  enumerable: true,
  get: function () { return chunkHJZOA2O5_cjs.HookUtils; }
});
Object.defineProperty(exports, "PluginManagerClass", {
  enumerable: true,
  get: function () { return chunkHJZOA2O5_cjs.PluginManager; }
});
Object.defineProperty(exports, "PluginRegistryImpl", {
  enumerable: true,
  get: function () { return chunkHJZOA2O5_cjs.PluginRegistryImpl; }
});
Object.defineProperty(exports, "PluginValidatorClass", {
  enumerable: true,
  get: function () { return chunkHJZOA2O5_cjs.PluginValidator; }
});
Object.defineProperty(exports, "ScopedHookSystemClass", {
  enumerable: true,
  get: function () { return chunkHJZOA2O5_cjs.ScopedHookSystem; }
});
Object.defineProperty(exports, "QueryFilterBuilder", {
  enumerable: true,
  get: function () { return chunkBRPONFW6_cjs.QueryFilterBuilder; }
});
Object.defineProperty(exports, "SONICJS_VERSION", {
  enumerable: true,
  get: function () { return chunkBRPONFW6_cjs.SONICJS_VERSION; }
});
Object.defineProperty(exports, "TemplateRenderer", {
  enumerable: true,
  get: function () { return chunkBRPONFW6_cjs.TemplateRenderer; }
});
Object.defineProperty(exports, "buildQuery", {
  enumerable: true,
  get: function () { return chunkBRPONFW6_cjs.buildQuery; }
});
Object.defineProperty(exports, "escapeHtml", {
  enumerable: true,
  get: function () { return chunkBRPONFW6_cjs.escapeHtml; }
});
Object.defineProperty(exports, "getCoreVersion", {
  enumerable: true,
  get: function () { return chunkBRPONFW6_cjs.getCoreVersion; }
});
Object.defineProperty(exports, "renderTemplate", {
  enumerable: true,
  get: function () { return chunkBRPONFW6_cjs.renderTemplate; }
});
Object.defineProperty(exports, "sanitizeInput", {
  enumerable: true,
  get: function () { return chunkBRPONFW6_cjs.sanitizeInput; }
});
Object.defineProperty(exports, "sanitizeObject", {
  enumerable: true,
  get: function () { return chunkBRPONFW6_cjs.sanitizeObject; }
});
Object.defineProperty(exports, "templateRenderer", {
  enumerable: true,
  get: function () { return chunkBRPONFW6_cjs.templateRenderer; }
});
Object.defineProperty(exports, "metricsTracker", {
  enumerable: true,
  get: function () { return chunkRCQ2HIQD_cjs.metricsTracker; }
});
Object.defineProperty(exports, "HOOKS", {
  enumerable: true,
  get: function () { return chunkKYGRJCZM_cjs.HOOKS; }
});
exports.VERSION = VERSION;
exports.createDb = createDb;
exports.createSonicJSApp = createSonicJSApp;
exports.setupCoreMiddleware = setupCoreMiddleware;
exports.setupCoreRoutes = setupCoreRoutes;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map