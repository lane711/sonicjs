import { Hono } from 'hono'
import { html, raw } from 'hono/html'
import { ContentModelManager } from '../content/models'
import { ContentWorkflow, ContentStatus } from '../content/workflow'
import { ContentVersioning } from '../content/versioning'
import { generateMarkdownHTML, defaultMarkdownConfig } from '../content/rich-text'
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
    
    return c.html(html`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Content Management - SonicJS AI Admin</title>
        <script src="https://unpkg.com/htmx.org@2.0.3"></script>
        <link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css">
        <script src="https://unpkg.com/easymde/dist/easymde.min.js"></script>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          .btn { @apply px-4 py-2 rounded font-medium transition-colors; }
          .btn-primary { @apply bg-blue-600 text-white hover:bg-blue-700; }
          .btn-secondary { @apply bg-gray-200 text-gray-800 hover:bg-gray-300; }
          .btn-success { @apply bg-green-600 text-white hover:bg-green-700; }
          .btn-warning { @apply bg-yellow-600 text-white hover:bg-yellow-700; }
          .btn-danger { @apply bg-red-600 text-white hover:bg-red-700; }
          .btn-sm { @apply px-2 py-1 text-sm; }
        </style>
      </head>
      <body class="bg-gray-50">
        <div class="min-h-screen">
          <!-- Header -->
          <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-4">
                  <h1 class="text-2xl font-bold text-gray-900">Content Management</h1>
                  <nav class="flex space-x-4">
                    <a href="/admin" class="text-gray-600 hover:text-gray-900">Dashboard</a>
                    <a href="/admin/content" class="text-blue-600 font-medium">Content</a>
                    <a href="/admin/collections" class="text-gray-600 hover:text-gray-900">Collections</a>
                    <a href="/admin/users" class="text-gray-600 hover:text-gray-900">Users</a>
                  </nav>
                </div>
                <a href="/admin/content/new" class="btn btn-primary">New Content</a>
              </div>
            </div>
          </header>
          
          <!-- Filters -->
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div class="flex flex-wrap gap-4 items-center">
                <div class="flex items-center space-x-2">
                  <label class="text-sm font-medium text-gray-700">Model:</label>
                  <select 
                    name="model" 
                    class="border border-gray-300 rounded-md px-3 py-1"
                    hx-get="/admin/content"
                    hx-trigger="change"
                    hx-target="#content-list"
                    hx-include="[name='status']"
                  >
                    <option value="all" ${modelName === 'all' ? 'selected' : ''}>All Models</option>
                    ${raw(models.map(model => `
                      <option value="${model.name}" ${modelName === model.name ? 'selected' : ''}>
                        ${model.displayName}
                      </option>
                    `).join(''))}
                  </select>
                </div>
                
                <div class="flex items-center space-x-2">
                  <label class="text-sm font-medium text-gray-700">Status:</label>
                  <select 
                    name="status" 
                    class="border border-gray-300 rounded-md px-3 py-1"
                    hx-get="/admin/content"
                    hx-trigger="change"
                    hx-target="#content-list"
                    hx-include="[name='model']"
                  >
                    <option value="all" ${status === 'all' ? 'selected' : ''}>All Status</option>
                    <option value="draft" ${status === 'draft' ? 'selected' : ''}>Draft</option>
                    <option value="review" ${status === 'review' ? 'selected' : ''}>Under Review</option>
                    <option value="scheduled" ${status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
                    <option value="published" ${status === 'published' ? 'selected' : ''}>Published</option>
                    <option value="archived" ${status === 'archived' ? 'selected' : ''}>Archived</option>
                  </select>
                </div>
                
                <div class="flex items-center space-x-2 ml-auto">
                  <button class="btn btn-secondary" onclick="location.reload()">Refresh</button>
                  <button 
                    class="btn btn-primary"
                    hx-get="/admin/content/bulk-actions"
                    hx-target="#bulk-actions-modal"
                  >
                    Bulk Actions
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Content List -->
            <div id="content-list" class="bg-white rounded-lg shadow-sm overflow-hidden">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input type="checkbox" class="rounded" id="select-all">
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    ${raw(contentItems.map(item => `
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <input type="checkbox" class="rounded content-checkbox" value="${item.id}">
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="flex items-center">
                            <div>
                              <div class="text-sm font-medium text-gray-900">
                                <a href="/admin/content/${item.id}" class="hover:text-blue-600">
                                  ${item.title}
                                </a>
                              </div>
                              <div class="text-sm text-gray-500">${item.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${item.modelName}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          ${item.statusBadge}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${item.authorName}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${item.formattedDate}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div class="flex space-x-2">
                            <a href="/admin/content/${item.id}/edit" class="btn btn-sm btn-primary">Edit</a>
                            <button 
                              class="btn btn-sm btn-secondary"
                              hx-get="/admin/content/${item.id}/versions"
                              hx-target="#versions-modal"
                            >
                              History
                            </button>
                            ${item.availableActions.length > 0 ? `
                              <div class="relative inline-block text-left">
                                <button class="btn btn-sm btn-secondary" onclick="toggleDropdown('${item.id}')">
                                  Actions ▼
                                </button>
                                <div id="dropdown-${item.id}" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                  ${item.availableActions.map((action: string) => `
                                    <button 
                                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      hx-post="/admin/content/${item.id}/workflow"
                                      hx-vals='{"action": "${action}"}'
                                      hx-target="#content-list"
                                      hx-swap="outerHTML"
                                    >
                                      ${action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </button>
                                  `).join('')}
                                </div>
                              </div>
                            ` : ''}
                          </div>
                        </td>
                      </tr>
                    `).join(''))}
                  </tbody>
                </table>
              </div>
              
              <!-- Pagination -->
              <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div class="flex-1 flex justify-between sm:hidden">
                  <button class="btn btn-secondary">Previous</button>
                  <button class="btn btn-secondary">Next</button>
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p class="text-sm text-gray-700">
                      Showing <span class="font-medium">${offset + 1}</span> to 
                      <span class="font-medium">${Math.min(offset + limit, offset + contentItems.length)}</span> of 
                      <span class="font-medium">${contentItems.length}</span> results
                    </p>
                  </div>
                  <div class="flex space-x-2">
                    ${page > 1 ? `
                      <a href="/admin/content?page=${page - 1}&model=${modelName}&status=${status}" 
                         class="btn btn-secondary">Previous</a>
                    ` : ''}
                    <span class="px-3 py-2 text-sm text-gray-700">Page ${page}</span>
                    <a href="/admin/content?page=${page + 1}&model=${modelName}&status=${status}" 
                       class="btn btn-secondary">Next</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modals -->
        <div id="bulk-actions-modal"></div>
        <div id="versions-modal"></div>
        
        <script>
          // Select all functionality
          document.getElementById('select-all').addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.content-checkbox');
            checkboxes.forEach(cb => cb.checked = this.checked);
          });
          
          // Dropdown toggle
          function toggleDropdown(id) {
            const dropdown = document.getElementById('dropdown-' + id);
            dropdown.classList.toggle('hidden');
          }
          
          // Close dropdowns when clicking outside
          document.addEventListener('click', function(event) {
            if (!event.target.closest('.relative')) {
              document.querySelectorAll('[id^="dropdown-"]').forEach(dropdown => {
                dropdown.classList.add('hidden');
              });
            }
          });
        </script>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Error loading content list:', error)
    return c.html(html`<p>Error loading content</p>`)
  }
})

// Helper function to generate form fields for a model
function generateModelFields(model: any): string {
  if (!model || !model.fields) return ''
  
  const fieldEntries = Object.entries(model.fields).sort(([, a]: any, [, b]: any) => 
    (a.ui?.position || 999) - (b.ui?.position || 999)
  )
  
  return fieldEntries.map(([fieldName, fieldConfig]: any) => {
    const required = fieldConfig.required ? 'required' : ''
    const placeholder = fieldConfig.ui?.placeholder || ''
    const helpText = fieldConfig.ui?.helpText || fieldConfig.description || ''
    
    let fieldHTML = ''
    
    switch (fieldConfig.type) {
      case 'text':
      case 'email':
      case 'url':
        fieldHTML = `
          <input 
            type="${fieldConfig.type}" 
            name="${fieldName}" 
            class="form-input" 
            placeholder="${placeholder}"
            ${required}
          >
        `
        break
      case 'textarea':
        fieldHTML = `
          <textarea 
            name="${fieldName}" 
            class="form-textarea" 
            rows="4"
            placeholder="${placeholder}"
            ${required}
          ></textarea>
        `
        break
      case 'rich_text':
        fieldHTML = generateMarkdownHTML(fieldName, '', defaultMarkdownConfig)
        break
      case 'number':
        fieldHTML = `
          <input 
            type="number" 
            name="${fieldName}" 
            class="form-input" 
            placeholder="${placeholder}"
            ${fieldConfig.validation?.min !== undefined ? `min="${fieldConfig.validation.min}"` : ''}
            ${fieldConfig.validation?.max !== undefined ? `max="${fieldConfig.validation.max}"` : ''}
            ${required}
          >
        `
        break
      case 'select':
        const options = fieldConfig.validation?.options || []
        fieldHTML = `
          <select name="${fieldName}" class="form-input" ${required}>
            <option value="">Select ${fieldConfig.label}</option>
            ${options.map((option: string) => `<option value="${option}">${option}</option>`).join('')}
          </select>
        `
        break
      case 'multi_select':
        const multiOptions = fieldConfig.validation?.options || []
        fieldHTML = `
          <select name="${fieldName}" class="form-input" multiple ${required}>
            ${multiOptions.map((option: string) => `<option value="${option}">${option}</option>`).join('')}
          </select>
        `
        break
      case 'boolean':
        fieldHTML = `
          <input type="checkbox" name="${fieldName}" class="rounded" ${required}>
        `
        break
      case 'date':
        fieldHTML = `
          <input type="datetime-local" name="${fieldName}" class="form-input" ${required}>
        `
        break
      default:
        fieldHTML = `
          <input type="text" name="${fieldName}" class="form-input" placeholder="${placeholder}" ${required}>
        `
        break
    }
    
    return `
      <div class="form-group">
        <label class="form-label">
          ${fieldConfig.label}${fieldConfig.required ? ' *' : ''}
        </label>
        ${fieldHTML}
        ${helpText ? `<p class="text-sm text-gray-600 mt-1">${helpText}</p>` : ''}
      </div>
    `
  }).join('')
}

// New content form
adminContentRoutes.get('/new', async (c) => {
  try {
    const models = modelManager.getAllModels()
    if (models.length === 0) {
      return c.html(html`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Content - SonicJS AI Admin</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-gray-50">
          <div class="min-h-screen">
            <header class="bg-white shadow-sm border-b">
              <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-4">
                  <div class="flex items-center space-x-4">
                    <a href="/admin/content" class="text-gray-600 hover:text-gray-900">← Back to Content</a>
                    <h1 class="text-2xl font-bold text-gray-900">Create New Content</h1>
                  </div>
                </div>
              </div>
            </header>
            
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div class="bg-white rounded-lg shadow-sm p-6">
                <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                  <p>No content models are available. Please create a collection first.</p>
                  <a href="/admin/collections/new" class="text-yellow-800 underline">Create a collection</a>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `)
    }
    
    const selectedModel = models[0] // Default to first model
    
    return c.html(html`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Content - SonicJS AI Admin</title>
      <script src="https://unpkg.com/htmx.org@2.0.3"></script>
      <link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css">
      <script src="https://unpkg.com/easymde/dist/easymde.min.js"></script>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <style>
        .btn { @apply px-4 py-2 rounded font-medium transition-colors; }
        .btn-primary { @apply bg-blue-600 text-white hover:bg-blue-700; }
        .btn-secondary { @apply bg-gray-200 text-gray-800 hover:bg-gray-300; }
        .form-group { @apply mb-6; }
        .form-label { @apply block text-sm font-medium text-gray-700 mb-2; }
        .form-input { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500; }
        .form-textarea { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500; }
      </style>
    </head>
    <body class="bg-gray-50">
      <div class="min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b">
          <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
              <div class="flex items-center space-x-4">
                <a href="/admin/content" class="text-gray-600 hover:text-gray-900">← Back to Content</a>
                <h1 class="text-2xl font-bold text-gray-900">Create New Content</h1>
              </div>
            </div>
          </div>
        </header>
        
        <!-- Form -->
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <form hx-post="/admin/content" hx-target="#form-messages">
              <div id="form-messages"></div>
              
              <!-- Model Selection -->
              <div class="form-group">
                <label class="form-label">Content Type</label>
                <select 
                  name="modelName" 
                  class="form-input"
                  hx-get="/admin/content/form-fields"
                  hx-trigger="change"
                  hx-target="#dynamic-fields"
                  required
                >
                  ${raw(models.map(model => `
                    <option value="${model.name}">${model.displayName}</option>
                  `).join(''))}
                </select>
              </div>
              
              <!-- Dynamic Fields -->
              <div id="dynamic-fields">
                ${raw(generateModelFields(selectedModel))}
              </div>
              
              <!-- Actions -->
              <div class="flex justify-between items-center pt-6 border-t">
                <div class="flex space-x-4">
                  <button type="submit" name="status" value="draft" class="btn btn-secondary">
                    Save as Draft
                  </button>
                  <button type="submit" name="status" value="published" class="btn btn-primary">
                    Publish
                  </button>
                </div>
                <a href="/admin/content" class="text-gray-600 hover:text-gray-900">Cancel</a>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <script>
        // Auto-generate slug from title
        function generateSlug(title) {
          return title.toLowerCase()
            .replace(/[^\\w\\s-]/g, '')
            .replace(/\\s+/g, '-')
            .trim();
        }
        
        document.addEventListener('input', function(e) {
          if (e.target.name === 'title') {
            const slugField = document.querySelector('[name="slug"]');
            if (slugField && !slugField.dataset.manual) {
              slugField.value = generateSlug(e.target.value);
            }
          }
        });
        
        document.addEventListener('input', function(e) {
          if (e.target.name === 'slug') {
            e.target.dataset.manual = 'true';
          }
        });
      </script>
    </body>
    </html>
  `)
  } catch (error) {
    console.error('Error loading content form:', error)
    return c.html(html`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error - SonicJS AI Admin</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body class="bg-gray-50">
        <div class="min-h-screen flex items-center justify-center">
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <h1 class="text-2xl font-bold text-red-600 mb-4">Error Loading Form</h1>
            <p class="text-gray-600 mb-4">There was an error loading the content creation form.</p>
            <a href="/admin/content" class="text-blue-600 hover:underline">← Back to Content</a>
          </div>
        </div>
      </body>
      </html>
    `)
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

