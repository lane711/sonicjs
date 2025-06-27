import { Hono } from 'hono'
import { html, raw } from 'hono/html'
import { renderDashboardPage, renderStatsCards, DashboardPageData, DashboardStats } from '../templates/pages/admin-dashboard-v2.template'
import { renderCollectionsListPage, CollectionsListPageData, Collection } from '../templates/pages/admin-collections-list.template'
import { renderCollectionFormPage, CollectionFormData } from '../templates/pages/admin-collections-form.template'
import { renderPluginsListPage, PluginsListPageData, generateMockPlugins } from '../templates/pages/admin-plugins-list.template'
import { renderSettingsPage, SettingsPageData } from '../templates/pages/admin-settings.template'
import { renderAPIReferencePage, APIReferencePageData, APIEndpoint } from '../templates/pages/admin-api-reference.template'

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
    const stmt = db.prepare('SELECT id, name, display_name, description, created_at FROM collections WHERE is_active = 1 ORDER BY created_at DESC')
    const { results } = await stmt.all()
    
    const collections: Collection[] = (results || [])
      .filter((row: any) => row && row.id)
      .map((row: any) => {
        return {
          id: String(row.id || ''),
          name: String(row.name || ''),
          display_name: String(row.display_name || ''),
          description: row.description ? String(row.description) : undefined,
          created_at: Number(row.created_at || 0),
          formattedDate: row.created_at ? new Date(Number(row.created_at)).toLocaleDateString() : 'Unknown'
        }
      })
    
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
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        Collection created successfully! Redirecting...
        <script>
          setTimeout(() => {
            window.location.href = '/admin/collections';
          }, 1500);
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
    const user = c.get('user')
    const db = c.env.DB
    
    const stmt = db.prepare('SELECT * FROM collections WHERE id = ?')
    const collection = await stmt.bind(id).first() as any
    
    if (!collection) {
      const formData: CollectionFormData = {
        isEdit: true,
        error: 'Collection not found.',
        user: user ? {
          name: user.email,
          email: user.email,
          role: user.role
        } : undefined
      }
      return c.html(renderCollectionFormPage(formData))
    }
    
    const formData: CollectionFormData = {
      id: collection.id,
      name: collection.name,
      display_name: collection.display_name,
      description: collection.description,
      isEdit: true,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined
    }
    
    return c.html(renderCollectionFormPage(formData))
  } catch (error) {
    console.error('Error fetching collection:', error)
    const user = c.get('user')
    const formData: CollectionFormData = {
      isEdit: true,
      error: 'Failed to load collection.',
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined
    }
    return c.html(renderCollectionFormPage(formData))
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
    
    return c.html(html`
      <script>
        window.location.href = '/admin/collections';
      </script>
    `)
  } catch (error) {
    console.error('Error deleting collection:', error)
    return c.html(html`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Failed to delete collection. Please try again.
      </div>
    `)
  }
})

