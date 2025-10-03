# Cache Plugin

Three-tiered caching system for SonicJS that provides automatic caching for content, users, media, and API responses.

## Features

- **Three-tier caching architecture**
  - Tier 1: In-Memory (fastest, region-specific, ~1-2ms)
  - Tier 2: Cloudflare KV (fast, global, ~5-10ms)
  - Tier 3: Database (source of truth, ~50-100ms)

- **Cache source tracking** ⭐ NEW
  - HTTP headers: `X-Cache-Status`, `X-Cache-Source`, `X-Cache-TTL`
  - Response metadata with cache info
  - Identify if data came from memory, KV, or database
  - See [CACHE_SOURCE_TRACKING.md](./CACHE_SOURCE_TRACKING.md) for details

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

### Setting Up Cloudflare KV (Optional)

To enable Tier 2 (KV) caching, you need to create a KV namespace:

```bash
# Create KV namespace for development
wrangler kv:namespace create "CACHE_KV"

# Create KV namespace for production
wrangler kv:namespace create "CACHE_KV" --env production
```

Then update your `wrangler.toml` with the namespace IDs:

```toml
[[kv_namespaces]]
binding = "CACHE_KV"
id = "your-namespace-id-from-above"
preview_id = "your-preview-namespace-id"
```

Finally, enable KV caching in the plugin settings:

```json
{
  "kvEnabled": true
}
```

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
  - Requires KV namespace binding in `wrangler.toml`
  - Provides global, persistent caching across all edge locations
  - Recommended for production environments
- **defaultTTL** (number): Default time-to-live in seconds (default: `3600`)
- **maxMemorySize** (number): Maximum memory cache size in MB (default: `50`)

## Usage

### Integrated Caching

The cache plugin is already integrated into core routes:

**Content Routes** (`src/routes/admin-content.ts`):
- Collection and field lookups cached (2 hour TTL)
- Individual content items cached (1 hour TTL)
- Automatic invalidation on content create/update/delete
- Pattern-based invalidation for content lists

**Authentication** (`src/routes/auth.ts`):
- User lookups by email cached (15 minute TTL)
- User lookups by ID cached (15 minute TTL)
- Automatic invalidation on login

**Performance Impact**:
- Collection/field queries: **50-100x faster** (from ~50ms to <2ms)
- Content lookups: **50-100x faster** (from ~50ms to <2ms)
- User authentication: **50x faster** on cache hit (from ~50ms to ~2ms)

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

## Event-Based Cache Invalidation

The cache plugin includes an event bus system for automatic cache invalidation:

```typescript
import { emitEvent } from '@/plugins/cache'

// Emit an event to trigger cache invalidation
await emitEvent('content.update', { id: contentId })

// Events automatically invalidate related caches based on configuration
```

### Supported Events

- `content.create`, `content.update`, `content.delete`, `content.publish`
- `user.update`, `user.delete`, `auth.login`, `auth.logout`
- `media.upload`, `media.delete`, `media.update`
- `config.update`, `plugin.activate`, `plugin.deactivate`, `plugin.update`
- `collection.create`, `collection.update`, `collection.delete`

## Cache Browser

Browse and inspect all cached entries via REST API:

```bash
# List all cache entries
GET /admin/cache/browser?namespace=content&search=post&sort=size&limit=50

# Get specific cache entry
GET /admin/cache/browser/content/content:item:abc123:v1
```

## Advanced Analytics

Get detailed cache analytics and performance metrics:

```bash
# Get comprehensive analytics
GET /admin/cache/analytics

# Response includes:
# - Overall hit/miss rates
# - DB queries avoided
# - Time saved (ms and minutes)
# - Estimated cost savings
# - Per-namespace analytics
# - Invalidation statistics
```

### Analytics Metrics

- **Hit Rate**: Percentage of requests served from cache
- **DB Queries Avoided**: Number of database queries saved
- **Time Saved**: Estimated time saved (assumes 48ms per cache hit)
- **Cost Savings**: Estimated cost savings (assumes $0.50 per million queries)
- **Efficiency Score**: Cache effectiveness ratio

## Cache Warming

Preload cache with common queries:

```bash
# Warm all common caches
POST /admin/cache/warm

# Warm specific namespace with custom data
POST /admin/cache/warm/content
{
  "entries": [
    { "key": "content:item:123:v1", "value": {...} }
  ]
}
```

### Programmatic Warming

```typescript
import { warmCommonCaches, preloadCache } from '@/plugins/cache'

// Warm common caches
const result = await warmCommonCaches(db)
console.log(`Warmed ${result.warmed} entries`)

// Preload on startup (with logging)
await preloadCache(db)
```

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

### Memory Cache (Tier 1)
- **Response time**: 1-2ms
- **Content queries**: 50-100x faster than database
- **Best for**: Frequently accessed data in the same region
- **Limitations**: Region-specific, not persistent across deployments

