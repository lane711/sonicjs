'use strict';

var chunkLEG4KNFP_cjs = require('./chunk-LEG4KNFP.cjs');

// src/middleware/bootstrap.ts
var bootstrapComplete = false;
function bootstrapMiddleware() {
  return async (c, next) => {
    if (bootstrapComplete) {
      return next();
    }
    const path = c.req.path;
    if (path.startsWith("/images/") || path.startsWith("/assets/") || path === "/health" || path.endsWith(".js") || path.endsWith(".css") || path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".ico")) {
      return next();
    }
    try {
      console.log("[Bootstrap] Starting system initialization...");
      console.log("[Bootstrap] Running database migrations...");
      const migrationService = new chunkLEG4KNFP_cjs.MigrationService(c.env.DB);
      await migrationService.runPendingMigrations();
      console.log("[Bootstrap] Syncing collection configurations...");
      try {
        await chunkLEG4KNFP_cjs.syncCollections(c.env.DB);
      } catch (error) {
        console.error("[Bootstrap] Error syncing collections:", error);
      }
      console.log("[Bootstrap] Bootstrapping core plugins...");
      const bootstrapService = new chunkLEG4KNFP_cjs.PluginBootstrapService(c.env.DB);
      const needsBootstrap = await bootstrapService.isBootstrapNeeded();
      if (needsBootstrap) {
        await bootstrapService.bootstrapCorePlugins();
      }
      bootstrapComplete = true;
      console.log("[Bootstrap] System initialization completed");
    } catch (error) {
      console.error("[Bootstrap] Error during system initialization:", error);
    }
    return next();
  };
}

// src/middleware/index.ts
var AuthManager = {};
var requireAuth = () => {
};
var requireRole = () => {
};
var optionalAuth = () => {
};
var loggingMiddleware = () => {
};
var detailedLoggingMiddleware = () => {
};
var securityLoggingMiddleware = () => {
};
var performanceLoggingMiddleware = () => {
};
var cacheHeaders = () => {
};
var compressionMiddleware = () => {
};
var securityHeaders = () => {
};
var PermissionManager = {};
var requirePermission = () => {
};
var requireAnyPermission = () => {
};
var logActivity = () => {
};
var requireActivePlugin = () => {
};
var requireActivePlugins = () => {
};
var getActivePlugins = () => {
};
var isPluginActive = () => {
};

exports.AuthManager = AuthManager;
exports.PermissionManager = PermissionManager;
exports.bootstrapMiddleware = bootstrapMiddleware;
exports.cacheHeaders = cacheHeaders;
exports.compressionMiddleware = compressionMiddleware;
exports.detailedLoggingMiddleware = detailedLoggingMiddleware;
exports.getActivePlugins = getActivePlugins;
exports.isPluginActive = isPluginActive;
exports.logActivity = logActivity;
exports.loggingMiddleware = loggingMiddleware;
exports.optionalAuth = optionalAuth;
exports.performanceLoggingMiddleware = performanceLoggingMiddleware;
exports.requireActivePlugin = requireActivePlugin;
exports.requireActivePlugins = requireActivePlugins;
exports.requireAnyPermission = requireAnyPermission;
exports.requireAuth = requireAuth;
exports.requirePermission = requirePermission;
exports.requireRole = requireRole;
exports.securityHeaders = securityHeaders;
exports.securityLoggingMiddleware = securityLoggingMiddleware;
//# sourceMappingURL=chunk-KM4AJFXI.cjs.map
//# sourceMappingURL=chunk-KM4AJFXI.cjs.map