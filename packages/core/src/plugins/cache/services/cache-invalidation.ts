/**
 * Cache Invalidation Service
 *
 * Automatically invalidates cache entries based on application events
 */

import { getCacheService } from './cache.js'
import { CACHE_CONFIGS } from './cache-config.js'
import { getEventBus, onEvent } from './event-bus.js'

/**
 * Setup automatic cache invalidation based on events
 */
export function setupCacheInvalidation(): void {
  const _____eventBus = getEventBus()

  // Content cache invalidation
  setupContentInvalidation()

  // User cache invalidation
  setupUserInvalidation()

  // Config cache invalidation
  setupConfigInvalidation()

  // Media cache invalidation
  setupMediaInvalidation()

  // API cache invalidation
  setupAPIInvalidation()

  // Collection cache invalidation
  setupCollectionInvalidation()

  console.log('Cache invalidation listeners registered')
}

/**
 * Content cache invalidation
 */
function setupContentInvalidation(): void {
  const config = CACHE_CONFIGS.content
  if (!config) return
  const contentCache = getCacheService(config)

  // Invalidate on content updates
  onEvent('content.create', async (_data) => {
    await contentCache.invalidate('content:*')
    console.log('Cache invalidated: content.create')
  })

  onEvent('content.update', async (data) => {
    if (data?.id) {
      // Invalidate specific content item
      await contentCache.delete(contentCache.generateKey('item', data.id))
    }
    // Invalidate all content lists
    await contentCache.invalidate('content:list:*')
    console.log('Cache invalidated: content.update', data?.id)
  })

  onEvent('content.delete', async (data) => {
    if (data?.id) {
      await contentCache.delete(contentCache.generateKey('item', data.id))
    }
    await contentCache.invalidate('content:*')
    console.log('Cache invalidated: content.delete', data?.id)
  })

  onEvent('content.publish', async (_data) => {
    await contentCache.invalidate('content:*')
    console.log('Cache invalidated: content.publish')
  })
}

/**
 * User cache invalidation
 */
function setupUserInvalidation(): void {
  const config = CACHE_CONFIGS.user
  if (!config) return
  const userCache = getCacheService(config)

  onEvent('user.update', async (data) => {
    if (data?.id) {
      await userCache.delete(userCache.generateKey('id', data.id))
    }
    if (data?.email) {
      await userCache.delete(userCache.generateKey('email', data.email))
    }
    console.log('Cache invalidated: user.update', data?.id)
  })

  onEvent('user.delete', async (data) => {
    if (data?.id) {
      await userCache.delete(userCache.generateKey('id', data.id))
    }
    if (data?.email) {
      await userCache.delete(userCache.generateKey('email', data.email))
    }
    console.log('Cache invalidated: user.delete', data?.id)
  })

  onEvent('auth.login', async (data) => {
    if (data?.userId) {
      await userCache.delete(userCache.generateKey('id', data.userId))
    }
    console.log('Cache invalidated: auth.login', data?.userId)
  })

  onEvent('auth.logout', async (data) => {
    // Clear session cache
    const sessionConfig = CACHE_CONFIGS.session
    if (sessionConfig) {
      const sessionCache = getCacheService(sessionConfig)
      if (data?.sessionId) {
        await sessionCache.delete(sessionCache.generateKey('session', data.sessionId))
      }
    }
    console.log('Cache invalidated: auth.logout')
  })
}

/**
 * Config cache invalidation
 */
