import { Hono } from 'hono'
import { html, raw } from 'hono/html'
import { requireAuth, requireRole } from '../middleware/auth'
import { renderMediaLibraryPage, MediaLibraryPageData, FolderStats, TypeStats } from '../templates/pages/admin-media-library.template'
import { renderMediaFileDetails, MediaFileDetailsData } from '../templates/components/media-file-details.template'
import { MediaFile } from '../templates/components/media-grid.template'

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
          WHEN mime_type LIKE 'image/%' THEN 'images'
          WHEN mime_type LIKE 'video/%' THEN 'videos'
          WHEN mime_type IN ('application/pdf', 'text/plain') THEN 'documents'
          ELSE 'other'
        END as type,
        COUNT(*) as count
      FROM media 
      GROUP BY type
    `)
    const { results: types } = await typesStmt.all()
    
    // Process media files
    const mediaFiles: MediaFile[] = results.map((row: any) => ({
      id: row.id,
      filename: row.filename,
      original_name: row.original_name,
      mime_type: row.mime_type,
      size: row.size,
      public_url: row.public_url,
      thumbnail_url: row.thumbnail_url,
      alt: row.alt,
      caption: row.caption,
      tags: row.tags ? JSON.parse(row.tags) : [],
      uploaded_at: row.uploaded_at,
      fileSize: formatFileSize(row.size),
      uploadedAt: new Date(row.uploaded_at).toLocaleDateString(),
      isImage: row.mime_type.startsWith('image/'),
      isVideo: row.mime_type.startsWith('video/'),
      isDocument: !row.mime_type.startsWith('image/') && !row.mime_type.startsWith('video/')
    }))
    
    const pageData: MediaLibraryPageData = {
      files: mediaFiles,
      folders: folders.map((f: any) => ({
        folder: f.folder,
        count: f.count,
        totalSize: f.totalSize
      })) as FolderStats[],
      types: types.map((t: any) => ({
        type: t.type,
        count: t.count
      })) as TypeStats[],
      currentFolder: folder,
      currentType: type,
      currentView: view as 'grid' | 'list',
      currentPage: page,
      totalFiles: results.length,
      hasNextPage: results.length === limit,
      user: {
        name: user.email,
        email: user.email,
        role: user.role
      }
    }

    return c.html(renderMediaLibraryPage(pageData))
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
      conditions.push('(filename LIKE ? OR original_name LIKE ? OR alt LIKE ?)')
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
    
    return c.html(raw(gridHTML))
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