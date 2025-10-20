import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { schemaDefinitions } from '../schemas'
import { getCacheService, CACHE_CONFIGS } from '../services'
import { QueryFilterBuilder, QueryFilter } from '../utils'
import { isPluginActive } from '../middleware'
import apiContentCrudRoutes from './api-content-crud'
import type { Bindings, Variables as AppVariables } from '../app'

// Extend Variables with API-specific fields
interface Variables extends AppVariables {
  startTime: number
  cacheEnabled?: boolean
}

const apiRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Add timing middleware
apiRoutes.use('*', async (c, next) => {
  const startTime = Date.now()
  c.set('startTime', startTime)
  await next()
  const totalTime = Date.now() - startTime
  c.header('X-Response-Time', `${totalTime}ms`)
})

// Check if cache plugin is active
apiRoutes.use('*', async (c, next) => {
  const cacheEnabled = await isPluginActive(c.env.DB, 'core-cache')
  c.set('cacheEnabled', cacheEnabled)
  await next()
})

// Add CORS middleware
apiRoutes.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// Helper function to add timing metadata
function addTimingMeta(c: any, meta: any = {}, executionStartTime?: number) {
  const totalTime = Date.now() - c.get('startTime')
  const executionTime = executionStartTime ? Date.now() - executionStartTime : undefined

  return {
    ...meta,
    timing: {
      total: totalTime,
      execution: executionTime,
      unit: 'ms'
    }
  }
}

// Root endpoint - API info
apiRoutes.get('/', (c) => {
  return c.json({
    name: 'SonicJS API',
    version: '2.0.0',
    description: 'RESTful API for SonicJS headless CMS',
    endpoints: {
      health: '/api/health',
      collections: '/api/collections',
      content: '/api/content',
      contentById: '/api/content/:id',
      collectionContent: '/api/collections/:collection/content'
    },
    documentation: '/docs'
  })
})

// Health check endpoint
apiRoutes.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    schemas: schemaDefinitions.map(s => s.name)
  })
})

// Basic collections endpoint
apiRoutes.get('/collections', async (c) => {
  const executionStart = Date.now()

  try {
    const db = c.env.DB
    const cacheEnabled = c.get('cacheEnabled')
    const cache = getCacheService(CACHE_CONFIGS.api!)
    const cacheKey = cache.generateKey('collections', 'all')

    // Use cache only if cache plugin is active
    if (cacheEnabled) {
      const cacheResult = await cache.getWithSource<any>(cacheKey)
      if (cacheResult.hit && cacheResult.data) {
        // Add cache headers
        c.header('X-Cache-Status', 'HIT')
        c.header('X-Cache-Source', cacheResult.source)
        if (cacheResult.ttl) {
          c.header('X-Cache-TTL', Math.floor(cacheResult.ttl).toString())
        }

        // Add cache info and timing to meta
        const dataWithMeta = {
          ...cacheResult.data,
          meta: addTimingMeta(c, {
            ...cacheResult.data.meta,
            cache: {
              hit: true,
              source: cacheResult.source,
              ttl: cacheResult.ttl ? Math.floor(cacheResult.ttl) : undefined
            }
          }, executionStart)
        }

        return c.json(dataWithMeta)
      }
    }

    // Cache miss - fetch from database
    c.header('X-Cache-Status', 'MISS')
    c.header('X-Cache-Source', 'database')

    const stmt = db.prepare('SELECT * FROM collections WHERE is_active = 1')
    const { results } = await stmt.all()

    // Parse schema and format results
    const transformedResults = results.map((row: any) => ({
      ...row,
      schema: row.schema ? JSON.parse(row.schema) : {},
      is_active: row.is_active // Keep as number (1 or 0)
    }))

    const responseData = {
      data: transformedResults,
      meta: addTimingMeta(c, {
        count: results.length,
        timestamp: new Date().toISOString(),
        cache: {
          hit: false,
          source: 'database'
        }
      }, executionStart)
    }

    // Cache the response only if cache plugin is enabled
    if (cacheEnabled) {
      await cache.set(cacheKey, responseData)
    }

    return c.json(responseData)
  } catch (error) {
    console.error('Error fetching collections:', error)
    return c.json({ error: 'Failed to fetch collections' }, 500)
  }
})

