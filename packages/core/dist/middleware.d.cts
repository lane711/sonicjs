import * as hono from 'hono';
import { Context, Next } from 'hono';
import { D1Database as D1Database$1 } from '@cloudflare/workers-types';

type JWTPayload = {
    userId: string;
    email: string;
    role: string;
    exp: number;
    iat: number;
};
declare class AuthManager {
    static generateToken(userId: string, email: string, role: string): Promise<string>;
    static verifyToken(token: string): Promise<JWTPayload | null>;
    static hashPassword(password: string): Promise<string>;
    static verifyPassword(password: string, hash: string): Promise<boolean>;
}
declare const requireAuth: () => (c: Context, next: Next) => Promise<void | (Response & hono.TypedResponse<undefined, 302, "redirect">) | (Response & hono.TypedResponse<{
    error: string;
}, 401, "json">)>;
declare const requireRole: (requiredRole: string | string[]) => (c: Context, next: Next) => Promise<void | (Response & hono.TypedResponse<undefined, 302, "redirect">) | (Response & hono.TypedResponse<{
    error: string;
}, 401, "json">) | (Response & hono.TypedResponse<{
    error: string;
}, 403, "json">)>;
declare const optionalAuth: () => (c: Context, next: Next) => Promise<void>;

type Bindings$2 = {
    DB: D1Database;
};
type Variables = {
    user?: {
        userId: string;
        email: string;
        role: string;
        exp: number;
        iat: number;
    };
    requestId?: string;
    startTime?: number;
};
/**
 * Logging middleware that captures HTTP requests and responses
 */
declare function loggingMiddleware(): (c: Context<{
    Bindings: Bindings$2;
    Variables: Variables;
}>, next: Next) => Promise<void>;
/**
 * Enhanced logging middleware with more detailed request/response logging
 */
declare function detailedLoggingMiddleware(): (c: Context<{
    Bindings: Bindings$2;
    Variables: Variables;
}>, next: Next) => Promise<void>;
/**
 * Security logging middleware for sensitive operations
 */
declare function securityLoggingMiddleware(): (c: Context<{
    Bindings: Bindings$2;
    Variables: Variables;
}>, next: Next) => Promise<void>;
/**
 * Performance logging middleware for slow requests
 */
declare function performanceLoggingMiddleware(slowThreshold?: number): (c: Context<{
    Bindings: Bindings$2;
    Variables: Variables;
}>, next: Next) => Promise<void>;

/**
 * Add cache headers for static admin pages
 * Only caches authenticated pages with short TTL
 */
declare const cacheHeaders: (maxAge?: number) => (c: Context, next: Next) => Promise<void>;
/**
 * Compression middleware - only compress if client supports it
 */
declare const compressionMiddleware: hono.MiddlewareHandler;
/**
 * Set security headers
 */
declare const securityHeaders: () => (c: Context, next: Next) => Promise<void>;

interface Permission {
    id: string;
    name: string;
    description: string;
    category: string;
}
interface UserPermissions {
    userId: string;
    role: string;
    permissions: string[];
    teamPermissions?: Record<string, string[]>;
}
declare class PermissionManager {
    private static permissionCache;
    private static cacheExpiry;
    private static CACHE_TTL;
    /**
     * Get user permissions from database with caching
     */
    static getUserPermissions(db: D1Database, userId: string): Promise<UserPermissions>;
    /**
     * Check if user has a specific permission
     */
    static hasPermission(db: D1Database, userId: string, permission: string, teamId?: string): Promise<boolean>;
    /**
     * Clear permission cache for a user
     */
    static clearUserCache(userId: string): void;
    /**
     * Clear all permission cache
     */
    static clearAllCache(): void;
    /**
     * Clear all permission cache (alias for clearAllCache)
     */
    static clearCache(): void;
    /**
     * Check multiple permissions at once
     */
    static checkMultiplePermissions(db: D1Database, userId: string, permissions: string[], teamId?: string): Promise<Record<string, boolean>>;
    /**
     * Middleware factory to require specific permissions
     */
    static requirePermissions(permissions: string[], teamIdParam?: string): (c: Context, next: Next) => Promise<void | (Response & hono.TypedResponse<{
        error: string;
    }, 401, "json">) | (Response & hono.TypedResponse<{
        error: string;
    }, 403, "json">) | (Response & hono.TypedResponse<{
        error: string;
    }, 500, "json">)>;
    /**
     * Get all available permissions from database
     */
    static getAllPermissions(db: D1Database): Promise<Permission[]>;
}
/**
 * Middleware to require specific permission
 */
declare function requirePermission(permission: string, teamIdParam?: string): (c: Context, next: Next) => Promise<void | (Response & hono.TypedResponse<{
    error: string;
}, 401, "json">) | (Response & hono.TypedResponse<{
    error: string;
}, 403, "json">) | (Response & hono.TypedResponse<{
    error: string;
}, 500, "json">)>;
/**
 * Middleware to require any of the specified permissions
 */
declare function requireAnyPermission(permissions: string[], teamIdParam?: string): (c: Context, next: Next) => Promise<(Response & hono.TypedResponse<{
    error: string;
}, 401, "json">) | (Response & hono.TypedResponse<{
    error: string;
}, 403, "json">) | (Response & hono.TypedResponse<{
    error: string;
}, 500, "json">) | undefined>;
/**
 * Helper to log user activity
 */
declare function logActivity(db: D1Database, userId: string, action: string, resourceType?: string, resourceId?: string, details?: any, ipAddress?: string, userAgent?: string): Promise<void>;

type Bindings$1 = {
    DB: D1Database$1;
};
/**
 * Middleware to check if a plugin is active before allowing access to its routes
 */
declare function requireActivePlugin(pluginName: string): (c: Context<{
    Bindings: Bindings$1;
}>, next: Next) => Promise<void | Response>;
/**
 * Check if multiple plugins are active
 */
declare function requireActivePlugins(pluginNames: string[]): (c: Context<{
    Bindings: Bindings$1;
}>, next: Next) => Promise<void | Response>;
/**
 * Get list of active plugins for menu generation
 */
declare function getActivePlugins(db: D1Database$1): Promise<Array<{
    name: string;
    display_name: string;
    icon?: string;
    settings?: any;
}>>;
/**
 * Check if a specific plugin is active
 */
declare function isPluginActive(db: D1Database$1, pluginName: string): Promise<boolean>;

type Bindings = {
    DB: D1Database;
    KV: KVNamespace;
};
/**
 * Bootstrap middleware that ensures system initialization
 * Runs once per worker instance
 */
declare function bootstrapMiddleware(): (c: Context<{
    Bindings: Bindings;
}>, next: Next) => Promise<void>;

export { AuthManager, type Permission, PermissionManager, type UserPermissions, bootstrapMiddleware, cacheHeaders, compressionMiddleware, detailedLoggingMiddleware, getActivePlugins, isPluginActive, logActivity, loggingMiddleware, optionalAuth, performanceLoggingMiddleware, requireActivePlugin, requireActivePlugins, requireAnyPermission, requireAuth, requirePermission, requireRole, securityHeaders, securityLoggingMiddleware };
