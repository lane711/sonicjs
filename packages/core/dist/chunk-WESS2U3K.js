import { getLogger, MigrationService, syncCollections, PluginBootstrapService } from './chunk-7N3HK7ZK.js';
import { sign, verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';
import { compress } from 'hono/compress';

var JWT_SECRET = "your-super-secret-jwt-key-change-in-production";
var AuthManager = class {
  static async generateToken(userId, email, role) {
    const payload = {
      userId,
      email,
      role,
      exp: Math.floor(Date.now() / 1e3) + 60 * 60 * 24,
      // 24 hours
      iat: Math.floor(Date.now() / 1e3)
    };
    return await sign(payload, JWT_SECRET);
  }
  static async verifyToken(token) {
    try {
      const payload = await verify(token, JWT_SECRET);
      if (payload.exp < Math.floor(Date.now() / 1e3)) {
        return null;
      }
      return payload;
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  }
  static async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "salt-change-in-production");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  static async verifyPassword(password, hash) {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }
};
var requireAuth = () => {
  return async (c, next) => {
    try {
      let token = c.req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        token = getCookie(c, "auth_token");
      }
      if (!token) {
        const acceptHeader = c.req.header("Accept") || "";
        if (acceptHeader.includes("text/html")) {
          return c.redirect("/auth/login?error=Please login to access the admin area");
        }
        return c.json({ error: "Authentication required" }, 401);
      }
      const kv = c.env?.KV;
      let payload = null;
      if (kv) {
        const cacheKey = `auth:${token.substring(0, 20)}`;
        const cached = await kv.get(cacheKey, "json");
        if (cached) {
          payload = cached;
        }
      }
      if (!payload) {
        payload = await AuthManager.verifyToken(token);
        if (payload && kv) {
          const cacheKey = `auth:${token.substring(0, 20)}`;
          await kv.put(cacheKey, JSON.stringify(payload), { expirationTtl: 300 });
        }
      }
      if (!payload) {
        const acceptHeader = c.req.header("Accept") || "";
        if (acceptHeader.includes("text/html")) {
          return c.redirect("/auth/login?error=Your session has expired, please login again");
        }
        return c.json({ error: "Invalid or expired token" }, 401);
      }
      c.set("user", payload);
      return await next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      const acceptHeader = c.req.header("Accept") || "";
      if (acceptHeader.includes("text/html")) {
        return c.redirect("/auth/login?error=Authentication failed, please login again");
      }
      return c.json({ error: "Authentication failed" }, 401);
    }
  };
};
var requireRole = (requiredRole) => {
  return async (c, next) => {
    const user = c.get("user");
    if (!user) {
      const acceptHeader = c.req.header("Accept") || "";
      if (acceptHeader.includes("text/html")) {
        return c.redirect("/auth/login?error=Please login to access the admin area");
      }
      return c.json({ error: "Authentication required" }, 401);
    }
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      const acceptHeader = c.req.header("Accept") || "";
      if (acceptHeader.includes("text/html")) {
        return c.redirect("/auth/login?error=You do not have permission to access this area");
      }
      return c.json({ error: "Insufficient permissions" }, 403);
    }
    return await next();
  };
};
var optionalAuth = () => {
  return async (c, next) => {
    try {
      let token = c.req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        token = getCookie(c, "auth_token");
      }
      if (token) {
        const payload = await AuthManager.verifyToken(token);
        if (payload) {
          c.set("user", payload);
        }
      }
      return await next();
    } catch (error) {
      console.error("Optional auth error:", error);
      return await next();
    }
  };
};

