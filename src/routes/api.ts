import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

export const apiRoutes = new Hono<{ Bindings: Bindings }>()

// Get all collections
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

// Get content by collection
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
    
    return c.json({
      data: results,
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

// Create new content
const createContentSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  data: z.record(z.any()),
  status: z.enum(['draft', 'published']).default('draft')
})

apiRoutes.post('/collections/:collection/content',
  zValidator('json', createContentSchema),
  async (c) => {
    try {
      const collection = c.req.param('collection')
      const validatedData = c.req.valid('json')
      const db = c.env.DB
      
      // Check if collection exists
      const collectionStmt = db.prepare('SELECT * FROM collections WHERE name = ? AND isActive = 1')
      const collectionResult = await collectionStmt.first()
      
      if (!collectionResult) {
        return c.json({ error: 'Collection not found' }, 404)
      }
      
      // Create content
      const contentId = crypto.randomUUID()
      const now = new Date()
      
      const insertStmt = db.prepare(`
        INSERT INTO content (id, collectionId, slug, title, data, status, authorId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      
      await insertStmt.bind(
        contentId,
        collectionResult.id,
        validatedData.slug,
        validatedData.title,
        JSON.stringify(validatedData.data),
        validatedData.status,
        'system', // TODO: Get from auth context
        now.getTime(),
        now.getTime()
      ).run()
      
      return c.json({
        data: {
          id: contentId,
          ...validatedData,
          collectionId: collectionResult.id,
          createdAt: now.toISOString()
        }
      }, 201)
    } catch (error) {
      console.error('Error creating content:', error)
      return c.json({ error: 'Failed to create content' }, 500)
    }
  }
)