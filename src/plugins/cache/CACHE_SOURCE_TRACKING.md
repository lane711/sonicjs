# Cache Source Tracking

## Overview

The cache plugin now includes **cache source tracking** to help you identify where your data comes from:
- **memory** - In-memory cache (fastest, ~1-2ms)
- **kv** - Cloudflare KV cache (fast, ~5-10ms, global)
- **database** - Direct database query (source of truth, ~50-100ms)
- **miss** - Cache miss, no data found

## How It Works

### Response Headers

Every cached API response includes these headers:

```http
X-Cache-Status: HIT | MISS
X-Cache-Source: memory | kv | database
X-Cache-TTL: 3540  (seconds remaining)
```

### Response Metadata

Cache information is also included in the response `meta` object:

```json
{
  "data": [...],
  "meta": {
    "count": 10,
    "timestamp": "2025-10-03T12:00:00.000Z",
    "cache": {
      "hit": true,
      "source": "memory",
      "ttl": 3540
    }
  }
}
```

## Example Responses

### Cache HIT from Memory

**Headers:**
```
X-Cache-Status: HIT
X-Cache-Source: memory
X-Cache-TTL: 3540
```

**Body:**
```json
{
  "data": [
    { "id": "1", "name": "Collection 1" }
  ],
  "meta": {
    "count": 1,
    "timestamp": "2025-10-03T12:00:00.000Z",
    "cache": {
      "hit": true,
      "source": "memory",
      "ttl": 3540
    }
  }
}
```

### Cache HIT from KV

**Headers:**
```
X-Cache-Status: HIT
X-Cache-Source: kv
X-Cache-TTL: 3200
```

**Body:**
```json
{
  "data": [...],
  "meta": {
    "cache": {
      "hit": true,
      "source": "kv",
      "ttl": 3200
    }
  }
}
```

### Cache MISS (Database)

**Headers:**
```
X-Cache-Status: MISS
X-Cache-Source: database
```

**Body:**
```json
{
  "data": [...],
  "meta": {
    "cache": {
      "hit": false,
      "source": "database"
    }
  }
}
```

## Using Cache Source in Your Code

### Get Data with Source Information

```typescript
import { getCacheService, CACHE_CONFIGS } from '@/plugins/cache'

const cache = getCacheService(CACHE_CONFIGS.content)

// Use getWithSource() instead of get()
const result = await cache.getWithSource('my-key')

console.log({
  data: result.data,        // The cached data (or null)
  hit: result.hit,          // true if cache hit, false if miss
  source: result.source,    // 'memory', 'kv', or 'miss'
  ttl: result.ttl,          // Time to live in seconds (if available)
  timestamp: result.timestamp // When cached (if available)
})
```

### Add Cache Headers to Your API Response

```typescript
import { getCacheService, CACHE_CONFIGS } from '@/plugins/cache'

app.get('/my-endpoint', async (c) => {
  const cache = getCacheService(CACHE_CONFIGS.api)
  const cacheKey = cache.generateKey('mydata', 'all')

  const cacheResult = await cache.getWithSource(cacheKey)

  if (cacheResult.hit && cacheResult.data) {
    // Add cache headers
    c.header('X-Cache-Status', 'HIT')
    c.header('X-Cache-Source', cacheResult.source)
    if (cacheResult.ttl) {
      c.header('X-Cache-TTL', Math.floor(cacheResult.ttl).toString())
    }

    // Add to response metadata
    return c.json({
      data: cacheResult.data,
      meta: {
        cache: {
          hit: true,
          source: cacheResult.source,
          ttl: cacheResult.ttl ? Math.floor(cacheResult.ttl) : undefined
        }
      }
    })
  }

  // Cache miss - fetch from database
  c.header('X-Cache-Status', 'MISS')
  c.header('X-Cache-Source', 'database')

  const data = await fetchFromDatabase()

  // Cache for next time
  await cache.set(cacheKey, data)

  return c.json({
    data,
    meta: {
      cache: {
        hit: false,
        source: 'database'
      }
    }
  })
})
```

## Performance Implications

### Cache Source Performance

| Source   | Latency | Global | Persistent | Best For |
|----------|---------|--------|------------|----------|
| memory   | 1-2ms   | No     | No         | Hot data in same region |
| kv       | 5-10ms  | Yes    | Yes        | Global reads, persistence |
| database | 50-100ms| Yes    | Yes        | Source of truth |

