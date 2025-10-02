# SonicJS AI - Caching Implementation Plan

## Overview

This document outlines the implementation plan for a three-tiered caching system in SonicJS AI, following the SonicJS persistence architecture documented at https://sonicjs.com/persistence. The system will leverage Cloudflare KV and in-memory caching to achieve low-latency data retrieval across Cloudflare's global edge network.

## Caching Architecture

### Three-Tier Approach

```
Request → In-Memory Cache → KV Cache → D1 Database
          (Fastest)          (Fast)      (Fallback)
```

1. **Tier 1: In-Memory Cache** (Region-Specific)
   - Stored in Worker's execution context
   - Extremely fast (~1ms access time)
   - Limited to single region/data center
   - Cleared on Worker restart/redeploy
   - Ideal for: Frequently accessed data, session data, hot content

2. **Tier 2: Cloudflare KV Cache** (Global)
   - Distributed across 200+ Cloudflare nodes
   - Fast (~10-50ms access time)
   - Global replication with eventual consistency
   - Persistent across Worker restarts
   - Ideal for: Published content, user data, configuration

3. **Tier 3: D1 Database** (Source of Truth)
   - SQLite database on Cloudflare's network
   - ~50-200ms access time depending on query
   - Authoritative data source
   - Used when cache misses occur

## Implementation Components

### 1. Cache Service Layer

**File:** `src/services/cache.ts`

```typescript
interface CacheConfig {
  ttl: number              // Time-to-live in seconds
  kvEnabled: boolean       // Use KV cache tier
  memoryEnabled: boolean   // Use in-memory cache tier
  namespace: string        // Cache namespace/prefix
  invalidateOn: string[]   // Events that invalidate this cache
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  version: string
  etag?: string
}

class CacheService {
  // Core methods
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, config?: CacheConfig): Promise<void>
  delete(key: string): Promise<void>
  invalidate(pattern: string): Promise<void>

  // Multi-tier operations
  getFromMemory<T>(key: string): T | null
  setInMemory<T>(key: string, value: T, ttl: number): void
  getFromKV<T>(key: string): Promise<T | null>
  setInKV<T>(key: string, value: T, ttl: number): Promise<void>

  // Cache warming
  warmCache(keys: string[]): Promise<void>

  // Statistics
  getStats(): CacheStats
}
```

**Features:**
- Automatic tier fallthrough (memory → KV → DB)
- Configurable TTL per cache type
- Cache key versioning for safe updates
- ETags for efficient revalidation
- Pattern-based invalidation
- Cache statistics and monitoring

### 2. Cache Key Strategy

**Format:** `{namespace}:{entity}:{id}:{version}`

Examples:
```typescript
// Content items
'content:post:123:v1'
'content:page:home:v2'

// Collections/Lists
'content:posts:list:limit=10&offset=0:v1'
'content:featured:v1'

// User data
'user:profile:456:v1'
'user:permissions:456:v1'

// Configuration
'config:site:v1'
'config:plugins:active:v1'

// Media
'media:file:789:metadata:v1'
'media:thumbnails:789:v1'
```

**Key Design Principles:**
- Hierarchical structure for easy pattern matching
- Version suffix for cache busting
- Query parameters hashed for list caching
- Namespace isolation for different data types

### 3. Cache Configuration by Entity Type

```typescript
const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Content (high read, low write)
  content: {
    ttl: 3600,              // 1 hour
    kvEnabled: true,
    memoryEnabled: true,
    namespace: 'content',
    invalidateOn: ['content.update', 'content.delete', 'content.publish']
  },

  // User data (medium read, medium write)
  user: {
    ttl: 900,               // 15 minutes
    kvEnabled: true,
    memoryEnabled: true,
    namespace: 'user',
    invalidateOn: ['user.update', 'user.delete', 'auth.login']
  },

  // Configuration (high read, very low write)
  config: {
    ttl: 7200,              // 2 hours
    kvEnabled: true,
    memoryEnabled: true,
    namespace: 'config',
    invalidateOn: ['config.update', 'plugin.activate', 'plugin.deactivate']
  },

  // Media metadata (high read, low write)
  media: {
    ttl: 3600,              // 1 hour
    kvEnabled: true,
    memoryEnabled: true,
    namespace: 'media',
    invalidateOn: ['media.upload', 'media.delete', 'media.update']
  },

  // API responses (very high read, low write)
  api: {
    ttl: 300,               // 5 minutes
    kvEnabled: true,
    memoryEnabled: true,
    namespace: 'api',
    invalidateOn: ['content.update', 'content.publish']
  },

  // Session data (very high read, medium write)
  session: {
    ttl: 1800,              // 30 minutes
    kvEnabled: false,       // Only in-memory for sessions
    memoryEnabled: true,
    namespace: 'session',
    invalidateOn: ['auth.logout']
  }
}
```

