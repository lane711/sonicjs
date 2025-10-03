import { Hono } from 'hono'
import { html, raw } from 'hono/html'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { requireAuth, requireRole } from '../middleware/auth'
import { renderMediaLibraryPage, MediaLibraryPageData, FolderStats, TypeStats } from '../templates/pages/admin-media-library.template'
import { renderMediaFileDetails, MediaFileDetailsData } from '../templates/components/media-file-details.template'
import { MediaFile } from '../templates/components/media-grid.template'
import { createCDNService } from '../services/cdn'
import { getCacheService, CACHE_CONFIGS } from '../plugins/cache'
import packageJson from '../../package.json'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
  MEDIA_BUCKET: R2Bucket
  IMAGES_ACCOUNT_ID?: string
  IMAGES_API_TOKEN?: string
  CDN_DOMAIN?: string
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

// File validation schema
const fileValidationSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().refine(
    (type) => {
      const allowedTypes = [
        // Images
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        // Documents
        'application/pdf', 'text/plain', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // Videos
        'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov',
        // Audio
        'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'
      ]
      return allowedTypes.includes(type)
    },
    { message: 'Unsupported file type' }
  ),
  size: z.number().min(1).max(50 * 1024 * 1024) // 50MB max
})

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

    // Use cache for media list
    const cache = getCacheService(CACHE_CONFIGS.media!)
    const cacheKey = cache.generateKey('list', `folder:${folder}_type:${type}_page:${page}`)

    const cachedData = await cache.get<MediaLibraryPageData>(cacheKey)
    if (cachedData) {
      return c.html(renderMediaLibraryPage(cachedData))
    }

    // Build query for media files
    let query = 'SELECT * FROM media'
    const params: any[] = []
    const conditions: string[] = ['deleted_at IS NULL']
    
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
    
    // Process media files with local serving URLs
    const mediaFiles: MediaFile[] = results.map((row: any) => ({
      id: row.id,
      filename: row.filename,
      original_name: row.original_name,
      mime_type: row.mime_type,
      size: row.size,
      public_url: `/admin/media/file/${row.r2_key}`,
      thumbnail_url: row.mime_type.startsWith('image/') ? `/admin/media/file/${row.r2_key}` : undefined,
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
      },
      version: `v${packageJson.version}`
    }

    // Cache the page data
    await cache.set(cacheKey, pageData)

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
      public_url: `/admin/media/file/${row.r2_key}`,
      thumbnail_url: row.mime_type.startsWith('image/') ? `/admin/media/file/${row.r2_key}` : undefined,
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
    
    const file: MediaFile & { width?: number; height?: number; folder: string; uploadedAt: string } = {
      id: result.id,
      filename: result.filename,
      original_name: result.original_name,
      mime_type: result.mime_type,
      size: result.size,
      public_url: `/admin/media/file/${result.r2_key}`,
      thumbnail_url: result.mime_type.startsWith('image/') ? `/admin/media/file/${result.r2_key}` : undefined,
      alt: result.alt,
      caption: result.caption,
      tags: result.tags ? JSON.parse(result.tags) : [],
      uploaded_at: result.uploaded_at,
      fileSize: formatFileSize(result.size),
      uploadedAt: new Date(result.uploaded_at).toLocaleString(),
      isImage: result.mime_type.startsWith('image/'),
      isVideo: result.mime_type.startsWith('video/'),
      isDocument: !result.mime_type.startsWith('image/') && !result.mime_type.startsWith('video/'),
      width: result.width,
      height: result.height,
      folder: result.folder
    }
    
    const detailsData: MediaFileDetailsData = { file }
    
    return c.html(renderMediaFileDetails(detailsData))
  } catch (error) {
    console.error('Error fetching file details:', error)
    return c.html('<div class="text-red-500">Error loading file details</div>')
  }
})

