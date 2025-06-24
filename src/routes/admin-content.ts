import { Hono } from 'hono'
import { html } from 'hono/html'
import { ContentModelManager } from '../content/models'
import { ContentWorkflow, ContentStatus } from '../content/workflow'
import { ContentVersioning } from '../content/versioning'
import { RichTextProcessor, generateRichTextHTML, defaultRichTextConfig } from '../content/rich-text'
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
      SELECT c.*, u.firstName, u.lastName 
      FROM content c 
      LEFT JOIN users u ON c.authorId = u.id
    `
    const params: any[] = []
    const conditions: string[] = []
    
    if (modelName !== 'all') {
      conditions.push('c.modelName = ?')
      params.push(modelName)
    }
    
    if (status !== 'all') {
      conditions.push('c.status = ?')
      params.push(status)
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }
    
    query += ` ORDER BY c.updatedAt DESC LIMIT ${limit} OFFSET ${offset}`
    
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
        authorName: `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Unknown',
        formattedDate: new Date(row.updatedAt).toLocaleDateString(),
        statusBadge: ContentWorkflow.generateStatusBadge(row.status as ContentStatus),
        availableActions: ContentWorkflow.getAvailableActions(
          row.status as ContentStatus,
          user.role,
          row.authorId === user.userId
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
        <script src="https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js"></script>
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
                    ${models.map(model => html`
                      <option value="${model.name}" ${modelName === model.name ? 'selected' : ''}>
                        ${model.displayName}
                      </option>
                    `).join('')}
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
                    ${contentItems.map(item => html`
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
                            ${item.availableActions.length > 0 ? html`
                              <div class="relative inline-block text-left">
                                <button class="btn btn-sm btn-secondary" onclick="toggleDropdown('${item.id}')">
                                  Actions ▼
                                </button>
                                <div id="dropdown-${item.id}" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                  ${item.availableActions.map((action: string) => html`
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
                    `).join('')}
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
                    ${page > 1 ? html`
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

// New content form
adminContentRoutes.get('/new', async (c) => {
  const models = modelManager.getAllModels()
  const selectedModel = models[0] // Default to first model
  
  return c.html(html`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Content - SonicJS AI Admin</title>
      <script src="https://unpkg.com/htmx.org@2.0.3"></script>
      <script src="https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js"></script>
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
            <form hx-post="/content" hx-target="#form-messages">
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
                  ${models.map(model => html`
                    <option value="${model.name}">${model.displayName}</option>
                  `).join('')}
                </select>
              </div>
              
              <!-- Dynamic Fields -->
              <div id="dynamic-fields">
                ${this.generateModelFields(selectedModel)}
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
})

// Helper method to generate form fields for a model
adminContentRoutes.generateModelFields = function(model: any): string {
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
        fieldHTML = generateRichTextHTML(fieldName, '', defaultRichTextConfig)
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
      case 'boolean':
        fieldHTML = `
          <div class="flex items-center">
            <input 
              type="checkbox" 
              name="${fieldName}" 
              value="true"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            >
            <span class="ml-2 text-sm text-gray-600">${fieldConfig.label}</span>
          </div>
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
      case 'date':
        fieldHTML = `
          <input 
            type="datetime-local" 
            name="${fieldName}" 
            class="form-input" 
            ${required}
          >
        `
        break
      default:
        fieldHTML = `
          <input 
            type="text" 
            name="${fieldName}" 
            class="form-input" 
            placeholder="${placeholder}"
            ${required}
          >
        `
    }
    
    return `
      <div class="form-group">
        <label class="form-label">
          ${fieldConfig.label}
          ${fieldConfig.required ? '<span class="text-red-500">*</span>' : ''}
        </label>
        ${fieldHTML}
        ${helpText ? `<p class="mt-1 text-sm text-gray-500">${helpText}</p>` : ''}
      </div>
    `
  }).join('')
}