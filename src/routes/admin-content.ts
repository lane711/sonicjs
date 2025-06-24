import { Hono } from 'hono'
import { html } from 'hono/html'
import { ContentModelManager } from '../content/models'
import { ContentWorkflow, ContentStatus } from '../content/workflow'
import { ContentVersioning } from '../content/versioning'
// Rich text now handled by form templates
import { requireAuth, requireRole } from '../middleware/auth'
import { renderContentListPage, ContentListPageData } from '../templates/pages/admin-content-list.template'
import { renderContentNewPage, ContentNewPageData } from '../templates/pages/admin-content-new.template'
import { renderContentEditPage, ContentEditPageData } from '../templates/pages/admin-content-edit.template'

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

export const adminContentRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Initialize content model manager
const modelManager = new ContentModelManager()

// Content list page
adminContentRoutes.get('/', async (c) => {
  try {
    const user = c.get('user')
    const { searchParams } = new URL(c.req.url)
    const modelName = searchParams.get('model') || 'all'
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit
    
    const db = c.env.DB
    
    // Build query
    let query = `
      SELECT c.*, u.first_name, u.last_name 
      FROM content c 
      LEFT JOIN users u ON c.author_id = u.id
    `
    const params: any[] = []
    const conditions: string[] = []
    
    if (modelName !== 'all') {
      conditions.push('c.collection_id = ?')
      params.push(modelName)
    }
    
    if (status !== 'all') {
      conditions.push('c.status = ?')
      params.push(status)
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }
    
    query += ` ORDER BY c.updated_at DESC LIMIT ${limit} OFFSET ${offset}`
    
    const stmt = db.prepare(query)
    const { results } = await stmt.bind(...params).all()
    
    // Get available models
    const models = modelManager.getAllModels()
    
    // Process results
    const contentItems = results.map((row: any) => {
      const data = row.data ? JSON.parse(row.data) : {}
      return {
        ...row,
        data,
        authorName: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Unknown',
        formattedDate: new Date(row.updated_at).toLocaleDateString(),
        statusBadge: ContentWorkflow.generateStatusBadge(row.status as ContentStatus),
        availableActions: ContentWorkflow.getAvailableActions(
          row.status as ContentStatus,
          user.role,
          row.author_id === user.userId
        )
      }
    })
    
    const pageData: ContentListPageData = {
      modelName,
      status,
      page,
      models: models.map(model => ({
        name: model.name,
        displayName: model.displayName
      })),
      contentItems: contentItems.map(item => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        modelName: item.modelName || 'Unknown',
        statusBadge: item.statusBadge,
        authorName: item.authorName,
        formattedDate: item.formattedDate,
        availableActions: item.availableActions || []
      })),
      totalItems: contentItems.length, // This should come from a proper count query
      itemsPerPage: limit,
      user: {
        name: `${user.email}`,
        email: user.email,
        role: user.role
      }
    }

    return c.html(renderContentListPage(pageData))
  } catch (error) {
    console.error('Error loading content list:', error)
    return c.html(html`<p>Error loading content</p>`)
  }
})


// New content form
adminContentRoutes.get('/new', async (c) => {
  try {
    const user = c.get('user')
    const models = modelManager.getAllModels()
    
    const pageData: ContentNewPageData = {
      models: models.map(model => ({
        name: model.name,
        displayName: model.displayName,
        fields: model.fields
      })),
      selectedModel: models.length > 0 ? {
        name: models[0]?.name || '',
        displayName: models[0]?.displayName || '',
        fields: models[0]?.fields
      } : undefined,
      user: {
        name: user.email,
        email: user.email,
        role: user.role
      }
    }
    
    return c.html(renderContentNewPage(pageData))
  } catch (error) {
    console.error('Error loading content form:', error)
    
    const pageData: ContentNewPageData = {
      models: [],
      error: 'Failed to load content form. Please try again.',
      user: {
        name: c.get('user')?.email || 'Unknown',
        email: c.get('user')?.email || '',
        role: c.get('user')?.role || 'viewer'
      }
    }
    
    return c.html(renderContentNewPage(pageData))
  }
})

