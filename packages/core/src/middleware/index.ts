/**
 * Middleware Module Exports
 *
 * Request processing middleware for SonicJS
 */

// Authentication middleware
export { AuthManager, requireAuth, requireRole, optionalAuth } from './auth'

// Logging middleware
export {
  loggingMiddleware,
  detailedLoggingMiddleware,
  securityLoggingMiddleware,
  performanceLoggingMiddleware,
} from './logging'

// Performance monitoring middleware
export {
  cacheHeaders,
  compressionMiddleware,
  securityHeaders,
} from './performance'

// Permissions middleware
export {
  PermissionManager,
  requirePermission,
  requireAnyPermission,
  logActivity,
} from './permissions'
export type { Permission, UserPermissions } from './permissions'

// Plugin middleware
export {
  requireActivePlugin,
  requireActivePlugins,
  getActivePlugins,
  isPluginActive,
} from './plugin-middleware'

// Bootstrap middleware
export { bootstrapMiddleware } from './bootstrap'