### 4. Repository Pattern Integration

**File:** `src/repositories/base-repository.ts`

```typescript
abstract class CachedRepository<T> {
  constructor(
    protected db: D1Database,
    protected cache: CacheService,
    protected config: CacheConfig
  ) {}

  // Find with caching
  async findById(id: string): Promise<T | null> {
    const cacheKey = this.getCacheKey('item', id)

    // Check cache
    const cached = await this.cache.get<T>(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch from database
    const result = await this.fetchFromDb(id)
    if (result) {
      await this.cache.set(cacheKey, result, this.config)
    }

    return result
  }

  // Find with caching for lists
  async findMany(params: QueryParams): Promise<T[]> {
    const cacheKey = this.getCacheKey('list', this.hashParams(params))

    const cached = await this.cache.get<T[]>(cacheKey)
    if (cached) {
      return cached
    }

    const results = await this.fetchManyFromDb(params)
    await this.cache.set(cacheKey, results, this.config)

    return results
  }

  // Update with cache invalidation
  async update(id: string, data: Partial<T>): Promise<T> {
    const result = await this.updateInDb(id, data)

    // Invalidate related caches
    await this.invalidateCaches(id)

    return result
  }

  // Delete with cache invalidation
  async delete(id: string): Promise<void> {
    await this.deleteFromDb(id)
    await this.invalidateCaches(id)
  }

  // Cache key generation
  protected getCacheKey(type: string, identifier: string): string {
    return `${this.config.namespace}:${type}:${identifier}:${this.config.version}`
  }

  // Invalidation logic
  protected async invalidateCaches(id: string): Promise<void> {
    // Invalidate single item
    await this.cache.delete(this.getCacheKey('item', id))

    // Invalidate lists (pattern-based)
    await this.cache.invalidate(`${this.config.namespace}:list:*`)
  }

  // Abstract methods
  protected abstract fetchFromDb(id: string): Promise<T | null>
  protected abstract fetchManyFromDb(params: QueryParams): Promise<T[]>
  protected abstract updateInDb(id: string, data: Partial<T>): Promise<T>
  protected abstract deleteFromDb(id: string): Promise<void>
}
```

### 5. Cache Warming Strategy

**File:** `src/services/cache-warmer.ts`

```typescript
class CacheWarmer {
  // Warm cache on Worker startup
  async warmOnStartup(): Promise<void> {
    await Promise.all([
      this.warmSiteConfig(),
      this.warmActivePlugins(),
      this.warmFeaturedContent(),
      this.warmNavigationMenus()
    ])
  }

  // Warm cache on content publish
  async warmOnPublish(contentId: string): Promise<void> {
    // Pre-cache the published content
    // Invalidate and re-cache list views
    // Update featured content if applicable
  }

  // Scheduled cache warming
  async scheduledWarm(): Promise<void> {
    // Popular content
    // Frequently accessed lists
    // Critical configuration
  }
}
```

### 6. Cache Invalidation Events

**File:** `src/services/cache-events.ts`

```typescript
// Event-driven cache invalidation
const invalidationHandlers = {
  'content.publish': async (contentId: string) => {
    await cache.invalidate(`content:*:${contentId}:*`)
    await cache.invalidate('content:list:*')
    await cache.invalidate('api:*')
  },

  'content.update': async (contentId: string) => {
    await cache.invalidate(`content:*:${contentId}:*`)
    await cache.invalidate('content:list:*')
  },

  'user.update': async (userId: string) => {
    await cache.invalidate(`user:*:${userId}:*`)
  },

  'plugin.activate': async (pluginId: string) => {
    await cache.invalidate('config:*')
    await cache.invalidate('api:*')
  },

  'plugin.deactivate': async (pluginId: string) => {
    await cache.invalidate('config:*')
    await cache.invalidate('api:*')
  }
}
```

## Implementation Phases

### Phase 1: Core Cache Service (Week 1) ✅ **COMPLETED**

**Tasks:**
- [x] Create `CacheService` class with in-memory tier
- [x] Implement basic get/set/delete operations
- [x] Add TTL management for in-memory cache
- [x] Create cache key generation utilities
- [x] Add unit tests for cache service

