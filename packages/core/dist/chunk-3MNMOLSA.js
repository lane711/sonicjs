// src/services/cache.ts
var CacheService = class {
  config;
  memoryCache = /* @__PURE__ */ new Map();
  constructor(config) {
    this.config = config;
  }
  /**
   * Generate cache key with prefix
   */
  generateKey(type, identifier) {
    const parts = [this.config.keyPrefix, type];
    if (identifier) {
      parts.push(identifier);
    }
    return parts.join(":");
  }
  /**
   * Get value from cache
   */
  async get(key) {
    const cached = this.memoryCache.get(key);
    if (!cached) {
      return null;
    }
    if (Date.now() > cached.expires) {
      this.memoryCache.delete(key);
      return null;
    }
    return cached.value;
  }
  /**
   * Get value from cache with source information
   */
  async getWithSource(key) {
    const cached = this.memoryCache.get(key);
    if (!cached) {
      return {
        hit: false,
        data: null,
        source: "none"
      };
    }
    if (Date.now() > cached.expires) {
      this.memoryCache.delete(key);
      return {
        hit: false,
        data: null,
        source: "expired"
      };
    }
    return {
      hit: true,
      data: cached.value,
      source: "memory",
      ttl: (cached.expires - Date.now()) / 1e3
      // TTL in seconds
    };
  }
  /**
   * Set value in cache
   */
  async set(key, value, ttl) {
    const expires = Date.now() + (ttl || this.config.ttl) * 1e3;
    this.memoryCache.set(key, { value, expires });
  }
  /**
   * Delete specific key from cache
   */
  async delete(key) {
    this.memoryCache.delete(key);
  }
  /**
   * Invalidate cache keys matching a pattern
   * For memory cache, we do simple string matching
   */
  async invalidate(pattern) {
    const regexPattern = pattern.replace(/\*/g, ".*").replace(/\?/g, ".");
    const regex = new RegExp(`^${regexPattern}$`);
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }
  }
  /**
   * Clear all cache
   */
  async clear() {
    this.memoryCache.clear();
  }
  /**
   * Get value from cache or set it using a callback
   */
  async getOrSet(key, callback, ttl) {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }
    const value = await callback();
    await this.set(key, value, ttl);
    return value;
  }
};
var CACHE_CONFIGS = {
  api: {
    ttl: 300,
    // 5 minutes
    keyPrefix: "api"
  },
  user: {
    ttl: 600,
    // 10 minutes
    keyPrefix: "user"
  },
  content: {
    ttl: 300,
    // 5 minutes
    keyPrefix: "content"
  },
  collection: {
    ttl: 600,
    // 10 minutes
    keyPrefix: "collection"
  }
};
function getCacheService(config) {
  return new CacheService(config);
}

export { CACHE_CONFIGS, CacheService, getCacheService };
//# sourceMappingURL=chunk-3MNMOLSA.js.map
//# sourceMappingURL=chunk-3MNMOLSA.js.map