// Create new content
adminContentRoutes.post('/', async (c) => {
  try {
    const user = c.get('user')
    const formData = await c.req.formData()
    
    // Extract form data
    const title = formData.get('title')?.toString() || ''
    const slug = formData.get('slug')?.toString() || ''
    const status = formData.get('status')?.toString() || 'draft'
    const modelName = formData.get('modelName')?.toString() || ''
    
    // Validate required fields
    if (!title || !slug || !modelName) {
      return c.html(`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Please fill in all required fields: Title, Slug, and Content Type.</p>
        </div>
      `)
    }
    
    const db = c.env.DB
    
    // Get model configuration
    const models = modelManager.getAllModels()
    const model = models.find(m => m.name === modelName)
    
    if (!model) {
      return c.html(`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Invalid content type selected.</p>
        </div>
      `)
    }
    
    // Ensure the collection exists in the database
    let collectionId = modelName
    
    // Check if collection exists, if not create it
    const existingCollection = await db.prepare('SELECT id FROM collections WHERE name = ?').bind(modelName).first()
    
    if (!existingCollection) {
      // Create the collection
      collectionId = `${modelName}-collection`
      const now = Date.now()
      
      try {
        await db.prepare(`
          INSERT INTO collections (id, name, display_name, description, schema, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          collectionId,
          modelName,
          model.displayName,
          model.description || `Collection for ${model.displayName}`,
          JSON.stringify(model),
          1,
          now,
          now
        ).run()
      } catch (error) {
        console.log('Collection might already exist:', error)
        // If collection creation fails, try to find existing one by different criteria
        const fallbackCollection = await db.prepare('SELECT id FROM collections LIMIT 1').first()
        if (fallbackCollection) {
          collectionId = fallbackCollection.id as string
        } else {
          // Use the blog collection as fallback
          collectionId = 'blog-posts-collection'
        }
      }
    } else {
      collectionId = existingCollection.id as string
    }
    
    // Build content data from form fields
    const contentData: any = { title, slug }
    
    // Extract dynamic fields based on model configuration
    if (model.fields) {
      Object.keys(model.fields).forEach(fieldName => {
        const fieldValue = formData.get(fieldName)
        if (fieldValue !== null) {
          contentData[fieldName] = fieldValue.toString()
        }
      })
    }
    
    // Check if slug already exists
    const existingContent = await db.prepare('SELECT id FROM content WHERE slug = ?').bind(slug).first()
    if (existingContent) {
      return c.html(`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>A content item with this slug already exists. Please choose a different slug.</p>
        </div>
      `)
    }
    
    // Insert new content
    const contentId = crypto.randomUUID()
    const now = new Date().toISOString()
    
    await db.prepare(`
      INSERT INTO content (
        id, title, slug, collection_id, status, data, author_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      contentId,
      title,
      slug,
      collectionId,
      status,
      JSON.stringify(contentData),
      user.userId,
      now,
      now
    ).run()
    
    // Redirect to content list with success message
    return c.redirect('/admin/content?success=Content created successfully')
    
  } catch (error) {
    console.error('Error creating content:', error)
    return c.html(`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>An error occurred while creating the content. Please try again.</p>
      </div>
    `)
  }
})

// Edit content form
adminContentRoutes.get('/:id/edit', async (c) => {
  try {
    const user = c.get('user')
    const contentId = c.req.param('id')
    const db = c.env.DB
    
    // Get content item
    const contentResult = await db.prepare('SELECT * FROM content WHERE id = ?').bind(contentId).first()
    
    if (!contentResult) {
      return c.html(`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Content not found.</p>
        </div>
      `)
    }
    
    // Parse content data
    const contentData = contentResult.data ? JSON.parse(contentResult.data as string) : {}
    
    const content = {
      id: contentResult.id as string,
      title: contentResult.title as string,
      slug: contentResult.slug as string,
      status: contentResult.status as string,
      data: contentData,
      collection_id: contentResult.collection_id as string,
      created_at: contentResult.created_at as string,
      updated_at: contentResult.updated_at as string
    }
    
    // Get available models
    const models = modelManager.getAllModels()
    
    // Find the model for this content
    const selectedModel = models.find(model => 
      model.name === content.collection_id || 
      content.collection_id.includes(model.name)
    ) || models[0]
    
    const pageData: ContentEditPageData = {
      content,
      models: models.map(model => ({
        name: model.name,
        displayName: model.displayName,
        fields: model.fields
      })),
      selectedModel: selectedModel ? {
        name: selectedModel.name,
        displayName: selectedModel.displayName,
        fields: selectedModel.fields
      } : undefined,
      user: {
        name: user.email,
        email: user.email,
        role: user.role
      }
    }
    
    return c.html(renderContentEditPage(pageData))
  } catch (error) {
    console.error('Error loading content for edit:', error)
    return c.html(`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error loading content. Please try again.</p>
      </div>
    `)
  }
})

// Handle POST to edit route (fallback for non-HTMX forms)
adminContentRoutes.post('/:id/edit', async (c) => {
  // Redirect POST requests to the PUT handler
  const contentId = c.req.param('id')
  const formData = await c.req.formData()
  
  // Create a new request object for the PUT route
  const putUrl = `/admin/content/${contentId}`
  const putRequest = new Request(putUrl, {
    method: 'PUT',
    body: formData,
    headers: c.req.raw.headers
  })
  
  // Forward to PUT handler by creating new context
  try {
    const user = c.get('user')
    const title = formData.get('title')?.toString() || ''
    const slug = formData.get('slug')?.toString() || ''
    const status = formData.get('status')?.toString() || 'draft'
    
    // Validate required fields
    if (!title || !slug) {
      return c.html(`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Please fill in all required fields: Title and Slug.</p>
        </div>
      `)
    }
    
    const db = c.env.DB
    
    // Get existing content
    const existingContent = await db.prepare('SELECT * FROM content WHERE id = ?').bind(contentId).first()
    if (!existingContent) {
      return c.html(`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Content not found.</p>
        </div>
      `)
    }
    
    // Check if slug already exists (excluding current content)
    const slugCheck = await db.prepare('SELECT id FROM content WHERE slug = ? AND id != ?').bind(slug, contentId).first()
    if (slugCheck) {
      return c.html(`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>A content item with this slug already exists. Please choose a different slug.</p>
        </div>
      `)
    }
    
    // Build updated content data
    const existingData = existingContent.data ? JSON.parse(existingContent.data as string) : {}
    const updatedData = { ...existingData, title, slug }
    
    // Extract dynamic fields from form
    for (const [key, value] of formData.entries()) {
      if (!['title', 'slug', 'status'].includes(key)) {
        updatedData[key] = value.toString()
      }
    }
    
    // Update content
    const now = new Date().toISOString()
    
    await db.prepare(`
      UPDATE content 
      SET title = ?, slug = ?, status = ?, data = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      title,
      slug,
      status,
      JSON.stringify(updatedData),
      now,
      contentId
    ).run()
    
    // Check if this is an HTMX request
    const isHtmxRequest = c.req.header('HX-Request') === 'true'
    
    if (isHtmxRequest) {
      return c.html(`
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>Content updated successfully!</p>
          <script>
            setTimeout(() => {
              window.location.href = '/admin/content';
            }, 1500);
          </script>
        </div>
      `)
    }
    
    // Redirect to content list with success message
    return c.redirect('/admin/content?success=Content updated successfully')
    
  } catch (error) {
    console.error('Error updating content:', error)
    return c.html(`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>An error occurred while updating the content. Please try again.</p>
      </div>
    `)
  }
})

// Update content
adminContentRoutes.put('/:id', async (c) => {
  try {
    const user = c.get('user')
    const contentId = c.req.param('id')
    const formData = await c.req.formData()
    
    // Extract form data
    const title = formData.get('title')?.toString() || ''
    const slug = formData.get('slug')?.toString() || ''
    const status = formData.get('status')?.toString() || 'draft'
    
    // Validate required fields
    if (!title || !slug) {
      return c.html(`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Please fill in all required fields: Title and Slug.</p>
        </div>
      `)
    }
    
    const db = c.env.DB
    
    // Get existing content
    const existingContent = await db.prepare('SELECT * FROM content WHERE id = ?').bind(contentId).first()
    if (!existingContent) {
      return c.html(`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Content not found.</p>
        </div>
      `)
    }
    
    // Check if slug already exists (excluding current content)
    const slugCheck = await db.prepare('SELECT id FROM content WHERE slug = ? AND id != ?').bind(slug, contentId).first()
    if (slugCheck) {
      return c.html(`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>A content item with this slug already exists. Please choose a different slug.</p>
        </div>
      `)
    }
    
    // Build updated content data
    const existingData = existingContent.data ? JSON.parse(existingContent.data as string) : {}
    const updatedData = { ...existingData, title, slug }
    
    // Extract dynamic fields from form
    for (const [key, value] of formData.entries()) {
      if (!['title', 'slug', 'status'].includes(key)) {
        updatedData[key] = value.toString()
      }
    }
    
    // Update content
    const now = new Date().toISOString()
    
    await db.prepare(`
      UPDATE content 
      SET title = ?, slug = ?, status = ?, data = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      title,
      slug,
      status,
      JSON.stringify(updatedData),
      now,
      contentId
    ).run()
    
    // Check if this is an HTMX request
    const isHtmxRequest = c.req.header('HX-Request') === 'true'
    
    if (isHtmxRequest) {
      return c.html(`
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>Content updated successfully!</p>
          <script>
            setTimeout(() => {
              window.location.href = '/admin/content';
            }, 1500);
          </script>
        </div>
      `)
    }
    
    // Redirect to content list with success message
    return c.redirect('/admin/content?success=Content updated successfully')
    
  } catch (error) {
    console.error('Error updating content:', error)
    return c.html(`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>An error occurred while updating the content. Please try again.</p>
      </div>
    `)
  }
})

// Delete content
adminContentRoutes.delete('/:id', async (c) => {
  try {
    const contentId = c.req.param('id')
    const db = c.env.DB
    
    // Check if content exists
    const existingContent = await db.prepare('SELECT id FROM content WHERE id = ?').bind(contentId).first()
    if (!existingContent) {
      return c.json({ error: 'Content not found' }, 404)
    }
    
    // Delete content
    await db.prepare('DELETE FROM content WHERE id = ?').bind(contentId).run()
    
    return c.json({ success: true, message: 'Content deleted successfully' })
    
  } catch (error) {
    console.error('Error deleting content:', error)
    return c.json({ error: 'An error occurred while deleting the content' }, 500)
  }
})

