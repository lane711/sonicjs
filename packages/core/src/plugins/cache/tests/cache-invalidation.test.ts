/**
 * Cache Invalidation Service Tests
 *
 * Tests for automatic cache invalidation based on application events
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  setupCacheInvalidation,
  getCacheInvalidationStats,
  getRecentInvalidations
} from '../services/cache-invalidation.js'
import { getEventBus, emitEvent } from '../services/event-bus.js'
import { getCacheService, clearAllCaches } from '../services/cache.js'
import { CACHE_CONFIGS } from '../services/cache-config.js'

describe('Cache Invalidation Service', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    // Clear all caches before each test
    await clearAllCaches()

    // Clear event bus subscriptions and logs
    const eventBus = getEventBus()
    for (const event of eventBus.getEvents()) {
      eventBus.off(event)
    }
    eventBus.clearEventLog()

    // Spy on console.log to verify invalidation messages
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('setupCacheInvalidation', () => {
    it('should register all cache invalidation listeners', () => {
      setupCacheInvalidation()

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidation listeners registered')

      const eventBus = getEventBus()
      const events = eventBus.getEvents()

      // Check that content events are registered
      expect(events).toContain('content.create')
      expect(events).toContain('content.update')
      expect(events).toContain('content.delete')
      expect(events).toContain('content.publish')

      // Check that user events are registered
      expect(events).toContain('user.update')
      expect(events).toContain('user.delete')
      expect(events).toContain('auth.login')
      expect(events).toContain('auth.logout')

      // Check that config events are registered
      expect(events).toContain('config.update')
      expect(events).toContain('plugin.activate')
      expect(events).toContain('plugin.deactivate')
      expect(events).toContain('plugin.update')

      // Check that media events are registered
      expect(events).toContain('media.upload')
      expect(events).toContain('media.delete')
      expect(events).toContain('media.update')

      // Check that collection events are registered
      expect(events).toContain('collection.create')
      expect(events).toContain('collection.update')
      expect(events).toContain('collection.delete')
    })
  })

  describe('Content Cache Invalidation', () => {
    beforeEach(() => {
      setupCacheInvalidation()
    })

    it('should invalidate content cache on content.create', async () => {
      const contentCache = getCacheService(CACHE_CONFIGS.content!)
      await contentCache.set('content:item:123', { id: '123', title: 'Test' })
      await contentCache.set('content:list:all', [{ id: '123' }])

      await emitEvent('content.create', { id: 'new-item' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: content.create')

      // Both items should be invalidated (content:* pattern)
      const item = await contentCache.get('content:item:123')
      const list = await contentCache.get('content:list:all')

      expect(item).toBeNull()
      expect(list).toBeNull()
    })

    it('should invalidate specific content item on content.update', async () => {
      const contentCache = getCacheService(CACHE_CONFIGS.content!)
      await contentCache.set(contentCache.generateKey('item', '123'), { id: '123' })
      await contentCache.set('content:list:all', [{ id: '123' }])
      await contentCache.set('content:other:data', 'other')

      await emitEvent('content.update', { id: '123' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: content.update', '123')

      // Specific item should be deleted
      const item = await contentCache.get(contentCache.generateKey('item', '123'))
      expect(item).toBeNull()

      // List should be invalidated
      const list = await contentCache.get('content:list:all')
      expect(list).toBeNull()
    })

    it('should handle content.update without id', async () => {
      const contentCache = getCacheService(CACHE_CONFIGS.content!)
      await contentCache.set('content:list:all', [{ id: '123' }])

      await emitEvent('content.update', {})

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: content.update', undefined)

      // Lists should still be invalidated
      const list = await contentCache.get('content:list:all')
      expect(list).toBeNull()
    })

    it('should invalidate on content.delete', async () => {
      const contentCache = getCacheService(CACHE_CONFIGS.content!)
      await contentCache.set(contentCache.generateKey('item', '456'), { id: '456' })

      await emitEvent('content.delete', { id: '456' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: content.delete', '456')

      const item = await contentCache.get(contentCache.generateKey('item', '456'))
      expect(item).toBeNull()
    })

    it('should invalidate on content.publish', async () => {
      const contentCache = getCacheService(CACHE_CONFIGS.content!)
      await contentCache.set('content:published:items', [{ id: '1' }])

      await emitEvent('content.publish', { id: '1' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: content.publish')

      const items = await contentCache.get('content:published:items')
      expect(items).toBeNull()
    })
  })

  describe('User Cache Invalidation', () => {
    beforeEach(() => {
      setupCacheInvalidation()
    })

    it('should invalidate user cache by id on user.update', async () => {
      const userCache = getCacheService(CACHE_CONFIGS.user!)
      await userCache.set(userCache.generateKey('id', 'user-123'), { id: 'user-123' })

      await emitEvent('user.update', { id: 'user-123' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: user.update', 'user-123')

      const user = await userCache.get(userCache.generateKey('id', 'user-123'))
      expect(user).toBeNull()
    })

    it('should invalidate user cache by email on user.update', async () => {
      const userCache = getCacheService(CACHE_CONFIGS.user!)
      await userCache.set(userCache.generateKey('email', 'test@example.com'), { email: 'test@example.com' })

      await emitEvent('user.update', { id: 'user-123', email: 'test@example.com' })

      const userByEmail = await userCache.get(userCache.generateKey('email', 'test@example.com'))
      expect(userByEmail).toBeNull()
    })

    it('should invalidate user cache on user.delete', async () => {
      const userCache = getCacheService(CACHE_CONFIGS.user!)
      await userCache.set(userCache.generateKey('id', 'user-456'), { id: 'user-456' })
      await userCache.set(userCache.generateKey('email', 'deleted@example.com'), { email: 'deleted@example.com' })

      await emitEvent('user.delete', { id: 'user-456', email: 'deleted@example.com' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: user.delete', 'user-456')

      const userById = await userCache.get(userCache.generateKey('id', 'user-456'))
      const userByEmail = await userCache.get(userCache.generateKey('email', 'deleted@example.com'))

      expect(userById).toBeNull()
      expect(userByEmail).toBeNull()
    })

    it('should invalidate user cache on auth.login', async () => {
      const userCache = getCacheService(CACHE_CONFIGS.user!)
      await userCache.set(userCache.generateKey('id', 'user-789'), { id: 'user-789', stale: true })

      await emitEvent('auth.login', { userId: 'user-789' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: auth.login', 'user-789')

      const user = await userCache.get(userCache.generateKey('id', 'user-789'))
      expect(user).toBeNull()
    })

    it('should invalidate session cache on auth.logout', async () => {
      const sessionCache = getCacheService(CACHE_CONFIGS.session!)
      await sessionCache.set(sessionCache.generateKey('session', 'sess-abc'), { sessionId: 'sess-abc' })

      await emitEvent('auth.logout', { sessionId: 'sess-abc' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: auth.logout')

      const session = await sessionCache.get(sessionCache.generateKey('session', 'sess-abc'))
      expect(session).toBeNull()
    })

    it('should handle auth.logout without sessionId', async () => {
      await emitEvent('auth.logout', {})

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: auth.logout')
    })
  })

  describe('Config Cache Invalidation', () => {
    beforeEach(() => {
      setupCacheInvalidation()
    })

    it('should invalidate config cache on config.update', async () => {
      const configCache = getCacheService(CACHE_CONFIGS.config!)
      await configCache.set('config:site:settings', { siteName: 'Test' })

      await emitEvent('config.update', {})

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: config.update')

      const config = await configCache.get('config:site:settings')
      expect(config).toBeNull()
    })

    it('should invalidate config and plugin cache on plugin.activate', async () => {
      const configCache = getCacheService(CACHE_CONFIGS.config!)
      const pluginCache = getCacheService(CACHE_CONFIGS.plugin!)

      await configCache.set('config:plugins:list', [{ id: 'plugin-1' }])
      await pluginCache.set('plugin:manifest:plugin-1', { id: 'plugin-1' })

      await emitEvent('plugin.activate', { pluginId: 'plugin-1' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: plugin.activate', 'plugin-1')

      const configPlugins = await configCache.get('config:plugins:list')
      const pluginManifest = await pluginCache.get('plugin:manifest:plugin-1')

      expect(configPlugins).toBeNull()
      expect(pluginManifest).toBeNull()
    })

    it('should invalidate config and plugin cache on plugin.deactivate', async () => {
      const configCache = getCacheService(CACHE_CONFIGS.config!)
      const pluginCache = getCacheService(CACHE_CONFIGS.plugin!)

      await configCache.set('config:active:plugins', ['plugin-1', 'plugin-2'])
      await pluginCache.set('plugin:state:plugin-2', { active: true })

      await emitEvent('plugin.deactivate', { pluginId: 'plugin-2' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: plugin.deactivate', 'plugin-2')

      const activePlugins = await configCache.get('config:active:plugins')
      const pluginState = await pluginCache.get('plugin:state:plugin-2')

      expect(activePlugins).toBeNull()
      expect(pluginState).toBeNull()
    })

    it('should invalidate plugin cache on plugin.update', async () => {
      const pluginCache = getCacheService(CACHE_CONFIGS.plugin!)
      await pluginCache.set('plugin:settings:plugin-3', { setting: 'value' })

      await emitEvent('plugin.update', { pluginId: 'plugin-3' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: plugin.update', 'plugin-3')

      const settings = await pluginCache.get('plugin:settings:plugin-3')
      expect(settings).toBeNull()
    })
  })

  describe('Media Cache Invalidation', () => {
    beforeEach(() => {
      setupCacheInvalidation()
    })

    it('should invalidate media cache on media.upload', async () => {
      const mediaCache = getCacheService(CACHE_CONFIGS.media!)
      await mediaCache.set('media:list:all', [{ id: 'file-1' }])

      await emitEvent('media.upload', { id: 'new-file' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: media.upload')

      const mediaList = await mediaCache.get('media:list:all')
      expect(mediaList).toBeNull()
    })

    it('should invalidate specific media item on media.delete', async () => {
      const mediaCache = getCacheService(CACHE_CONFIGS.media!)
      await mediaCache.set(mediaCache.generateKey('item', 'file-123'), { id: 'file-123' })
      await mediaCache.set('media:list:recent', [{ id: 'file-123' }])

      await emitEvent('media.delete', { id: 'file-123' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: media.delete', 'file-123')

      const item = await mediaCache.get(mediaCache.generateKey('item', 'file-123'))
      const list = await mediaCache.get('media:list:recent')

      expect(item).toBeNull()
      expect(list).toBeNull()
    })

    it('should invalidate specific media item on media.update', async () => {
      const mediaCache = getCacheService(CACHE_CONFIGS.media!)
      await mediaCache.set(mediaCache.generateKey('item', 'file-456'), { id: 'file-456', name: 'old' })
      await mediaCache.set('media:list:all', [{ id: 'file-456' }])

      await emitEvent('media.update', { id: 'file-456' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: media.update', 'file-456')

      const item = await mediaCache.get(mediaCache.generateKey('item', 'file-456'))
      expect(item).toBeNull()
    })

    it('should handle media events without id', async () => {
      const mediaCache = getCacheService(CACHE_CONFIGS.media!)
      await mediaCache.set('media:list:all', [{ id: 'file-1' }])

      await emitEvent('media.delete', {})

      // List should still be invalidated
      const list = await mediaCache.get('media:list:all')
      expect(list).toBeNull()
    })
  })

  describe('API Cache Invalidation', () => {
    beforeEach(() => {
      setupCacheInvalidation()
    })

    it('should invalidate API cache on content.update', async () => {
      const apiCache = getCacheService(CACHE_CONFIGS.api!)
      await apiCache.set('api:endpoint:/posts', [{ id: '1' }])

      await emitEvent('content.update', { id: '1' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: api (content.update)')

      const apiResponse = await apiCache.get('api:endpoint:/posts')
      expect(apiResponse).toBeNull()
    })

    it('should invalidate API cache on content.publish', async () => {
      const apiCache = getCacheService(CACHE_CONFIGS.api!)
      await apiCache.set('api:public:feed', [{ id: '1' }])

      await emitEvent('content.publish', { id: '1' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: api (content.publish)')

      const feed = await apiCache.get('api:public:feed')
      expect(feed).toBeNull()
    })

    it('should invalidate API cache on content.create', async () => {
      const apiCache = getCacheService(CACHE_CONFIGS.api!)
      await apiCache.set('api:list:items', [])

      await emitEvent('content.create', { id: 'new' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: api (content.create)')
    })

    it('should invalidate API cache on content.delete', async () => {
      const apiCache = getCacheService(CACHE_CONFIGS.api!)
      await apiCache.set('api:item:deleted', { id: 'deleted' })

      await emitEvent('content.delete', { id: 'deleted' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: api (content.delete)')
    })

    it('should invalidate API cache on collection.update', async () => {
      const apiCache = getCacheService(CACHE_CONFIGS.api!)
      await apiCache.set('api:schema:posts', { fields: [] })

      await emitEvent('collection.update', { id: 'posts' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: api (collection.update)')

      const schema = await apiCache.get('api:schema:posts')
      expect(schema).toBeNull()
    })
  })

  describe('Collection Cache Invalidation', () => {
    beforeEach(() => {
      setupCacheInvalidation()
    })

    it('should invalidate collection cache on collection.create', async () => {
      const collectionCache = getCacheService(CACHE_CONFIGS.collection!)
      await collectionCache.set('collection:list:all', [{ name: 'posts' }])

      await emitEvent('collection.create', { name: 'pages' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: collection.create')

      const collections = await collectionCache.get('collection:list:all')
      expect(collections).toBeNull()
    })

    it('should invalidate specific collection on collection.update', async () => {
      const collectionCache = getCacheService(CACHE_CONFIGS.collection!)
      await collectionCache.set(collectionCache.generateKey('item', 'posts'), { name: 'posts' })
      await collectionCache.set('collection:schema:all', {})

      await emitEvent('collection.update', { id: 'posts' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: collection.update', 'posts')

      const item = await collectionCache.get(collectionCache.generateKey('item', 'posts'))
      expect(item).toBeNull()
    })

    it('should invalidate collection cache on collection.delete', async () => {
      const collectionCache = getCacheService(CACHE_CONFIGS.collection!)
      await collectionCache.set('collection:all', [{ name: 'posts' }, { name: 'pages' }])

      await emitEvent('collection.delete', { id: 'pages' })

      expect(consoleSpy).toHaveBeenCalledWith('Cache invalidated: collection.delete', 'pages')

      const collections = await collectionCache.get('collection:all')
      expect(collections).toBeNull()
    })
  })

  describe('Statistics and Logging', () => {
    beforeEach(() => {
      setupCacheInvalidation()
    })

    it('should return cache invalidation stats', async () => {
      await emitEvent('content.create', { id: '1' })
      await emitEvent('content.update', { id: '2' })
      await emitEvent('user.update', { id: 'user-1' })

      const stats = getCacheInvalidationStats()

      expect(stats.totalEvents).toBeGreaterThanOrEqual(3)
      expect(stats.eventCounts['content.create']).toBeGreaterThanOrEqual(1)
      expect(stats.eventCounts['content.update']).toBeGreaterThanOrEqual(1)
      expect(stats.eventCounts['user.update']).toBeGreaterThanOrEqual(1)
    })

    it('should return recent invalidation events', async () => {
      await emitEvent('content.create', { id: '1' })
      await emitEvent('media.upload', { id: 'file-1' })

      const recentEvents = getRecentInvalidations(10)

      expect(recentEvents.length).toBeGreaterThanOrEqual(2)

      const eventNames = recentEvents.map(e => e.event)
      expect(eventNames).toContain('content.create')
      expect(eventNames).toContain('media.upload')
    })

    it('should limit recent invalidations', async () => {
      for (let i = 0; i < 20; i++) {
        await emitEvent('content.create', { id: `item-${i}` })
      }

      const limited = getRecentInvalidations(5)

      expect(limited.length).toBe(5)
    })

    it('should use default limit of 50 for recent invalidations', async () => {
      for (let i = 0; i < 60; i++) {
        await emitEvent('content.create', { id: `item-${i}` })
      }

      const defaultLimited = getRecentInvalidations()

      expect(defaultLimited.length).toBe(50)
    })
  })
})
