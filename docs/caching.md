# SonicJS Caching System Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Cache Configuration](#cache-configuration)
4. [Core Cache Service](#core-cache-service)
5. [Cache Invalidation](#cache-invalidation)
6. [Event-Driven Invalidation](#event-driven-invalidation)
7. [Cache Warming](#cache-warming)
8. [Usage Examples](#usage-examples)
9. [API Integration](#api-integration)
10. [Performance Optimization](#performance-optimization)
11. [Monitoring and Debugging](#monitoring-and-debugging)
12. [Best Practices](#best-practices)
13. [Advanced Features](#advanced-features)

---

## Overview

SonicJS implements a sophisticated **three-tiered caching system** designed for Cloudflare's edge platform. The caching system provides:

- **Ultra-fast response times** with in-memory caching
- **Global distribution** via Cloudflare KV
- **Automatic invalidation** through event-driven architecture
- **Intelligent cache warming** for frequently accessed data
- **Comprehensive monitoring** and analytics

### Key Features

- Three-tier cache hierarchy (Memory → KV → Database)
- Configurable TTL per namespace
- Pattern-based cache invalidation
- Event-driven automatic invalidation
- Cache warming and preloading
- Detailed statistics and analytics
- LRU eviction for memory management
- Support for complex data types

---

## Architecture

### Three-Tier Cache Hierarchy

The SonicJS caching system uses a three-tier architecture where each tier serves as a fallback for the next:

```
┌─────────────────────────────────────────────────────────────┐
│                     REQUEST FLOW                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   TIER 1: Memory      │ ◄─── Fastest (2ms)
                │   - In-Process        │      Regional
                │   - LRU Eviction      │      50MB limit
                │   - 2ms response      │
                └───────────┬───────────┘
                            │ miss
                            ▼
                ┌───────────────────────┐
                │   TIER 2: KV Cache    │ ◄─── Fast (20ms)
                │   - Cloudflare KV     │      Global
                │   - Global CDN        │      Persistent
                │   - 20ms response     │
                └───────────┬───────────┘
                            │ miss
                            ▼
                ┌───────────────────────┐
                │   TIER 3: Database    │ ◄─── Source (50ms+)
                │   - D1 Database       │      Truth
                │   - Source of Truth   │      Authoritative
                │   - 50-200ms response │
                └───────────────────────┘
```

### How It Works

1. **Cache Hit (Memory)**: Request → Memory Cache → Response (2ms)
2. **Cache Hit (KV)**: Request → Memory Miss → KV Hit → Populate Memory → Response (20ms)
3. **Cache Miss**: Request → Memory Miss → KV Miss → Database → Populate KV & Memory → Response (50-200ms)

### Performance Characteristics

| Tier | Response Time | Scope | Persistence | Size Limit |
|------|--------------|-------|-------------|------------|
| Memory | 2ms | Regional | Process lifetime | 50MB |
| KV | 20ms | Global | Persistent | 1GB per key |
| Database | 50-200ms | Global | Permanent | Unlimited |

### Implementation

The core cache service implements the three-tier lookup pattern:

```typescript
// From src/plugins/cache/services/cache.ts

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    this.stats.totalRequests++

    // Tier 1: Try memory cache first
    if (this.config.memoryEnabled) {
      const memoryValue = this.memoryCache.get<T>(key)
      if (memoryValue !== null) {
        this.stats.memoryHits++
        this.updateHitRate()
        return memoryValue
      }
      this.stats.memoryMisses++
    }

    // Tier 2: Try KV cache
    if (this.config.kvEnabled && this.kvNamespace) {
      try {
        const kvValue = await this.kvNamespace.get(key, 'json')
        if (kvValue !== null) {
          this.stats.kvHits++

          // Populate memory cache for faster subsequent access
          if (this.config.memoryEnabled) {
            this.memoryCache.set(key, kvValue as T, this.config.ttl, this.config.version)
          }

          this.updateHitRate()
          return kvValue as T
        }
        this.stats.kvMisses++
      } catch (error) {
        console.error('KV cache read error:', error)
        this.stats.kvMisses++
      }
    }

    this.updateHitRate()
    return null
  }
}
```

### Memory Cache with LRU Eviction

```typescript
class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private maxSize: number = 50 * 1024 * 1024 // 50MB
  private currentSize: number = 0

  set<T>(key: string, value: T, ttl: number, version: string = 'v1'): void {
    const now = Date.now()
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: now,
      expiresAt: now + (ttl * 1000),
      version
    }

    // Estimate size (rough approximation)
    const entrySize = JSON.stringify(entry).length * 2 // UTF-16

    // Check if we need to evict
    if (this.currentSize + entrySize > this.maxSize) {
      this.evictLRU(entrySize)
    }

    // Delete old entry if exists
    if (this.cache.has(key)) {
      this.delete(key)
    }

    this.cache.set(key, entry)
    this.currentSize += entrySize
  }

  private evictLRU(neededSpace: number): void {
    // Sort by timestamp (oldest first)
    const entries = Array.from(this.cache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    )

    let freedSpace = 0
    for (const [key, entry] of entries) {
      if (freedSpace >= neededSpace) break

      const entrySize = JSON.stringify(entry).length * 2
      this.delete(key)
      freedSpace += entrySize
    }
  }
}
```

---

## Cache Configuration

### Configuration Structure

Each cache namespace has its own configuration defining behavior and invalidation rules:

```typescript
interface CacheConfig {
  ttl: number              // Time-to-live in seconds
  kvEnabled: boolean       // Use KV cache tier
  memoryEnabled: boolean   // Use in-memory cache tier
  namespace: string        // Cache namespace/prefix
  invalidateOn: string[]   // Events that invalidate this cache
  version?: string         // Cache version for busting
}
```

### Predefined Namespaces

SonicJS comes with preconfigured namespaces optimized for different data types:

```typescript
// From src/plugins/cache/services/cache-config.ts

export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Content Cache (High read, low write)
  content: {
    ttl: 3600,              // 1 hour
    kvEnabled: true,
    memoryEnabled: true,
    namespace: 'content',
    invalidateOn: ['content.update', 'content.delete', 'content.publish'],
    version: 'v1'
  },

  // User Cache (Medium read, medium write)
  user: {
    ttl: 900,               // 15 minutes
    kvEnabled: true,
    memoryEnabled: true,
    namespace: 'user',
    invalidateOn: ['user.update', 'user.delete', 'auth.login'],
    version: 'v1'
  },

  // Config Cache (High read, very low write)
  config: {
    ttl: 7200,              // 2 hours
    kvEnabled: true,
    memoryEnabled: true,
    namespace: 'config',
    invalidateOn: ['config.update', 'plugin.activate', 'plugin.deactivate'],
    version: 'v1'
  },

  // API Response Cache (Very high read, low write)
  api: {
    ttl: 300,               // 5 minutes
    kvEnabled: true,
    memoryEnabled: true,
    namespace: 'api',
    invalidateOn: ['content.update', 'content.publish'],
    version: 'v1'
  },

  // Session Cache (Very high read, medium write)
  session: {
    ttl: 1800,              // 30 minutes
    kvEnabled: false,       // Memory only for sessions
    memoryEnabled: true,
    namespace: 'session',
    invalidateOn: ['auth.logout'],
    version: 'v1'
  },

  // Media Cache (High read, low write)
  media: {
    ttl: 3600,              // 1 hour
    kvEnabled: true,
    memoryEnabled: true,
    namespace: 'media',
    invalidateOn: ['media.upload', 'media.delete', 'media.update'],
    version: 'v1'
  },

  // Collection Cache (High read, very low write)
  collection: {
    ttl: 7200,              // 2 hours
    kvEnabled: true,
    memoryEnabled: true,
    namespace: 'collection',
    invalidateOn: ['collection.update', 'collection.delete'],
    version: 'v1'
  },

  // Plugin Cache
  plugin: {
    ttl: 3600,              // 1 hour
    kvEnabled: true,
    memoryEnabled: true,
    namespace: 'plugin',
    invalidateOn: ['plugin.activate', 'plugin.deactivate', 'plugin.update'],
    version: 'v1'
  }
}
```

### Cache Key Format

Cache keys follow a consistent format for easy management and pattern matching:

```typescript
// Format: {namespace}:{type}:{identifier}:{version}
// Example: content:post:123:v1

// Generate a cache key
import { generateCacheKey } from './plugins/cache'

const key = generateCacheKey('content', 'post', '123', 'v1')
// Returns: "content:post:123:v1"

// Parse a cache key
import { parseCacheKey } from './plugins/cache'

const parsed = parseCacheKey('content:post:123:v1')
// Returns: { namespace: 'content', type: 'post', identifier: '123', version: 'v1' }
```

### Query Parameter Hashing

For caching API responses with query parameters:

```typescript
import { hashQueryParams } from './plugins/cache'

const params = { limit: 50, offset: 0, sort: 'asc' }
const hash = hashQueryParams(params)
// Returns: consistent hash like "abc123"

// Use in cache key
const cacheKey = `api:content-list:${hash}:v1`
```

---

## Core Cache Service

### Initialization

Get or create a cache service for a specific namespace:

```typescript
import { getCacheService, CACHE_CONFIGS } from './plugins/cache'

// Get cache service for content namespace
const contentCache = getCacheService(CACHE_CONFIGS.content)

// Get cache service with custom config
const customCache = getCacheService({
  ttl: 1800,
  kvEnabled: true,
  memoryEnabled: true,
  namespace: 'custom',
  invalidateOn: [],
  version: 'v1'
})
```

### Basic Operations

#### Set a Value

```typescript
// Basic set
await cache.set('mykey', { id: 1, name: 'Test' })

// Set with custom TTL
await cache.set('mykey', { id: 1, name: 'Test' }, { ttl: 3600 })

// Set with custom config
await cache.set('mykey', value, {
  ttl: 7200,
  memoryEnabled: true,
  kvEnabled: false
})
```

#### Get a Value

```typescript
// Basic get
const value = await cache.get('mykey')

// Get with type information
const user = await cache.get<User>('user:123')

// Get with source information
const result = await cache.getWithSource<User>('user:123')
console.log(result)
// {
//   data: { id: 123, name: 'John' },
//   source: 'memory',  // or 'kv' or 'miss'
//   hit: true,
//   timestamp: 1234567890,
//   ttl: 300
// }
```

#### Delete a Value

```typescript
// Delete single key
await cache.delete('mykey')

// Delete multiple keys
await cache.deleteMany(['key1', 'key2', 'key3'])
```

#### Check Existence

```typescript
const exists = await cache.has('mykey')
if (exists) {
  console.log('Key exists in cache')
}
```

### Batch Operations

#### Get Multiple Values

```typescript
const keys = ['user:1', 'user:2', 'user:3']
const results = await cache.getMany<User>(keys)

// Results is a Map
results.forEach((user, key) => {
  console.log(`${key}: ${user.name}`)
})
```

#### Set Multiple Values

```typescript
const entries = [
  { key: 'user:1', value: { id: 1, name: 'John' } },
  { key: 'user:2', value: { id: 2, name: 'Jane' } },
  { key: 'user:3', value: { id: 3, name: 'Bob' } }
]

await cache.setMany(entries)
```

### Get-or-Set Pattern

The get-or-set pattern automatically fetches and caches data if not found:

```typescript
// Fetcher function is only called on cache miss
const user = await cache.getOrSet(
  'user:123',
  async () => {
    // This function only runs on cache miss
    return await db.query('SELECT * FROM users WHERE id = ?', [123])
  }
)

// With custom TTL
const user = await cache.getOrSet(
  'user:123',
  async () => await fetchUser(123),
  { ttl: 3600 }
)
```

### Advanced Operations

#### Generate Cache Keys

```typescript
// Generate key with namespace
const key = cache.generateKey('post', '123')
// Returns: "content:post:123:v1" (uses namespace from config)
```

#### List All Keys

```typescript
const keys = await cache.listKeys()
// Returns array of key metadata
keys.forEach(key => {
  console.log({
    key: key.key,
    size: key.size,
    age: key.age,
    expiresAt: key.expiresAt
  })
})
```

#### Get Entry with Metadata

```typescript
const entry = await cache.getEntry('mykey')
if (entry) {
  console.log({
    data: entry.data,
    timestamp: entry.timestamp,
    expiresAt: entry.expiresAt,
    ttl: entry.ttl,
    size: entry.size
  })
}
```

### Cache Statistics

```typescript
const stats = cache.getStats()
console.log({
  memoryHits: stats.memoryHits,
  memoryMisses: stats.memoryMisses,
  kvHits: stats.kvHits,
  kvMisses: stats.kvMisses,
  totalRequests: stats.totalRequests,
  hitRate: stats.hitRate,
  memorySize: stats.memorySize,
  entryCount: stats.entryCount
})
```

---

## Cache Invalidation

### Pattern-Based Invalidation

Invalidate cache entries matching a pattern:

```typescript
// Invalidate all content posts
const count = await cache.invalidate('content:post:*')
console.log(`Invalidated ${count} entries`)

// Invalidate all entries in namespace
await cache.invalidate('content:*')

// Invalidate specific type
await cache.invalidate('content:post:*')

// Invalidate specific pattern
await cache.invalidate('api:collection-content:blog:*')
```

### Create Invalidation Patterns

```typescript
import { createCachePattern } from './plugins/cache'

// Create patterns for different scopes
const pattern1 = createCachePattern('content')
// Returns: "content:*"

const pattern2 = createCachePattern('content', 'post')
// Returns: "content:post:*"

const pattern3 = createCachePattern('content', 'post', '123')
// Returns: "content:post:123:*"
```

### Clear Cache

```typescript
// Clear all entries in namespace
await cache.clear()

// Clear all caches across all namespaces
import { clearAllCaches } from './plugins/cache'
await clearAllCaches()
```

---

## Event-Driven Invalidation

SonicJS uses an event bus to automatically invalidate cache entries when data changes.

### Event Bus Architecture

```typescript
import { getEventBus, emitEvent, onEvent } from './plugins/cache'

// Get the global event bus
const eventBus = getEventBus()
```

### Subscribing to Events

```typescript
// Subscribe to a specific event
const unsubscribe = onEvent('content.update', async (data) => {
  console.log('Content updated:', data.id)
  // Handle cache invalidation
})

// Unsubscribe when done
unsubscribe()

// Subscribe to wildcard (all events)
onEvent('*', async ({ event, data }) => {
  console.log(`Event fired: ${event}`, data)
})
```

### Emitting Events

```typescript
// Emit an event
await emitEvent('content.update', { id: '123', title: 'Updated Post' })

// Emit event after data modification
async function updateContent(id, updates) {
  // Update database
  await db.update('content', id, updates)

  // Emit event to trigger cache invalidation
  await emitEvent('content.update', { id })
}
```

### Automatic Invalidation Setup

The cache plugin automatically sets up invalidation listeners based on the `invalidateOn` configuration:

```typescript
// From src/plugins/cache/services/cache-invalidation.ts

// Content cache invalidation
onEvent('content.update', async (data) => {
  if (data?.id) {
    // Invalidate specific content item
    await contentCache.delete(contentCache.generateKey('item', data.id))
  }
  // Invalidate all content lists
  await contentCache.invalidate('content:list:*')
})

onEvent('content.delete', async (data) => {
  if (data?.id) {
    await contentCache.delete(contentCache.generateKey('item', data.id))
  }
  await contentCache.invalidate('content:*')
})

onEvent('content.publish', async (data) => {
  await contentCache.invalidate('content:*')
})
```

### Event Types

Common event types in SonicJS:

```typescript
// Content Events
'content.create'
'content.update'
'content.delete'
'content.publish'

// User Events
'user.create'
'user.update'
'user.delete'

// Auth Events
'auth.login'
'auth.logout'

// Config Events
'config.update'

// Plugin Events
'plugin.activate'
'plugin.deactivate'
'plugin.update'

// Media Events
'media.upload'
'media.delete'
'media.update'

// Collection Events
'collection.create'
'collection.update'
'collection.delete'
```

### Event Statistics

```typescript
import { getCacheInvalidationStats, getRecentInvalidations } from './plugins/cache'

// Get invalidation statistics
const stats = getCacheInvalidationStats()
console.log({
  totalEvents: stats.totalEvents,
  totalSubscriptions: stats.totalSubscriptions,
  eventCounts: stats.eventCounts
})

// Get recent invalidations
const recent = getRecentInvalidations(50)
recent.forEach(event => {
  console.log({
    event: event.event,
    timestamp: new Date(event.timestamp),
    data: event.data
  })
})
```

---

## Cache Warming

Cache warming preloads frequently accessed data into the cache to improve initial response times.

### Warm Common Caches

```typescript
import { warmCommonCaches } from './plugins/cache'

// Warm all common caches
const result = await warmCommonCaches(db)
console.log({
  warmed: result.warmed,      // Total entries warmed
  errors: result.errors,       // Number of errors
  details: result.details      // Per-namespace breakdown
})

// Output example:
// {
//   warmed: 153,
//   errors: 0,
//   details: [
//     { namespace: 'collection', count: 8 },
//     { namespace: 'content', count: 51 },
//     { namespace: 'media', count: 51 }
//   ]
// }
```

### Warm Specific Namespace

```typescript
import { warmNamespace } from './plugins/cache'

// Prepare entries
const entries = [
  { key: 'user:1', value: { id: 1, name: 'John' } },
  { key: 'user:2', value: { id: 2, name: 'Jane' } }
]

// Warm specific namespace
const count = await warmNamespace('user', entries)
console.log(`Warmed ${count} entries`)
```

### Preload on Startup

```typescript
import { preloadCache } from './plugins/cache'

// In your application startup
async function initializeApp() {
  // ... other initialization

  // Preload cache
  await preloadCache(db)
  console.log('Cache preloaded')
}
```

### Periodic Cache Warming

```typescript
import { schedulePeriodicWarming } from './plugins/cache'

// Schedule warming every 5 minutes (300000ms)
const timer = schedulePeriodicWarming(db, 300000)

// Cancel scheduled warming
clearInterval(timer)
```

### Custom Warming Functions

```typescript
// From src/plugins/cache/services/cache-warming.ts

async function warmRecentContent(db: D1Database, limit: number = 50): Promise<number> {
  const config = CACHE_CONFIGS.content
  if (!config) return 0
  const contentCache = getCacheService(config)
  let count = 0

  try {
    const stmt = db.prepare(`SELECT * FROM content ORDER BY created_at DESC LIMIT ${limit}`)
    const { results } = await stmt.all()

    for (const content of results as any[]) {
      const key = contentCache.generateKey('item', content.id)
      await contentCache.set(key, content)
      count++
    }

    // Cache the list
    const listKey = contentCache.generateKey('list', 'recent')
    await contentCache.set(listKey, results)
    count++

  } catch (error) {
    console.error('Error warming content cache:', error)
  }

  return count
}
```

---

## Usage Examples

### Example 1: Caching Content Items

```typescript
import { getCacheService, CACHE_CONFIGS } from './plugins/cache'

async function getContent(id: string) {
  const contentCache = getCacheService(CACHE_CONFIGS.content)
  const cacheKey = contentCache.generateKey('item', id)

  // Try to get from cache
  const cached = await contentCache.get(cacheKey)
  if (cached) {
    return cached
  }

  // Cache miss - fetch from database
  const content = await db.query('SELECT * FROM content WHERE id = ?', [id])

  // Store in cache
  await contentCache.set(cacheKey, content)

  return content
}
```

### Example 2: Using Get-or-Set Pattern

```typescript
async function getContent(id: string) {
  const contentCache = getCacheService(CACHE_CONFIGS.content)
  const cacheKey = contentCache.generateKey('item', id)

  // Automatically fetch and cache if not found
  return await contentCache.getOrSet(cacheKey, async () => {
    return await db.query('SELECT * FROM content WHERE id = ?', [id])
  })
}
```

### Example 3: Caching with Event Invalidation

```typescript
import { getCacheService, CACHE_CONFIGS, emitEvent } from './plugins/cache'

// Update content
async function updateContent(id: string, updates: any) {
  // Update database
  await db.update('content', id, updates)

  // Emit event to trigger automatic cache invalidation
  await emitEvent('content.update', { id })

  // Cache is automatically invalidated by event listeners
}

// Get content (with caching)
async function getContent(id: string) {
  const contentCache = getCacheService(CACHE_CONFIGS.content)
  const cacheKey = contentCache.generateKey('item', id)

  return await contentCache.getOrSet(cacheKey, async () => {
    return await db.query('SELECT * FROM content WHERE id = ?', [id])
  })
}
```

### Example 4: Caching API Responses

```typescript
import { getCacheService, CACHE_CONFIGS, hashQueryParams } from './plugins/cache'

async function getContentList(params: { limit: number; offset: number }) {
  const apiCache = getCacheService(CACHE_CONFIGS.api)

  // Generate cache key with hashed params
  const paramsHash = hashQueryParams(params)
  const cacheKey = apiCache.generateKey('content-list', paramsHash)

  return await apiCache.getOrSet(cacheKey, async () => {
    return await db.query(
      'SELECT * FROM content LIMIT ? OFFSET ?',
      [params.limit, params.offset]
    )
  })
}
```

### Example 5: Manual Cache Invalidation

```typescript
import { getCacheService, CACHE_CONFIGS } from './plugins/cache'

async function deleteContent(id: string) {
  // Delete from database
  await db.delete('content', id)

  const contentCache = getCacheService(CACHE_CONFIGS.content)

  // Invalidate specific item
  await contentCache.delete(contentCache.generateKey('item', id))

  // Invalidate all content lists
  await contentCache.invalidate('content:list:*')

  // Also invalidate API cache
  const apiCache = getCacheService(CACHE_CONFIGS.api)
  await apiCache.invalidate('api:*')
}
```

### Example 6: Session Caching

```typescript
import { getCacheService, CACHE_CONFIGS } from './plugins/cache'

const sessionCache = getCacheService(CACHE_CONFIGS.session)

// Store session (memory-only, not persisted to KV)
async function createSession(userId: string, sessionData: any) {
  const sessionId = generateSessionId()
  const cacheKey = sessionCache.generateKey('session', sessionId)

  await sessionCache.set(cacheKey, {
    userId,
    ...sessionData,
    createdAt: Date.now()
  })

  return sessionId
}

// Get session
async function getSession(sessionId: string) {
  const cacheKey = sessionCache.generateKey('session', sessionId)
  return await sessionCache.get(cacheKey)
}

// Invalidate session on logout
async function logout(sessionId: string) {
  const cacheKey = sessionCache.generateKey('session', sessionId)
  await sessionCache.delete(cacheKey)
}
```

---

## API Integration

### Caching API Responses

The API routes in `src/routes/api.ts` demonstrate real-world cache integration:

```typescript
import { getCacheService, CACHE_CONFIGS } from '../plugins/cache'

// GET /api/collections
apiRoutes.get('/collections', async (c) => {
  const cache = getCacheService(CACHE_CONFIGS.api)
  const cacheKey = cache.generateKey('collections', 'all')

  // Try cache with source tracking
  const cacheResult = await cache.getWithSource<any>(cacheKey)
  if (cacheResult.hit && cacheResult.data) {
    // Cache hit - add headers
    c.header('X-Cache-Status', 'HIT')
    c.header('X-Cache-Source', cacheResult.source)
    c.header('X-Cache-TTL', Math.floor(cacheResult.ttl || 0).toString())

    return c.json(cacheResult.data)
  }

  // Cache miss - fetch from database
  c.header('X-Cache-Status', 'MISS')
  c.header('X-Cache-Source', 'database')

  const stmt = c.env.DB.prepare('SELECT * FROM collections WHERE is_active = 1')
  const { results } = await stmt.all()

  const responseData = {
    data: results,
    meta: {
      count: results.length,
      timestamp: new Date().toISOString()
    }
  }

  // Cache the response
  await cache.set(cacheKey, responseData)

  return c.json(responseData)
})
```

### Adding Cache Headers

Always include cache headers in API responses:

```typescript
// On cache hit
c.header('X-Cache-Status', 'HIT')
c.header('X-Cache-Source', 'memory') // or 'kv'
c.header('X-Cache-TTL', '245') // seconds until expiration

// On cache miss
c.header('X-Cache-Status', 'MISS')
c.header('X-Cache-Source', 'database')

// Add timing information
c.header('X-Response-Time', `${Date.now() - startTime}ms`)
```

### Complete API Route Example

```typescript
apiRoutes.get('/content', async (c) => {
  const executionStart = Date.now()
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100)

  // Get cache service
  const cache = getCacheService(CACHE_CONFIGS.api)
  const cacheKey = cache.generateKey('content-list', `limit:${limit}`)

  // Check cache with source information
  const cacheResult = await cache.getWithSource<any>(cacheKey)
  if (cacheResult.hit && cacheResult.data) {
    c.header('X-Cache-Status', 'HIT')
    c.header('X-Cache-Source', cacheResult.source)
    if (cacheResult.ttl) {
      c.header('X-Cache-TTL', Math.floor(cacheResult.ttl).toString())
    }

    // Add timing to cached response
    const dataWithMeta = {
      ...cacheResult.data,
      meta: {
        ...cacheResult.data.meta,
        timing: {
          total: Date.now() - c.get('startTime'),
          execution: Date.now() - executionStart,
          unit: 'ms'
        },
        cache: {
          hit: true,
          source: cacheResult.source,
          ttl: cacheResult.ttl ? Math.floor(cacheResult.ttl) : undefined
        }
      }
    }

    return c.json(dataWithMeta)
  }

  // Cache miss - fetch from database
  c.header('X-Cache-Status', 'MISS')
  c.header('X-Cache-Source', 'database')

  const stmt = c.env.DB.prepare(`
    SELECT * FROM content
    ORDER BY created_at DESC
    LIMIT ${limit}
  `)
  const { results } = await stmt.all()

  // Transform results
  const transformedResults = results.map((row: any) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status,
    collectionId: row.collection_id,
    data: row.data ? JSON.parse(row.data) : {},
    created_at: row.created_at,
    updated_at: row.updated_at
  }))

  const responseData = {
    data: transformedResults,
    meta: {
      count: results.length,
      timestamp: new Date().toISOString(),
      timing: {
        total: Date.now() - c.get('startTime'),
        execution: Date.now() - executionStart,
        unit: 'ms'
      },
      cache: {
        hit: false,
        source: 'database'
      }
    }
  }

  // Cache the response
  await cache.set(cacheKey, responseData)

  return c.json(responseData)
})
```

---

## Performance Optimization

### Choosing the Right TTL

Consider data update frequency when setting TTL:

```typescript
// Frequently changing data (5 minutes)
const realtimeCache = {
  ttl: 300,
  namespace: 'realtime'
}

// Moderately changing data (1 hour)
const standardCache = {
  ttl: 3600,
  namespace: 'content'
}

// Rarely changing data (24 hours)
const staticCache = {
  ttl: 86400,
  namespace: 'config'
}
```

### Memory Management

The in-memory cache has a 50MB size limit with automatic LRU eviction:

```typescript
// Size estimation
const entry = { id: 1, name: 'Test', data: {...} }
const entrySize = JSON.stringify(entry).length * 2 // UTF-16 encoding

// When cache exceeds 50MB, least recently used entries are automatically evicted
```

### Minimize Cache Key Size

Shorter keys reduce memory usage:

```typescript
// Good
const key = cache.generateKey('p', '123')  // "content:p:123:v1"

// Better than
const key = cache.generateKey('post-with-long-type-name', '123')
```

### Batch Operations

Use batch operations to reduce overhead:

```typescript
// Instead of multiple individual operations
await cache.set('key1', value1)
await cache.set('key2', value2)
await cache.set('key3', value3)

// Use batch operation
await cache.setMany([
  { key: 'key1', value: value1 },
  { key: 'key2', value: value2 },
  { key: 'key3', value: value3 }
])
```

### Selective Caching

Not everything needs to be cached:

```typescript
// Cache read-heavy, rarely changing data
✓ Published content
✓ User profiles
✓ Site configuration
✓ Media metadata
✓ Collections/schemas

// Don't cache
✗ Real-time analytics
✗ One-time tokens
✗ Streaming data
✗ Large binary files
```

### Cache Warming Strategy

Warm cache during off-peak times:

```typescript
// Warm cache on deployment
if (process.env.NODE_ENV === 'production') {
  await preloadCache(db)
}

// Or schedule periodic warming
schedulePeriodicWarming(db, 300000) // Every 5 minutes
```

### Monitoring Hit Rates

Monitor and optimize based on cache statistics:

```typescript
const stats = cache.getStats()

// Target hit rates:
// - 80%+ : Excellent
// - 60-80% : Good
// - 40-60% : Fair (consider increasing TTL)
// - <40% : Poor (review caching strategy)

if (stats.hitRate < 60) {
  console.warn('Low cache hit rate, consider:')
  console.warn('- Increasing TTL')
  console.warn('- Better cache warming')
  console.warn('- Different invalidation strategy')
}
```

---

## Monitoring and Debugging

### Admin Dashboard

Access the cache dashboard at `/admin/cache`:

```
http://localhost:8787/admin/cache
```

Features:
- Real-time cache statistics
- Hit rate by namespace
- Memory usage monitoring
- Cache browser
- Manual invalidation controls
- Cache warming triggers

### Cache Statistics API

```typescript
// Get all cache statistics
GET /admin/cache/stats

// Response
{
  "success": true,
  "data": {
    "content": {
      "memoryHits": 1234,
      "memoryMisses": 567,
      "kvHits": 89,
      "kvMisses": 45,
      "totalRequests": 1935,
      "hitRate": 68.35,
      "memorySize": 2458624,
      "entryCount": 42
    },
    "user": { ... },
    "api": { ... }
  },
  "timestamp": "2025-10-06T12:00:00.000Z"
}

// Get statistics for specific namespace
GET /admin/cache/stats/content
```

### Health Check

```typescript
// Check cache system health
GET /admin/cache/health

// Response
{
  "success": true,
  "data": {
    "status": "healthy",  // or "warning" or "unhealthy"
    "namespaces": [
      {
        "namespace": "content",
        "status": "healthy",
        "hitRate": 75.5,
        "memoryUsage": "4.68%",
        "entryCount": 42
      }
    ]
  }
}
```

### Cache Browser

Browse and inspect cache entries:

```typescript
// List all cache entries
GET /admin/cache/browser?namespace=content&search=post&sort=age&limit=100

// Get specific cache entry
GET /admin/cache/browser/content/content:post:123:v1

// Response
{
  "success": true,
  "data": {
    "key": "content:post:123:v1",
    "namespace": "content",
    "parsed": {
      "namespace": "content",
      "type": "post",
      "identifier": "123",
      "version": "v1"
    },
    "data": { ... },
    "timestamp": 1234567890,
    "expiresAt": 1234571490,
    "ttl": 3600,
    "size": 4096,
    "createdAt": "2025-10-06T10:00:00.000Z",
    "expiresAt": "2025-10-06T11:00:00.000Z"
  }
}
```

### Analytics Endpoint

```typescript
// Get detailed cache analytics
GET /admin/cache/analytics

// Response
{
  "success": true,
  "data": {
    "overview": {
      "totalHits": 5234,
      "totalMisses": 1567,
      "totalRequests": 6801,
      "overallHitRate": "76.95",
      "totalSize": 12458624,
      "totalEntries": 187,
      "avgEntrySize": 66630
    },
    "performance": {
      "dbQueriesAvoided": 5234,
      "timeSavedMs": 251232,
      "timeSavedMinutes": "4.19",
      "estimatedCostSavings": "0.0026"
    },
    "namespaces": [
      {
        "namespace": "content",
        "hitRate": "82.50",
        "totalRequests": 2000,
        "memoryHitRate": "75.00",
        "kvHitRate": "7.50",
        "avgEntrySize": 58624,
        "totalSize": 2458624,
        "entryCount": 42,
        "efficiency": "0.89"
      }
    ],
    "invalidation": {
      "totalEvents": 45,
      "totalSubscriptions": 8,
      "eventCounts": {
        "content.update": 25,
        "content.delete": 10,
        "content.publish": 10
      },
      "recent": [...]
    }
  }
}
```

### Logging

Enable detailed cache logging:

```typescript
// Cache operations are logged to console
console.log('Cache hit: content:post:123:v1')
console.log('Cache miss: content:post:456:v1')
console.log('Cache invalidated: content.update', { id: '123' })

// LRU eviction logging
console.log('LRU eviction: freed 1.5MB, evicted 23 entries')

// Cache warming logging
console.log('Cache preloaded: 153 entries across 3 namespaces')
console.log('  - collection: 8 entries')
console.log('  - content: 51 entries')
console.log('  - media: 51 entries')
```

### Debugging Tools

```typescript
// Check cache contents programmatically
const keys = await cache.listKeys()
console.log('Cached keys:', keys.map(k => k.key))

// Inspect specific entry
const entry = await cache.getEntry('mykey')
console.log('Entry details:', {
  data: entry.data,
  age: Date.now() - entry.timestamp,
  ttl: entry.ttl,
  size: entry.size
})

// Monitor invalidation events
onEvent('*', ({ event, data }) => {
  console.log(`[Event] ${event}:`, data)
})
```

---

## Best Practices

### 1. Use Appropriate Namespaces

Organize cache by data type using namespaces:

```typescript
// Good
const contentCache = getCacheService(CACHE_CONFIGS.content)
const userCache = getCacheService(CACHE_CONFIGS.user)

// Bad - using single namespace for everything
const cache = getCacheService(CACHE_CONFIGS.content)
await cache.set('user:123', userData) // Wrong namespace!
```

### 2. Always Use Get-or-Set Pattern

Simplify code and ensure consistency:

```typescript
// Good
const user = await cache.getOrSet(key, () => fetchUser(id))

// Avoid manual cache checking
const cached = await cache.get(key)
if (!cached) {
  const user = await fetchUser(id)
  await cache.set(key, user)
  return user
}
return cached
```

### 3. Emit Events for Data Changes

Always emit events when modifying data:

```typescript
// Good
async function updateContent(id, updates) {
  await db.update('content', id, updates)
  await emitEvent('content.update', { id })
}

// Bad - no event emission
async function updateContent(id, updates) {
  await db.update('content', id, updates)
  // Cache will become stale!
}
```

### 4. Use Consistent Key Formats

Always use `generateKey` for consistent formatting:

```typescript
// Good
const key = cache.generateKey('post', id)

// Avoid manual key construction
const key = `content:post:${id}:v1`
```

### 5. Set Appropriate TTLs

Match TTL to data volatility:

```typescript
// Frequently updated data
{ ttl: 300 }     // 5 minutes

// Standard content
{ ttl: 3600 }    // 1 hour

// Rarely changing data
{ ttl: 86400 }   // 24 hours
```

### 6. Include Cache Headers in API Responses

Always indicate cache status:

```typescript
c.header('X-Cache-Status', cacheResult.hit ? 'HIT' : 'MISS')
c.header('X-Cache-Source', cacheResult.source)
c.header('X-Cache-TTL', ttl.toString())
```

### 7. Monitor and Optimize

Regularly review cache performance:

```typescript
// Check hit rates weekly
const stats = getAllCacheStats()
Object.entries(stats).forEach(([namespace, stat]) => {
  if (stat.hitRate < 60) {
    console.warn(`Low hit rate for ${namespace}: ${stat.hitRate}%`)
  }
})
```

### 8. Warm Critical Caches

Preload frequently accessed data:

```typescript
// On application startup
await preloadCache(db)

// Or schedule periodic warming
schedulePeriodicWarming(db, 300000)
```

### 9. Use Memory-Only for Sensitive Data

Don't persist sensitive data to KV:

```typescript
const sessionCache = {
  kvEnabled: false,      // Memory only
  memoryEnabled: true,
  namespace: 'session'
}
```

### 10. Handle Cache Failures Gracefully

Always have a fallback:

```typescript
async function getContent(id) {
  try {
    return await cache.getOrSet(key, () => fetchFromDB(id))
  } catch (error) {
    console.error('Cache error:', error)
    // Fallback to database
    return await fetchFromDB(id)
  }
}
```

---

## Advanced Features

### Custom Cache Configurations

Create custom cache configurations for specific use cases:

```typescript
const customCache = getCacheService({
  ttl: 1800,              // 30 minutes
  kvEnabled: true,
  memoryEnabled: true,
  namespace: 'analytics',
  invalidateOn: ['analytics.recalculate'],
  version: 'v2'
})
```

### Cache Versioning

Use versions to invalidate all cache entries:

```typescript
// Increment version to invalidate all cached data
const oldConfig = { ...CACHE_CONFIGS.content, version: 'v1' }
const newConfig = { ...CACHE_CONFIGS.content, version: 'v2' }

// All v1 keys will be ignored, forcing fresh data fetch
```

### Complex Invalidation Patterns

Implement sophisticated invalidation logic:

```typescript
onEvent('content.update', async (data) => {
  // Invalidate the specific item
  await contentCache.delete(
    contentCache.generateKey('item', data.id)
  )

  // Invalidate related collections
  if (data.collectionId) {
    await contentCache.invalidate(
      `content:collection:${data.collectionId}:*`
    )
  }

  // Invalidate by tags
  if (data.tags) {
    for (const tag of data.tags) {
      await contentCache.invalidate(`content:tag:${tag}:*`)
    }
  }

  // Invalidate all lists
  await contentCache.invalidate('content:list:*')

  // Invalidate API cache
  await apiCache.invalidate('api:*')
})
```

### Conditional Caching

Cache based on conditions:

```typescript
async function getContent(id: string, useCache = true) {
  if (!useCache) {
    return await fetchFromDB(id)
  }

  return await cache.getOrSet(
    cache.generateKey('item', id),
    () => fetchFromDB(id)
  )
}
```

### Cache Refresh Strategy

Implement background refresh for stale-while-revalidate:

```typescript
async function getContentWithRefresh(id: string) {
  const key = cache.generateKey('item', id)
  const entry = await cache.getEntry(key)

  if (entry) {
    // If TTL is low, refresh in background
    if (entry.ttl < 300) { // Less than 5 minutes
      // Return stale data immediately
      setTimeout(async () => {
        const fresh = await fetchFromDB(id)
        await cache.set(key, fresh)
      }, 0)
    }

    return entry.data
  }

  // Cache miss - fetch and cache
  return await cache.getOrSet(key, () => fetchFromDB(id))
}
```

### Cache Tags

Implement tag-based invalidation:

```typescript
interface CacheEntryWithTags {
  data: any
  tags: string[]
}

async function setWithTags(key: string, data: any, tags: string[]) {
  await cache.set(key, { data, tags })

  // Store tag mappings
  for (const tag of tags) {
    const tagKey = `tags:${tag}`
    const taggedKeys = (await cache.get<string[]>(tagKey)) || []
    taggedKeys.push(key)
    await cache.set(tagKey, taggedKeys)
  }
}

async function invalidateByTag(tag: string) {
  const tagKey = `tags:${tag}`
  const taggedKeys = await cache.get<string[]>(tagKey)

  if (taggedKeys) {
    await cache.deleteMany(taggedKeys)
    await cache.delete(tagKey)
  }
}
```

---

## Summary

The SonicJS caching system provides a robust, scalable solution for high-performance content delivery:

- **Three-tier architecture** ensures optimal performance
- **Automatic invalidation** keeps cache fresh
- **Event-driven design** simplifies cache management
- **Comprehensive monitoring** enables optimization
- **Flexible configuration** adapts to any use case

### Quick Start Checklist

1. Import cache service: `import { getCacheService, CACHE_CONFIGS } from './plugins/cache'`
2. Get cache instance: `const cache = getCacheService(CACHE_CONFIGS.content)`
3. Use get-or-set pattern: `await cache.getOrSet(key, fetchFunction)`
4. Emit events on changes: `await emitEvent('content.update', { id })`
5. Monitor performance: Visit `/admin/cache`

### Performance Targets

- Memory cache hits: < 2ms
- KV cache hits: < 20ms
- Overall hit rate: > 70%
- Memory usage: < 50MB

### Next Steps

- Review your application's data access patterns
- Configure appropriate TTLs for each namespace
- Set up event-driven invalidation
- Implement cache warming for critical data
- Monitor cache statistics regularly
- Optimize based on hit rates

For questions or issues, refer to the [SonicJS documentation](https://sonicjs.com) or check the [GitHub repository](https://github.com/lane711/sonicjs).

---

**Last Updated**: October 2025
**Version**: 0.1.0
**License**: MIT
