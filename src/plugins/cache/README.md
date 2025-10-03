# Cache Plugin

Three-tiered caching system for SonicJS that provides automatic caching for content, users, media, and API responses.

## Features

- **Three-tier caching architecture**
  - Tier 1: In-Memory (fastest, region-specific)
  - Tier 2: Cloudflare KV (fast, global) - *Phase 2*
  - Tier 3: Database (source of truth)

- **Automatic cache management**
  - TTL-based expiration
  - LRU eviction when memory limit reached
  - Pattern-based invalidation
  - Version-based cache busting

- **Comprehensive statistics**
  - Hit/miss tracking
  - Hit rate calculation
  - Memory usage monitoring
  - Per-namespace metrics

## Installation

The cache plugin is included by default but can be disabled if caching is not needed.

## Configuration

Configure the cache plugin through the admin interface at `/admin/plugins/cache` or via settings:

```json
{
  "memoryEnabled": true,
  "kvEnabled": false,
  "defaultTTL": 3600,
  "maxMemorySize": 50
}
```

### Settings

- **memoryEnabled** (boolean): Enable in-memory caching (default: `true`)
- **kvEnabled** (boolean): Enable Cloudflare KV caching (default: `false`)
- **defaultTTL** (number): Default time-to-live in seconds (default: `3600`)
- **maxMemorySize** (number): Maximum memory cache size in MB (default: `50`)

## Usage

### Using Cache in Your Code

When the cache plugin is active, you can use it in your routes and services:

```typescript
import { getCacheService, CACHE_CONFIGS } from '@/plugins/cache'

// Get cache service for content
const contentCache = getCacheService(CACHE_CONFIGS.content)

// Get or set pattern (fetch on cache miss)
const post = await contentCache.getOrSet(
  contentCache.generateKey('post', postId),
  async () => {
    // Fetch from database if not in cache
    return await db.getPost(postId)
  }
)

// Manual cache operations
await contentCache.set('my-key', data)
const cached = await contentCache.get('my-key')
await contentCache.delete('my-key')

// Invalidate patterns
await contentCache.invalidate('content:post:*')
```

### Available Cache Namespaces

- **content**: Content items (TTL: 1 hour)
- **user**: User data (TTL: 15 minutes)
- **config**: Configuration settings (TTL: 2 hours)
- **media**: Media metadata (TTL: 1 hour)
- **api**: API responses (TTL: 5 minutes)
- **session**: Session data (TTL: 30 minutes, memory-only)
- **plugin**: Plugin data (TTL: 1 hour)
- **collection**: Collections/schema (TTL: 2 hours)

## API Endpoints

### GET /admin/cache/stats

Get cache statistics for all namespaces.

**Response:**
```json
{
  "success": true,
  "data": {
    "content": {
      "memoryHits": 150,
      "memoryMisses": 10,
      "kvHits": 0,
      "kvMisses": 0,
      "totalRequests": 160,
      "hitRate": 93.75,
      "memorySize": 1048576,
      "entryCount": 45
    }
  },
  "timestamp": "2025-01-02T12:00:00.000Z"
}
```

### POST /admin/cache/clear

Clear all cache entries across all namespaces.

**Response:**
```json
{
  "success": true,
  "message": "All cache entries cleared",
  "timestamp": "2025-01-02T12:00:00.000Z"
}
```

### POST /admin/cache/invalidate

Invalidate cache entries matching a pattern.

**Request:**
```json
{
  "pattern": "content:post:*",
  "namespace": "content"
}
```

**Response:**
```json
{
  "success": true,
  "invalidated": 23,
  "pattern": "content:post:*",
  "namespace": "content",
  "timestamp": "2025-01-02T12:00:00.000Z"
}
```

## Cache Invalidation Patterns

The cache system automatically invalidates entries based on events:

- **content**: Invalidates on `content.update`, `content.delete`, `content.publish`
- **user**: Invalidates on `user.update`, `user.delete`, `auth.login`
- **config**: Invalidates on `config.update`, `plugin.activate`, `plugin.deactivate`
- **media**: Invalidates on `media.upload`, `media.delete`, `media.update`

## Performance Benefits

Enabling caching can significantly improve performance:

- **Content queries**: 50-100x faster (1-2ms vs 50-100ms)
- **User authentication**: 10-20x faster
- **API responses**: Reduced database load
- **Media metadata**: Faster gallery rendering

## When to Disable

You may want to disable the cache plugin if:

- Running in development and need to see live database changes
- Debugging cache-related issues
- Memory constraints on your deployment
- Your application has mostly write-heavy workloads

## Development

### Running Tests

```bash
npm run test -- src/plugins/cache/tests
```

### Adding Custom Cache Configs

```typescript
import { getCacheService } from '@/plugins/cache'

const myCache = getCacheService({
  ttl: 1800,              // 30 minutes
  kvEnabled: true,
  memoryEnabled: true,
  namespace: 'my-custom-cache',
  invalidateOn: ['my.event'],
  version: 'v1'
})
```

## License

MIT
