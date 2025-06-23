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
          <a href="/admin/collections">Collections</a>
          <a href="/admin/content">Content</a>
          <a href="/admin/media">Media</a>
          <a href="/admin/users">Users</a>
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
    const collectionsStmt = db.prepare('SELECT COUNT(*) as count FROM collections WHERE isActive = 1')
    const collectionsResult = await collectionsStmt.first()
    
    // Get content count
    const contentStmt = db.prepare('SELECT COUNT(*) as count FROM content')
    const contentResult = await contentStmt.first()
    
    // Get media count
    const mediaStmt = db.prepare('SELECT COUNT(*) as count FROM media')
    const mediaResult = await mediaStmt.first()
    
    // Get users count
    const usersStmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE isActive = 1')
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
    const stmt = db.prepare('SELECT * FROM collections WHERE isActive = 1 ORDER BY createdAt DESC')
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
                    <td>${collection.displayName}</td>
                    <td>${collection.description || '-'}</td>
                    <td>${new Date(collection.createdAt).toLocaleDateString()}</td>
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