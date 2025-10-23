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

// Re-export types and functions that are referenced but implemented in monolith
// These are placeholder exports to maintain API compatibility
export type Permission = string
export type UserPermissions = {
  userId: string
  permissions: Permission[]
}

// Placeholder exports (to be implemented when middleware is migrated)
export const AuthManager: any = {}
export const requireAuth: any = () => {}
export const requireRole: any = () => {}
export const optionalAuth: any = () => {}
export const loggingMiddleware: any = () => {}
export const detailedLoggingMiddleware: any = () => {}
export const securityLoggingMiddleware: any = () => {}
export const performanceLoggingMiddleware: any = () => {}
export const cacheHeaders: any = () => {}
export const compressionMiddleware: any = () => {}
export const securityHeaders: any = () => {}
export const PermissionManager: any = {}
export const requirePermission: any = () => {}
export const requireAnyPermission: any = () => {}
export const logActivity: any = () => {}
export const requireActivePlugin: any = () => {}
export const requireActivePlugins: any = () => {}
export const getActivePlugins: any = () => {}
export const isPluginActive: any = () => {}
