import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
// import { APIGenerator } from '../utils/api-generator'
import { schemaDefinitions } from '../schemas'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

export const apiRoutes = new Hono<{ Bindings: Bindings }>()

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