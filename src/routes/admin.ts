import { Hono } from 'hono'
import { html } from 'hono/html'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

export const adminRoutes = new Hono<{ Bindings: Bindings }>()

// Admin dashboard
adminRoutes.get('/', (c) => {
  return c.html(html`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SonicJS AI Admin</title>
      <script src="https://unpkg.com/htmx.org@2.0.3"></script>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
        .nav { display: flex; gap: 20px; margin: 20px 0; }
        .nav a { text-decoration: none; color: #0066cc; padding: 10px 15px; border-radius: 5px; }
        .nav a:hover { background: #f0f0f0; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 10px 0; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .stat { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
        .stat h3 { margin: 0 0 5px 0; color: #666; font-size: 14px; }
        .stat p { margin: 0; font-size: 24px; font-weight: bold; color: #333; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SonicJS AI Admin</h1>
          <p>Cloudflare-native headless CMS</p>
        </div>
        
        <nav class="nav">
          <a href="/admin">Dashboard</a>
          <a href="/admin/content">Content</a>
          <a href="/admin/collections">Collections</a>
          <a href="/admin/media">Media</a>
          <a href="/admin/users">Users</a>
          <a href="/auth/logout" style="margin-left: auto; background: #dc3545; color: white;">Logout</a>
        </nav>
        
        <div id="main-content">
          <div class="card">
            <h2>Dashboard</h2>
            <div class="stats" hx-get="/admin/api/stats" hx-trigger="load">
              <div class="stat">
                <h3>Collections</h3>
                <p>Loading...</p>
              </div>
              <div class="stat">
                <h3>Content Items</h3>
                <p>Loading...</p>
              </div>
              <div class="stat">
                <h3>Media Files</h3>
                <p>Loading...</p>
              </div>
              <div class="stat">
                <h3>Users</h3>
                <p>Loading...</p>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h2>Recent Activity</h2>
            <div hx-get="/admin/api/recent-activity" hx-trigger="load">
              <p>Loading recent activity...</p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `)
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
    
    return c.html(html`
      <div class="stat">
        <h3>Collections</h3>
        <p>${collectionsResult?.count || 0}</p>
      </div>
      <div class="stat">
        <h3>Content Items</h3>
        <p>${contentResult?.count || 0}</p>
      </div>
      <div class="stat">
        <h3>Media Files</h3>
        <p>${mediaResult?.count || 0}</p>
      </div>
      <div class="stat">
        <h3>Users</h3>
        <p>${usersResult?.count || 0}</p>
      </div>
    `)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return c.html(html`<p>Error loading statistics</p>`)
  }
})

// Collections management
adminRoutes.get('/collections', async (c) => {
  try {
    const db = c.env.DB
    const stmt = db.prepare('SELECT * FROM collections WHERE is_active = 1 ORDER BY created_at DESC')
    const { results } = await stmt.all()
    
    return c.html(html`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Collections - SonicJS AI Admin</title>
        <script src="https://unpkg.com/htmx.org@2.0.3"></script>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; }
          .container { max-width: 1200px; margin: 0 auto; }
          .header { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
          .nav { display: flex; gap: 20px; margin: 20px 0; }
          .nav a { text-decoration: none; color: #0066cc; padding: 10px 15px; border-radius: 5px; }
          .nav a:hover { background: #f0f0f0; }
          .nav a.active { background: #0066cc; color: white; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
          th { background: #f8f9fa; font-weight: 600; }
          .btn { background: #0066cc; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; }
          .btn:hover { background: #0052a3; }
          .btn-sm { padding: 4px 8px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SonicJS AI Admin</h1>
            <p>Cloudflare-native headless CMS</p>
          </div>
          
          <nav class="nav">
            <a href="/admin">Dashboard</a>
            <a href="/admin/collections" class="active">Collections</a>
            <a href="/admin/content">Content</a>
            <a href="/admin/media">Media</a>
            <a href="/admin/users">Users</a>
          </nav>
          
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h2>Collections</h2>
              <a href="/admin/collections/new" class="btn">New Collection</a>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Display Name</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${results.map((collection: any) => html`
                  <tr>
                    <td><code>${collection.name}</code></td>
                    <td>${collection.display_name}</td>
                    <td>${collection.description || '-'}</td>
                    <td>${new Date(collection.created_at).toLocaleDateString()}</td>
                    <td>
                      <a href="/admin/collections/${collection.id}" class="btn btn-sm">Edit</a>
                      <a href="/admin/collections/${collection.name}/content" class="btn btn-sm">Content</a>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            ${results.length === 0 ? html`
              <div style="text-align: center; padding: 40px; color: #666;">
                <p>No collections found. <a href="/admin/collections/new">Create your first collection</a></p>
              </div>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Error fetching collections:', error)
    return c.html(html`<p>Error loading collections</p>`)
  }
})

// New collection form
adminRoutes.get('/collections/new', (c) => {
  return c.html(html`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Collection - SonicJS AI Admin</title>
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
              <span class="text-gray-900">New Collection</span>
            </div>
            <h2 class="text-3xl font-bold text-gray-900">Create New Collection</h2>
            <p class="text-gray-600 mt-2">Define a new content collection with custom fields and settings.</p>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm border p-6">
            <form hx-post="/admin/collections" hx-target="#form-response" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                    Collection Name *
                  </label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    required
                    placeholder="blog_posts"
                    pattern="^[a-z0-9_]+$"
                    class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                  <p class="text-xs text-gray-500 mt-1">Lowercase letters, numbers, and underscores only</p>
                </div>
                
                <div>
                  <label for="displayName" class="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input 
                    type="text" 
                    id="displayName" 
                    name="displayName" 
                    required
                    placeholder="Blog Posts"
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
                  placeholder="Description of this collection..."
                  class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              
              <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div class="flex">
                  <svg class="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                  <div>
                    <h3 class="text-sm font-medium text-yellow-800">
                      Basic Collection Creation
                    </h3>
                    <p class="text-sm text-yellow-700 mt-1">
                      This creates a basic collection. Advanced field definitions and schema management will be available in Stage 5.
                    </p>
                  </div>
                </div>
              </div>
              
              <div class="flex justify-end space-x-3">
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
                  Create Collection
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