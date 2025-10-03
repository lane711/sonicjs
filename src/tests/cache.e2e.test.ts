// @ts-nocheck
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Hono } from 'hono'
import cacheRoutes from '../plugins/cache/routes'
import { getCacheService, clearAllCaches, CACHE_CONFIGS } from '../plugins/cache'

// Mock environment bindings
const createMockEnv = () => ({
  DB: {
    prepare: vi.fn().mockReturnValue({
      bind: vi.fn().mockReturnThis(),
      first: vi.fn(),
      all: vi.fn().mockResolvedValue({ results: [] }),
      run: vi.fn()
    })
  },
  KV: {},
  CACHE_KV: null
})

describe('Cache Plugin E2E Tests', () => {
  let app: Hono
  let mockEnv: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockEnv = createMockEnv()

    // Create new app instance for each test
    app = new Hono()
    app.route('/', cacheRoutes)
  })

  afterEach(async () => {
    // Clear all caches after each test
    await clearAllCaches()
  })

  describe('Cache Statistics', () => {
    it('GET /stats - should return cache statistics for all namespaces', async () => {
      // Initialize cache services by getting them
      getCacheService(CACHE_CONFIGS.content)
      getCacheService(CACHE_CONFIGS.user)
      getCacheService(CACHE_CONFIGS.media)

      const res = await app.fetch(new Request('https://test.com/stats'), mockEnv)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.timestamp).toBeDefined()

      // Check that common namespaces are present
      expect(data.data).toHaveProperty('content')
      expect(data.data).toHaveProperty('user')
      expect(data.data).toHaveProperty('media')
    })

    it('GET /stats/:namespace - should return stats for specific namespace', async () => {
      const res = await app.fetch(new Request('https://test.com/stats/content'), mockEnv)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.namespace).toBe('content')
      expect(data.data.config).toBeDefined()
      expect(data.data.stats).toBeDefined()
      expect(data.data.stats).toHaveProperty('memoryHits')
      expect(data.data.stats).toHaveProperty('memoryMisses')
    })

    it('GET /stats/:namespace - should return 404 for unknown namespace', async () => {
      const res = await app.fetch(new Request('https://test.com/stats/unknown'), mockEnv)
      const data = await res.json()

      expect(res.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Unknown namespace')
    })
  })

  describe('Cache Health', () => {
    it('GET /health - should return cache health status', async () => {
      const res = await app.fetch(new Request('https://test.com/health'), mockEnv)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.status).toBeDefined()
      expect(['healthy', 'warning', 'unhealthy']).toContain(data.data.status)
      expect(Array.isArray(data.data.namespaces)).toBe(true)
      expect(data.data.namespaces.length).toBeGreaterThan(0)
    })

    it('GET /health - should include health metrics for each namespace', async () => {
      const res = await app.fetch(new Request('https://test.com/health'), mockEnv)
      const data = await res.json()

      const firstNamespace = data.data.namespaces[0]
      expect(firstNamespace).toHaveProperty('namespace')
      expect(firstNamespace).toHaveProperty('status')
      expect(firstNamespace).toHaveProperty('hitRate')
      expect(firstNamespace).toHaveProperty('memoryUsage')
      expect(firstNamespace).toHaveProperty('entryCount')
    })
  })

  describe('Cache Management', () => {
    it('POST /clear - should clear all cache entries', async () => {
      // First add some cache entries
      const contentCache = getCacheService(CACHE_CONFIGS.content)
      await contentCache.set('test-key-1', { data: 'test1' })
      await contentCache.set('test-key-2', { data: 'test2' })

      // Verify entries exist
      const value1 = await contentCache.get('test-key-1')
      expect(value1).toBeDefined()

      // Clear all caches
      const res = await app.fetch(
        new Request('https://test.com/clear', { method: 'POST' }),
        mockEnv
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('cleared')

      // Verify entries are gone
      const value2 = await contentCache.get('test-key-1')
      expect(value2).toBeNull()
    })

    it('POST /clear/:namespace - should clear specific namespace cache', async () => {
      // Add entries to multiple namespaces
      const contentCache = getCacheService(CACHE_CONFIGS.content)
      const userCache = getCacheService(CACHE_CONFIGS.user)

      await contentCache.set('content-key', { data: 'content' })
      await userCache.set('user-key', { data: 'user' })

      // Clear only content cache
      const res = await app.fetch(
        new Request('https://test.com/clear/content', { method: 'POST' }),
        mockEnv
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.namespace).toBe('content')

      // Verify content cache is cleared but user cache is not
      expect(await contentCache.get('content-key')).toBeNull()
      expect(await userCache.get('user-key')).toBeDefined()
    })

    it('POST /clear/:namespace - should return 404 for unknown namespace', async () => {
      const res = await app.fetch(
        new Request('https://test.com/clear/unknown', { method: 'POST' }),
        mockEnv
      )
      const data = await res.json()

      expect(res.status).toBe(404)
      expect(data.success).toBe(false)
    })
  })

  describe('Cache Invalidation', () => {
    it('POST /invalidate - should invalidate entries matching pattern', async () => {
      const contentCache = getCacheService(CACHE_CONFIGS.content)

      await contentCache.set('content:post:123', { title: 'Post 123' })
      await contentCache.set('content:post:456', { title: 'Post 456' })
      await contentCache.set('content:page:789', { title: 'Page 789' })

      const res = await app.fetch(
        new Request('https://test.com/invalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pattern: 'content:post:*',
            namespace: 'content'
          })
        }),
        mockEnv
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.invalidated).toBeGreaterThanOrEqual(2)
      expect(data.pattern).toBe('content:post:*')

      // Verify posts are invalidated but page is not
      expect(await contentCache.get('content:post:123')).toBeNull()
      expect(await contentCache.get('content:post:456')).toBeNull()
      expect(await contentCache.get('content:page:789')).toBeDefined()
    })

    it('POST /invalidate - should require pattern parameter', async () => {
      const res = await app.fetch(
        new Request('https://test.com/invalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }),
        mockEnv
      )
      const data = await res.json()

      expect(res.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Pattern is required')
    })
  })

  describe('Cache Browser', () => {
    it('GET /browser - should list all cache entries', async () => {
      // Add some test entries
      const contentCache = getCacheService(CACHE_CONFIGS.content)
      await contentCache.set(contentCache.generateKey('post', '1'), { title: 'Post 1' })
      await contentCache.set(contentCache.generateKey('post', '2'), { title: 'Post 2' })

      const res = await app.fetch(new Request('https://test.com/browser'), mockEnv)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data.entries)).toBe(true)
      expect(data.data.total).toBeGreaterThanOrEqual(2)
    })

    it('GET /browser - should filter by namespace', async () => {
      const contentCache = getCacheService(CACHE_CONFIGS.content)
      const userCache = getCacheService(CACHE_CONFIGS.user)

      await contentCache.set(contentCache.generateKey('post', '1'), { title: 'Post 1' })
      await userCache.set(userCache.generateKey('id', '1'), { name: 'User 1' })

      const res = await app.fetch(
        new Request('https://test.com/browser?namespace=content'),
        mockEnv
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.namespace).toBe('content')

      // All entries should be from content namespace
      data.data.entries.forEach(entry => {
        expect(entry.namespace).toBe('content')
      })
    })

    it('GET /browser - should search cache keys', async () => {
      const contentCache = getCacheService(CACHE_CONFIGS.content)
      await contentCache.set(contentCache.generateKey('post', '123'), { title: 'Post 123' })
      await contentCache.set(contentCache.generateKey('page', '456'), { title: 'Page 456' })

      const res = await app.fetch(
        new Request('https://test.com/browser?search=post'),
        mockEnv
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.search).toBe('post')

      // All results should contain "post"
      data.data.entries.forEach(entry => {
        expect(entry.key.toLowerCase()).toContain('post')
      })
    })

    it('GET /browser - should sort by size, age, or key', async () => {
      const contentCache = getCacheService(CACHE_CONFIGS.content)
      await contentCache.set('small-key', { data: 'x' })
      await contentCache.set('large-key', { data: 'x'.repeat(1000) })

      const res = await app.fetch(
        new Request('https://test.com/browser?sort=size'),
        mockEnv
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.sortBy).toBe('size')

      // Verify sorted by size (descending)
      if (data.data.entries.length >= 2) {
        expect(data.data.entries[0].size).toBeGreaterThanOrEqual(data.data.entries[1].size)
      }
    })

    it('GET /browser/:namespace/:key - should get specific cache entry', async () => {
      const contentCache = getCacheService(CACHE_CONFIGS.content)
      const key = contentCache.generateKey('post', '123')
      const testData = { title: 'Test Post', content: 'Test content' }

      await contentCache.set(key, testData)

      const encodedKey = encodeURIComponent(key)
      const res = await app.fetch(
        new Request(`https://test.com/browser/content/${encodedKey}`),
        mockEnv
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.key).toBe(key)
      expect(data.data.namespace).toBe('content')
      expect(data.data.data).toEqual(testData)
      expect(data.data.ttl).toBeDefined()
      expect(data.data.size).toBeGreaterThan(0)
    })
  })

  describe('Cache Analytics', () => {
    it('GET /analytics - should return comprehensive analytics', async () => {
      const res = await app.fetch(new Request('https://test.com/analytics'), mockEnv)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.overview).toBeDefined()
      expect(data.data.performance).toBeDefined()
      expect(data.data.namespaces).toBeDefined()
      expect(data.data.invalidation).toBeDefined()

      // Check overview metrics
      expect(data.data.overview).toHaveProperty('totalHits')
      expect(data.data.overview).toHaveProperty('totalMisses')
      expect(data.data.overview).toHaveProperty('overallHitRate')

      // Check performance metrics
      expect(data.data.performance).toHaveProperty('dbQueriesAvoided')
      expect(data.data.performance).toHaveProperty('timeSavedMs')
      expect(data.data.performance).toHaveProperty('estimatedCostSavings')
    })

    it('GET /analytics - should include per-namespace analytics', async () => {
      const res = await app.fetch(new Request('https://test.com/analytics'), mockEnv)
      const data = await res.json()

      expect(Array.isArray(data.data.namespaces)).toBe(true)

      if (data.data.namespaces.length > 0) {
        const firstNamespace = data.data.namespaces[0]
        expect(firstNamespace).toHaveProperty('namespace')
        expect(firstNamespace).toHaveProperty('hitRate')
        expect(firstNamespace).toHaveProperty('totalRequests')
        expect(firstNamespace).toHaveProperty('avgEntrySize')
        expect(firstNamespace).toHaveProperty('efficiency')
      }
    })
  })

  describe('Cache Warming', () => {
    it('POST /warm - should warm common caches', async () => {
      // Mock DB responses
      mockEnv.DB.prepare.mockReturnValue({
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({
          results: [
            { id: '1', name: 'Test Collection' },
            { id: '2', name: 'Another Collection' }
          ]
        })
      })

      const res = await app.fetch(
        new Request('https://test.com/warm', { method: 'POST' }),
        mockEnv
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.warmed).toBeGreaterThan(0)
      expect(Array.isArray(data.details)).toBe(true)
    })

    it('POST /warm/:namespace - should warm specific namespace', async () => {
      const entries = [
        { key: 'content:post:1', value: { title: 'Post 1' } },
        { key: 'content:post:2', value: { title: 'Post 2' } }
      ]

      const res = await app.fetch(
        new Request('https://test.com/warm/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries })
        }),
        mockEnv
      )
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.namespace).toBe('content')
      expect(data.count).toBe(2)

      // Verify entries were cached
      const contentCache = getCacheService(CACHE_CONFIGS.content)
      const cached1 = await contentCache.get('content:post:1')
      const cached2 = await contentCache.get('content:post:2')

      expect(cached1).toEqual({ title: 'Post 1' })
      expect(cached2).toEqual({ title: 'Post 2' })
    })

    it('POST /warm/:namespace - should require entries array', async () => {
      const res = await app.fetch(
        new Request('https://test.com/warm/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }),
        mockEnv
      )
      const data = await res.json()

      expect(res.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('Entries array is required')
    })
  })

  describe('Cache Source Tracking', () => {
    it('should return cache source information with getWithSource', async () => {
      const contentCache = getCacheService(CACHE_CONFIGS.content)
      const testData = { id: '123', title: 'Test Content' }

      // First call - should be a miss
      const missResult = await contentCache.getWithSource('source-test-key')
      expect(missResult.hit).toBe(false)
      expect(missResult.source).toBe('miss')
      expect(missResult.data).toBeNull()

      // Set cache entry
      await contentCache.set('source-test-key', testData)

      // Second call - should hit memory
      const hitResult = await contentCache.getWithSource('source-test-key')
      expect(hitResult.hit).toBe(true)
      expect(hitResult.source).toBe('memory')
      expect(hitResult.data).toEqual(testData)
      expect(hitResult.ttl).toBeGreaterThan(0)
      expect(hitResult.timestamp).toBeDefined()
    })

    it('should include cache info in response metadata', async () => {
      const contentCache = getCacheService(CACHE_CONFIGS.content)
      const cacheResult = await contentCache.getWithSource('test-meta-key')

      // Verify CacheResult structure
      expect(cacheResult).toHaveProperty('data')
      expect(cacheResult).toHaveProperty('source')
      expect(cacheResult).toHaveProperty('hit')
      expect(['memory', 'kv', 'miss']).toContain(cacheResult.source)
    })
  })

  describe('Cache Integration', () => {
    it('should cache and retrieve data correctly', async () => {
      const contentCache = getCacheService(CACHE_CONFIGS.content)
      const testData = { id: '123', title: 'Test Content', body: 'Test body' }

      // Set cache entry
      await contentCache.set('test-content-123', testData)

      // Get from cache
      const cached = await contentCache.get('test-content-123')

      expect(cached).toEqual(testData)

      // Verify stats were updated
      const stats = contentCache.getStats()
      expect(stats.memoryHits).toBeGreaterThan(0)
    })

    it('should handle cache TTL expiration', async () => {
      const shortTTLCache = getCacheService({
        ...CACHE_CONFIGS.content,
        namespace: 'test-expiration',
        ttl: 1 // 1 second TTL
      })

      await shortTTLCache.set('expiring-key', { data: 'test' })

      // Should exist immediately
      let value = await shortTTLCache.get('expiring-key')
      expect(value).toBeDefined()

      // Wait for expiration (1 second + buffer)
      await new Promise(resolve => setTimeout(resolve, 1200))

      // Should be expired and return null
      value = await shortTTLCache.get('expiring-key')
      expect(value).toBeNull()
    })

    it('should support getOrSet pattern', async () => {
      const contentCache = getCacheService(CACHE_CONFIGS.content)
      let fetchCount = 0

      const fetcher = async () => {
        fetchCount++
        return { data: 'fetched data', count: fetchCount }
      }

      // First call should fetch
      const result1 = await contentCache.getOrSet('test-key', fetcher)
      expect(result1.count).toBe(1)
      expect(fetchCount).toBe(1)

      // Second call should use cache
      const result2 = await contentCache.getOrSet('test-key', fetcher)
      expect(result2.count).toBe(1) // Same data from cache
      expect(fetchCount).toBe(1) // Fetcher not called again
    })
  })
})
