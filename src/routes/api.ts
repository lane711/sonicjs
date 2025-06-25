import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { cors } from 'hono/cors'
// import { APIGenerator } from '../utils/api-generator'
import { schemaDefinitions } from '../schemas'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

export const apiRoutes = new Hono<{ Bindings: Bindings }>()

// Add CORS middleware
apiRoutes.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// OpenAPI specification endpoint
apiRoutes.get('/', (c) => {
  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'SonicJS AI API',
      version: '0.1.0',
      description: 'RESTful API for SonicJS AI CMS'
    },
    servers: [
      {
        url: c.req.url.replace(c.req.path, ''),
        description: 'Current server'
      }
    ],
    paths: {
      '/api/health': {
        get: {
          summary: 'Health check',
          responses: {
            '200': {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      timestamp: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/collections': {
        get: {
          summary: 'Get all collections',
          responses: {
            '200': {
              description: 'List of collections',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array' },
                      meta: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/content': {
        get: {
          summary: 'Get all content',
          responses: {
            '200': {
              description: 'List of content',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array' },
                      meta: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  return c.json(openApiSpec)
})

// TODO: Re-enable auto-generated routes after fixing TypeScript issues
// const apiGenerator = new APIGenerator()
// schemaDefinitions.forEach(schema => {
//   apiGenerator.registerSchema(schema)
// })
// apiRoutes.route('/', apiGenerator.getApp())

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
  try {
    const db = c.env.DB
    const stmt = db.prepare('SELECT * FROM collections WHERE isActive = 1')
    const { results } = await stmt.all()
    
    return c.json({
      data: results,
      meta: {
        count: results.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching collections:', error)
    return c.json({ error: 'Failed to fetch collections' }, 500)
  }
})

// Basic content endpoint
apiRoutes.get('/content', async (c) => {
  try {
    const db = c.env.DB
    const stmt = db.prepare('SELECT * FROM content ORDER BY createdAt DESC LIMIT 50')
    const { results } = await stmt.all()
    
    // Parse JSON data field for each result
    const parsedResults = results.map((row: any) => ({
      ...row,
      data: row.data ? JSON.parse(row.data) : {}
    }))
    
    return c.json({
      data: parsedResults,
      meta: {
        count: results.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return c.json({ error: 'Failed to fetch content' }, 500)
  }
})

// Legacy collection-specific routes for backward compatibility
apiRoutes.get('/collections/:collection/content', async (c) => {
  try {
    const collection = c.req.param('collection')
    const db = c.env.DB
    
    // First check if collection exists
    const collectionStmt = db.prepare('SELECT * FROM collections WHERE name = ? AND isActive = 1')
    const collectionResult = await collectionStmt.first()
    
    if (!collectionResult) {
      return c.json({ error: 'Collection not found' }, 404)
    }
    
    // Get content for this collection
    const contentStmt = db.prepare('SELECT * FROM content WHERE collectionId = ? ORDER BY createdAt DESC')
    const { results } = await contentStmt.bind(collectionResult.id).all()
    
    // Parse JSON data field for each result
    const parsedResults = results.map((row: any) => ({
      ...row,
      data: row.data ? JSON.parse(row.data) : {}
    }))
    
    return c.json({
      data: parsedResults,
      meta: {
        collection: collectionResult,
        count: results.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return c.json({ error: 'Failed to fetch content' }, 500)
  }
})