// Users management routes
adminRoutes.get('/users', async (c) => {
  try {
    const user = c.get('user')
    const db = c.env.DB
    const url = new URL(c.req.url)
    
    // Get query parameters
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const search = url.searchParams.get('search') || ''
    const role = url.searchParams.get('role') || ''
    const status = url.searchParams.get('status') || ''
    const offset = (page - 1) * limit
    
    // Build where conditions
    const conditions: string[] = []
    const params: any[] = []
    
    if (search) {
      conditions.push('(email LIKE ? OR username LIKE ? OR first_name LIKE ? OR last_name LIKE ?)')
      const searchParam = `%${search}%`
      params.push(searchParam, searchParam, searchParam, searchParam)
    }
    
    if (role) {
      conditions.push('role = ?')
      params.push(role)
    }
    
    if (status === 'active') {
      conditions.push('is_active = ?')
      params.push(1)
    } else if (status === 'inactive') {
      conditions.push('is_active = ?')
      params.push(0)
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    
    // Get total count
    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM users ${whereClause}`)
    const countResult = await countStmt.bind(...params).first() as any
    const totalUsers = countResult?.count || 0
    const totalPages = Math.ceil(totalUsers / limit)
    
    // Get users
    const usersStmt = db.prepare(`
      SELECT id, email, username, first_name, last_name, role, avatar, is_active, 
             last_login_at, created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `)
    const { results } = await usersStmt.bind(...params, limit, offset).all()
    
    const users = (results || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      avatar: u.avatar,
      isActive: u.is_active === 1,
      lastLoginAt: u.last_login_at,
      createdAt: u.created_at,
      updatedAt: u.updated_at
    }))
    
    const { renderUsersListPage } = await import('../templates/pages/admin-users-list.template')
    
    const pageData = {
      users,
      currentPage: page,
      totalPages,
      totalUsers,
      pagination: totalPages > 1 ? {
        currentPage: page,
        totalPages,
        totalItems: totalUsers,
        itemsPerPage: limit,
        startItem: offset + 1,
        endItem: Math.min(offset + limit, totalUsers),
        baseUrl: '/admin/users'
      } : undefined,
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined
    }
    
    return c.html(renderUsersListPage(pageData))
  } catch (error) {
    console.error('Error fetching users:', error)
    return c.html(`<p>Error loading users: ${error}</p>`)
  }
})

// Toggle user status
adminRoutes.post('/users/:id/toggle', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const active = body.active
    
    const db = c.env.DB
    const updateStmt = db.prepare('UPDATE users SET is_active = ?, updated_at = ? WHERE id = ?')
    await updateStmt.bind(active ? 1 : 0, Date.now(), id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Error toggling user status:', error)
    return c.json({ success: false, error: 'Failed to update user status' })
  }
})

// Export users
adminRoutes.get('/users/export', async (c) => {
  try {
    const db = c.env.DB
    const stmt = db.prepare(`
      SELECT email, username, first_name, last_name, role, is_active, 
             last_login_at, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `)
    const { results } = await stmt.all()
    
    // Convert to CSV
    const headers = ['Email', 'Username', 'First Name', 'Last Name', 'Role', 'Active', 'Last Login', 'Created', 'Updated']
    const csvRows = [headers.join(',')]
    
    results?.forEach((user: any) => {
      const row = [
        user.email,
        user.username,
        user.first_name,
        user.last_name,
        user.role,
        user.is_active ? 'Yes' : 'No',
        user.last_login_at ? new Date(user.last_login_at).toISOString() : '',
        new Date(user.created_at).toISOString(),
        new Date(user.updated_at).toISOString()
      ]
      csvRows.push(row.join(','))
    })
    
    const csv = csvRows.join('\n')
    
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="users-export.csv"'
      }
    })
  } catch (error) {
    console.error('Error exporting users:', error)
    return c.json({ error: 'Failed to export users' }, 500)
  }
})

// Plugins management
adminRoutes.get('/plugins', (c) => {
  const user = c.get('user')
  const plugins = generateMockPlugins()
  
  const stats = {
    total: plugins.length,
    active: plugins.filter(p => p.status === 'active').length,
    inactive: plugins.filter(p => p.status === 'inactive').length,
    errors: plugins.filter(p => p.status === 'error').length
  }
  
  const pageData: PluginsListPageData = {
    plugins,
    stats,
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined
  }
  
  return c.html(renderPluginsListPage(pageData))
})

// Settings page
adminRoutes.get('/settings', (c) => {
  const user = c.get('user')
  const url = new URL(c.req.url)
  const activeTab = url.searchParams.get('tab') || 'general'
  
  // Mock settings data - in a real app, this would come from database
  const mockSettings = {
    general: {
      siteName: 'SonicJS AI',
      siteDescription: 'A modern headless CMS powered by AI',
      adminEmail: user?.email || 'admin@example.com',
      timezone: 'UTC',
      language: 'en',
      maintenanceMode: false
    },
    appearance: {
      theme: 'dark' as const,
      primaryColor: '#465FFF',
      logoUrl: '',
      favicon: '',
      customCSS: ''
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      passwordRequirements: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: false
      },
      ipWhitelist: []
    },
    notifications: {
      emailNotifications: true,
      contentUpdates: true,
      systemAlerts: true,
      userRegistrations: false,
      emailFrequency: 'immediate' as const
    },
    storage: {
      maxFileSize: 10,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'docx'],
      storageProvider: 'cloudflare' as const,
      backupFrequency: 'daily' as const,
      retentionPeriod: 30
    }
  }
  
  const pageData: SettingsPageData = {
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined,
    settings: mockSettings,
    activeTab
  }
  
  return c.html(renderSettingsPage(pageData))
})

// Save settings
adminRoutes.post('/settings', async (c) => {
  try {
    const formData = await c.req.formData()
    
    // Here you would save the settings to your database
    // For now, we'll just return a success message
    
    return c.html(html`
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        Settings saved successfully!
        <script>
          setTimeout(() => {
            showNotification('Settings saved successfully!', 'success');
          }, 100);
        </script>
      </div>
    `)
  } catch (error) {
    console.error('Error saving settings:', error)
    return c.html(html`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Failed to save settings. Please try again.
      </div>
    `)
  }
})

// API Reference page
adminRoutes.get('/api-reference', (c) => {
  const user = c.get('user')
  
  // Define all API endpoints
  const endpoints: APIEndpoint[] = [
    // API Routes
    { method: 'GET', path: '/api/', description: 'Returns OpenAPI specification for the API', authentication: false, category: 'System' },
    { method: 'GET', path: '/api/health', description: 'Health check endpoint that returns status, timestamp, and available schemas', authentication: false, category: 'System' },
    { method: 'GET', path: '/api/collections', description: 'Retrieves all active collections from the database', authentication: false, category: 'Content' },
    { method: 'GET', path: '/api/content', description: 'Retrieves content items with pagination (limit 50)', authentication: false, category: 'Content' },
    { method: 'GET', path: '/api/collections/:collection/content', description: 'Gets content for a specific collection', authentication: false, category: 'Content' },
    
    // API Media Routes
    { method: 'POST', path: '/api/media/upload', description: 'Upload a single file to R2 storage', authentication: true, category: 'Media' },
    { method: 'POST', path: '/api/media/upload-multiple', description: 'Upload multiple files at once (batch upload)', authentication: true, category: 'Media' },
    { method: 'POST', path: '/api/media/bulk-delete', description: 'Delete multiple files (max 50 per operation)', authentication: true, category: 'Media' },
    { method: 'DELETE', path: '/api/media/:id', description: 'Delete a single media file (soft delete)', authentication: true, category: 'Media' },
    { method: 'PATCH', path: '/api/media/:id', description: 'Update file metadata (alt text, caption, tags, folder)', authentication: true, category: 'Media' },
    
    // Auth Routes
    { method: 'GET', path: '/auth/login', description: 'Display login page HTML form', authentication: false, category: 'Auth' },
    { method: 'GET', path: '/auth/register', description: 'Display registration page HTML form', authentication: false, category: 'Auth' },
    { method: 'POST', path: '/auth/register', description: 'Register new user (JSON API)', authentication: false, category: 'Auth' },
    { method: 'POST', path: '/auth/login', description: 'User login (JSON API)', authentication: false, category: 'Auth' },
    { method: 'POST', path: '/auth/logout', description: 'Log out user (clears auth cookie)', authentication: false, category: 'Auth' },
    { method: 'GET', path: '/auth/logout', description: 'Log out user and redirect to login page', authentication: false, category: 'Auth' },
    { method: 'GET', path: '/auth/me', description: 'Get current authenticated user details', authentication: true, category: 'Auth' },
    { method: 'POST', path: '/auth/refresh', description: 'Refresh authentication token', authentication: true, category: 'Auth' },
    { method: 'POST', path: '/auth/register/form', description: 'Form-based registration handler for HTML forms', authentication: false, category: 'Auth' },
    { method: 'POST', path: '/auth/login/form', description: 'Form-based login handler for HTML forms', authentication: false, category: 'Auth' },
    { method: 'POST', path: '/auth/seed-admin', description: 'Create test admin user (development only)', authentication: false, category: 'Auth' },
    { method: 'POST', path: '/auth/normalize-emails', description: 'Normalize existing emails to lowercase (migration tool)', authentication: true, category: 'Auth' },
    
    // Content Routes
    { method: 'GET', path: '/content/health', description: 'Health check for content API', authentication: false, category: 'System' },
    
    // Media Routes
    { method: 'GET', path: '/media/serve/:key', description: 'Serve media files from R2 storage', authentication: false, category: 'Media' },
    { method: 'GET', path: '/media/', description: 'Get all media files with filtering and pagination', authentication: false, category: 'Media' },
    { method: 'POST', path: '/media/upload', description: 'Upload media files (with HTMX support)', authentication: true, category: 'Media' },
    { method: 'GET', path: '/media/:id', description: 'Get single media file details', authentication: false, category: 'Media' },
    { method: 'PUT', path: '/media/:id', description: 'Update media file metadata', authentication: true, category: 'Media' },
    { method: 'DELETE', path: '/media/:id', description: 'Delete media file (soft delete)', authentication: true, category: 'Media' },
    { method: 'POST', path: '/media/bulk', description: 'Bulk operations on media (delete, move, tag)', authentication: true, category: 'Media' },
    { method: 'GET', path: '/media/stats/overview', description: 'Get media statistics and overview', authentication: false, category: 'Media' },
    { method: 'GET', path: '/media/folders', description: 'Get list of media folders with file counts', authentication: false, category: 'Media' },
    
    // Admin Routes
    { method: 'GET', path: '/admin/', description: 'Admin dashboard main page', authentication: true, category: 'Admin' },
    { method: 'GET', path: '/admin/api/stats', description: 'Get dashboard statistics (HTMX endpoint)', authentication: true, category: 'Admin' },
    { method: 'GET', path: '/admin/collections', description: 'List all collections', authentication: true, category: 'Admin' },
    { method: 'GET', path: '/admin/collections/new', description: 'New collection form', authentication: true, category: 'Admin' },
    { method: 'POST', path: '/admin/collections', description: 'Create new collection', authentication: true, category: 'Admin' },
    { method: 'GET', path: '/admin/collections/:id', description: 'Edit collection form', authentication: true, category: 'Admin' },
    { method: 'PUT', path: '/admin/collections/:id', description: 'Update collection', authentication: true, category: 'Admin' },
    { method: 'DELETE', path: '/admin/collections/:id', description: 'Delete collection', authentication: true, category: 'Admin' },
    { method: 'GET', path: '/admin/users', description: 'List users with pagination and filtering', authentication: true, category: 'Admin' },
    { method: 'POST', path: '/admin/users/:id/toggle', description: 'Toggle user active status', authentication: true, category: 'Admin' },
    { method: 'GET', path: '/admin/users/export', description: 'Export users to CSV', authentication: true, category: 'Admin' },
    { method: 'GET', path: '/admin/plugins', description: 'List plugins page', authentication: true, category: 'Admin' },
    { method: 'GET', path: '/admin/settings', description: 'Settings page with tabs', authentication: true, category: 'Admin' },
    { method: 'POST', path: '/admin/settings', description: 'Save settings', authentication: true, category: 'Admin' },
    { method: 'GET', path: '/admin/content/', description: 'List content with filtering and pagination', authentication: true, category: 'Admin' },
    { method: 'GET', path: '/admin/content/new', description: 'New content form', authentication: true, category: 'Admin' },
    { method: 'POST', path: '/admin/content/', description: 'Create new content', authentication: true, category: 'Admin' },
    { method: 'GET', path: '/admin/content/:id/edit', description: 'Edit content form', authentication: true, category: 'Admin' },
    { method: 'PUT', path: '/admin/content/:id', description: 'Update content', authentication: true, category: 'Admin' },
    { method: 'DELETE', path: '/admin/content/:id', description: 'Delete content', authentication: true, category: 'Admin' },
    { method: 'GET', path: '/admin/media/', description: 'Media library main page with grid/list view', authentication: true, category: 'Admin' },
    { method: 'GET', path: '/admin/media/search', description: 'Search media files (HTMX endpoint)', authentication: true, category: 'Admin' },
    { method: 'GET', path: '/admin/media/:id/details', description: 'Get file details modal (HTMX endpoint)', authentication: true, category: 'Admin' },
    { method: 'POST', path: '/admin/media/upload', description: 'Upload files (HTMX compatible)', authentication: true, category: 'Admin' },
    { method: 'PUT', path: '/admin/media/:id', description: 'Update media file metadata (HTMX compatible)', authentication: true, category: 'Admin' },
    { method: 'DELETE', path: '/admin/media/:id', description: 'Delete media file (HTMX compatible)', authentication: true, category: 'Admin' },
    { method: 'GET', path: '/admin/faq/', description: 'List FAQs with filtering and pagination', authentication: true, category: 'Admin' },
    { method: 'GET', path: '/admin/faq/new', description: 'New FAQ form', authentication: true, category: 'Admin' },
    { method: 'POST', path: '/admin/faq/', description: 'Create new FAQ', authentication: true, category: 'Admin' },
    { method: 'GET', path: '/admin/faq/:id', description: 'Edit FAQ form', authentication: true, category: 'Admin' },
    { method: 'PUT', path: '/admin/faq/:id', description: 'Update FAQ', authentication: true, category: 'Admin' },
    { method: 'DELETE', path: '/admin/faq/:id', description: 'Delete FAQ', authentication: true, category: 'Admin' },
    { method: 'GET', path: '/admin/api-reference', description: 'API documentation and reference', authentication: true, category: 'Admin' }
  ]

  const pageData: APIReferencePageData = {
    endpoints,
    user: user ? {
      name: user.email,
      email: user.email,
      role: user.role
    } : undefined
  }

  return c.html(renderAPIReferencePage(pageData))
})

// Populate database with dummy content (development only)
adminRoutes.post('/populate-dummy-content', async (c) => {
  try {
    const user = c.get('user')
    
    // Only allow admin users to populate dummy content
    if (!user || user.role !== 'admin') {
      return c.json({ error: 'Unauthorized. Admin access required.' }, 403)
    }
    
    const db = c.env.DB
    
    // Import the populate function
    const { populateDatabase } = await import('../scripts/populate-dummy-content')
    
    // Execute the population
    const result = await populateDatabase(db)
    
    return c.json(result)
  } catch (error) {
    console.error('Error in populate-dummy-content route:', error)
    return c.json({ 
      success: false, 
      message: `Failed to populate database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      count: 0
    }, 500)
  }
})

export default adminRoutes