### KV Cache (Tier 2)
- **Response time**: 5-10ms
- **Global reach**: Cached at edge locations worldwide
- **Persistent**: Survives deployments and restarts
- **Best for**: Global content distribution
- **Limitations**: Slightly slower than memory, costs per operation

### Combined (Memory + KV)
- **First request**: Checks memory → KV → database
- **Subsequent requests**: Served from memory (fastest)
- **Cross-region**: Other regions benefit from KV cache
- **Optimal setup**: Both tiers enabled for best performance

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

## Development Roadmap

### ✅ Phase 1: In-Memory Cache (Completed)
- [x] Memory cache with LRU eviction
- [x] TTL-based expiration
- [x] Pattern-based invalidation
- [x] Cache statistics tracking
- [x] Namespace isolation
- [x] Version-based cache busting
- [x] Batch operations (getMany, setMany, deleteMany)
- [x] getOrSet pattern
- [x] Comprehensive test suite (40 tests)

### ✅ Phase 2: Cloudflare KV Cache (Completed)
- [x] KV namespace integration
- [x] Two-tier caching (Memory → KV)
- [x] Automatic memory population on KV hits
- [x] KV pattern invalidation
- [x] Global KV namespace configuration
- [x] Updated documentation with KV setup
- [x] Performance comparisons
- [x] Wrangler.toml bindings for all environments

### ✅ Phase 3: Integration & Features (Completed)
- [x] Integrate cache into content routes
  - [x] Cache collection and field lookups
  - [x] Cache individual content items
  - [x] Invalidate on create/update/delete
  - [x] Pattern-based list invalidation
- [x] Integrate cache into user authentication
  - [x] Cache user lookups by email and ID
  - [x] Invalidate on login
- [x] Admin UI for cache management
  - [x] **Statistics Dashboard** (at `/admin/cache`)
    - [x] Real-time hit/miss rates by namespace
    - [x] Overall cache hit rate display
    - [x] Memory usage visualization
    - [x] Per-namespace statistics table
    - [x] Health status indicator
  - [x] **Cache Management Controls**
    - [x] Clear all caches button
    - [x] Clear by namespace
    - [x] Refresh statistics button
    - [x] Color-coded hit rate indicators
- [x] Integrate cache into media queries
  - [x] Cache media list queries
  - [x] Invalidate on upload/delete/update
- [x] Integrate cache into API endpoints
  - [x] Cache collections endpoint
  - [x] Cache content lists
  - [x] Cache collection-specific content
- [x] Event-based cache invalidation
  - [x] Event bus system
  - [x] Automatic invalidation listeners
  - [x] Event logging and statistics
- [x] **Cache Browser**
  - [x] View all cached items by namespace
  - [x] Search/filter cache keys
  - [x] Inspect individual cache entries (key, value, TTL, size)
  - [x] Sort by size, age, key
  - [x] REST API endpoints
- [x] **Advanced Analytics**
  - [x] Cache efficiency score
  - [x] Cost savings calculator (DB queries avoided)
  - [x] Time saved metrics
  - [x] Per-namespace analytics
  - [x] Memory and KV hit rate breakdown
  - [x] Average entry size calculation
  - [x] Invalidation event tracking
  - [x] Recent invalidations log
- [x] Cache warming utilities
  - [x] Warm common caches (collections, content, media)
  - [x] Warm specific namespace
  - [x] REST API endpoints for warming
- [x] Cache preloading on startup
  - [x] Preload function
  - [x] Automatic warming on activation
  - [x] Exported utilities for custom preloading

### 📋 Phase 4: Advanced Features (Planned)
- [ ] **Advanced Analytics**
  - [ ] Cache performance heatmaps (geographic distribution)
  - [ ] Time-series analysis of cache patterns
  - [ ] Predictive cache warming based on usage patterns
  - [ ] Cache ROI calculator (cost savings vs storage costs)
  - [ ] Anomaly detection for cache misses
  - [ ] User journey cache analysis
- [ ] **Performance Optimization**
  - [ ] Cache compression for large values
  - [ ] Smart cache prefetching
  - [ ] Automatic cache optimization
  - [ ] Cache sharding recommendations
  - [ ] Memory allocation optimizer
- [ ] **Advanced Features**
  - [ ] A/B testing support with cache isolation
  - [ ] Cache dependency tracking
  - [ ] Distributed cache invalidation
  - [ ] Cache versioning strategy
  - [ ] Cache hit/miss alerts and notifications
  - [ ] Webhook integration for cache events

### 🔮 Future Considerations
- [ ] Redis cache tier (optional Tier 2.5)
- [ ] GraphQL query caching
- [ ] Edge-side includes (ESI) support
- [ ] Stale-while-revalidate pattern
- [ ] Background cache refresh
- [ ] Cache sharding strategies
- [ ] Multi-region cache coordination

## License

MIT
