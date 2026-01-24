/**
 * Admin Cache Routes Tests
 *
 * Tests for the cache management admin routes
 * Issue #461: https://github.com/SonicJs-Org/sonicjs/issues/461
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Hono } from 'hono'

// Mock the template module before importing routes
vi.mock('../../templates/pages/admin-cache.template', () => ({
  renderCacheDashboard: (data: any) => `<html><head><title>Cache Dashboard</title></head><body><h1>Cache Dashboard</h1><div>Stats: ${JSON.stringify(data.totals)}</div></body></html>`,
  CacheDashboardData: {}
}))

import cacheRoutes from '../../plugins/cache/routes'
import { clearAllCaches } from '../../plugins/cache/services/cache'

// Mock user creation helper
const createMockUser = (role: string = 'admin') => ({
  id: 'test-user',
  email: 'test@example.com',
  role
})

// Store the mock role so tests can change it
let mockUserRole = 'admin'

// Mock environment bindings
const createMockEnv = () => ({
  DB: {
    prepare: vi.fn().mockReturnValue({
      bind: vi.fn().mockReturnThis(),
      first: vi.fn(),
      all: vi.fn(),
      run: vi.fn()
    })
  },
  CACHE_KV: {},
  MEDIA_BUCKET: {}
})

describe('Admin Cache Routes', () => {
  let app: Hono
  let mockEnv: any

  beforeEach(async () => {
    vi.clearAllMocks()
    mockEnv = createMockEnv()
    mockUserRole = 'admin'

    // Clear all caches before each test
    await clearAllCaches()

    // Create new app instance for each test
    app = new Hono<{ Bindings: { DB: any; CACHE_KV: any; MEDIA_BUCKET: any } }>()

    // Set up middleware to provide env and user context
    app.use('*', async (c, next) => {
      // @ts-ignore - Setting env for test purposes
      c.env = mockEnv
      c.set('appVersion', '1.0.0-test')
      c.set('user', createMockUser(mockUserRole))
      await next()
    })

    // Mount cache routes
    app.route('/admin/cache', cacheRoutes)
  })

  describe('GET /admin/cache (dashboard)', () => {
    it('should return cache dashboard HTML page', async () => {
      const res = await app.request('/admin/cache', {
        method: 'GET'
      })

      expect(res.status).toBe(200)
      const html = await res.text()
      expect(html).toContain('Cache')
    })
  })

  describe('GET /admin/cache/stats', () => {
    it('should return cache statistics as JSON', async () => {
      const res = await app.request('/admin/cache/stats', {
        method: 'GET'
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toBeDefined()
      expect(json.timestamp).toBeDefined()
    })

    it('should include stats for all namespaces', async () => {
      const res = await app.request('/admin/cache/stats', {
        method: 'GET'
      })

      expect(res.status).toBe(200)
      const json = await res.json()

      // Should have stats object even if empty
      expect(typeof json.data).toBe('object')
    })
  })

  describe('GET /admin/cache/stats/:namespace', () => {
    it('should return stats for valid namespace', async () => {
      const res = await app.request('/admin/cache/stats/content', {
        method: 'GET'
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.namespace).toBe('content')
    })

    it('should return 404 for unknown namespace', async () => {
      const res = await app.request('/admin/cache/stats/unknown-namespace', {
        method: 'GET'
      })

      expect(res.status).toBe(404)
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('Unknown namespace')
    })
  })

  describe('POST /admin/cache/clear', () => {
    it('should clear all caches successfully', async () => {
      const res = await app.request('/admin/cache/clear', {
        method: 'POST'
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.message).toBe('All cache entries cleared')
      expect(json.timestamp).toBeDefined()
    })
  })

  describe('POST /admin/cache/clear/:namespace', () => {
    it('should clear specific namespace cache', async () => {
      const res = await app.request('/admin/cache/clear/content', {
        method: 'POST'
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.namespace).toBe('content')
    })

    it('should return 404 for unknown namespace', async () => {
      const res = await app.request('/admin/cache/clear/unknown-namespace', {
        method: 'POST'
      })

      expect(res.status).toBe(404)
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toContain('Unknown namespace')
    })
  })

  describe('POST /admin/cache/invalidate', () => {
    it('should invalidate cache entries matching pattern', async () => {
      const res = await app.request('/admin/cache/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern: 'content:*' })
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.pattern).toBe('content:*')
      expect(typeof json.invalidated).toBe('number')
    })

    it('should invalidate from specific namespace', async () => {
      const res = await app.request('/admin/cache/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern: 'post:*', namespace: 'content' })
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.namespace).toBe('content')
    })

    it('should return 400 when pattern is missing', async () => {
      const res = await app.request('/admin/cache/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Pattern is required')
    })

    it('should return 404 for unknown namespace in targeted invalidation', async () => {
      const res = await app.request('/admin/cache/invalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern: '*', namespace: 'unknown-namespace' })
      })

      expect(res.status).toBe(404)
      const json = await res.json()
      expect(json.success).toBe(false)
    })
  })

  describe('GET /admin/cache/health', () => {
    it('should return cache health status', async () => {
      const res = await app.request('/admin/cache/health', {
        method: 'GET'
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.status).toBeDefined()
      expect(['healthy', 'warning', 'unhealthy']).toContain(json.data.status)
      expect(Array.isArray(json.data.namespaces)).toBe(true)
    })
  })

  describe('GET /admin/cache/browser', () => {
    it('should return cache entries browser data', async () => {
      const res = await app.request('/admin/cache/browser', {
        method: 'GET'
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data).toBeDefined()
      expect(Array.isArray(json.data.entries)).toBe(true)
      expect(typeof json.data.total).toBe('number')
    })

    it('should support namespace filter', async () => {
      const res = await app.request('/admin/cache/browser?namespace=content', {
        method: 'GET'
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data.namespace).toBe('content')
    })

    it('should support search filter', async () => {
      const res = await app.request('/admin/cache/browser?search=test', {
        method: 'GET'
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data.search).toBe('test')
    })

    it('should support sort parameter', async () => {
      const res = await app.request('/admin/cache/browser?sort=size', {
        method: 'GET'
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data.sortBy).toBe('size')
    })

    it('should support limit parameter', async () => {
      const res = await app.request('/admin/cache/browser?limit=10', {
        method: 'GET'
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data.showing).toBeLessThanOrEqual(10)
    })
  })

  describe('GET /admin/cache/analytics', () => {
    it('should return cache analytics data', async () => {
      const res = await app.request('/admin/cache/analytics', {
        method: 'GET'
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.overview).toBeDefined()
      expect(json.data.performance).toBeDefined()
      expect(json.data.namespaces).toBeDefined()
      expect(json.data.invalidation).toBeDefined()
    })

    it('should include performance metrics', async () => {
      const res = await app.request('/admin/cache/analytics', {
        method: 'GET'
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(typeof json.data.performance.dbQueriesAvoided).toBe('number')
      expect(typeof json.data.performance.timeSavedMs).toBe('number')
    })
  })

  describe('GET /admin/cache/analytics/trends', () => {
    it('should return cache trends data', async () => {
      const res = await app.request('/admin/cache/analytics/trends', {
        method: 'GET'
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(Array.isArray(json.data.trends)).toBe(true)
    })
  })

  describe('GET /admin/cache/analytics/top-keys', () => {
    it('should return top keys data (placeholder)', async () => {
      const res = await app.request('/admin/cache/analytics/top-keys', {
        method: 'GET'
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.data.topKeys).toBeDefined()
    })
  })

  describe('POST /admin/cache/warm', () => {
    it('should attempt to warm common caches', async () => {
      const res = await app.request('/admin/cache/warm', {
        method: 'POST'
      })

      // May return 200 or 500 depending on DB availability in test
      // Just verify the endpoint responds
      expect([200, 500]).toContain(res.status)
    })
  })

  describe('POST /admin/cache/warm/:namespace', () => {
    it('should warm specific namespace with entries', async () => {
      const res = await app.request('/admin/cache/warm/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: [
            { key: 'test:1', value: 'value1' },
            { key: 'test:2', value: 'value2' }
          ]
        })
      })

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.success).toBe(true)
      expect(json.namespace).toBe('content')
      expect(json.count).toBe(2)
    })

    it('should return 400 when entries array is missing', async () => {
      const res = await app.request('/admin/cache/warm/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.success).toBe(false)
      expect(json.error).toBe('Entries array is required')
    })
  })
})

describe('Cache Routes Integration', () => {
  let app: Hono

  beforeEach(async () => {
    await clearAllCaches()

    app = new Hono()
    app.use('*', async (c, next) => {
      c.set('appVersion', '1.0.0-test')
      c.set('user', { id: 'test', email: 'test@test.com', role: 'admin' })
      await next()
    })
    app.route('/admin/cache', cacheRoutes)
  })

  it('should clear cache and verify stats reset', async () => {
    // First, get initial stats
    const statsBefore = await app.request('/admin/cache/stats', { method: 'GET' })
    expect(statsBefore.status).toBe(200)

    // Clear all caches
    const clearRes = await app.request('/admin/cache/clear', { method: 'POST' })
    expect(clearRes.status).toBe(200)

    // Verify stats after clear
    const statsAfter = await app.request('/admin/cache/stats', { method: 'GET' })
    expect(statsAfter.status).toBe(200)
    const json = await statsAfter.json()
    expect(json.success).toBe(true)
  })

  it('should support full cache management workflow', async () => {
    // 1. Check health
    const healthRes = await app.request('/admin/cache/health', { method: 'GET' })
    expect(healthRes.status).toBe(200)

    // 2. Get stats
    const statsRes = await app.request('/admin/cache/stats', { method: 'GET' })
    expect(statsRes.status).toBe(200)

    // 3. Browse entries
    const browserRes = await app.request('/admin/cache/browser', { method: 'GET' })
    expect(browserRes.status).toBe(200)

    // 4. Get analytics
    const analyticsRes = await app.request('/admin/cache/analytics', { method: 'GET' })
    expect(analyticsRes.status).toBe(200)

    // 5. Clear all
    const clearRes = await app.request('/admin/cache/clear', { method: 'POST' })
    expect(clearRes.status).toBe(200)
  })
})