// Upload files endpoint (HTMX compatible)
adminMediaRoutes.post('/upload', async (c) => {
  try {
    const user = c.get('user')
    const formData = await c.req.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return c.html(html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          No files provided
        </div>
      `)
    }

    const uploadResults = []
    const errors = []

    for (const file of files) {
      try {
        // Validate file
        const validation = fileValidationSchema.safeParse({
          name: file.name,
          type: file.type,
          size: file.size
        })

        if (!validation.success) {
          errors.push({
            filename: file.name,
            error: validation.error.issues[0]?.message || 'Validation failed'
          })
          continue
        }

        // Generate unique filename and R2 key
        const fileId = nanoid()
        const fileExtension = file.name.split('.').pop() || ''
        const filename = `${fileId}.${fileExtension}`
        const folder = formData.get('folder') as string || 'uploads'
        const r2Key = `${folder}/${filename}`

        // Upload to R2
        const arrayBuffer = await file.arrayBuffer()
        const uploadResult = await c.env.MEDIA_BUCKET.put(r2Key, arrayBuffer, {
          httpMetadata: {
            contentType: file.type,
            contentDisposition: `inline; filename="${file.name}"`
          },
          customMetadata: {
            originalName: file.name,
            uploadedBy: user.userId,
            uploadedAt: new Date().toISOString()
          }
        })

        if (!uploadResult) {
          errors.push({
            filename: file.name,
            error: 'Failed to upload to storage'
          })
          continue
        }

        // Extract image dimensions if it's an image
        let width: number | undefined
        let height: number | undefined
        
        if (file.type.startsWith('image/') && !file.type.includes('svg')) {
          try {
            const dimensions = await getImageDimensions(arrayBuffer)
            width = dimensions.width
            height = dimensions.height
          } catch (error) {
            console.warn('Failed to extract image dimensions:', error)
          }
        }

        // Generate URLs - use local serving route for development
        const publicUrl = `/admin/media/file/${r2Key}`
        const thumbnailUrl = file.type.startsWith('image/') ? publicUrl : undefined

        // Save to database
        const stmt = c.env.DB.prepare(`
          INSERT INTO media (
            id, filename, original_name, mime_type, size, width, height, 
            folder, r2_key, public_url, thumbnail_url, uploaded_by, uploaded_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        
        await stmt.bind(
          fileId,
          filename,
          file.name,
          file.type,
          file.size,
          width,
          height,
          folder,
          r2Key,
          publicUrl,
          thumbnailUrl,
          user.userId,
          Math.floor(Date.now() / 1000)
        ).run()

        uploadResults.push({
          id: fileId,
          filename: filename,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          publicUrl: publicUrl
        })
      } catch (error) {
        errors.push({
          filename: file.name,
          error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error')
        })
      }
    }

    // Return HTMX response with results
    return c.html(html`
      ${uploadResults.length > 0 ? html`
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Successfully uploaded ${uploadResults.length} file${uploadResults.length > 1 ? 's' : ''}
        </div>
      ` : ''}
      
      ${errors.length > 0 ? html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p class="font-medium">Upload errors:</p>
          <ul class="list-disc list-inside mt-2">
            ${errors.map(error => html`
              <li>${error.filename}: ${error.error}</li>
            `)}
          </ul>
        </div>
      ` : ''}
      
      <script>
        // Refresh the media grid after upload
        if (${uploadResults.length} > 0) {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      </script>
    `)
  } catch (error) {
    console.error('Upload error:', error)
    return c.html(html`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}
      </div>
    `)
  }
})

// Serve files from R2 storage
adminMediaRoutes.get('/file/*', async (c) => {
  try {
    const r2Key = c.req.path.replace('/admin/media/file/', '')
    
    if (!r2Key) {
      return c.notFound()
    }

    // Get file from R2
    const object = await c.env.MEDIA_BUCKET.get(r2Key)
    
    if (!object) {
      return c.notFound()
    }

    // Set appropriate headers
    const headers = new Headers()
    object.httpMetadata?.contentType && headers.set('Content-Type', object.httpMetadata.contentType)
    object.httpMetadata?.contentDisposition && headers.set('Content-Disposition', object.httpMetadata.contentDisposition)
    headers.set('Cache-Control', 'public, max-age=31536000') // 1 year cache
    
    return new Response(object.body, {
      headers
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return c.notFound()
  }
})

// Update media file metadata (HTMX compatible)
adminMediaRoutes.put('/:id', async (c) => {
  try {
    const user = c.get('user')
    const fileId = c.req.param('id')
    const formData = await c.req.formData()
    
    // Get file record
    const stmt = c.env.DB.prepare('SELECT * FROM media WHERE id = ? AND deleted_at IS NULL')
    const fileRecord = await stmt.bind(fileId).first() as any
    
    if (!fileRecord) {
      return c.html(html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          File not found
        </div>
      `)
    }

    // Check permissions (only allow updates by uploader or admin)
    if (fileRecord.uploaded_by !== user.userId && user.role !== 'admin') {
      return c.html(html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Permission denied
        </div>
      `)
    }

    // Extract form data
    const alt = formData.get('alt') as string || null
    const caption = formData.get('caption') as string || null
    const tagsString = formData.get('tags') as string || ''
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag) : []

    // Update database
    const updateStmt = c.env.DB.prepare(`
      UPDATE media 
      SET alt = ?, caption = ?, tags = ?, updated_at = ?
      WHERE id = ?
    `)
    await updateStmt.bind(
      alt,
      caption,
      JSON.stringify(tags),
      Math.floor(Date.now() / 1000),
      fileId
    ).run()

    return c.html(html`
      <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        File updated successfully
      </div>
      <script>
        // Refresh the file details
        setTimeout(() => {
          htmx.trigger('#file-modal-content', 'htmx:load');
        }, 1000);
      </script>
    `)
  } catch (error) {
    console.error('Update error:', error)
    return c.html(html`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        Update failed: ${error instanceof Error ? error.message : 'Unknown error'}
      </div>
    `)
  }
})

// Delete media file (HTMX compatible)
adminMediaRoutes.delete('/:id', async (c) => {
  try {
    const user = c.get('user')
    const fileId = c.req.param('id')
    
    // Get file record
    const stmt = c.env.DB.prepare('SELECT * FROM media WHERE id = ? AND deleted_at IS NULL')
    const fileRecord = await stmt.bind(fileId).first() as any
    
    if (!fileRecord) {
      return c.html(html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          File not found
        </div>
      `)
    }

    // Check permissions (only allow deletion by uploader or admin)
    if (fileRecord.uploaded_by !== user.userId && user.role !== 'admin') {
      return c.html(html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Permission denied
        </div>
      `)
    }

    // Delete from R2
    try {
      await c.env.MEDIA_BUCKET.delete(fileRecord.r2_key)
    } catch (error) {
      console.warn('Failed to delete from R2:', error)
      // Continue with database deletion even if R2 deletion fails
    }

    // Soft delete in database
    const deleteStmt = c.env.DB.prepare('UPDATE media SET deleted_at = ? WHERE id = ?')
    await deleteStmt.bind(Math.floor(Date.now() / 1000), fileId).run()

    // Return HTMX response that redirects to media library
    return c.html(html`
      <script>
        // Close modal if open
        const modal = document.getElementById('file-modal');
        if (modal) {
          modal.classList.add('hidden');
        }
        // Redirect to media library
        window.location.href = '/admin/media';
      </script>
    `)
  } catch (error) {
    console.error('Delete error:', error)
    return c.html(html`
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}
      </div>
    `)
  }
})

// Helper function to extract image dimensions
async function getImageDimensions(arrayBuffer: ArrayBuffer): Promise<{ width: number; height: number }> {
  const uint8Array = new Uint8Array(arrayBuffer)
  
  // Check for JPEG
  if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8) {
    return getJPEGDimensions(uint8Array)
  }
  
  // Check for PNG
  if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47) {
    return getPNGDimensions(uint8Array)
  }
  
  // Default fallback
  return { width: 0, height: 0 }
}

function getJPEGDimensions(uint8Array: Uint8Array): { width: number; height: number } {
  let i = 2
  while (i < uint8Array.length - 8) {
    if (uint8Array[i] === 0xFF && uint8Array[i + 1] === 0xC0) {
      return {
        height: (uint8Array[i + 5]! << 8) | uint8Array[i + 6]!,
        width: (uint8Array[i + 7]! << 8) | uint8Array[i + 8]!
      }
    }
    const segmentLength = (uint8Array[i + 2]! << 8) | uint8Array[i + 3]!
    i += 2 + segmentLength
  }
  return { width: 0, height: 0 }
}

function getPNGDimensions(uint8Array: Uint8Array): { width: number; height: number } {
  if (uint8Array.length < 24) {
    return { width: 0, height: 0 }
  }
  return {
    width: (uint8Array[16]! << 24) | (uint8Array[17]! << 16) | (uint8Array[18]! << 8) | uint8Array[19]!,
    height: (uint8Array[20]! << 24) | (uint8Array[21]! << 16) | (uint8Array[22]! << 8) | uint8Array[23]!
  }
}

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