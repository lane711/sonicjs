/**
 * Simple Cache Service
 *
 * Provides basic caching functionality for the core package
 * Can be extended with KV or other storage backends
 */

export interface CacheConfig {
  ttl: number // Time to live in seconds
  keyPrefix: string
}

export class CacheService {
  private config: CacheConfig
  private memoryCache: Map<string, { value: any; expires: number }> = new Map()

  constructor(config: CacheConfig) {
    this.config = config
  }

  /**
   * Generate cache key with prefix
   */
  generateKey(type: string, identifier?: string): string {
    const parts = [this.config.keyPrefix, type]
    if (identifier) {
      parts.push(identifier)
    }
    return parts.join(':')
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const cached = this.memoryCache.get(key)

    if (!cached) {
      return null
    }

    // Check if expired
    if (Date.now() > cached.expires) {
      this.memoryCache.delete(key)
      return null
    }

    return cached.value as T
  }

  /**
   * Get value from cache with source information
   */
  async getWithSource<T>(key: string): Promise<{
    hit: boolean
    data: T | null
    source: string
    ttl?: number
  }> {
    const cached = this.memoryCache.get(key)

    if (!cached) {
      return {
        hit: false,
        data: null,
        source: 'none'
      }
    }

    // Check if expired
    if (Date.now() > cached.expires) {
      this.memoryCache.delete(key)
      return {
        hit: false,
        data: null,
        source: 'expired'
      }
    }

    return {
      hit: true,
      data: cached.value as T,
      source: 'memory',
      ttl: (cached.expires - Date.now()) / 1000 // TTL in seconds
    }
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expires = Date.now() + ((ttl || this.config.ttl) * 1000)
    this.memoryCache.set(key, { value, expires })
  }

  /**
   * Delete specific key from cache
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key)
  }

  /**
   * Invalidate cache keys matching a pattern
   * For memory cache, we do simple string matching
   */
  async invalidate(pattern: string): Promise<void> {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
    const regex = new RegExp(`^${regexPattern}$`)

    // Find and delete matching keys
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key)
      }
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear()
  }

  /**
   * Get value from cache or set it using a callback
   */
  async getOrSet<T>(key: string, callback: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key)

    if (cached !== null) {
      return cached
    }

    const value = await callback()
    await this.set(key, value, ttl)
    return value
  }
}

/**
 * Cache configurations for different data types
 */
export const CACHE_CONFIGS = {
  api: {
    ttl: 300, // 5 minutes
    keyPrefix: 'api'
  },
  user: {
    ttl: 600, // 10 minutes
    keyPrefix: 'user'
  },
  content: {
    ttl: 300, // 5 minutes
    keyPrefix: 'content'
  },
  collection: {
    ttl: 600, // 10 minutes
    keyPrefix: 'collection'
  }
}

/**
 * Get cache service instance for a config
 */
export function getCacheService(config: CacheConfig): CacheService {
  return new CacheService(config)
}
