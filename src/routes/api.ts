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
  const baseUrl = c.req.url.replace(c.req.path, '')
  
  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'SonicJS AI API',
      version: '0.1.0',
      description: 'RESTful API for SonicJS AI - A modern headless CMS built for Cloudflare\'s edge platform',
      contact: {
        name: 'SonicJS AI',
        url: `${baseUrl}/docs`
      }
    },
    servers: [
      {
        url: baseUrl,
        description: 'Current server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    paths: {
      '/api/': {
        get: {
          summary: 'Get OpenAPI specification',
          description: 'Returns the OpenAPI 3.0 specification for this API',
          responses: {
            '200': {
              description: 'OpenAPI specification',
              content: {
                'application/json': {
                  schema: {
                    type: 'object'
                  }
                }
              }
            }
          }
        }
      },
      '/api/health': {
        get: {
          summary: 'Health check endpoint',
          description: 'Returns status, timestamp, and available schemas',
          responses: {
            '200': {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'healthy' },
                      timestamp: { type: 'string', format: 'date-time' },
                      schemas: { 
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Available content schemas'
                      }
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
          description: 'Retrieves all active collections from the database',
          responses: {
            '200': {
              description: 'List of collections',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            displayName: { type: 'string' },
                            description: { type: 'string' },
                            schema: { type: 'object' },
                            isActive: { type: 'boolean' },
                            createdAt: { type: 'integer' },
                            updatedAt: { type: 'integer' }
                          }
                        }
                      },
                      meta: {
                        type: 'object',
                        properties: {
                          count: { type: 'integer' },
                          timestamp: { type: 'string', format: 'date-time' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: { type: 'string' }
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
          description: 'Retrieves content items with pagination (limit 50)',
          responses: {
            '200': {
              description: 'List of content items',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            slug: { type: 'string' },
                            status: { type: 'string' },
                            collectionId: { type: 'string' },
                            data: { type: 'object' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' }
                          }
                        }
                      },
                      meta: {
                        type: 'object',
                        properties: {
                          count: { type: 'integer' },
                          timestamp: { type: 'string', format: 'date-time' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/collections/{collection}/content': {
        get: {
          summary: 'Get content for specific collection',
          description: 'Gets content for a specific collection by collection name',
          parameters: [
            {
              name: 'collection',
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              },
              description: 'Collection name'
            }
          ],
          responses: {
            '200': {
              description: 'Content for the specified collection',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            slug: { type: 'string' },
                            status: { type: 'string' },
                            collectionId: { type: 'string' },
                            data: { type: 'object' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' }
                          }
                        }
                      },
                      meta: {
                        type: 'object',
                        properties: {
                          collection: { type: 'object' },
                          count: { type: 'integer' },
                          timestamp: { type: 'string', format: 'date-time' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '404': {
              description: 'Collection not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: { type: 'string' }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Internal server error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: { type: 'string' }
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
    const stmt = db.prepare('SELECT * FROM collections WHERE is_active = 1')
    const { results } = await stmt.all()
    
    // Parse schema and format results
    const transformedResults = results.map((row: any) => ({
      ...row,
      schema: row.schema ? JSON.parse(row.schema) : {},
      is_active: row.is_active // Keep as number (1 or 0)
    }))
    
    return c.json({
      data: transformedResults,
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
    const stmt = db.prepare('SELECT * FROM content ORDER BY created_at DESC LIMIT 50')
    const { results } = await stmt.all()
    
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
    
    return c.json({
      data: transformedResults,
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
    const collectionStmt = db.prepare('SELECT * FROM collections WHERE name = ? AND is_active = 1')
    const collectionResult = await collectionStmt.bind(collection).first()
    
    if (!collectionResult) {
      return c.json({ error: 'Collection not found' }, 404)
    }
    
    // Get content for this collection
    const contentStmt = db.prepare('SELECT * FROM content WHERE collection_id = ? ORDER BY created_at DESC')
    const { results } = await contentStmt.bind(collectionResult.id).all()
    
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
    
    return c.json({
      data: transformedResults,
      meta: {
        collection: {
          ...collectionResult,
          schema: (collectionResult as any).schema ? JSON.parse((collectionResult as any).schema) : {}
        },
        count: results.length,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return c.json({ error: 'Failed to fetch content' }, 500)
  }
})