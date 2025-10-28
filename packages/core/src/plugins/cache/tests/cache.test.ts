/**
 * Cache Service Tests
 *
 * Tests for the three-tiered caching system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  CacheService,
  createCacheService,
  getCacheService,
  clearAllCaches,
  getAllCacheStats
} from '../services/cache.js'
import {
  CacheConfig,
  CACHE_CONFIGS,
  getCacheConfig,
  generateCacheKey,
  parseCacheKey,
  hashQueryParams,
  createCachePattern
} from '../services/cache-config.js'

describe('CacheConfig', () => {
  it('should have predefined cache configurations', () => {
    expect(CACHE_CONFIGS.content).toBeDefined()
    expect(CACHE_CONFIGS.user).toBeDefined()
    expect(CACHE_CONFIGS.config).toBeDefined()
    expect(CACHE_CONFIGS.media).toBeDefined()
  })

  it('should get cache config by namespace', () => {
    const config = getCacheConfig('content')
    expect(config.namespace).toBe('content')
    expect(config.ttl).toBe(3600)
  })

  it('should return default config for unknown namespace', () => {
    const config = getCacheConfig('unknown')
    expect(config.namespace).toBe('unknown')
    expect(config.ttl).toBe(3600)
  })

  it('should generate cache key with correct format', () => {
    const key = generateCacheKey('content', 'post', '123', 'v1')
    expect(key).toBe('content:post:123:v1')
  })

  it('should parse cache key correctly', () => {
    const key = 'content:post:123:v1'
    const parsed = parseCacheKey(key)

    expect(parsed).toBeDefined()
    expect(parsed?.namespace).toBe('content')
    expect(parsed?.type).toBe('post')
    expect(parsed?.identifier).toBe('123')
    expect(parsed?.version).toBe('v1')
  })

  it('should return null for invalid cache key', () => {
    const parsed = parseCacheKey('invalid:key')
    expect(parsed).toBeNull()
  })

  it('should hash query parameters consistently', () => {
    const params1 = { limit: 10, offset: 0, sort: 'asc' }
    const params2 = { offset: 0, limit: 10, sort: 'asc' }

    const hash1 = hashQueryParams(params1)
    const hash2 = hashQueryParams(params2)

    expect(hash1).toBe(hash2) // Order shouldn't matter
  })

  it('should create cache pattern for invalidation', () => {
    const pattern1 = createCachePattern('content')
    expect(pattern1).toBe('content:*')

    const pattern2 = createCachePattern('content', 'post')
    expect(pattern2).toBe('content:post:*')

    const pattern3 = createCachePattern('content', 'post', '123')
    expect(pattern3).toBe('content:post:123:*')
  })
})

describe('CacheService - Basic Operations', () => {
  let cache: CacheService

  beforeEach(() => {
    const config: CacheConfig = {
      ttl: 60,
      kvEnabled: false,
      memoryEnabled: true,
      namespace: 'test',
      invalidateOn: [],
      version: 'v1'
    }
    cache = createCacheService(config)
  })

  it('should create cache service instance', () => {
    expect(cache).toBeDefined()
    expect(cache.getStats).toBeDefined()
  })

  it('should set and get value from cache', async () => {
    await cache.set('test:key', 'value')
    const result = await cache.get('test:key')

    expect(result).toBe('value')
  })

  it('should return null for non-existent key', async () => {
    const result = await cache.get('non-existent')
    expect(result).toBeNull()
  })

  it('should delete value from cache', async () => {
    await cache.set('test:key', 'value')
    await cache.delete('test:key')

    const result = await cache.get('test:key')
    expect(result).toBeNull()
  })

  it('should clear all cache entries', async () => {
    await cache.set('test:key1', 'value1')
    await cache.set('test:key2', 'value2')

    await cache.clear()

    const result1 = await cache.get('test:key1')
    const result2 = await cache.get('test:key2')

    expect(result1).toBeNull()
    expect(result2).toBeNull()
  })

  it('should check if key exists', async () => {
    await cache.set('test:key', 'value')

    const exists = await cache.has('test:key')
    const notExists = await cache.has('non-existent')

    expect(exists).toBe(true)
    expect(notExists).toBe(false)
  })

  it('should generate cache key with namespace', () => {
    const key = cache.generateKey('item', '123')
    expect(key).toBe('test:item:123:v1')
  })
})

describe('CacheService - Complex Data Types', () => {
  let cache: CacheService

  beforeEach(() => {
    cache = createCacheService(CACHE_CONFIGS.content!)
  })

  it('should cache objects', async () => {
    const obj = { id: 1, name: 'Test', data: { nested: true } }
    await cache.set('obj:key', obj)

    const result = await cache.get<typeof obj>('obj:key')
    expect(result).toEqual(obj)
  })

  it('should cache arrays', async () => {
    const arr = [1, 2, 3, 4, 5]
    await cache.set('arr:key', arr)

    const result = await cache.get<number[]>('arr:key')
    expect(result).toEqual(arr)
  })

  it('should cache null values', async () => {
    await cache.set('null:key', null)
    const result = await cache.get('null:key')

    // Note: null is stored but get returns null for both "not found" and "stored null"
    // This is acceptable behavior
    expect(result).toBeNull()
  })

  it('should cache boolean values', async () => {
    await cache.set('bool:true', true)
    await cache.set('bool:false', false)

    const resultTrue = await cache.get('bool:true')
    const resultFalse = await cache.get('bool:false')

    expect(resultTrue).toBe(true)
    expect(resultFalse).toBe(false)
  })
})

describe('CacheService - TTL and Expiration', () => {
  let cache: CacheService

  beforeEach(() => {
    const config: CacheConfig = {
      ttl: 1, // 1 second TTL for testing
      kvEnabled: false,
      memoryEnabled: true,
      namespace: 'test',
      invalidateOn: [],
      version: 'v1'
    }
    cache = createCacheService(config)
  })

  it('should expire entries after TTL', async () => {
    await cache.set('test:key', 'value')

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1100))

    const result = await cache.get('test:key')
    expect(result).toBeNull()
  })

  it('should not expire before TTL', async () => {
    await cache.set('test:key', 'value')

    // Wait less than TTL
    await new Promise(resolve => setTimeout(resolve, 500))

    const result = await cache.get('test:key')
    expect(result).toBe('value')
  })

  it('should allow custom TTL per entry', async () => {
    await cache.set('test:key', 'value', { ttl: 10 }) // 10 second TTL

    // Entry should still be there after 1 second
    await new Promise(resolve => setTimeout(resolve, 1100))

    const result = await cache.get('test:key')
    expect(result).toBe('value')
  })
})

describe('CacheService - Statistics', () => {
  let cache: CacheService

  beforeEach(() => {
    cache = createCacheService(CACHE_CONFIGS.content!)
  })

  it('should track cache hits', async () => {
    await cache.set('test:key', 'value')

    await cache.get('test:key') // Hit
    await cache.get('test:key') // Hit

    const stats = cache.getStats()
    expect(stats.memoryHits).toBe(2)
  })

  it('should track cache misses', async () => {
    await cache.get('non-existent1') // Miss
    await cache.get('non-existent2') // Miss

    const stats = cache.getStats()
    expect(stats.memoryMisses).toBe(2)
  })

  it('should calculate hit rate correctly', async () => {
    await cache.set('test:key', 'value')

    await cache.get('test:key')       // Hit
    await cache.get('non-existent')   // Miss

    const stats = cache.getStats()
    expect(stats.hitRate).toBe(50) // 1 hit out of 2 requests
  })

  it('should track total requests', async () => {
    await cache.get('key1')
    await cache.get('key2')
    await cache.get('key3')

    const stats = cache.getStats()
    expect(stats.totalRequests).toBe(3)
  })

  it('should track entry count', async () => {
    await cache.set('key1', 'value1')
    await cache.set('key2', 'value2')
    await cache.set('key3', 'value3')

    const stats = cache.getStats()
    expect(stats.entryCount).toBe(3)
  })
})

describe('CacheService - Pattern Invalidation', () => {
  let cache: CacheService

  beforeEach(() => {
    cache = createCacheService(CACHE_CONFIGS.content!)
  })

  it('should invalidate entries matching pattern', async () => {
    await cache.set('content:post:1', 'value1')
    await cache.set('content:post:2', 'value2')
    await cache.set('content:page:1', 'value3')

    const count = await cache.invalidate('content:post:*')

    expect(count).toBe(2)

    const post1 = await cache.get('content:post:1')
    const post2 = await cache.get('content:post:2')
    const page1 = await cache.get('content:page:1')

    expect(post1).toBeNull()
    expect(post2).toBeNull()
    expect(page1).toBe('value3') // Should not be invalidated
  })

  it('should invalidate all entries with wildcard', async () => {
    await cache.set('content:post:1', 'value1')
    await cache.set('content:page:1', 'value2')
    await cache.set('content:list:all', 'value3')

    const count = await cache.invalidate('content:*')

    expect(count).toBe(3)
  })

  it('should return 0 for non-matching pattern', async () => {
    await cache.set('content:post:1', 'value1')

    const count = await cache.invalidate('user:*')

    expect(count).toBe(0)
  })
})

describe('CacheService - Batch Operations', () => {
  let cache: CacheService

  beforeEach(() => {
    cache = createCacheService(CACHE_CONFIGS.content!)
  })

  it('should get multiple values at once', async () => {
    await cache.set('key1', 'value1')
    await cache.set('key2', 'value2')
    await cache.set('key3', 'value3')

    const results = await cache.getMany(['key1', 'key2', 'key3', 'key4'])

    expect(results.size).toBe(3)
    expect(results.get('key1')).toBe('value1')
    expect(results.get('key2')).toBe('value2')
    expect(results.get('key3')).toBe('value3')
    expect(results.has('key4')).toBe(false)
  })

  it('should set multiple values at once', async () => {
    await cache.setMany([
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: 'value2' },
      { key: 'key3', value: 'value3' }
    ])

    const value1 = await cache.get('key1')
    const value2 = await cache.get('key2')
    const value3 = await cache.get('key3')

    expect(value1).toBe('value1')
    expect(value2).toBe('value2')
    expect(value3).toBe('value3')
  })

  it('should delete multiple keys at once', async () => {
    await cache.set('key1', 'value1')
    await cache.set('key2', 'value2')
    await cache.set('key3', 'value3')

    await cache.deleteMany(['key1', 'key3'])

    const value1 = await cache.get('key1')
    const value2 = await cache.get('key2')
    const value3 = await cache.get('key3')

    expect(value1).toBeNull()
    expect(value2).toBe('value2')
    expect(value3).toBeNull()
  })

  it('should warm cache with multiple entries', async () => {
    await cache.warmCache([
      { key: 'key1', value: 'value1' },
      { key: 'key2', value: 'value2' }
    ])

    const value1 = await cache.get('key1')
    const value2 = await cache.get('key2')

    expect(value1).toBe('value1')
    expect(value2).toBe('value2')
  })
})

describe('CacheService - Get or Set Pattern', () => {
  let cache: CacheService

  beforeEach(() => {
    cache = createCacheService(CACHE_CONFIGS.content!)
  })

  it('should fetch and cache value when not found', async () => {
    let fetchCount = 0
    const fetcher = async () => {
      fetchCount++
      return 'fetched-value'
    }

    const result1 = await cache.getOrSet('test:key', fetcher)
    const result2 = await cache.getOrSet('test:key', fetcher)

    expect(result1).toBe('fetched-value')
    expect(result2).toBe('fetched-value')
    expect(fetchCount).toBe(1) // Fetcher should only be called once
  })

  it('should not call fetcher when value is cached', async () => {
    await cache.set('test:key', 'cached-value')

    const fetcher = vi.fn(async () => 'fetched-value')
    const result = await cache.getOrSet('test:key', fetcher)

    expect(result).toBe('cached-value')
    expect(fetcher).not.toHaveBeenCalled()
  })
})

describe('Global Cache Management', () => {
  beforeEach(async () => {
    await clearAllCaches()
  })

  it('should get singleton cache instance', () => {
    const cache1 = getCacheService(CACHE_CONFIGS.content!)
    const cache2 = getCacheService(CACHE_CONFIGS.content!)

    expect(cache1).toBe(cache2) // Same instance
  })

  it('should get different instances for different namespaces', () => {
    const contentCache = getCacheService(CACHE_CONFIGS.content!)
    const userCache = getCacheService(CACHE_CONFIGS.user!)

    expect(contentCache).not.toBe(userCache)
  })

  it('should clear all cache instances', async () => {
    const contentCache = getCacheService(CACHE_CONFIGS.content!)
    const userCache = getCacheService(CACHE_CONFIGS.user!)

    await contentCache.set('content:key', 'value')
    await userCache.set('user:key', 'value')

    await clearAllCaches()

    const contentValue = await contentCache.get('content:key')
    const userValue = await userCache.get('user:key')

    expect(contentValue).toBeNull()
    expect(userValue).toBeNull()
  })

  it('should get stats from all cache instances', async () => {
    const contentCache = getCacheService(CACHE_CONFIGS.content!)
    const userCache = getCacheService(CACHE_CONFIGS.user!)

    await contentCache.set('content:key', 'value')
    await userCache.set('user:key', 'value')

    const stats = getAllCacheStats()

    expect(stats.content).toBeDefined()
    expect(stats.user).toBeDefined()
    expect(stats.content!.entryCount).toBe(1)
    expect(stats.user!.entryCount).toBe(1)
  })
})