// Basic content endpoint with advanced filtering
apiRoutes.get('/content', async (c) => {
  const executionStart = Date.now()

  try {
    const db = c.env.DB
    const queryParams = c.req.query()

    // Handle collection parameter - convert collection name to collection_id
    if (queryParams.collection) {
      const collectionName = queryParams.collection
      const collectionStmt = db.prepare('SELECT id FROM collections WHERE name = ? AND is_active = 1')
      const collectionResult = await collectionStmt.bind(collectionName).first()

      if (collectionResult) {
        // Replace 'collection' param with 'collection_id' for the filter builder
        queryParams.collection_id = (collectionResult as any).id
        delete queryParams.collection
      } else {
        // Collection not found - return empty result
        return c.json({
          data: [],
          meta: addTimingMeta(c, {
            count: 0,
            timestamp: new Date().toISOString(),
            message: `Collection '${collectionName}' not found`
          }, executionStart)
        })
      }
    }

    // Parse filter from query parameters
    const filter: QueryFilter = QueryFilterBuilder.parseFromQuery(queryParams)

    // Set default limit if not provided
    if (!filter.limit) {
      filter.limit = 50
    }
    filter.limit = Math.min(filter.limit, 1000) // Max 1000

    // Build SQL query from filter
    const builder = new QueryFilterBuilder()
    const queryResult = builder.build('content', filter)

    // Check for query building errors
    if (queryResult.errors.length > 0) {
      return c.json({
        error: 'Invalid filter parameters',
        details: queryResult.errors
      }, 400)
    }

    // Only use cache if cache plugin is active
    const cacheEnabled = c.get('cacheEnabled')
    const cache = getCacheService(CACHE_CONFIGS.api!)
    const cacheKey = cache.generateKey('content-filtered', JSON.stringify({ filter, query: queryResult.sql }))

    if (cacheEnabled) {
      const cacheResult = await cache.getWithSource<any>(cacheKey)
      if (cacheResult.hit && cacheResult.data) {
        // Add cache headers
        c.header('X-Cache-Status', 'HIT')
        c.header('X-Cache-Source', cacheResult.source)
        if (cacheResult.ttl) {
          c.header('X-Cache-TTL', Math.floor(cacheResult.ttl).toString())
        }

        // Add cache info and timing to meta
        const dataWithMeta = {
          ...cacheResult.data,
          meta: addTimingMeta(c, {
            ...cacheResult.data.meta,
            cache: {
              hit: true,
              source: cacheResult.source,
              ttl: cacheResult.ttl ? Math.floor(cacheResult.ttl) : undefined
            }
          }, executionStart)
        }

        return c.json(dataWithMeta)
      }
    }

    // Cache miss - fetch from database
    c.header('X-Cache-Status', 'MISS')
    c.header('X-Cache-Source', 'database')

    // Execute query with parameters
    const stmt = db.prepare(queryResult.sql)
    const boundStmt = queryResult.params.length > 0
      ? stmt.bind(...queryResult.params)
      : stmt

    const { results } = await boundStmt.all()

    // Transform results to match API spec (camelCase)
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
      meta: addTimingMeta(c, {
        count: results.length,
        timestamp: new Date().toISOString(),
        filter: filter,
        query: {
          sql: queryResult.sql,
          params: queryResult.params
        },
        cache: {
          hit: false,
          source: 'database'
        }
      }, executionStart)
    }

    // Cache the response only if cache is enabled
    if (cacheEnabled) {
      await cache.set(cacheKey, responseData)
    }

    return c.json(responseData)
  } catch (error) {
    console.error('Error fetching content:', error)
    return c.json({
      error: 'Failed to fetch content',
      details: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// Collection-specific routes with advanced filtering
apiRoutes.get('/collections/:collection/content', async (c) => {
  const executionStart = Date.now()

  try {
    const collection = c.req.param('collection')
    const db = c.env.DB
    const queryParams = c.req.query()

    // First check if collection exists
    const collectionStmt = db.prepare('SELECT * FROM collections WHERE name = ? AND is_active = 1')
    const collectionResult = await collectionStmt.bind(collection).first()

    if (!collectionResult) {
      return c.json({ error: 'Collection not found' }, 404)
    }

    // Parse filter from query parameters
    const filter: QueryFilter = QueryFilterBuilder.parseFromQuery(queryParams)

    // Add collection_id filter to where clause
    if (!filter.where) {
      filter.where = { and: [] }
    }

    if (!filter.where.and) {
      filter.where.and = []
    }

    // Add collection filter
    filter.where.and.push({
      field: 'collection_id',
      operator: 'equals',
      value: (collectionResult as any).id
    })

    // Set default limit if not provided
    if (!filter.limit) {
      filter.limit = 50
    }
    filter.limit = Math.min(filter.limit, 1000)

    // Build SQL query from filter
    const builder = new QueryFilterBuilder()
    const queryResult = builder.build('content', filter)

    // Check for query building errors
    if (queryResult.errors.length > 0) {
      return c.json({
        error: 'Invalid filter parameters',
        details: queryResult.errors
      }, 400)
    }

    // Generate cache key
    const cacheEnabled = c.get('cacheEnabled')
    const cache = getCacheService(CACHE_CONFIGS.api!)
    const cacheKey = cache.generateKey('collection-content-filtered', `${collection}:${JSON.stringify({ filter, query: queryResult.sql })}`)

    // Only check cache if plugin is enabled
    if (cacheEnabled) {
      const cacheResult = await cache.getWithSource<any>(cacheKey)
      if (cacheResult.hit && cacheResult.data) {
        // Add cache headers
        c.header('X-Cache-Status', 'HIT')
        c.header('X-Cache-Source', cacheResult.source)
        if (cacheResult.ttl) {
          c.header('X-Cache-TTL', Math.floor(cacheResult.ttl).toString())
        }

        // Add cache info and timing to meta
        const dataWithMeta = {
          ...cacheResult.data,
          meta: addTimingMeta(c, {
            ...cacheResult.data.meta,
            cache: {
              hit: true,
              source: cacheResult.source,
              ttl: cacheResult.ttl ? Math.floor(cacheResult.ttl) : undefined
            }
          }, executionStart)
        }

        return c.json(dataWithMeta)
      }
    }

    // Cache miss - fetch from database
    c.header('X-Cache-Status', 'MISS')
    c.header('X-Cache-Source', 'database')

    // Execute query with parameters
    const stmt = db.prepare(queryResult.sql)
    const boundStmt = queryResult.params.length > 0
      ? stmt.bind(...queryResult.params)
      : stmt

    const { results } = await boundStmt.all()

    // Transform results to match API spec (camelCase)
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
      meta: addTimingMeta(c, {
        collection: {
          ...(collectionResult as any),
          schema: (collectionResult as any).schema ? JSON.parse((collectionResult as any).schema) : {}
        },
        count: results.length,
        timestamp: new Date().toISOString(),
        filter: filter,
        query: {
          sql: queryResult.sql,
          params: queryResult.params
        },
        cache: {
          hit: false,
          source: 'database'
        }
      }, executionStart)
    }

    // Cache the response only if cache plugin is enabled
    if (cacheEnabled) {
      await cache.set(cacheKey, responseData)
    }

    return c.json(responseData)
  } catch (error) {
    console.error('Error fetching content:', error)
    return c.json({
      error: 'Failed to fetch content',
      details: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// Mount CRUD routes for content
apiRoutes.route('/content', apiContentCrudRoutes)

export default apiRoutes
