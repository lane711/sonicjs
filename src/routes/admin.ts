import { Hono } from 'hono'
import { html, raw } from 'hono/html'
import { renderDashboardPage, renderStatsCards, DashboardPageData, DashboardStats } from '../templates/pages/admin-dashboard.template'
import { renderCollectionsListPage, CollectionsListPageData, Collection } from '../templates/pages/admin-collections-list.template'
import { renderCollectionFormPage, CollectionFormData } from '../templates/pages/admin-collections-form.template'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

type Variables = {
  user?: {
    userId: string
    email: string
    role: string
    exp: number
    iat: number
  }
}

export const adminRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Admin dashboard
adminRoutes.get('/', (c) => {
  const user = c.get('user')
  
  const pageData: DashboardPageData = {
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined
  }
  
  return c.html(renderDashboardPage(pageData))
})

// Admin API endpoints for HTMX
adminRoutes.get('/api/stats', async (c) => {
  try {
    const db = c.env.DB
    
    // Get collections count
    const collectionsStmt = db.prepare('SELECT COUNT(*) as count FROM collections WHERE is_active = 1')
    const collectionsResult = await collectionsStmt.first()
    
    // Get content count
    const contentStmt = db.prepare('SELECT COUNT(*) as count FROM content')
    const contentResult = await contentStmt.first()
    
    // Get media count
    const mediaStmt = db.prepare('SELECT COUNT(*) as count FROM media')
    const mediaResult = await mediaStmt.first()
    
    // Get users count
    const usersStmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1')
    const usersResult = await usersStmt.first()
    
    const stats: DashboardStats = {
      collections: (collectionsResult as any)?.count || 0,
      contentItems: (contentResult as any)?.count || 0,
      mediaFiles: (mediaResult as any)?.count || 0,
      users: (usersResult as any)?.count || 0
    }
    
    return c.html(renderStatsCards(stats))
  } catch (error) {
    console.error('Error fetching stats:', error)
    return c.html(html`<p>Error loading statistics</p>`)
  }
})

// Collections management
adminRoutes.get('/collections', async (c) => {
  try {
    const user = c.get('user')
    const db = c.env.DB
    const stmt = db.prepare('SELECT * FROM collections WHERE is_active = 1 ORDER BY created_at DESC')
    const { results } = await stmt.all()
    
    const collections: Collection[] = (results || [])
      .filter((collection: any) => collection && collection.id)
      .map((collection: any) => ({
        id: collection.id,
        name: collection.name || `collection-${collection.id}`,
        display_name: collection.display_name || collection.name || `Collection ${collection.id}`,
        description: collection.description,
        created_at: collection.created_at,
        formattedDate: collection.created_at ? new Date(collection.created_at).toLocaleDateString() : 'Unknown'
      }))
    
    const pageData: CollectionsListPageData = {
      collections,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined
    }
    
    return c.html(renderCollectionsListPage(pageData))
  } catch (error) {
    console.error('Error fetching collections:', error)
    return c.html(html`<p>Error loading collections</p>`)
  }
})

// New collection form
adminRoutes.get('/collections/new', (c) => {
  const user = c.get('user')
  
  const formData: CollectionFormData = {
    isEdit: false,
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined
  }
  
  return c.html(renderCollectionFormPage(formData))
})

