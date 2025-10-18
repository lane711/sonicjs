import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
// import { MediaStorage, FileMetadata, MEDIA_CONFIG, MEDIA_FOLDERS, getMediaConfigByType } from '../media/storage'
import { requireAuth, requireRole } from '@sonicjs-cms/core'
import { 
  R2StorageManager, 
  CloudflareImagesManager,
  validateFile,
  generateSafeFilename,
  generateR2Key,
  getFileCategory,
  formatFileSize
} from '../media/storage'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
  MEDIA_BUCKET?: R2Bucket
  CF_ACCOUNT_ID?: string
  CF_IMAGES_TOKEN?: string
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

export const mediaRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Media configuration
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Serve media files from R2
mediaRoutes.get('/serve/:key{.*}', async (c) => {
  try {
    const key = decodeURIComponent(c.req.param('key'))
    const bucket = c.env.MEDIA_BUCKET
    
    if (!bucket) {
      return c.text('Media storage not configured', 500)
    }
    
    const file = await bucket.get(key)
    
    if (!file) {
      return c.text('File not found', 404)
    }
    
    // Set appropriate headers
    const headers = new Headers()
    if (file.httpMetadata?.contentType) {
      headers.set('Content-Type', file.httpMetadata.contentType)
    }
    headers.set('Cache-Control', 'public, max-age=31536000') // Cache for 1 year
    
    return new Response(file.body, {
      headers
    })
  } catch (error) {
    console.error('Error serving media file:', error)
    return c.text('Error serving file', 500)
  }
})

// Media upload schema
const uploadSchema = z.object({
  folder: z.string().optional().default('uploads'),
  alt: z.string().optional(),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional()
})

// Media update schema
const updateMediaSchema = z.object({
  alt: z.string().optional(),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional(),
  folder: z.string().optional()
})

