/**
 * Cache Routes Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { Hono } from 'hono'

// Mock the cache services before importing routes
vi.mock('../services/cache.js', () => ({
  getAllCacheStats: vi.fn(() => ({
    content: {
      memoryHits: 100,
      kvHits: 50,
      memoryMisses: 20,
      kvMisses: 10,
      dbHits: 5,
      memorySize: 1024000,
      entryCount: 50,
      hitRate: 83.33,
      totalRequests: 180
    },
    collections: {
      memoryHits: 200,
      kvHits: 100,
      memoryMisses: 30,
      kvMisses: 20,
      dbHits: 10,
      memorySize: 512000,
      entryCount: 25,
      hitRate: 85.71,
      totalRequests: 350
    }
  })),
  clearAllCaches: vi.fn(async () => {}),
  getCacheService: vi.fn(() => ({
    getStats: vi.fn(() => ({
      memoryHits: 100,
      kvHits: 50,
      memoryMisses: 20,
      kvMisses: 10,
      dbHits: 5,
      memorySize: 1024000,
      entryCount: 50,
      hitRate: 83.33
    })),
    clear: vi.fn(async () => {}),
    invalidate: vi.fn(async () => 5),
    listKeys: vi.fn(async () => [
      { key: 'content:page:1', size: 1024, age: 60000, expiresAt: Date.now() + 300000 },
      { key: 'content:page:2', size: 2048, age: 30000, expiresAt: Date.now() + 350000 }
    ]),
    getEntry: vi.fn(async (key: string) => {
      if (key === 'test-key') {
        return {
          data: { title: 'Test' },
          size: 1024,
          timestamp: Date.now() - 60000,
          expiresAt: Date.now() + 300000
        }
      }
      return null
    })
  }))
}))

vi.mock('../services/cache-config.js', () => ({
  CACHE_CONFIGS: {
    content: { namespace: 'content', ttl: 3600 },
    collections: { namespace: 'collections', ttl: 7200 },
    media: { namespace: 'media', ttl: 86400 }
  },
  parseCacheKey: vi.fn((key: string) => {
    const parts = key.split(':')
    return { type: parts[0], id: parts[1] || null }
  })
}))

vi.mock('../services/cache-invalidation.js', () => ({
  getRecentInvalidations: vi.fn(() => [
    { pattern: 'content:*', namespace: 'content', count: 5, timestamp: Date.now() - 60000 },
    { pattern: 'collections:*', namespace: 'collections', count: 3, timestamp: Date.now() - 120000 }
  ]),
  getCacheInvalidationStats: vi.fn(() => ({
    totalInvalidations: 100,
    lastInvalidation: Date.now() - 60000
  }))
}))

vi.mock('../services/cache-warming.js', () => ({
  warmCommonCaches: vi.fn(async () => ({
    warmed: 15,
    errors: 0,
    details: [
      { namespace: 'content', count: 5 },
      { namespace: 'collections', count: 5 },
      { namespace: 'media', count: 5 }
    ]
  })),
  warmNamespace: vi.fn(async () => 10)
}))

vi.mock('../../../../templates/pages/admin-cache.template', () => ({
  renderCacheDashboard: vi.fn(() => '<html>Cache Dashboard</html>')
}))

// Import routes after mocking
import cacheRoutes from '../routes'
import { getAllCacheStats, clearAllCaches, getCacheService } from '../services/cache.js'
import { warmCommonCaches, warmNamespace } from '../services/cache-warming.js'

describe('Cache Routes', () => {
  let app: Hono

  beforeEach(() => {
    vi.clearAllMocks()
    app = new Hono()
    app.route('/admin/cache', cacheRoutes)
  })

  describe('GET /admin/cache', () => {
    it('should return cache dashboard HTML', async () => {
      const res = await app.request('/admin/cache')

      expect(res.status).toBe(200)
      // The response is HTML (either mocked or real)
      const text = await res.text()
      expect(text).toContain('html')
    })

    it('should call getAllCacheStats', async () => {
      await app.request('/admin/cache')

      expect(getAllCacheStats).toHaveBeenCalled()
    })
  })

  describe('GET /admin/cache/stats', () => {
    it('should return JSON stats for all namespaces', async () => {
      const res = await app.request('/admin/cache/stats')
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.data).toBeDefined()
      expect(json.data.content).toBeDefined()
      expect(json.data.collections).toBeDefined()
      expect(json.timestamp).toBeDefined()
    })
  })

  describe('GET /admin/cache/stats/:namespace', () => {
    it('should return stats for a specific namespace', async () => {
      const res = await app.request('/admin/cache/stats/content')
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.data.namespace).toBe('content')
      expect(json.data.stats).toBeDefined()
    })

    it('should return 404 for unknown namespace', async () => {
      const res = await app.request('/admin/cache/stats/unknown')
      const json = await res.json()

      expect(res.status).toBe(404)
      expect(json.success).toBe(false)
      expect(json.error).toContain('Unknown namespace')
    })
  })

  describe('POST /admin/cache/clear', () => {
    it('should clear all caches', async () => {
      const res = await app.request('/admin/cache/clear', {
        method: 'POST'
      })
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.message).toContain('cleared')
      expect(clearAllCaches).toHaveBeenCalled()
    })
  })

  describe('POST /admin/cache/clear/:namespace', () => {
    it('should clear cache for a specific namespace', async () => {
      const res = await app.request('/admin/cache/clear/content', {
        method: 'POST'
      })
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.namespace).toBe('content')
    })

    it('should return 404 for unknown namespace', async () => {
      const res = await app.request('/admin/cache/clear/unknown', {
        method: 'POST'
      })
      const json = await res.json()

      expect(res.status).toBe(404)
      expect(json.success).toBe(false)
    })
  })

  describe('POST /admin/cache/invalidate', () => {
    it('should invalidate cache entries by pattern', async () => {
      const res = await app.request('/admin/cache/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern: 'content:*' })
      })
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.pattern).toBe('content:*')
      expect(json.invalidated).toBeDefined()
    })

    it('should invalidate in specific namespace', async () => {
      const res = await app.request('/admin/cache/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern: '*', namespace: 'content' })
      })
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.namespace).toBe('content')
    })

    it('should return 400 when pattern is missing', async () => {
      const res = await app.request('/admin/cache/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      const json = await res.json()

      expect(res.status).toBe(400)
      expect(json.success).toBe(false)
      expect(json.error).toContain('Pattern is required')
    })

    it('should return 404 for unknown namespace', async () => {
      const res = await app.request('/admin/cache/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern: '*', namespace: 'unknown' })
      })
      const json = await res.json()

      expect(res.status).toBe(404)
      expect(json.success).toBe(false)
    })
  })

  describe('GET /admin/cache/health', () => {
    it('should return health check results', async () => {
      const res = await app.request('/admin/cache/health')
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.data.status).toBeDefined()
      expect(json.data.namespaces).toBeDefined()
      expect(Array.isArray(json.data.namespaces)).toBe(true)
    })

    it('should include namespace health status', async () => {
      const res = await app.request('/admin/cache/health')
      const json = await res.json()

      const namespaceHealth = json.data.namespaces[0]
      expect(namespaceHealth.namespace).toBeDefined()
      expect(namespaceHealth.status).toBeDefined()
      expect(namespaceHealth.hitRate).toBeDefined()
      expect(namespaceHealth.memoryUsage).toBeDefined()
    })
  })

  describe('GET /admin/cache/browser', () => {
    it('should return cache entries', async () => {
      const res = await app.request('/admin/cache/browser')
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.data.entries).toBeDefined()
      expect(Array.isArray(json.data.entries)).toBe(true)
    })

    it('should filter by namespace', async () => {
      const res = await app.request('/admin/cache/browser?namespace=content')
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.data.namespace).toBe('content')
    })

    it('should filter by search query', async () => {
      const res = await app.request('/admin/cache/browser?search=page')
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.data.search).toBe('page')
    })

    it('should sort by size', async () => {
      const res = await app.request('/admin/cache/browser?sort=size')
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.data.sortBy).toBe('size')
    })

    it('should sort by key', async () => {
      const res = await app.request('/admin/cache/browser?sort=key')
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.data.sortBy).toBe('key')
    })

    it('should limit results', async () => {
      const res = await app.request('/admin/cache/browser?limit=10')
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.data.showing).toBeLessThanOrEqual(10)
    })
  })

  describe('GET /admin/cache/browser/:namespace/:key', () => {
    it('should return specific cache entry details', async () => {
      const res = await app.request('/admin/cache/browser/content/test-key')
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.data.key).toBe('test-key')
      expect(json.data.namespace).toBe('content')
    })

    it('should return 404 for unknown namespace', async () => {
      const res = await app.request('/admin/cache/browser/unknown/test-key')
      const json = await res.json()

      expect(res.status).toBe(404)
      expect(json.success).toBe(false)
    })

    it('should return 404 for non-existent entry', async () => {
      const res = await app.request('/admin/cache/browser/content/non-existent-key')
      const json = await res.json()

      expect(res.status).toBe(404)
      expect(json.success).toBe(false)
      expect(json.error).toContain('not found')
    })
  })

  describe('GET /admin/cache/analytics', () => {
    it('should return analytics data', async () => {
      const res = await app.request('/admin/cache/analytics')
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.data.overview).toBeDefined()
      expect(json.data.performance).toBeDefined()
      expect(json.data.namespaces).toBeDefined()
      expect(json.data.invalidation).toBeDefined()
    })

    it('should include performance metrics', async () => {
      const res = await app.request('/admin/cache/analytics')
      const json = await res.json()

      expect(json.data.performance.dbQueriesAvoided).toBeDefined()
      expect(json.data.performance.timeSavedMs).toBeDefined()
      expect(json.data.performance.estimatedCostSavings).toBeDefined()
    })

    it('should include overview stats', async () => {
      const res = await app.request('/admin/cache/analytics')
      const json = await res.json()

      expect(json.data.overview.totalHits).toBeDefined()
      expect(json.data.overview.totalMisses).toBeDefined()
      expect(json.data.overview.totalRequests).toBeDefined()
      expect(json.data.overview.overallHitRate).toBeDefined()
    })
  })

  describe('GET /admin/cache/analytics/trends', () => {
    it('should return trends data', async () => {
      const res = await app.request('/admin/cache/analytics/trends')
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.data.trends).toBeDefined()
      expect(Array.isArray(json.data.trends)).toBe(true)
    })
  })

  describe('GET /admin/cache/analytics/top-keys', () => {
    it('should return top keys placeholder', async () => {
      const res = await app.request('/admin/cache/analytics/top-keys')
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.data.topKeys).toBeDefined()
      expect(json.data.note).toBeDefined()
    })
  })

  describe('POST /admin/cache/warm', () => {
    it('should warm all caches', async () => {
      // Create app with mock env
      const appWithEnv = new Hono()
      appWithEnv.use('*', async (c, next) => {
        c.env = { DB: {} }
        await next()
      })
      appWithEnv.route('/admin/cache', cacheRoutes)

      const res = await appWithEnv.request('/admin/cache/warm', {
        method: 'POST'
      })
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.warmed).toBe(15)
      expect(warmCommonCaches).toHaveBeenCalled()
    })

    it('should handle warming errors', async () => {
      vi.mocked(warmCommonCaches).mockRejectedValueOnce(new Error('Warming failed'))

      const appWithEnv = new Hono()
      appWithEnv.use('*', async (c, next) => {
        c.env = { DB: {} }
        await next()
      })
      appWithEnv.route('/admin/cache', cacheRoutes)

      const res = await appWithEnv.request('/admin/cache/warm', {
        method: 'POST'
      })
      const json = await res.json()

      expect(res.status).toBe(500)
      expect(json.success).toBe(false)
      expect(json.error).toContain('failed')
    })
  })

  describe('POST /admin/cache/warm/:namespace', () => {
    it('should warm specific namespace', async () => {
      const res = await app.request('/admin/cache/warm/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: [
            { key: 'page:1', data: { title: 'Page 1' } },
            { key: 'page:2', data: { title: 'Page 2' } }
          ]
        })
      })
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.namespace).toBe('content')
      expect(warmNamespace).toHaveBeenCalledWith('content', expect.any(Array))
    })

    it('should return 400 when entries is missing', async () => {
      const res = await app.request('/admin/cache/warm/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      const json = await res.json()

      expect(res.status).toBe(400)
      expect(json.success).toBe(false)
      expect(json.error).toContain('Entries array is required')
    })

    it('should return 400 when entries is not an array', async () => {
      const res = await app.request('/admin/cache/warm/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: 'not-an-array' })
      })
      const json = await res.json()

      expect(res.status).toBe(400)
      expect(json.success).toBe(false)
    })

    it('should handle namespace warming errors', async () => {
      vi.mocked(warmNamespace).mockRejectedValueOnce(new Error('Namespace warming failed'))

      const res = await app.request('/admin/cache/warm/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: [] })
      })
      const json = await res.json()

      expect(res.status).toBe(500)
      expect(json.success).toBe(false)
    })
  })
})

describe('Cache Routes - Edge Cases', () => {
  let app: Hono

  beforeEach(() => {
    vi.clearAllMocks()
    app = new Hono()
    app.route('/admin/cache', cacheRoutes)
  })

  describe('Health status calculation', () => {
    it('should return healthy status when hit rate > 70%', async () => {
      vi.mocked(getAllCacheStats).mockReturnValueOnce({
        content: {
          memoryHits: 80,
          kvHits: 10,
          memoryMisses: 5,
          kvMisses: 5,
          dbHits: 0,
          memorySize: 1024,
          entryCount: 10,
          hitRate: 90,
          totalRequests: 100
        }
      } as any)

      const res = await app.request('/admin/cache/health')
      const json = await res.json()

      expect(json.data.status).toBe('healthy')
    })

    it('should return warning status when hit rate 40-70%', async () => {
      vi.mocked(getAllCacheStats).mockReturnValueOnce({
        content: {
          memoryHits: 40,
          kvHits: 10,
          memoryMisses: 30,
          kvMisses: 20,
          dbHits: 0,
          memorySize: 1024,
          entryCount: 10,
          hitRate: 50,
          totalRequests: 100
        }
      } as any)

      const res = await app.request('/admin/cache/health')
      const json = await res.json()

      expect(json.data.status).toBe('warning')
    })

    it('should return unhealthy status when hit rate < 40%', async () => {
      vi.mocked(getAllCacheStats).mockReturnValueOnce({
        content: {
          memoryHits: 10,
          kvHits: 10,
          memoryMisses: 50,
          kvMisses: 30,
          dbHits: 0,
          memorySize: 1024,
          entryCount: 10,
          hitRate: 20,
          totalRequests: 100
        }
      } as any)

      const res = await app.request('/admin/cache/health')
      const json = await res.json()

      expect(json.data.status).toBe('unhealthy')
    })
  })

  describe('Analytics calculations', () => {
    it('should handle zero requests gracefully', async () => {
      vi.mocked(getAllCacheStats).mockReturnValueOnce({
        content: {
          memoryHits: 0,
          kvHits: 0,
          memoryMisses: 0,
          kvMisses: 0,
          dbHits: 0,
          memorySize: 0,
          entryCount: 0,
          hitRate: 0,
          totalRequests: 0
        }
      } as any)

      const res = await app.request('/admin/cache/analytics')
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.data.overview.overallHitRate).toBe('0.00')
      expect(json.data.overview.avgEntrySize).toBe(0)
    })
  })

  describe('Browser filtering', () => {
    it('should handle empty cache entries', async () => {
      // Mock returns empty for all namespace queries
      vi.mocked(getCacheService).mockReturnValue({
        listKeys: vi.fn(async () => []),
        getStats: vi.fn(),
        clear: vi.fn(),
        invalidate: vi.fn(),
        getEntry: vi.fn()
      } as any)

      const res = await app.request('/admin/cache/browser')
      const json = await res.json()

      expect(res.status).toBe(200)
      expect(json.data.entries).toEqual([])
      expect(json.data.total).toBe(0)
    })
  })
})
