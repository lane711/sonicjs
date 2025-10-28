/**
 * Middleware Module Exports
 *
 * Request processing middleware for SonicJS
 *
 * Note: Most middleware is currently in the monolith and will be migrated later.
 * For now, we only export the bootstrap middleware which is used for system initialization.
 */

// Bootstrap middleware
export { bootstrapMiddleware } from './bootstrap'

// Auth middleware
export { AuthManager, requireAuth, requireRole, optionalAuth } from './auth'

// Metrics middleware
export { metricsMiddleware } from './metrics'

// Re-export types and functions that are referenced but implemented in monolith
// These are placeholder exports to maintain API compatibility
export type Permission = string
export type UserPermissions = {
  userId: string
  permissions: Permission[]
}

// Middleware stubs - these return pass-through middleware that call next()
export const loggingMiddleware: any = () => async (c: any, next: any) => await next()
export const detailedLoggingMiddleware: any = () => async (c: any, next: any) => await next()
export const securityLoggingMiddleware: any = () => async (c: any, next: any) => await next()
export const performanceLoggingMiddleware: any = () => async (c: any, next: any) => await next()
export const cacheHeaders: any = () => async (c: any, next: any) => await next()
export const compressionMiddleware: any = async (c: any, next: any) => await next()
export const securityHeaders: any = () => async (c: any, next: any) => await next()

// Other stubs
export const PermissionManager: any = {}
export const requirePermission: any = () => async (c: any, next: any) => await next()
export const requireAnyPermission: any = () => async (c: any, next: any) => await next()
export const logActivity: any = () => {}
export const requireActivePlugin: any = () => async (c: any, next: any) => await next()
export const requireActivePlugins: any = () => async (c: any, next: any) => await next()
export const getActivePlugins: any = () => []
export const isPluginActive: any = () => false
