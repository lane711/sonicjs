/**
 * Cache Plugin Routes
 *
 * Admin routes for cache management
 */

import { Hono } from 'hono'
import type { Context } from 'hono'
import { getAllCacheStats, clearAllCaches, getCacheService } from './services/cache.js'
import { CACHE_CONFIGS } from './services/cache-config.js'
import { renderCacheDashboard, CacheDashboardData } from '../../templates/pages/admin-cache.template.js'

const app = new Hono()

/**
 * GET /admin/cache
 * Cache statistics dashboard
 */
app.get('/', async (c: Context) => {
  const stats = getAllCacheStats()
  const user = c.get('user')

  // Calculate totals
  let totalHits = 0
  let totalMisses = 0
  let totalSize = 0
  let totalEntries = 0

  Object.values(stats).forEach(stat => {
    totalHits += stat.memoryHits + stat.kvHits
    totalMisses += stat.memoryMisses + stat.kvMisses
    totalSize += stat.memorySize
    totalEntries += stat.entryCount
  })

  const totalRequests = totalHits + totalMisses
  const overallHitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0

  const dashboardData: CacheDashboardData = {
    stats,
    totals: {
      hits: totalHits,
      misses: totalMisses,
      requests: totalRequests,
      hitRate: overallHitRate.toFixed(2),
      memorySize: totalSize,
      entryCount: totalEntries
    },
    namespaces: Object.keys(stats),
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined
  }

  return c.html(renderCacheDashboard(dashboardData))
})

/**
 * GET /admin/cache/stats
 * Detailed statistics for all namespaces
 */
app.get('/stats', async (c: Context) => {
  const stats = getAllCacheStats()

  return c.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString()
  })
})

/**
 * GET /admin/cache/stats/:namespace
 * Statistics for a specific namespace
 */
app.get('/stats/:namespace', async (c: Context) => {
  const namespace = c.req.param('namespace')
  const config = CACHE_CONFIGS[namespace]

  if (!config) {
    return c.json({
      success: false,
      error: `Unknown namespace: ${namespace}`
    }, 404)
  }

  const cache = getCacheService(config)
  const stats = cache.getStats()

  return c.json({
    success: true,
    data: {
      namespace,
      config,
      stats
    },
    timestamp: new Date().toISOString()
  })
})

/**
 * POST /admin/cache/clear
 * Clear all cache entries
 */
app.post('/clear', async (c: Context) => {
  await clearAllCaches()

  return c.json({
    success: true,
    message: 'All cache entries cleared',
    timestamp: new Date().toISOString()
  })
})

/**
 * POST /admin/cache/clear/:namespace
 * Clear cache for a specific namespace
 */
app.post('/clear/:namespace', async (c: Context) => {
  const namespace = c.req.param('namespace')
  const config = CACHE_CONFIGS[namespace]

  if (!config) {
    return c.json({
      success: false,
      error: `Unknown namespace: ${namespace}`
    }, 404)
  }

  const cache = getCacheService(config)
  await cache.clear()

  return c.json({
    success: true,
    message: `Cache cleared for namespace: ${namespace}`,
    namespace,
    timestamp: new Date().toISOString()
  })
})

/**
 * POST /admin/cache/invalidate
 * Invalidate cache entries matching a pattern
 */
app.post('/invalidate', async (c: Context) => {
  const body = await c.req.json()
  const { pattern, namespace } = body

  if (!pattern) {
    return c.json({
      success: false,
      error: 'Pattern is required'
    }, 400)
  }

  let totalInvalidated = 0

  if (namespace) {
    // Invalidate from specific namespace
    const config = CACHE_CONFIGS[namespace]
    if (!config) {
      return c.json({
        success: false,
        error: `Unknown namespace: ${namespace}`
      }, 404)
    }

    const cache = getCacheService(config)
    totalInvalidated = await cache.invalidate(pattern)
  } else {
    // Invalidate from all namespaces
    for (const config of Object.values(CACHE_CONFIGS)) {
      const cache = getCacheService(config)
      totalInvalidated += await cache.invalidate(pattern)
    }
  }

  return c.json({
    success: true,
    invalidated: totalInvalidated,
    pattern,
    namespace: namespace || 'all',
    timestamp: new Date().toISOString()
  })
})

/**
 * GET /admin/cache/health
 * Cache system health check
 */
app.get('/health', async (c: Context) => {
  const stats = getAllCacheStats()

  // Calculate health metrics
  const namespaces = Object.entries(stats)
  const healthChecks = namespaces.map(([name, stat]) => {
    const hitRate = stat.hitRate
    const memoryUsage = stat.memorySize / (50 * 1024 * 1024) // Assume 50MB max

    return {
      namespace: name,
      status: hitRate > 70 ? 'healthy' : hitRate > 40 ? 'warning' : 'unhealthy',
      hitRate,
      memoryUsage: (memoryUsage * 100).toFixed(2) + '%',
      entryCount: stat.entryCount
    }
  })

  const overallStatus = healthChecks.every(h => h.status === 'healthy')
    ? 'healthy'
    : healthChecks.some(h => h.status === 'unhealthy')
    ? 'unhealthy'
    : 'warning'

  return c.json({
    success: true,
    data: {
      status: overallStatus,
      namespaces: healthChecks,
      timestamp: new Date().toISOString()
    }
  })
})

export default app