**Deliverables:**
- `src/services/cache.ts` - Core cache service ✅
- `src/services/cache-config.ts` - Configuration definitions ✅
- `src/tests/services.cache.test.ts` - Test suite (40 tests passing) ✅

**Implementation Summary:**
- Created three-tiered cache architecture with in-memory as first tier
- Implemented MemoryCache class with LRU eviction (50MB limit)
- Added TTL-based expiration with automatic cleanup
- Built comprehensive CacheService with get/set/delete/clear operations
- Implemented pattern-based cache invalidation
- Added batch operations (getMany, setMany, deleteMany)
- Created getOrSet pattern for convenient cache usage
- Implemented singleton cache management with namespace isolation
- Added comprehensive statistics tracking (hits, misses, hit rate, size)
- All 40 unit tests passing successfully

### Phase 2: KV Integration (Week 1-2)

**Tasks:**
- [ ] Add KV namespace binding to `wrangler.toml`
- [ ] Implement KV tier in `CacheService`
- [ ] Add automatic tier fallthrough logic
- [ ] Implement KV serialization/deserialization
- [ ] Add KV-specific error handling
- [ ] Create KV cache statistics

**Deliverables:**
- Updated `wrangler.toml` with KV namespace
- Enhanced `CacheService` with KV support
- KV integration tests

### Phase 3: Repository Pattern (Week 2)

**Tasks:**
- [ ] Create `BaseCachedRepository` abstract class
- [ ] Implement `ContentRepository` with caching
- [ ] Implement `UserRepository` with caching
- [ ] Implement `MediaRepository` with caching
- [ ] Add query parameter hashing for list caching
- [ ] Create repository tests

**Deliverables:**
- `src/repositories/base-repository.ts`
- `src/repositories/content-repository.ts`
- `src/repositories/user-repository.ts`
- `src/repositories/media-repository.ts`
- Repository test suites

### Phase 4: Cache Invalidation (Week 2-3)

**Tasks:**
- [ ] Implement event-driven invalidation system
- [ ] Add pattern-based cache invalidation
- [ ] Create invalidation handlers for each entity type
- [ ] Add cache version bumping mechanism
- [ ] Implement bulk invalidation for lists
- [ ] Add invalidation logging

**Deliverables:**
- `src/services/cache-events.ts`
- Invalidation handlers integrated into repositories
- Invalidation tests

### Phase 5: Cache Warming (Week 3)

**Tasks:**
- [ ] Create `CacheWarmer` service
- [ ] Implement startup cache warming
- [ ] Add publish-triggered warming
- [ ] Create scheduled warming jobs
- [ ] Add warming priority queue
- [ ] Implement warming metrics

**Deliverables:**
- `src/services/cache-warmer.ts`
- Integration with Worker startup
- Warming scheduler

### Phase 6: Monitoring & Optimization (Week 3-4)

**Tasks:**
- [ ] Add cache hit/miss tracking
- [ ] Implement cache statistics endpoint
- [ ] Create cache performance dashboard
- [ ] Add cache size monitoring
- [ ] Implement cache health checks
- [ ] Optimize cache key strategies
- [ ] Add cache debugging tools

**Deliverables:**
- Cache statistics API endpoint
- Admin dashboard for cache monitoring
- Performance reports
- Optimization recommendations

## Configuration Files

### wrangler.toml Updates

```toml
# Add KV namespace for caching
[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_KV_NAMESPACE_ID"
preview_id = "YOUR_PREVIEW_KV_NAMESPACE_ID"

# Production environment
[[env.production.kv_namespaces]]
binding = "CACHE"
id = "YOUR_PRODUCTION_KV_NAMESPACE_ID"
```

### Environment Variables

```toml
[vars]
CACHE_ENABLED = "true"
CACHE_DEFAULT_TTL = "3600"
CACHE_MAX_MEMORY_SIZE = "50" # MB
CACHE_KV_ENABLED = "true"
CACHE_DEBUG = "false"
```

## API Integration Examples

### Content API with Caching

```typescript
// Before (no caching)
contentRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  const result = await c.env.DB
    .prepare('SELECT * FROM content WHERE id = ?')
    .bind(id)
    .first()
  return c.json(result)
})

// After (with caching)
contentRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  const cache = new CacheService(c.env.CACHE, CACHE_CONFIGS.content)
  const repository = new ContentRepository(c.env.DB, cache)

  const result = await repository.findById(id)
  return c.json(result)
})
```

### List API with Caching

