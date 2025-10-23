import { MigrationService, syncCollections, PluginBootstrapService } from './chunk-CDBVZEWR.js';

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
      const migrationService = new MigrationService(c.env.DB);
      await migrationService.runPendingMigrations();
      console.log("[Bootstrap] Syncing collection configurations...");
      try {
        await syncCollections(c.env.DB);
      } catch (error) {
        console.error("[Bootstrap] Error syncing collections:", error);
      }
      console.log("[Bootstrap] Bootstrapping core plugins...");
      const bootstrapService = new PluginBootstrapService(c.env.DB);
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

export { AuthManager, PermissionManager, bootstrapMiddleware, cacheHeaders, compressionMiddleware, detailedLoggingMiddleware, getActivePlugins, isPluginActive, logActivity, loggingMiddleware, optionalAuth, performanceLoggingMiddleware, requireActivePlugin, requireActivePlugins, requireAnyPermission, requireAuth, requirePermission, requireRole, securityHeaders, securityLoggingMiddleware };
//# sourceMappingURL=chunk-TY3NHEBN.js.map
//# sourceMappingURL=chunk-TY3NHEBN.js.map