// Get all media files with filtering and pagination
mediaRoutes.get('/', async (c) => {
  try {
    const { searchParams } = new URL(c.req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '24'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const folder = searchParams.get('folder')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    
    const db = c.env.DB
    let query = 'SELECT * FROM media WHERE deleted_at IS NULL'
    const params: any[] = []
    
    // Apply filters
    if (folder && folder !== 'all') {
      query += ' AND folder = ?'
      params.push(folder)
    }
    
    if (type && type !== 'all') {
      switch (type) {
        case 'images':
          query += ' AND mime_type LIKE ?'
          params.push('image/%')
          break
        case 'documents':
          query += ' AND mime_type IN (?, ?, ?, ?, ?, ?)'
          params.push('application/pdf', 'text/plain', 'application/msword', 
                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                     'application/vnd.ms-excel', 
                     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          break
        case 'videos':
          query += ' AND mime_type LIKE ?'
          params.push('video/%')
          break
        case 'audio':
          query += ' AND mime_type LIKE ?'
          params.push('audio/%')
          break
      }
    }
    
    // Search functionality
    if (search) {
      query += ' AND (filename LIKE ? OR original_name LIKE ? OR alt LIKE ? OR caption LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }
    
    // Apply sorting
    switch (sort) {
      case 'newest':
        query += ' ORDER BY uploaded_at DESC'
        break
      case 'oldest':
        query += ' ORDER BY uploaded_at ASC'
        break
      case 'name':
        query += ' ORDER BY original_name ASC'
        break
      case 'size':
        query += ' ORDER BY size DESC'
        break
      default:
        query += ' ORDER BY uploaded_at DESC'
    }
    
    query += ` LIMIT ${limit} OFFSET ${offset}`
    
    const stmt = db.prepare(query)
    const { results } = await stmt.bind(...params).all()
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM media WHERE deleted_at IS NULL'
    let countParams: any[] = []
    
    if (folder && folder !== 'all') {
      countQuery += ' AND folder = ?'
      countParams.push(folder)
    }
    
    if (type && type !== 'all') {
      switch (type) {
        case 'images':
          countQuery += ' AND mime_type LIKE ?'
          countParams.push('image/%')
          break
        case 'documents':
          countQuery += ' AND mime_type IN (?, ?, ?, ?, ?, ?)'
          countParams.push('application/pdf', 'text/plain', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'application/vnd.ms-excel', 
                          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          break
        case 'videos':
          countQuery += ' AND mime_type LIKE ?'
          countParams.push('video/%')
          break
        case 'audio':
          countQuery += ' AND mime_type LIKE ?'
          countParams.push('audio/%')
          break
      }
    }
    
    if (search) {
      countQuery += ' AND (filename LIKE ? OR original_name LIKE ? OR alt LIKE ? OR caption LIKE ?)'
      const searchTerm = `%${search}%`
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm)
    }
    
    const countStmt = db.prepare(countQuery)
    const countResult = await countStmt.bind(...countParams).first() as any
    const total = countResult?.total || 0
    
    // Process results
    const processedResults = results.map((row: any) => ({
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : [],
      uploadedAt: new Date(row.uploaded_at).toISOString(),
      fileSize: formatFileSize(row.size),
      category: getFileCategory(row.mime_type),
      isImage: row.mime_type.startsWith('image/'),
      isVideo: row.mime_type.startsWith('video/'),
      isDocument: !row.mime_type.startsWith('image/') && !row.mime_type.startsWith('video/')
    }))
    
    return c.json({
      data: processedResults,
      meta: {
        total,
        count: results.length,
        limit,
        offset,
        hasMore: offset + limit < total,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return c.json({ error: 'Failed to fetch media files' }, 500)
  }
})

// Upload media files
mediaRoutes.post('/upload',
  requireAuth(),
  async (c) => {
    try {
      const user = c.get('user')
      const db = c.env.DB
      
      // Check if R2 bucket is configured
      const bucket = c.env.MEDIA_BUCKET
      if (!bucket) {
        return c.json({ error: 'Media storage not configured' }, 500)
      }
      
      // Parse multipart form data
      const formData = await c.req.formData()
      const files = formData.getAll('files') as File[]
      const folder = formData.get('folder') as string || 'uploads'
      const alt = formData.get('alt') as string
      const caption = formData.get('caption') as string
      const tagsString = formData.get('tags') as string
      const tags = tagsString ? tagsString.split(',').map(t => t.trim()) : []
      
      if (!files || files.length === 0) {
        return c.json({ error: 'No files provided' }, 400)
      }
      
      const r2Manager = new R2StorageManager(bucket, c.env.CDN_DOMAIN)
      const imagesManager = c.env.CF_ACCOUNT_ID && c.env.CF_IMAGES_TOKEN ? 
        new CloudflareImagesManager(c.env.CF_ACCOUNT_ID, c.env.CF_IMAGES_TOKEN) : null
      
      const uploadResults = []
      
      for (const file of files) {
        try {
          // Validate file
          const validation = validateFile(file)
          if (!validation.valid) {
            uploadResults.push({
              filename: file.name,
              success: false,
              errors: validation.errors
            })
            continue
          }
          
          // Generate safe filename and R2 key
          const safeFilename = generateSafeFilename(file.name)
          const r2Key = generateR2Key(safeFilename, folder)
          
          // Upload to R2
          const uploadResult = await r2Manager.uploadFile(file, r2Key, {
            userId: user.userId,
            folder: folder,
            originalName: file.name
          })
          
          if (!uploadResult.success) {
            uploadResults.push({
              filename: file.name,
              success: false,
              error: uploadResult.error
            })
            continue
          }
          
          // Get image dimensions if it's an image
          let width: number | null = null
          let height: number | null = null
          let thumbnailUrl: string | null = null
          
          if (file.type.startsWith('image/')) {
            // Try to get dimensions from file
            try {
              const img = new Image()
              const imageUrl = URL.createObjectURL(file)
              
              await new Promise((resolve, reject) => {
                img.onload = () => {
                  width = img.width
                  height = img.height
                  resolve(true)
                }
                img.onerror = reject
                img.src = imageUrl
              })
              
              URL.revokeObjectURL(imageUrl)
            } catch (error) {
              console.warn('Could not get image dimensions:', error)
            }
            
            // Upload to Cloudflare Images for optimization if available
            if (imagesManager) {
              try {
                const cfResult = await imagesManager.uploadImage(file, {
                  originalName: file.name,
                  userId: user.userId,
                  folder: folder
                })
                
                if (cfResult.success && cfResult.url) {
                  thumbnailUrl = cfResult.url
                }
              } catch (error) {
                console.warn('Cloudflare Images upload failed:', error)
              }
            }
          }
          
          // Save to database
          const mediaId = crypto.randomUUID()
          const now = Date.now()
          
          const insertStmt = db.prepare(`
            INSERT INTO media (
              id, filename, original_name, mime_type, size, width, height,
              folder, r2_key, public_url, thumbnail_url, alt, caption, tags,
              uploaded_by, uploaded_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          
          await insertStmt.bind(
            mediaId,
            safeFilename,
            file.name,
            file.type,
            file.size,
            width,
            height,
            folder,
            r2Key,
            uploadResult.publicUrl,
            thumbnailUrl,
            alt || null,
            caption || null,
            tags.length > 0 ? JSON.stringify(tags) : null,
            user.userId,
            now,
            now
          ).run()
          
          uploadResults.push({
            id: mediaId,
            filename: file.name,
            success: true,
            url: uploadResult.publicUrl,
            thumbnailUrl: thumbnailUrl,
            size: formatFileSize(file.size),
            dimensions: width && height ? { width, height } : null
          })
          
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error)
          uploadResults.push({
            filename: file.name,
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed'
          })
        }
      }
      
      const successCount = uploadResults.filter(r => r.success).length
      const failCount = uploadResults.filter(r => !r.success).length
      
      // Check if this is an HTMX request (from admin interface)
      const isHtmxRequest = c.req.header('HX-Request') === 'true'
      
      if (isHtmxRequest) {
        // Return HTML for admin interface
        const { html, raw } = await import('hono/html')
        
        return c.html(html`
          <div class="space-y-4">
            <div class="bg-green-50 border border-green-200 rounded-md p-4">
              <div class="flex">
                <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800">
                    Upload completed: ${successCount} successful, ${failCount} failed
                  </h3>
                  ${raw(uploadResults.length > 0 ? `
                    <div class="mt-2 text-sm text-green-700">
                      <ul class="list-disc list-inside space-y-1">
                        ${uploadResults.map(result => `
                          <li class="${result.success ? 'text-green-700' : 'text-red-700'}">
                            ${result.filename}: ${result.success ? 'Success' : `Failed - ${result.error || result.errors?.join(', ')}`}
                          </li>
                        `).join('')}
                      </ul>
                    </div>
                  ` : '')}
                </div>
              </div>
            </div>
            
            <div class="flex justify-end">
              <button 
                type="button"
                onclick="document.getElementById('upload-modal').classList.add('hidden'); window.location.reload();"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        `)
      }
      
      // Return JSON for API requests
      return c.json({
        message: `Upload completed: ${successCount} successful, ${failCount} failed`,
        results: uploadResults,
        summary: {
          total: uploadResults.length,
          successful: successCount,
          failed: failCount
        }
      })
      
    } catch (error) {
      console.error('Error in media upload:', error)
      
      // Check if this is an HTMX request (from admin interface)
      const isHtmxRequest = c.req.header('HX-Request') === 'true'
      
      if (isHtmxRequest) {
        const { html } = await import('hono/html')
        return c.html(html`
          <div class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Upload failed</h3>
                <p class="text-sm text-red-700 mt-1">An error occurred while uploading your files. Please try again.</p>
              </div>
            </div>
          </div>
        `)
      }
      
      return c.json({ error: 'Upload failed' }, 500)
    }
  }
)

// Get single media file
mediaRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env.DB
    
    const stmt = db.prepare('SELECT * FROM media WHERE id = ? AND deleted_at IS NULL')
    const result = await stmt.bind(id).first() as any
    
    if (!result) {
      return c.json({ error: 'Media file not found' }, 404)
    }
    
    // Process result
    const processedResult = {
      ...result,
      tags: result.tags ? JSON.parse(result.tags) : [],
      uploadedAt: new Date(result.uploaded_at).toISOString(),
      fileSize: formatFileSize(result.size),
      category: getFileCategory(result.mime_type),
      isImage: result.mime_type.startsWith('image/'),
      isVideo: result.mime_type.startsWith('video/'),
      isDocument: !result.mime_type.startsWith('image/') && !result.mime_type.startsWith('video/')
    }
    
    return c.json({ data: processedResult })
  } catch (error) {
    console.error('Error fetching media file:', error)
    return c.json({ error: 'Failed to fetch media file' }, 500)
  }
})

// Update media file metadata
mediaRoutes.put('/:id',
  requireAuth(),
  zValidator('json', updateMediaSchema),
  async (c) => {
    try {
      const id = c.req.param('id')
      const user = c.get('user')
      const updates = c.req.valid('json')
      const db = c.env.DB
      
      // Check if media file exists
      const checkStmt = db.prepare('SELECT * FROM media WHERE id = ? AND deleted_at IS NULL')
      const existing = await checkStmt.bind(id).first() as any
      
      if (!existing) {
        return c.json({ error: 'Media file not found' }, 404)
      }
      
      // Check permissions (only owner or admin/editor can edit)
      if (existing.uploaded_by !== user.userId && !['admin', 'editor'].includes(user.role)) {
        return c.json({ error: 'Permission denied' }, 403)
      }
      
      // Build update query
      const updateFields: string[] = []
      const updateParams: any[] = []
      
      if (updates.alt !== undefined) {
        updateFields.push('alt = ?')
        updateParams.push(updates.alt)
      }
      
      if (updates.caption !== undefined) {
        updateFields.push('caption = ?')
        updateParams.push(updates.caption)
      }
      
      if (updates.tags !== undefined) {
        updateFields.push('tags = ?')
        updateParams.push(updates.tags.length > 0 ? JSON.stringify(updates.tags) : null)
      }
      
      if (updates.folder !== undefined) {
        updateFields.push('folder = ?')
        updateParams.push(updates.folder)
      }
      
      if (updateFields.length === 0) {
        return c.json({ error: 'No fields to update' }, 400)
      }
      
      updateFields.push('updated_at = ?')
      updateParams.push(Date.now())
      updateParams.push(id)
      
      const updateStmt = db.prepare(`
        UPDATE media 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `)
      
      await updateStmt.bind(...updateParams).run()
      
      return c.json({ message: 'Media file updated successfully' })
    } catch (error) {
      console.error('Error updating media file:', error)
      return c.json({ error: 'Failed to update media file' }, 500)
    }
  }
)

// Delete media file
mediaRoutes.delete('/:id',
  requireAuth(),
  async (c) => {
    try {
      const id = c.req.param('id')
      const user = c.get('user')
      const db = c.env.DB
      
      // Check if media file exists
      const checkStmt = db.prepare('SELECT * FROM media WHERE id = ? AND deleted_at IS NULL')
      const existing = await checkStmt.bind(id).first() as any
      
      if (!existing) {
        return c.json({ error: 'Media file not found' }, 404)
      }
      
      // Check permissions (only owner or admin/editor can delete)
      if (existing.uploaded_by !== user.userId && !['admin', 'editor'].includes(user.role)) {
        return c.json({ error: 'Permission denied' }, 403)
      }
      
      // Soft delete in database
      const deleteStmt = db.prepare(`
        UPDATE media 
        SET deleted_at = ?, updated_at = ?
        WHERE id = ?
      `)
      
      const now = Date.now()
      await deleteStmt.bind(now, now, id).run()
      
      // Try to delete from R2 (async, don't wait for completion)
      if (c.env.MEDIA_BUCKET) {
        const r2Manager = new R2StorageManager(c.env.MEDIA_BUCKET)
        r2Manager.deleteFile(existing.r2_key).catch(error => {
          console.error('Error deleting file from R2:', error)
        })
      }
      
      return c.json({ message: 'Media file deleted successfully' })
    } catch (error) {
      console.error('Error deleting media file:', error)
      return c.json({ error: 'Failed to delete media file' }, 500)
    }
  }
)

// Bulk operations
mediaRoutes.post('/bulk',
  requireAuth(),
  requireRole(['admin', 'editor']),
  zValidator('json', z.object({
    operation: z.enum(['delete', 'move', 'tag']),
    mediaIds: z.array(z.string()).min(1),
    folder: z.string().optional(),
    tags: z.array(z.string()).optional()
  })),
  async (c) => {
    try {
      const user = c.get('user')
      const { operation, mediaIds, folder, tags } = c.req.valid('json')
      const db = c.env.DB
      
      const results = []
      
      for (const mediaId of mediaIds) {
        try {
          switch (operation) {
            case 'delete':
              const deleteStmt = db.prepare(`
                UPDATE media 
                SET deleted_at = ?, updated_at = ?
                WHERE id = ? AND deleted_at IS NULL
              `)
              
              const now = Date.now()
              await deleteStmt.bind(now, now, mediaId).run()
              results.push({ id: mediaId, success: true })
              break
              
            case 'move':
              if (!folder) {
                results.push({ id: mediaId, success: false, error: 'Folder required for move operation' })
                continue
              }
              
              const moveStmt = db.prepare(`
                UPDATE media 
                SET folder = ?, updated_at = ?
                WHERE id = ? AND deleted_at IS NULL
              `)
              
              await moveStmt.bind(folder, Date.now(), mediaId).run()
              results.push({ id: mediaId, success: true })
              break
              
            case 'tag':
              if (!tags) {
                results.push({ id: mediaId, success: false, error: 'Tags required for tag operation' })
                continue
              }
              
              const tagStmt = db.prepare(`
                UPDATE media 
                SET tags = ?, updated_at = ?
                WHERE id = ? AND deleted_at IS NULL
              `)
              
              await tagStmt.bind(JSON.stringify(tags), Date.now(), mediaId).run()
              results.push({ id: mediaId, success: true })
              break
          }
        } catch (error) {
          results.push({ 
            id: mediaId, 
            success: false, 
            error: error instanceof Error ? error.message : 'Operation failed' 
          })
        }
      }
      
      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length
      
      return c.json({
        message: `Bulk ${operation} completed: ${successCount} successful, ${failCount} failed`,
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failCount
        }
      })
    } catch (error) {
      console.error('Error in bulk operation:', error)
      return c.json({ error: 'Bulk operation failed' }, 500)
    }
  }
)

// Get media statistics
mediaRoutes.get('/stats/overview', async (c) => {
  try {
    const db = c.env.DB
    
    // Get total counts by type
    const statsStmt = db.prepare(`
      SELECT 
        COUNT(*) as total_files,
        SUM(size) as total_size,
        SUM(CASE WHEN mime_type LIKE 'image/%' THEN 1 ELSE 0 END) as image_count,
        SUM(CASE WHEN mime_type LIKE 'video/%' THEN 1 ELSE 0 END) as video_count,
        SUM(CASE WHEN mime_type LIKE 'audio/%' THEN 1 ELSE 0 END) as audio_count,
        SUM(CASE WHEN mime_type NOT LIKE 'image/%' AND mime_type NOT LIKE 'video/%' AND mime_type NOT LIKE 'audio/%' THEN 1 ELSE 0 END) as document_count
      FROM media 
      WHERE deleted_at IS NULL
    `)
    
    const stats = await statsStmt.first() as any
    
    // Get folder breakdown
    const folderStmt = db.prepare(`
      SELECT folder, COUNT(*) as count, SUM(size) as total_size
      FROM media 
      WHERE deleted_at IS NULL
      GROUP BY folder
      ORDER BY count DESC
    `)
    
    const { results: folders } = await folderStmt.all()
    
    return c.json({
      data: {
        overview: {
          totalFiles: stats.total_files || 0,
          totalSize: formatFileSize(stats.total_size || 0),
          totalSizeBytes: stats.total_size || 0,
          imageCount: stats.image_count || 0,
          videoCount: stats.video_count || 0,
          audioCount: stats.audio_count || 0,
          documentCount: stats.document_count || 0
        },
        folders: folders.map((folder: any) => ({
          ...folder,
          totalSize: formatFileSize(folder.total_size || 0)
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching media stats:', error)
    return c.json({ error: 'Failed to fetch media statistics' }, 500)
  }
})

// Get media folders
mediaRoutes.get('/folders', async (c) => {
  try {
    const db = c.env.DB
    
    const stmt = db.prepare(`
      SELECT folder, COUNT(*) as fileCount, SUM(size) as totalSize
      FROM media 
      GROUP BY folder 
      ORDER BY folder
    `)
    
    const { results } = await stmt.all()
    
    return c.json({ data: results })
  } catch (error) {
    console.error('Error fetching folders:', error)
    return c.json({ error: 'Failed to fetch folders' }, 500)
  }
})

// Utility functions
function validateUploadedFile(file: File): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB limit`)
  }
  
  // Check file type
  const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES]
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`)
  }
  
  // Check if file is empty
  if (file.size === 0) {
    errors.push('File is empty')
  }
  
  return { valid: errors.length === 0, errors }
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
}