```typescript
contentRoutes.get('/', async (c) => {
  const params = {
    limit: parseInt(c.req.query('limit') || '20'),
    offset: parseInt(c.req.query('offset') || '0'),
    sortBy: c.req.query('sortBy') || 'created_at',
    sortDirection: c.req.query('sortDirection') || 'desc'
  }

  const cache = new CacheService(c.env.CACHE, CACHE_CONFIGS.api)
  const repository = new ContentRepository(c.env.DB, cache)

  const results = await repository.findMany(params)
  return c.json(results)
})
```

## Cache Performance Targets

### Target Metrics

- **In-Memory Cache Hit Rate:** 60-80%
- **KV Cache Hit Rate:** 80-95%
- **Combined Cache Hit Rate:** 95%+
- **In-Memory Response Time:** < 5ms
- **KV Response Time:** < 50ms
- **Database Response Time:** < 200ms

### Cache Size Limits

- **In-Memory Cache:** 50MB max per Worker instance
- **KV Cache:** 25MB per key, unlimited keys
- **Cache Entry Count:** 10,000 max in memory

## Best Practices

### 1. Cache Key Design
- Use consistent namespace prefixes
- Include version in keys for safe updates
- Hash complex query parameters
- Keep keys under 512 bytes

### 2. TTL Strategy
- High-read, low-write data: Longer TTL (1-2 hours)
- Medium activity: Moderate TTL (15-30 minutes)
- High-write data: Short TTL (5-10 minutes)
- Session data: Match session lifetime

### 3. Invalidation
- Invalidate on write operations
- Use pattern-based invalidation for related data
- Prefer explicit invalidation over short TTLs
- Log invalidation events for debugging

### 4. Cache Warming
- Warm critical data on startup
- Pre-cache after publish events
- Schedule warming during low-traffic periods
- Prioritize frequently accessed data

### 5. Monitoring
- Track hit/miss ratios
- Monitor cache size growth
- Alert on cache errors
- Review cache effectiveness regularly

## Testing Strategy

### Unit Tests
- Cache service get/set/delete operations
- TTL expiration logic
- Key generation and hashing
- Serialization/deserialization

### Integration Tests
- Multi-tier fallthrough behavior
- Repository caching integration
- Cache invalidation propagation
- KV namespace operations

### Performance Tests
- Cache hit rate measurements
- Response time comparisons (cached vs uncached)
- Memory usage under load
- KV operation latency

### End-to-End Tests
- Full request lifecycle with caching
- Cache warming effectiveness
- Invalidation event handling
- Cache recovery after failures

## Migration Strategy

### Gradual Rollout

1. **Week 1-2:** Core cache service and KV integration
2. **Week 2-3:** Content API caching (read-only first)
3. **Week 3-4:** User and media API caching
4. **Week 4:** Full invalidation and warming system
5. **Week 5:** Monitoring and optimization

### Rollback Plan

- Feature flags for cache enabling/disabling
- Fallback to direct database queries on cache errors
- KV namespace versioning for safe updates
- Gradual percentage-based rollout (10% → 50% → 100%)

## Success Criteria

- [ ] 95%+ cache hit rate achieved
- [ ] API response times reduced by 80%+
- [ ] Database query load reduced by 90%+
- [ ] Zero cache-related data inconsistencies
- [ ] Cache monitoring dashboard operational
- [ ] All tests passing with >90% coverage

## Resources

- [Cloudflare KV Documentation](https://developers.cloudflare.com/kv/)
- [SonicJS Persistence Architecture](https://sonicjs.com/persistence)
- [Cloudflare Workers Best Practices](https://developers.cloudflare.com/workers/platform/limits/)
- [Cache-Control Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)

## Questions to Address

1. **KV Namespace Setup:** Do we need separate KV namespaces for different environments (dev/preview/prod)?
   - **Answer:** Yes, follow same pattern as D1 databases

2. **Cache Key Versioning:** How do we handle cache version updates during deployments?
   - **Answer:** Use environment variable for global cache version, bump on breaking changes

3. **Memory Limits:** What's the optimal in-memory cache size for our Worker instances?
   - **Answer:** Start with 50MB, monitor and adjust based on actual usage

4. **Invalidation Latency:** How do we handle KV's eventual consistency for invalidation?
   - **Answer:** Immediate in-memory invalidation, accept eventual KV consistency (typically < 60s)

5. **Cache Debugging:** What tools do we need for debugging cache issues in production?
   - **Answer:** Cache statistics endpoint, cache key inspection API, hit/miss logging

## Next Steps

1. Review and approve this plan
2. Create KV namespace in Cloudflare dashboard
3. Begin Phase 1 implementation
4. Set up monitoring infrastructure
5. Create performance baseline measurements