### Understanding the Flow

**First Request (Cold Cache):**
```
Client → API → Database (50ms)
Headers: X-Cache-Status: MISS, X-Cache-Source: database
```

**Second Request (Same Region):**
```
Client → API → Memory (1ms) ✨ 50x faster!
Headers: X-Cache-Status: HIT, X-Cache-Source: memory
```

**Second Request (Different Region, KV Enabled):**
```
Client → API → KV (5ms) ✨ 10x faster!
Headers: X-Cache-Status: HIT, X-Cache-Source: kv
```

## Debugging with Cache Headers

### Check Cache Headers with cURL

```bash
# View response headers
curl -I https://your-api.com/api/collections

# Response:
# X-Cache-Status: HIT
# X-Cache-Source: memory
# X-Cache-TTL: 3540
```

### Monitoring Cache Performance

Use the headers to track cache effectiveness:

```javascript
fetch('/api/collections')
  .then(res => {
    const cacheStatus = res.headers.get('X-Cache-Status')
    const cacheSource = res.headers.get('X-Cache-Source')
    const cacheTTL = res.headers.get('X-Cache-TTL')

    console.log(`Cache ${cacheStatus} from ${cacheSource}, TTL: ${cacheTTL}s`)
  })
```

### Frontend Cache Indicators

Show cache status in your UI:

```typescript
const response = await fetch('/api/content')
const data = await response.json()

// From headers
const cacheStatus = response.headers.get('X-Cache-Status')
const cacheSource = response.headers.get('X-Cache-Source')

// Or from metadata
const { cache } = data.meta

if (cache.hit) {
  console.log(`⚡ Served from ${cache.source} cache (${cache.ttl}s remaining)`)
} else {
  console.log('📀 Fresh from database')
}
```

## API Endpoints with Cache Tracking

These endpoints include cache headers and metadata:

- ✅ `GET /api/collections` - All collections
- ✅ `GET /api/content` - All content
- ✅ `GET /api/collections/:collection/content` - Collection-specific content

All responses include:
- `X-Cache-Status` header
- `X-Cache-Source` header
- `X-Cache-TTL` header (when hit)
- `meta.cache` object in response body

## Testing Cache Sources

```typescript
import { getCacheService, CACHE_CONFIGS } from '@/plugins/cache'

// Test cache source tracking
const cache = getCacheService(CACHE_CONFIGS.content)

// First call - should miss
const miss = await cache.getWithSource('test-key')
console.assert(miss.hit === false)
console.assert(miss.source === 'miss')

// Set data
await cache.set('test-key', { data: 'test' })

// Second call - should hit memory
const hit = await cache.getWithSource('test-key')
console.assert(hit.hit === true)
console.assert(hit.source === 'memory')
console.assert(hit.ttl > 0)
```

## Benefits

### 1. **Observability**
- Know exactly where your data comes from
- Track cache hit rates per endpoint
- Identify slow queries that need caching

### 2. **Debugging**
- Verify cache is working as expected
- Troubleshoot cache misses
- Monitor TTL expiration

### 3. **Performance Monitoring**
- Measure cache effectiveness
- Calculate actual performance gains
- Optimize cache strategy based on real data

### 4. **Transparency**
- API consumers can see cache status
- Developers understand data freshness
- DevOps can monitor cache health

## Future Enhancements

Potential additions to cache source tracking:

- **Cache age**: How old is the cached data?
- **Cache key**: What cache key was used?
- **Cache namespace**: Which cache namespace?
- **Hit count**: How many times has this been served from cache?
- **Last modified**: When was the data last updated in the database?
- **ETag support**: HTTP ETag headers for conditional requests
- **Cache-Control headers**: Standard HTTP cache control

## Summary

Cache source tracking gives you complete visibility into your caching layer:

✅ **Response Headers** - Standard HTTP headers for cache status
✅ **Response Metadata** - JSON metadata in response body
✅ **Programmatic Access** - `getWithSource()` method
✅ **All API Endpoints** - Automatic tracking on cached endpoints
✅ **Performance Insights** - Understand cache effectiveness
✅ **Debugging Tools** - Identify and fix cache issues

Now you always know if your data came from memory, KV, or the database!
