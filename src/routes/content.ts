import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
// import { ContentModelManager } from '../content/models'
// import { ContentWorkflow, ContentStatus, WorkflowAction } from '../content/workflow'
// import { ContentVersioning } from '../content/versioning'
// import { RichTextProcessor } from '../content/rich-text'
import { requireAuth, requireRole } from '../middleware/auth'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

type Variables = {
  user: {
    userId: string
    email: string
    role: string
    exp: number
    iat: number
  }
}

export const contentRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Initialize content model manager
// const modelManager = new ContentModelManager()

// Temporary health endpoint for content routes
contentRoutes.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    message: 'Content API is ready for Stage 3 implementation',
    timestamp: new Date().toISOString()
  })
})

/*
// Get all content with filtering and pagination
contentRoutes.get('/', async (c) => {
  try {
    const { searchParams } = new URL(c.req.url)
    const user = c.get('user')
    
    // Query parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const modelName = searchParams.get('model')
    const status = searchParams.get('status') as ContentStatus
    const search = searchParams.get('search')
    const authorId = searchParams.get('author')
    
    const db = c.env.DB
    let query = 'SELECT * FROM content'
    const params: any[] = []
    const conditions: string[] = []
    
    // Filter by model
    if (modelName) {
      conditions.push('modelName = ?')
      params.push(modelName)
    }
    
    // Filter by status (respecting user permissions)
    const visibleStatuses = user ? 
      ContentWorkflow.getContentVisibility(user.role, false) : 
      [ContentStatus.PUBLISHED]
    
    if (status && visibleStatuses.includes(status)) {
      conditions.push('status = ?')
      params.push(status)
    } else {
      const statusPlaceholders = visibleStatuses.map(() => '?').join(',')
      conditions.push(`status IN (${statusPlaceholders})`)
      params.push(...visibleStatuses)
    }
    
    // Filter by author
    if (authorId) {
      conditions.push('author_id = ?')
      params.push(authorId)
    }
    
    // Search in title and content
    if (search) {
      conditions.push('(title LIKE ? OR data LIKE ?)')
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm)
    }
    
    // Build final query
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }
    
    query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
    
    const stmt = db.prepare(query)
    const { results } = await stmt.bind(...params).all()
    
    // Process results
    const processedResults = results.map((row: any) => {
      const data = row.data ? JSON.parse(row.data) : {}
      
      // Add computed fields
      if (data.content) {
        const wordCount = RichTextProcessor.countWords(data.content)
        const readingTime = RichTextProcessor.estimateReadingTime(data.content)
        data._computed = { wordCount, readingTime }
      }
      
      return {
        ...row,
        data
      }
    })
    
    // Filter by user permissions
    const filteredResults = user ? 
      ContentWorkflow.filterContentByPermissions(processedResults, user.role, user.userId) :
      processedResults.filter(item => item.status === ContentStatus.PUBLISHED)
    
    return c.json({
      data: filteredResults,
      meta: {
        count: filteredResults.length,
        limit,
        offset,
        total: filteredResults.length, // This would need a separate count query for accuracy
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return c.json({ error: 'Failed to fetch content' }, 500)
  }
})

// Get single content item by ID
contentRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const user = c.get('user')
    const db = c.env.DB
    
    const stmt = db.prepare('SELECT * FROM content WHERE id = ?')
    const result = await stmt.bind(id).first() as any
    
    if (!result) {
      return c.json({ error: 'Content not found' }, 404)
    }
    
    // Check permissions
    const visibleStatuses = user ? 
      ContentWorkflow.getContentVisibility(user.role, result.authorId === user.userId) : 
      [ContentStatus.PUBLISHED]
    
    if (!visibleStatuses.includes(result.status)) {
      return c.json({ error: 'Content not found' }, 404)
    }
    
    // Parse and enhance data
    const data = result.data ? JSON.parse(result.data) : {}
    
    if (data.content) {
      const wordCount = RichTextProcessor.countWords(data.content)
      const readingTime = RichTextProcessor.estimateReadingTime(data.content)
      const tableOfContents = RichTextProcessor.generateTableOfContents(data.content)
      data._computed = { wordCount, readingTime, tableOfContents }
    }
    
    return c.json({
      data: {
        ...result,
        data
      }
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return c.json({ error: 'Failed to fetch content' }, 500)
  }
})

// Create new content
const createContentSchema = z.object({
  modelName: z.string().min(1, 'Model name is required'),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').optional(),
  data: z.record(z.any()).default({}),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
  scheduledAt: z.number().optional()
})

contentRoutes.post('/', 
  requireAuth(),
  zValidator('json', createContentSchema),
  async (c) => {
    try {
      const user = c.get('user')
      const validatedData = c.req.valid('json')
      const db = c.env.DB
      
      // Get content model
      const model = modelManager.getModel(validatedData.modelName)
      if (!model) {
        return c.json({ error: 'Invalid content model' }, 400)
      }
      
      // Validate content against model
      const validation = modelManager.validateContent(validatedData.modelName, validatedData.data)
      if (!validation.valid) {
        return c.json({ error: 'Validation failed', details: validation.errors }, 400)
      }
      
      // Generate slug if not provided
      const slug = validatedData.slug || 
        validatedData.title.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim()
      
      // Check for duplicate slug
      const duplicateStmt = db.prepare('SELECT id FROM content WHERE slug = ? AND modelName = ?')
      const duplicate = await duplicateStmt.bind(slug, validatedData.modelName).first()
      
      if (duplicate) {
        return c.json({ error: 'Slug already exists' }, 400)
      }
      
      // Process rich text content
      if (validatedData.data.content) {
        validatedData.data.content = RichTextProcessor.sanitize(validatedData.data.content)
        validatedData.data.content = RichTextProcessor.addHeadingIds(validatedData.data.content)
        
        // Generate excerpt if not provided
        if (!validatedData.data.excerpt) {
          validatedData.data.excerpt = RichTextProcessor.generateExcerpt(validatedData.data.content)
        }
      }
      
      // Create content
      const contentId = crypto.randomUUID()
      const now = Date.now()
      
      const insertStmt = db.prepare(`
        INSERT INTO content (
          id, modelName, title, slug, data, status, authorId, 
          version, createdAt, updatedAt, scheduledAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      
      await insertStmt.bind(
        contentId,
        validatedData.modelName,
        validatedData.title,
        slug,
        JSON.stringify(validatedData.data),
        validatedData.status,
        user.userId,
        1,
        now,
        now,
        validatedData.scheduledAt || null
      ).run()
      
      // Create initial version if versioning is enabled
      if (model.settings.versioning) {
        const version = ContentVersioning.createVersion(
          contentId,
          {
            title: validatedData.title,
            slug,
            data: validatedData.data,
            status: validatedData.status,
            authorId: user.userId
          },
          undefined,
          user.userId,
          'create',
          'Initial version'
        )
        
        await ContentVersioning.saveVersion(version, db)
      }
      
      return c.json({
        data: {
          id: contentId,
          modelName: validatedData.modelName,
          title: validatedData.title,
          slug,
          data: validatedData.data,
          status: validatedData.status,
          authorId: user.userId,
          version: 1,
          createdAt: new Date(now).toISOString()
        }
      }, 201)
    } catch (error) {
      console.error('Error creating content:', error)
      return c.json({ error: 'Failed to create content' }, 500)
    }
  }
)

// Bulk operations
const bulkOperationSchema = z.object({
  operation: z.enum(['delete', 'publish', 'unpublish', 'archive', 'change_status']),
  contentIds: z.array(z.string()).min(1, 'At least one content ID is required'),
  newStatus: z.nativeEnum(ContentStatus).optional(),
  scheduledAt: z.number().optional()
})

contentRoutes.post('/bulk',
  requireAuth(),
  requireRole(['admin', 'editor']),
  zValidator('json', bulkOperationSchema),
  async (c) => {
    try {
      const user = c.get('user')
      const { operation, contentIds, newStatus, scheduledAt } = c.req.valid('json')
      const db = c.env.DB
      
      const results: { id: string; success: boolean; error?: string }[] = []
      
      // Process each content item
      for (const contentId of contentIds) {
        try {
          // Get current content
          const stmt = db.prepare('SELECT * FROM content WHERE id = ?')
          const content = await stmt.bind(contentId).first() as any
          
          if (!content) {
            results.push({ id: contentId, success: false, error: 'Content not found' })
            continue
          }
          
          // Check permissions
          const canPerform = ContentWorkflow.canPerformAction(
            operation as WorkflowAction,
            content.status,
            user.role,
            content.authorId === user.userId
          )
          
          if (!canPerform) {
            results.push({ id: contentId, success: false, error: 'Insufficient permissions' })
            continue
          }
          
          let updateStatus = content.status
          let updateFields: Record<string, any> = { updatedAt: Date.now() }
          
          // Apply operation
          switch (operation) {
            case 'delete':
              updateStatus = ContentStatus.DELETED
              updateFields.deletedAt = Date.now()
              break
            case 'publish':
              updateStatus = ContentStatus.PUBLISHED
              updateFields.publishedAt = Date.now()
              break
            case 'unpublish':
              updateStatus = ContentStatus.DRAFT
              updateFields.publishedAt = null
              break
            case 'archive':
              updateStatus = ContentStatus.ARCHIVED
              updateFields.archivedAt = Date.now()
              break
            case 'change_status':
              if (newStatus) {
                updateStatus = newStatus
                if (newStatus === ContentStatus.SCHEDULED && scheduledAt) {
                  updateFields.scheduledAt = scheduledAt
                }
              }
              break
          }
          
          // Update content
          const updateStmt = db.prepare(`
            UPDATE content 
            SET status = ?, updatedAt = ?
            ${updateFields.publishedAt !== undefined ? ', publishedAt = ?' : ''}
            ${updateFields.deletedAt !== undefined ? ', deletedAt = ?' : ''}
            ${updateFields.archivedAt !== undefined ? ', archivedAt = ?' : ''}
            ${updateFields.scheduledAt !== undefined ? ', scheduledAt = ?' : ''}
            WHERE id = ?
          `)
          
          const params = [updateStatus, updateFields.updatedAt]
          if (updateFields.publishedAt !== undefined) params.push(updateFields.publishedAt)
          if (updateFields.deletedAt !== undefined) params.push(updateFields.deletedAt)
          if (updateFields.archivedAt !== undefined) params.push(updateFields.archivedAt)
          if (updateFields.scheduledAt !== undefined) params.push(updateFields.scheduledAt)
          params.push(contentId)
          
          await updateStmt.bind(...params).run()
          
          results.push({ id: contentId, success: true })
        } catch (error) {
          console.error(`Error processing bulk operation for ${contentId}:`, error)
          results.push({ id: contentId, success: false, error: 'Processing failed' })
        }
      }
      
      const successCount = results.filter(r => r.success).length
      const errorCount = results.filter(r => !r.success).length
      
      return c.json({
        message: `Bulk operation completed: ${successCount} successful, ${errorCount} failed`,
        results,
        summary: {
          total: contentIds.length,
          successful: successCount,
          failed: errorCount
        }
      })
    } catch (error) {
      console.error('Error in bulk operation:', error)
      return c.json({ error: 'Bulk operation failed' }, 500)
    }
  }
)

// Workflow actions
contentRoutes.post('/:id/workflow',
  requireAuth(),
  zValidator('json', z.object({
    action: z.nativeEnum(WorkflowAction),
    comment: z.string().optional(),
    scheduledAt: z.number().optional()
  })),
  async (c) => {
    try {
      const contentId = c.req.param('id')
      const user = c.get('user')
      const { action, comment, scheduledAt } = c.req.valid('json')
      const db = c.env.DB
      
      // Get current content
      const stmt = db.prepare('SELECT * FROM content WHERE id = ?')
      const content = await stmt.bind(contentId).first() as any
      
      if (!content) {
        return c.json({ error: 'Content not found' }, 404)
      }
      
      // Check permissions
      const canPerform = ContentWorkflow.canPerformAction(
        action,
        content.status,
        user.role,
        content.authorId === user.userId
      )
      
      if (!canPerform) {
        return c.json({ error: 'Insufficient permissions' }, 403)
      }
      
      // Apply workflow action
      const { content: updatedContent, historyEntry } = ContentWorkflow.applyAction(
        content,
        action,
        user.userId,
        scheduledAt,
        comment
      )
      
      // Update content in database
      const updateStmt = db.prepare(`
        UPDATE content 
        SET status = ?, updatedAt = ?, publishedAt = ?, scheduledAt = ?, archivedAt = ?, deletedAt = ?
        WHERE id = ?
      `)
      
      await updateStmt.bind(
        updatedContent.status,
        updatedContent.updatedAt,
        updatedContent.publishedAt || null,
        updatedContent.scheduledAt || null,
        updatedContent.archivedAt || null,
        updatedContent.deletedAt || null,
        contentId
      ).run()
      
      // Save workflow history
      const historyStmt = db.prepare(`
        INSERT INTO workflow_history (
          id, contentId, action, fromStatus, toStatus, userId, comment, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      
      await historyStmt.bind(
        historyEntry.id,
        historyEntry.contentId,
        historyEntry.action,
        historyEntry.fromStatus,
        historyEntry.toStatus,
        historyEntry.userId,
        historyEntry.comment || null,
        historyEntry.createdAt
      ).run()
      
      return c.json({
        message: 'Workflow action applied successfully',
        content: updatedContent,
        historyEntry
      })
    } catch (error) {
      console.error('Error applying workflow action:', error)
      return c.json({ error: 'Failed to apply workflow action' }, 500)
    }
  }
)

// Get content models
contentRoutes.get('/models', (c) => {
  const models = modelManager.getAllModels().map(model => ({
    id: model.id,
    name: model.name,
    displayName: model.displayName,
    description: model.description,
    fieldCount: Object.keys(model.fields).length,
    settings: model.settings
  }))
  
  return c.json({ data: models })
})

// Get specific content model with full field definitions
contentRoutes.get('/models/:name', (c) => {
  const modelName = c.req.param('name')
  const model = modelManager.getModel(modelName)
  
  if (!model) {
    return c.json({ error: 'Content model not found' }, 404)
  }
  
  return c.json({ data: model })
})*/