// src/middleware/logging.ts
function loggingMiddleware() {
  return async (c, next) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    c.set("requestId", requestId);
    c.set("startTime", startTime);
    try {
      const logger = getLogger(c.env.DB);
      const user = c.get("user");
      const method = c.req.method;
      const url = c.req.url;
      const userAgent = c.req.header("user-agent") || "";
      const ipAddress = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
      await next();
      const duration = Date.now() - startTime;
      const status = c.res.status;
      const skipLogging = url.includes("/admin/api/metrics");
      if (!skipLogging) {
        await logger.logRequest(method, url, status, duration, {
          userId: user?.userId,
          requestId,
          ipAddress,
          userAgent,
          source: "http-middleware"
        });
      }
      if (status >= 400) {
        await logger.warn("api", `HTTP ${status} error for ${method} ${url}`, {
          method,
          url,
          status,
          duration,
          userAgent,
          userId: user?.userId
        }, {
          userId: user?.userId,
          requestId,
          ipAddress,
          userAgent,
          method,
          url,
          statusCode: status,
          duration,
          source: "http-middleware",
          tags: ["http-error", `status-${status}`]
        });
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      try {
        const logger = getLogger(c.env.DB);
        const user = c.get("user");
        await logger.error("api", `Unhandled error in ${c.req.method} ${c.req.url}`, error, {
          userId: user?.userId,
          requestId,
          ipAddress: c.req.header("cf-connecting-ip") || "unknown",
          userAgent: c.req.header("user-agent") || "",
          method: c.req.method,
          url: c.req.url,
          duration,
          source: "http-middleware",
          tags: ["unhandled-error"]
        });
      } catch (logError) {
        console.error("Failed to log error:", logError);
        console.error("Original error:", error);
      }
      throw error;
    }
  };
}
function detailedLoggingMiddleware() {
  return async (c, next) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    c.set("requestId", requestId);
    c.set("startTime", startTime);
    try {
      const logger = getLogger(c.env.DB);
      const user = c.get("user");
      const method = c.req.method;
      const url = c.req.url;
      const userAgent = c.req.header("user-agent") || "";
      const ipAddress = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
      const contentType = c.req.header("content-type") || "";
      const contentLength = c.req.header("content-length") || "";
      await logger.debug("api", `Starting ${method} ${url}`, {
        method,
        url,
        userAgent,
        contentType,
        contentLength,
        headers: Object.fromEntries(c.req.raw.headers.entries())
      }, {
        userId: user?.userId,
        requestId,
        ipAddress,
        userAgent,
        method,
        url,
        source: "detailed-middleware",
        tags: ["request-start"]
      });
      await next();
      const duration = Date.now() - startTime;
      const status = c.res.status;
      const responseHeaders = Object.fromEntries(c.res.headers.entries());
      await logger.info("api", `Completed ${method} ${url} - ${status} (${duration}ms)`, {
        method,
        url,
        status,
        duration,
        responseHeaders,
        responseSize: c.res.headers.get("content-length")
      }, {
        userId: user?.userId,
        requestId,
        ipAddress,
        userAgent,
        method,
        url,
        statusCode: status,
        duration,
        source: "detailed-middleware",
        tags: ["request-complete", `status-${Math.floor(status / 100)}xx`]
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      try {
        const logger = getLogger(c.env.DB);
        const user = c.get("user");
        await logger.error("api", `Request failed: ${c.req.method} ${c.req.url}`, error, {
          userId: user?.userId,
          requestId,
          ipAddress: c.req.header("cf-connecting-ip") || "unknown",
          userAgent: c.req.header("user-agent") || "",
          method: c.req.method,
          url: c.req.url,
          duration,
          source: "detailed-middleware",
          tags: ["request-error"]
        });
      } catch (logError) {
        console.error("Failed to log detailed error:", logError);
        console.error("Original error:", error);
      }
      throw error;
    }
  };
}
function securityLoggingMiddleware() {
  return async (c, next) => {
    const startTime = Date.now();
    const requestId = c.get("requestId") || crypto.randomUUID();
    try {
      const logger = getLogger(c.env.DB);
      const user = c.get("user");
      const method = c.req.method;
      const url = c.req.url;
      const ipAddress = c.req.header("cf-connecting-ip") || "unknown";
      const userAgent = c.req.header("user-agent") || "";
      const suspiciousPatterns = [
        /script[^>]*>/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /\.\.\/\.\.\//,
        /\/etc\/passwd/i,
        /union\s+select/i,
        /drop\s+table/i
      ];
      const isSuspicious = suspiciousPatterns.some(
        (pattern) => pattern.test(url) || pattern.test(userAgent)
      );
      if (isSuspicious) {
        await logger.logSecurity("Suspicious request pattern detected", "medium", {
          userId: user?.userId,
          requestId,
          ipAddress,
          userAgent,
          method,
          url,
          source: "security-middleware",
          tags: ["suspicious-pattern"]
        });
      }
      await next();
      const duration = Date.now() - startTime;
      const status = c.res.status;
      if (url.includes("/auth/") && status === 401) {
        await logger.logSecurity("Authentication failure", "low", {
          userId: user?.userId,
          requestId,
          ipAddress,
          userAgent,
          method,
          url,
          statusCode: status,
          duration,
          source: "security-middleware",
          tags: ["auth-failure"]
        });
      }
      if (url.includes("/admin/") && status < 400 && !url.includes("/admin/api/metrics")) {
        await logger.logSecurity("Admin area access", "low", {
          userId: user?.userId,
          requestId,
          ipAddress,
          userAgent,
          method,
          url,
          statusCode: status,
          duration,
          source: "security-middleware",
          tags: ["admin-access"]
        });
      }
    } catch (error) {
      try {
        const logger = getLogger(c.env.DB);
        await logger.error("security", "Security middleware error", error, {
          requestId,
          source: "security-middleware"
        });
      } catch (logError) {
        console.error("Failed to log security error:", logError);
      }
      throw error;
    }
  };
}
function performanceLoggingMiddleware(slowThreshold = 1e3) {
  return async (c, next) => {
    const startTime = Date.now();
    const requestId = c.get("requestId") || crypto.randomUUID();
    await next();
    const duration = Date.now() - startTime;
    if (duration > slowThreshold) {
      try {
        const logger = getLogger(c.env.DB);
        const user = c.get("user");
        await logger.warn("system", `Slow request detected: ${c.req.method} ${c.req.url} took ${duration}ms`, {
          method: c.req.method,
          url: c.req.url,
          duration,
          threshold: slowThreshold
        }, {
          userId: user?.userId,
          requestId,
          method: c.req.method,
          url: c.req.url,
          duration,
          source: "performance-middleware",
          tags: ["slow-request", "performance"]
        });
      } catch (error) {
        console.error("Failed to log slow request:", error);
      }
    }
  };
}
var cacheHeaders = (maxAge = 60) => {
  return async (c, next) => {
    await next();
    if (c.res.status === 200 && c.res.headers.get("Content-Type")?.includes("text/html")) {
      c.res.headers.set("Cache-Control", `private, max-age=${maxAge}`);
    }
  };
};
var compressionMiddleware = compress();
var securityHeaders = () => {
  return async (c, next) => {
    await next();
    c.res.headers.set("X-Content-Type-Options", "nosniff");
    c.res.headers.set("X-Frame-Options", "SAMEORIGIN");
    c.res.headers.set("X-XSS-Protection", "1; mode=block");
  };
};

// src/middleware/permissions.ts
var PermissionManager = class _PermissionManager {
  static permissionCache = /* @__PURE__ */ new Map();
  static cacheExpiry = /* @__PURE__ */ new Map();
  static CACHE_TTL = 5 * 60 * 1e3;
  // 5 minutes
  /**
   * Get user permissions from database with caching
   */
  static async getUserPermissions(db, userId) {
    const cacheKey = `permissions:${userId}`;
    const now = Date.now();
    if (this.permissionCache.has(cacheKey)) {
      const expiry = this.cacheExpiry.get(cacheKey) || 0;
      if (now < expiry) {
        return this.permissionCache.get(cacheKey);
      }
    }
    const userStmt = db.prepare("SELECT id, role FROM users WHERE id = ? AND is_active = 1");
    const user = await userStmt.bind(userId).first();
    if (!user) {
      throw new Error("User not found");
    }
    const rolePermStmt = db.prepare(`
      SELECT p.name 
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role = ?
    `);
    const { results: rolePermissions } = await rolePermStmt.bind(user.role).all();
    const rolePerms = (rolePermissions || []).map((row) => row.name);
    const permissions = [...rolePerms];
    const teamPermStmt = db.prepare(`
      SELECT tm.team_id, tm.role, tm.permissions
      FROM team_memberships tm
      WHERE tm.user_id = ?
    `);
    const { results: teamMemberships } = await teamPermStmt.bind(userId).all();
    const teamPermissions = {};
    for (const membership of teamMemberships || []) {
      const teamRole = membership.role;
      const customPerms = membership.permissions ? JSON.parse(membership.permissions) : [];
      const teamRolePerms = await rolePermStmt.bind(teamRole).all();
      const teamRolePermissions = (teamRolePerms.results || []).map((row) => row.name);
      teamPermissions[membership.team_id] = [...teamRolePermissions, ...customPerms];
    }
    const userPermissions = {
      userId,
      role: user.role,
      permissions,
      teamPermissions
    };
    this.permissionCache.set(cacheKey, userPermissions);
    this.cacheExpiry.set(cacheKey, now + this.CACHE_TTL);
    return userPermissions;
  }
  /**
   * Check if user has a specific permission
   */
  static async hasPermission(db, userId, permission, teamId) {
    try {
      console.log("hasPermission called with:", { userId, permission, teamId });
      const userPerms = await this.getUserPermissions(db, userId);
      console.log("User permissions result:", userPerms);
      if (userPerms.permissions.includes(permission)) {
        console.log("Permission found in global permissions");
        return true;
      }
      if (teamId && userPerms.teamPermissions && userPerms.teamPermissions[teamId]) {
        const hasTeamPermission = userPerms.teamPermissions[teamId].includes(permission);
        console.log("Team permission check:", hasTeamPermission);
        return hasTeamPermission;
      }
      console.log("Permission not found");
      return false;
    } catch (error) {
      console.error("Permission check error:", error);
      if (error instanceof Error && error.message === "User not found") {
        return false;
      }
      throw error;
    }
  }
  /**
   * Clear permission cache for a user
   */
  static clearUserCache(userId) {
    const cacheKey = `permissions:${userId}`;
    this.permissionCache.delete(cacheKey);
    this.cacheExpiry.delete(cacheKey);
  }
  /**
   * Clear all permission cache
   */
  static clearAllCache() {
    this.permissionCache.clear();
    this.cacheExpiry.clear();
  }
  /**
   * Clear all permission cache (alias for clearAllCache)
   */
  static clearCache() {
    this.clearAllCache();
  }
  /**
   * Check multiple permissions at once
   */
  static async checkMultiplePermissions(db, userId, permissions, teamId) {
    const result = {};
    for (const permission of permissions) {
      result[permission] = await this.hasPermission(db, userId, permission, teamId);
    }
    return result;
  }
  /**
   * Middleware factory to require specific permissions
   */
  static requirePermissions(permissions, teamIdParam) {
    return async (c, next) => {
      const user = c.get("user");
      if (!user) {
        return c.json({ error: "Authentication required" }, 401);
      }
      const db = c.env.DB;
      const teamId = teamIdParam ? c.req.param(teamIdParam) : void 0;
      try {
        for (const permission of permissions) {
          const hasPermission = await _PermissionManager.hasPermission(db, user.userId, permission, teamId);
          if (!hasPermission) {
            return c.json({ error: `Permission denied: ${permission}` }, 403);
          }
        }
        return await next();
      } catch (error) {
        console.error("Permission check error:", error);
        return c.json({ error: "Permission check failed" }, 500);
      }
    };
  }
  /**
   * Get all available permissions from database
   */
  static async getAllPermissions(db) {
    const stmt = db.prepare("SELECT * FROM permissions ORDER BY category, name");
    const { results } = await stmt.all();
    return (results || []).map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category
    }));
  }
};
function requirePermission(permission, teamIdParam) {
  return async (c, next) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const db = c.env.DB;
    const teamId = teamIdParam ? c.req.param(teamIdParam) : void 0;
    try {
      const hasPermission = await PermissionManager.hasPermission(db, user.userId, permission, teamId);
      if (!hasPermission) {
        return c.json({ error: `Permission denied: ${permission}` }, 403);
      }
      return await next();
    } catch (error) {
      console.error("Permission check error:", error);
      return c.json({ error: "Permission check failed" }, 500);
    }
  };
}
function requireAnyPermission(permissions, teamIdParam) {
  return async (c, next) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Authentication required" }, 401);
    }
    const db = c.env.DB;
    const teamId = teamIdParam ? c.req.param(teamIdParam) : void 0;
    try {
      for (const permission of permissions) {
        const hasPermission = await PermissionManager.hasPermission(db, user.userId, permission, teamId);
        if (hasPermission) {
          await next();
          return;
        }
      }
      return c.json({ error: `Permission denied. Required one of: ${permissions.join(", ")}` }, 403);
    } catch (error) {
      console.error("Permission check error:", error);
      return c.json({ error: "Permission check failed" }, 500);
    }
  };
}
async function logActivity(db, userId, action, resourceType, resourceId, details, ipAddress, userAgent) {
  try {
    const logStmt = db.prepare(`
      INSERT INTO activity_logs (id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    await logStmt.bind(
      crypto.randomUUID(),
      userId,
      action,
      resourceType || null,
      resourceId || null,
      details ? JSON.stringify(details) : null,
      ipAddress || null,
      userAgent || null,
      Date.now()
    ).run();
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

// src/middleware/plugin-middleware.ts
function requireActivePlugin(pluginName) {
  return async (c, next) => {
    try {
      const db = c.env.DB;
      const plugin = await db.prepare(
        "SELECT status FROM plugins WHERE name = ? AND status = ?"
      ).bind(pluginName, "active").first();
      if (!plugin) {
        return c.html(`
          <div class="min-h-screen flex items-center justify-center bg-gray-900">
            <div class="text-center">
              <h1 class="text-4xl font-bold text-white mb-4">Feature Not Available</h1>
              <p class="text-gray-300 mb-6">The ${pluginName} plugin is not currently active.</p>
              <a href="/admin" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                Return to Admin Dashboard
              </a>
            </div>
          </div>
        `, 404);
      }
      return await next();
    } catch (error) {
      console.error(`Error checking plugin status for ${pluginName}:`, error);
      return await next();
    }
  };
}
function requireActivePlugins(pluginNames) {
  return async (c, next) => {
    try {
      const db = c.env.DB;
      for (const pluginName of pluginNames) {
        const plugin = await db.prepare(
          "SELECT status FROM plugins WHERE name = ? AND status = ?"
        ).bind(pluginName, "active").first();
        if (!plugin) {
          return c.html(`
            <div class="min-h-screen flex items-center justify-center bg-gray-900">
              <div class="text-center">
                <h1 class="text-4xl font-bold text-white mb-4">Feature Not Available</h1>
                <p class="text-gray-300 mb-6">Required plugin "${pluginName}" is not currently active.</p>
                <a href="/admin" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
                  Return to Admin Dashboard
                </a>
              </div>
            </div>
          `, 404);
        }
      }
      return await next();
    } catch (error) {
      console.error(`Error checking plugin status for plugins:`, pluginNames, error);
      return await next();
    }
  };
}
async function getActivePlugins(db) {
  try {
    const result = await db.prepare(
      "SELECT name, display_name, icon, settings FROM plugins WHERE status = ? ORDER BY display_name"
    ).bind("active").all();
    return result.results?.map((row) => ({
      name: row.name,
      display_name: row.display_name,
      icon: row.icon,
      settings: row.settings ? JSON.parse(row.settings) : null
    })) || [];
  } catch (error) {
    console.error("Error fetching active plugins:", error);
    return [];
  }
}
async function isPluginActive(db, pluginName) {
  try {
    const result = await db.prepare(
      "SELECT id FROM plugins WHERE name = ? AND status = ?"
    ).bind(pluginName, "active").first();
    return !!result;
  } catch (error) {
    console.error(`Error checking if plugin ${pluginName} is active:`, error);
    return false;
  }
}

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

export { AuthManager, PermissionManager, bootstrapMiddleware, cacheHeaders, compressionMiddleware, detailedLoggingMiddleware, getActivePlugins, isPluginActive, logActivity, loggingMiddleware, optionalAuth, performanceLoggingMiddleware, requireActivePlugin, requireActivePlugins, requireAnyPermission, requireAuth, requirePermission, requireRole, securityHeaders, securityLoggingMiddleware };
//# sourceMappingURL=chunk-WESS2U3K.js.map
//# sourceMappingURL=chunk-WESS2U3K.js.map