// Create collection
adminRoutes.post('/collections', async (c) => {
  try {
    const formData = await c.req.formData()
    const name = formData.get('name') as string
    const displayName = formData.get('displayName') as string
    const description = formData.get('description') as string
    
    // Basic validation
    if (!name || !displayName) {
      return c.html(html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Name and display name are required.
        </div>
      `)
    }
    
    // Validate name format
    if (!/^[a-z0-9_]+$/.test(name)) {
      return c.html(html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Collection name must contain only lowercase letters, numbers, and underscores.
        </div>
      `)
    }
    
    const db = c.env.DB
    
    // Check if collection already exists
    const existingStmt = db.prepare('SELECT id FROM collections WHERE name = ?')
    const existing = await existingStmt.bind(name).first()
    
    if (existing) {
      return c.html(html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          A collection with this name already exists.
        </div>
      `)
    }
    
    // Create basic schema for the collection
    const basicSchema = {
      type: "object",
      properties: {
        title: {
          type: "string",
          title: "Title",
          required: true
        },
        content: {
          type: "string",
          title: "Content",
          format: "richtext"
        },
        status: {
          type: "string",
          title: "Status",
          enum: ["draft", "published", "archived"],
          default: "draft"
        }
      },
      required: ["title"]
    }
    
    // Create collection
    const collectionId = crypto.randomUUID()
    const now = Date.now()
    
    const insertStmt = db.prepare(`
      INSERT INTO collections (id, name, display_name, description, schema, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    await insertStmt.bind(
      collectionId,
      name,
      displayName,
      description || null,
      JSON.stringify(basicSchema),
      1, // is_active
      now,
      now
    ).run()
    
    return c.html(html`
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        Collection created successfully! Redirecting...
        <script>
          setTimeout(() => {
            window.location.href = '/admin/collections';
          }, 2000);
        </script>
      </div>
    `)
  } catch (error) {
    console.error('Error creating collection:', error)
    return c.html(html`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Failed to create collection. Please try again.
      </div>
    `)
  }
})

// Edit collection form
adminRoutes.get('/collections/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env.DB
    
    const stmt = db.prepare('SELECT * FROM collections WHERE id = ?')
    const collection = await stmt.bind(id).first() as any
    
    if (!collection) {
      return c.html(html`
        <div class="max-w-4xl mx-auto px-4 py-6">
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Collection not found.
          </div>
        </div>
      `)
    }
    
    return c.html(html`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Edit Collection - SonicJS AI Admin</title>
        <script src="https://unpkg.com/htmx.org@2.0.3"></script>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-50">
        <div class="min-h-screen">
          <!-- Header -->
          <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-4">
                  <h1 class="text-2xl font-bold text-gray-900">SonicJS AI Admin</h1>
                  <nav class="flex space-x-4">
                    <a href="/admin" class="text-gray-600 hover:text-gray-900">Dashboard</a>
                    <a href="/admin/content" class="text-gray-600 hover:text-gray-900">Content</a>
                    <a href="/admin/collections" class="text-blue-600 font-medium">Collections</a>
                    <a href="/admin/media" class="text-gray-600 hover:text-gray-900">Media</a>
                    <a href="/admin/users" class="text-gray-600 hover:text-gray-900">Users</a>
                  </nav>
                </div>
              </div>
            </div>
          </header>
          
          <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="mb-6">
              <div class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <a href="/admin" class="hover:text-gray-700">Admin</a>
                <span>/</span>
                <a href="/admin/collections" class="hover:text-gray-700">Collections</a>
                <span>/</span>
                <span class="text-gray-900">Edit Collection</span>
              </div>
              <h2 class="text-3xl font-bold text-gray-900">Edit Collection: ${collection.display_name}</h2>
            </div>
            
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <form hx-put="/admin/collections/${collection.id}" hx-target="#form-response" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                      Collection Name *
                    </label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value="${collection.name}"
                      readonly
                      class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500"
                    >
                    <p class="text-xs text-gray-500 mt-1">Collection name cannot be changed</p>
                  </div>
                  
                  <div>
                    <label for="displayName" class="block text-sm font-medium text-gray-700 mb-2">
                      Display Name *
                    </label>
                    <input 
                      type="text" 
                      id="displayName" 
                      name="displayName" 
                      value="${collection.display_name}"
                      required
                      class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                  </div>
                </div>
                
                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea 
                    id="description" 
                    name="description" 
                    rows="3"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >${collection.description || ''}</textarea>
                </div>
                
                <div class="flex justify-between">
                  <div class="flex space-x-3">
                    <a 
                      href="/admin/collections" 
                      class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </a>
                    <button 
                      type="submit"
                      class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Update Collection
                    </button>
                  </div>
                  
                  <button 
                    type="button"
                    hx-delete="/admin/collections/${collection.id}"
                    hx-confirm="Are you sure you want to delete this collection? This action cannot be undone."
                    hx-target="body"
                    class="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Delete Collection
                  </button>
                </div>
              </form>
              
              <div id="form-response" class="mt-4"></div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Error fetching collection:', error)
    return c.html(html`<p>Error loading collection</p>`)
  }
})

// Update collection
adminRoutes.put('/collections/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const formData = await c.req.formData()
    const displayName = formData.get('displayName') as string
    const description = formData.get('description') as string
    
    if (!displayName) {
      return c.html(html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Display name is required.
        </div>
      `)
    }
    
    const db = c.env.DB
    
    const updateStmt = db.prepare(`
      UPDATE collections 
      SET display_name = ?, description = ?, updated_at = ?
      WHERE id = ?
    `)
    
    await updateStmt.bind(displayName, description || null, Date.now(), id).run()
    
    return c.html(html`
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        Collection updated successfully!
      </div>
    `)
  } catch (error) {
    console.error('Error updating collection:', error)
    return c.html(html`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Failed to update collection. Please try again.
      </div>
    `)
  }
})

// Delete collection
adminRoutes.delete('/collections/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env.DB
    
    // Check if collection has content
    const contentStmt = db.prepare('SELECT COUNT(*) as count FROM content WHERE collection_id = ?')
    const contentResult = await contentStmt.bind(id).first() as any
    
    if (contentResult && contentResult.count > 0) {
      return c.html(html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Cannot delete collection: it contains ${contentResult.count} content item(s). Delete all content first.
        </div>
      `)
    }
    
    // Delete collection
    const deleteStmt = db.prepare('DELETE FROM collections WHERE id = ?')
    await deleteStmt.bind(id).run()
    
    return c.redirect('/admin/collections')
  } catch (error) {
    console.error('Error deleting collection:', error)
    return c.html(html`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Failed to delete collection. Please try again.
      </div>
    `)
  }
})