function setupConfigInvalidation(): void {
  const configConfig = CACHE_CONFIGS.config
  if (!configConfig) return
  const configCache = getCacheService(configConfig)

  onEvent('config.update', async (_data) => {
    await configCache.invalidate('config:*')
    console.log('Cache invalidated: config.update')
  })

  onEvent('plugin.activate', async (data) => {
    await configCache.invalidate('config:*')
    const pluginConfig = CACHE_CONFIGS.plugin
    if (pluginConfig) {
      const pluginCache = getCacheService(pluginConfig)
      await pluginCache.invalidate('plugin:*')
    }
    console.log('Cache invalidated: plugin.activate', data?.pluginId)
  })

  onEvent('plugin.deactivate', async (data) => {
    await configCache.invalidate('config:*')
    const pluginConfig = CACHE_CONFIGS.plugin
    if (pluginConfig) {
      const pluginCache = getCacheService(pluginConfig)
      await pluginCache.invalidate('plugin:*')
    }
    console.log('Cache invalidated: plugin.deactivate', data?.pluginId)
  })

  onEvent('plugin.update', async (data) => {
    const pluginConfig = CACHE_CONFIGS.plugin
    if (!pluginConfig) return
    const pluginCache = getCacheService(pluginConfig)
    await pluginCache.invalidate('plugin:*')
    console.log('Cache invalidated: plugin.update', data?.pluginId)
  })
}

/**
 * Media cache invalidation
 */
function setupMediaInvalidation(): void {
  const config = CACHE_CONFIGS.media
  if (!config) return
  const mediaCache = getCacheService(config)

  onEvent('media.upload', async (_data) => {
    await mediaCache.invalidate('media:*')
    console.log('Cache invalidated: media.upload')
  })

  onEvent('media.delete', async (data) => {
    if (data?.id) {
      await mediaCache.delete(mediaCache.generateKey('item', data.id))
    }
    await mediaCache.invalidate('media:list:*')
    console.log('Cache invalidated: media.delete', data?.id)
  })

  onEvent('media.update', async (data) => {
    if (data?.id) {
      await mediaCache.delete(mediaCache.generateKey('item', data.id))
    }
    await mediaCache.invalidate('media:list:*')
    console.log('Cache invalidated: media.update', data?.id)
  })
}

/**
 * API cache invalidation (depends on content changes)
 */
function setupAPIInvalidation(): void {
  const config = CACHE_CONFIGS.api
  if (!config) return
  const apiCache = getCacheService(config)

  onEvent('content.update', async (_data) => {
    await apiCache.invalidate('api:*')
    console.log('Cache invalidated: api (content.update)')
  })

  onEvent('content.publish', async (_data) => {
    await apiCache.invalidate('api:*')
    console.log('Cache invalidated: api (content.publish)')
  })

  onEvent('content.create', async (_data) => {
    await apiCache.invalidate('api:*')
    console.log('Cache invalidated: api (content.create)')
  })

  onEvent('content.delete', async (_data) => {
    await apiCache.invalidate('api:*')
    console.log('Cache invalidated: api (content.delete)')
  })

  onEvent('collection.update', async (_data) => {
    await apiCache.invalidate('api:*')
    console.log('Cache invalidated: api (collection.update)')
  })
}

/**
 * Collection cache invalidation
 */
function setupCollectionInvalidation(): void {
  const config = CACHE_CONFIGS.collection
  if (!config) return
  const collectionCache = getCacheService(config)

  onEvent('collection.create', async (_data) => {
    await collectionCache.invalidate('collection:*')
    console.log('Cache invalidated: collection.create')
  })

  onEvent('collection.update', async (data) => {
    if (data?.id) {
      await collectionCache.delete(collectionCache.generateKey('item', data.id))
    }
    await collectionCache.invalidate('collection:*')
    console.log('Cache invalidated: collection.update', data?.id)
  })

  onEvent('collection.delete', async (data) => {
    await collectionCache.invalidate('collection:*')
    console.log('Cache invalidated: collection.delete', data?.id)
  })
}

/**
 * Get invalidation statistics
 */
export function getCacheInvalidationStats() {
  const eventBus = getEventBus()
  return eventBus.getStats()
}

/**
 * Get recent invalidation events
 */
export function getRecentInvalidations(limit: number = 50) {
  const eventBus = getEventBus()
  return eventBus.getEventLog(limit)
}
