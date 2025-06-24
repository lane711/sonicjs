import { Hono } from 'hono'
import { html } from 'hono/html'
import { requireAuth, requireRole } from '../middleware/auth'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
  MEDIA_BUCKET?: R2Bucket
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

export const adminMediaRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Media library main page
adminMediaRoutes.get('/', async (c) => {
  try {
    const user = c.get('user')
    const { searchParams } = new URL(c.req.url)
    const folder = searchParams.get('folder') || 'all'
    const type = searchParams.get('type') || 'all'
    const view = searchParams.get('view') || 'grid'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 24
    const offset = (page - 1) * limit
    
    const db = c.env.DB
    
    // Build query for media files
    let query = 'SELECT * FROM media'
    const params: any[] = []
    const conditions: string[] = []
    
    if (folder !== 'all') {
      conditions.push('folder = ?')
      params.push(folder)
    }
    
    if (type !== 'all') {
      switch (type) {
        case 'images':
          conditions.push('mime_type LIKE ?')
          params.push('image/%')
          break
        case 'documents':
          conditions.push('mime_type IN (?, ?, ?)')
          params.push('application/pdf', 'text/plain', 'application/msword')
          break
        case 'videos':
          conditions.push('mime_type LIKE ?')
          params.push('video/%')
          break
      }
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }
    
    query += ` ORDER BY uploaded_at DESC LIMIT ${limit} OFFSET ${offset}`
    
    const stmt = db.prepare(query)
    const { results } = await stmt.bind(...params).all()
    
    // Get folder statistics
    const foldersStmt = db.prepare(`
      SELECT folder, COUNT(*) as count, SUM(size) as totalSize
      FROM media 
      GROUP BY folder 
      ORDER BY folder
    `)
    const { results: folders } = await foldersStmt.all()
    
    // Get type statistics
    const typesStmt = db.prepare(`
      SELECT 
        CASE 
          WHEN mimeType LIKE 'image/%' THEN 'images'
          WHEN mimeType LIKE 'video/%' THEN 'videos'
          WHEN mimeType IN ('application/pdf', 'text/plain') THEN 'documents'
          ELSE 'other'
        END as type,
        COUNT(*) as count
      FROM media 
      GROUP BY type
    `)
    const { results: types } = await typesStmt.all()
    
    // Process media files
    const mediaFiles = results.map((row: any) => ({
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : [],
      uploadedAt: new Date(row.uploaded_at).toLocaleDateString(),
      fileSize: formatFileSize(row.size),
      isImage: row.mime_type.startsWith('image/'),
      isVideo: row.mime_type.startsWith('video/'),
      isDocument: !row.mime_type.startsWith('image/') && !row.mime_type.startsWith('video/')
    }))
    
    return c.html(html`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Media Library - SonicJS AI Admin</title>
        <script src="https://unpkg.com/htmx.org@2.0.3"></script>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <script src="https://unpkg.com/sortablejs@1.15.0/Sortable.min.js"></script>
        <style>
          .media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
          .media-item { position: relative; border-radius: 8px; overflow: hidden; transition: transform 0.2s; }
          .media-item:hover { transform: scale(1.02); }
          .media-item.selected { ring: 2px solid #3B82F6; }
          .upload-zone { border: 2px dashed #D1D5DB; background: #F9FAFB; min-height: 200px; }
          .upload-zone.dragover { border-color: #3B82F6; background: #EBF8FF; }
          .file-icon { width: 48px; height: 48px; }
          .preview-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); opacity: 0; transition: opacity 0.2s; }
          .media-item:hover .preview-overlay { opacity: 1; }
        </style>
      </head>
      <body class="bg-gray-50">
        <div class="min-h-screen">
          <!-- Header -->
          <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex justify-between items-center py-4">
                <div class="flex items-center space-x-4">
                  <h1 class="text-2xl font-bold text-gray-900">Media Library</h1>
                  <nav class="flex space-x-4">
                    <a href="/admin" class="text-gray-600 hover:text-gray-900">Dashboard</a>
                    <a href="/admin/content" class="text-gray-600 hover:text-gray-900">Content</a>
                    <a href="/admin/media" class="text-blue-600 font-medium">Media</a>
                    <a href="/admin/collections" class="text-gray-600 hover:text-gray-900">Collections</a>
                  </nav>
                </div>
                <div class="flex items-center space-x-2">
                  <button 
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onclick="document.getElementById('upload-modal').classList.remove('hidden')"
                  >
                    Upload Files
                  </button>
                </div>
              </div>
            </div>
          </header>
          
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex gap-6">
              <!-- Sidebar -->
              <div class="w-64 bg-white rounded-lg shadow-sm p-6">
                <div class="space-y-6">
                  <!-- Folders -->
                  <div>
                    <h3 class="text-sm font-medium text-gray-900 mb-3">Folders</h3>
                    <ul class="space-y-1">
                      <li>
                        <a href="/admin/media?folder=all" 
                           class="block px-3 py-2 text-sm rounded-md ${folder === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}">
                          All Files (${results.length})
                        </a>
                      </li>
                      ${folders.map((f: any) => html`
                        <li>
                          <a href="/admin/media?folder=${f.folder}" 
                             class="block px-3 py-2 text-sm rounded-md ${folder === f.folder ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}">
                            ${f.folder} (${f.count})
                          </a>
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                  
                  <!-- File Types -->
                  <div>
                    <h3 class="text-sm font-medium text-gray-900 mb-3">File Types</h3>
                    <ul class="space-y-1">
                      <li>
                        <a href="/admin/media?type=all" 
                           class="block px-3 py-2 text-sm rounded-md ${type === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}">
                          All Types
                        </a>
                      </li>
                      ${types.map((t: any) => html`
                        <li>
                          <a href="/admin/media?type=${t.type}" 
                             class="block px-3 py-2 text-sm rounded-md ${type === t.type ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}">
                            ${t.type.charAt(0).toUpperCase() + t.type.slice(1)} (${t.count})
                          </a>
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                  
                  <!-- Quick Actions -->
                  <div>
                    <h3 class="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
                    <div class="space-y-2">
                      <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                        Create Folder
                      </button>
                      <button 
                        class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                        hx-delete="/media/cleanup"
                        hx-confirm="Delete unused files?"
                      >
                        Cleanup Unused
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Main Content -->
              <div class="flex-1">
                <!-- Toolbar -->
                <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div class="flex items-center space-x-2">
                        <label class="text-sm font-medium text-gray-700">View:</label>
                        <select class="border border-gray-300 rounded-md px-3 py-1 text-sm">
                          <option value="grid" ${view === 'grid' ? 'selected' : ''}>Grid</option>
                          <option value="list" ${view === 'list' ? 'selected' : ''}>List</option>
                        </select>
                      </div>
                      
                      <div class="flex items-center space-x-2">
                        <input 
                          type="text" 
                          placeholder="Search files..." 
                          class="border border-gray-300 rounded-md px-3 py-1 text-sm w-64"
                          hx-get="/admin/media/search"
                          hx-trigger="keyup changed delay:300ms"
                          hx-target="#media-grid"
                        >
                      </div>
                    </div>
                    
                    <div class="flex items-center space-x-2">
                      <span class="text-sm text-gray-500">${results.length} files</span>
                      <button 
                        id="select-all-btn"
                        class="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                        onclick="toggleSelectAll()"
                      >
                        Select All
                      </button>
                      <button 
                        id="bulk-actions-btn"
                        class="px-3 py-1 text-sm bg-gray-200 text-gray-400 rounded-md cursor-not-allowed"
                        disabled
                      >
                        Bulk Actions
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Media Grid -->
                <div id="media-grid" class="media-grid">
                  ${mediaFiles.map(file => generateMediaItemHTML(file)).join('')}
                </div>
                
                <!-- Pagination -->
                ${results.length === limit ? html`
                  <div class="mt-6 flex justify-center">
                    <div class="flex space-x-2">
                      ${page > 1 ? html`
                        <a href="/admin/media?page=${page - 1}&folder=${folder}&type=${type}" 
                           class="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                          Previous
                        </a>
                      ` : ''}
                      <span class="px-3 py-2 text-sm text-gray-700">Page ${page}</span>
                      <a href="/admin/media?page=${page + 1}&folder=${folder}&type=${type}" 
                         class="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                        Next
                      </a>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Upload Modal -->
        <div id="upload-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium">Upload Files</h3>
              <button onclick="document.getElementById('upload-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <!-- Upload Form -->
            <form 
              id="upload-form"
              hx-post="/media/upload/bulk"
              hx-encoding="multipart/form-data"
              hx-target="#upload-results"
              class="space-y-4"
            >
              <!-- Drag and Drop Zone -->
              <div 
                id="upload-zone"
                class="upload-zone border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer"
                onclick="document.getElementById('file-input').click()"
              >
                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div class="mt-4">
                  <p class="text-lg text-gray-600">Drop files here or click to upload</p>
                  <p class="text-sm text-gray-500">PNG, JPG, GIF, PDF up to 10MB</p>
                </div>
              </div>
              
              <input 
                type="file" 
                id="file-input" 
                name="files" 
                multiple 
                accept="image/*,application/pdf,text/plain"
                class="hidden"
                onchange="handleFileSelect(this.files)"
              >
              
              <!-- Folder Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Upload to folder:</label>
                <select name="folder" class="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="uploads">uploads</option>
                  <option value="images">images</option>
                  <option value="documents">documents</option>
                </select>
              </div>
              
              <!-- File List -->
              <div id="file-list" class="hidden">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                <div id="selected-files" class="space-y-2 max-h-40 overflow-y-auto"></div>
              </div>
              
              <!-- Upload Button -->
              <div class="flex justify-end space-x-2">
                <button 
                  type="button" 
                  onclick="document.getElementById('upload-modal').classList.add('hidden')"
                  class="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  id="upload-btn"
                  class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled
                >
                  Upload Files
                </button>
              </div>
            </form>
            
            <!-- Upload Results -->
            <div id="upload-results" class="mt-4"></div>
          </div>
        </div>
        
        <!-- File Details Modal -->
        <div id="file-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div id="file-modal-content" class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <!-- Content loaded via HTMX -->
          </div>
        </div>
        
        <script>
          let selectedFiles = new Set();
          let dragDropFiles = [];
          
          // File selection handling
          function toggleFileSelection(fileId) {
            if (selectedFiles.has(fileId)) {
              selectedFiles.delete(fileId);
              document.querySelector([\`[data-file-id="\${fileId}"]\`]).classList.remove('selected');
            } else {
              selectedFiles.add(fileId);
              document.querySelector([\`[data-file-id="\${fileId}"]\`]).classList.add('selected');
            }
            updateBulkActionsButton();
          }
          
          function toggleSelectAll() {
            const allItems = document.querySelectorAll('[data-file-id]');
            if (selectedFiles.size === allItems.length) {
              // Deselect all
              selectedFiles.clear();
              allItems.forEach(item => item.classList.remove('selected'));
              document.getElementById('select-all-btn').textContent = 'Select All';
            } else {
              // Select all
              allItems.forEach(item => {
                const fileId = item.dataset.fileId;
                selectedFiles.add(fileId);
                item.classList.add('selected');
              });
              document.getElementById('select-all-btn').textContent = 'Deselect All';
            }
            updateBulkActionsButton();
          }
          
          function updateBulkActionsButton() {
            const btn = document.getElementById('bulk-actions-btn');
            if (selectedFiles.size > 0) {
              btn.disabled = false;
              btn.className = 'px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700';
              btn.textContent = \`Actions (\${selectedFiles.size})\`;
            } else {
              btn.disabled = true;
              btn.className = 'px-3 py-1 text-sm bg-gray-200 text-gray-400 rounded-md cursor-not-allowed';
              btn.textContent = 'Bulk Actions';
            }
          }
          
          // Drag and drop handling
          const uploadZone = document.getElementById('upload-zone');
          
          ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, preventDefaults, false);
          });
          
          function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
          }
          
          ['dragenter', 'dragover'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => uploadZone.classList.add('dragover'), false);
          });
          
          ['dragleave', 'drop'].forEach(eventName => {
            uploadZone.addEventListener(eventName, () => uploadZone.classList.remove('dragover'), false);
          });
          
          uploadZone.addEventListener('drop', handleDrop, false);
          
          function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFileSelect(files);
          }
          
          function handleFileSelect(files) {
            dragDropFiles = Array.from(files);
            displaySelectedFiles();
            document.getElementById('upload-btn').disabled = false;
          }
          
          function displaySelectedFiles() {
            const fileList = document.getElementById('file-list');
            const selectedFilesDiv = document.getElementById('selected-files');
            
            selectedFilesDiv.innerHTML = '';
            
            dragDropFiles.forEach((file, index) => {
              const fileItem = document.createElement('div');
              fileItem.className = 'flex items-center justify-between p-2 bg-gray-50 rounded';
              fileItem.innerHTML = \`
                <div class="flex items-center space-x-2">
                  <span class="text-sm">\${file.name}</span>
                  <span class="text-xs text-gray-500">(\${formatFileSize(file.size)})</span>
                </div>
                <button onclick="removeFile(\${index})" class="text-red-500 hover:text-red-700">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              \`;
              selectedFilesDiv.appendChild(fileItem);
            });
            
            fileList.classList.toggle('hidden', dragDropFiles.length === 0);
          }
          
          function removeFile(index) {
            dragDropFiles.splice(index, 1);
            displaySelectedFiles();
            
            // Update file input
            const fileInput = document.getElementById('file-input');
            const dt = new DataTransfer();
            dragDropFiles.forEach(file => dt.items.add(file));
            fileInput.files = dt.files;
            
            document.getElementById('upload-btn').disabled = dragDropFiles.length === 0;
          }
          
          function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
          }
          
          // Copy to clipboard function
          function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
              // Show a temporary notification
              const notification = document.createElement('div');
              notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
              notification.textContent = 'URL copied to clipboard!';
              document.body.appendChild(notification);
              setTimeout(() => document.body.removeChild(notification), 2000);
            }).catch(err => {
              console.error('Failed to copy: ', err);
            });
          }
          
          // Show file details
          function showFileDetails(fileId) {
            htmx.ajax('GET', \`/admin/media/\${fileId}/details\`, {
              target: '#file-modal-content'
            }).then(() => {
              document.getElementById('file-modal').classList.remove('hidden');
            });
          }
          
          // Close modal when clicking outside
          document.getElementById('file-modal').addEventListener('click', function(e) {
            if (e.target === this) {
              this.classList.add('hidden');
            }
          });
        </script>
      </body>
      </html>
    `)
  } catch (error) {
    console.error('Error loading media library:', error)
    return c.html(html`<p>Error loading media library</p>`)
  }
})

// Search media files (HTMX endpoint)
adminMediaRoutes.get('/search', async (c) => {
  try {
    const { searchParams } = new URL(c.req.url)
    const search = searchParams.get('search') || ''
    const folder = searchParams.get('folder') || 'all'
    const type = searchParams.get('type') || 'all'
    const db = c.env.DB
    
    // Build search query
    let query = 'SELECT * FROM media'
    const params: any[] = []
    const conditions: string[] = []
    
    if (search.trim()) {
      conditions.push('(filename LIKE ? OR originalName LIKE ? OR alt LIKE ?)')
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }
    
    if (folder !== 'all') {
      conditions.push('folder = ?')
      params.push(folder)
    }
    
    if (type !== 'all') {
      switch (type) {
        case 'images':
          conditions.push('mime_type LIKE ?')
          params.push('image/%')
          break
        case 'documents':
          conditions.push('mime_type IN (?, ?, ?)')
          params.push('application/pdf', 'text/plain', 'application/msword')
          break
        case 'videos':
          conditions.push('mime_type LIKE ?')
          params.push('video/%')
          break
      }
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }
    
    query += ` ORDER BY uploaded_at DESC LIMIT 24`
    
    const stmt = db.prepare(query)
    const { results } = await stmt.bind(...params).all()
    
    const mediaFiles = results.map((row: any) => ({
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : [],
      uploadedAt: new Date(row.uploaded_at).toLocaleDateString(),
      fileSize: formatFileSize(row.size),
      isImage: row.mime_type.startsWith('image/'),
      isVideo: row.mime_type.startsWith('video/'),
      isDocument: !row.mime_type.startsWith('image/') && !row.mime_type.startsWith('video/')
    }))
    
    const gridHTML = mediaFiles.map(file => generateMediaItemHTML(file)).join('')
    
    return c.html(gridHTML)
  } catch (error) {
    console.error('Error searching media:', error)
    return c.html('<div class="text-red-500">Error searching files</div>')
  }
})

// Get file details modal (HTMX endpoint)
adminMediaRoutes.get('/:id/details', async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env.DB
    
    const stmt = db.prepare('SELECT * FROM media WHERE id = ?')
    const result = await stmt.bind(id).first() as any
    
    if (!result) {
      return c.html('<div class="text-red-500">File not found</div>')
    }
    
    const file = {
      ...result,
      tags: result.tags ? JSON.parse(result.tags) : [],
      uploadedAt: new Date(result.uploaded_at).toLocaleString(),
      fileSize: formatFileSize(result.size),
      isImage: result.mime_type.startsWith('image/'),
      isVideo: result.mime_type.startsWith('video/'),
      isDocument: !result.mime_type.startsWith('image/') && !result.mime_type.startsWith('video/')
    }
    
    return c.html(html`
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium">File Details</h3>
        <button onclick="document.getElementById('file-modal').classList.add('hidden')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Preview -->
        <div class="space-y-4">
          <div class="bg-gray-100 rounded-lg p-4">
            ${file.isImage ? `
              <img src="${file.public_url}" alt="${file.alt || file.filename}" class="w-full h-auto rounded">
            ` : file.isVideo ? `
              <video src="${file.public_url}" controls class="w-full h-auto rounded"></video>
            ` : `
              <div class="flex items-center justify-center h-32">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            `}
          </div>
          
          <div class="text-center">
            <button 
              onclick="copyToClipboard('${file.public_url}')"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
            >
              Copy URL
            </button>
            <a 
              href="${file.public_url}" 
              target="_blank"
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Open Original
            </a>
          </div>
        </div>
        
        <!-- Details -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Filename</label>
            <p class="text-sm text-gray-900">${file.original_name}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <p class="text-sm text-gray-900">${file.fileSize}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <p class="text-sm text-gray-900">${file.mime_type}</p>
            </div>
          </div>
          
          ${file.width && file.height ? `
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Width</label>
                <p class="text-sm text-gray-900">${file.width}px</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <p class="text-sm text-gray-900">${file.height}px</p>
              </div>
            </div>
          ` : ''}
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Folder</label>
            <p class="text-sm text-gray-900">${file.folder}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Uploaded</label>
            <p class="text-sm text-gray-900">${file.uploadedAt}</p>
          </div>
          
          <!-- Editable Fields -->
          <form hx-put="/media/${file.id}" hx-target="#file-modal-content" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
              <input 
                type="text" 
                name="alt" 
                value="${file.alt || ''}"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Describe this image..."
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Caption</label>
              <textarea 
                name="caption" 
                rows="3"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="Optional caption..."
              >${file.caption || ''}</textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input 
                type="text" 
                name="tags" 
                value="${file.tags.join(', ')}"
                class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="tag1, tag2, tag3"
              >
            </div>
            
            <div class="flex justify-between">
              <button 
                type="submit"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Changes
              </button>
              <button 
                type="button"
                hx-delete="/media/${file.id}"
                hx-confirm="Are you sure you want to delete this file?"
                hx-target="body"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete File
              </button>
            </div>
          </form>
        </div>
      </div>
    `)
  } catch (error) {
    console.error('Error fetching file details:', error)
    return c.html('<div class="text-red-500">Error loading file details</div>')
  }
})

// Helper function to generate media item HTML
function generateMediaItemHTML(file: any): string {
  const isImage = file.isImage
  const isVideo = file.isVideo
  
  return `
    <div 
      class="media-item bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer" 
      data-file-id="${file.id}"
      onclick="toggleFileSelection('${file.id}')"
    >
      <div class="aspect-square relative">
        ${isImage ? `
          <img 
            src="${file.public_url}" 
            alt="${file.alt || file.filename}"
            class="w-full h-full object-cover"
            loading="lazy"
          >
        ` : isVideo ? `
          <video 
            src="${file.public_url}" 
            class="w-full h-full object-cover"
            muted
          ></video>
        ` : `
          <div class="w-full h-full flex items-center justify-center bg-gray-100">
            <div class="text-center">
              <svg class="file-icon mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span class="text-xs text-gray-500 mt-1">${file.filename.split('.').pop()?.toUpperCase()}</span>
            </div>
          </div>
        `}
        
        <div class="preview-overlay flex items-center justify-center">
          <div class="flex space-x-2">
            <button 
              onclick="event.stopPropagation(); showFileDetails('${file.id}')"
              class="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30"
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            </button>
            <button 
              onclick="event.stopPropagation(); copyToClipboard('${file.public_url}')"
              class="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30"
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div class="p-3">
        <h4 class="text-sm font-medium text-gray-900 truncate" title="${file.original_name}">
          ${file.original_name}
        </h4>
        <div class="flex justify-between items-center mt-1">
          <span class="text-xs text-gray-500">${file.fileSize}</span>
          <span class="text-xs text-gray-500">${file.uploadedAt}</span>
        </div>
        ${file.tags.length > 0 ? `
          <div class="flex flex-wrap gap-1 mt-2">
            ${file.tags.slice(0, 2).map((tag: string) => `
              <span class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                ${tag}
              </span>
            `).join('')}
            ${file.tags.length > 2 ? `<span class="text-xs text-gray-400">+${file.tags.length - 2}</span>` : ''}
          </div>
        ` : ''}
      </div>
    </div>
  `
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}