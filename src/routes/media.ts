import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
// import { MediaStorage, FileMetadata, MEDIA_CONFIG, MEDIA_FOLDERS, getMediaConfigByType } from '../media/storage'
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

export const mediaRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Media configuration
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/plain']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Get all media files with filtering
mediaRoutes.get('/', async (c) => {
  try {
    const user = c.get('user')
    const { searchParams } = new URL(c.req.url)
    
    // Query parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const folder = searchParams.get('folder')
    const type = searchParams.get('type') // image, document, video, audio
    const search = searchParams.get('search')
    
    const db = c.env.DB
    let query = 'SELECT * FROM media'
    const params: any[] = []
    const conditions: string[] = []
    
    // Filter by folder
    if (folder) {
      conditions.push('folder = ?')
      params.push(folder)
    }
    
    // Filter by media type
    if (type) {
      switch (type) {
        case 'image':
          conditions.push('mime_type LIKE ?')
          params.push('image/%')
          break
        case 'document':
          conditions.push('mime_type IN (?, ?)')
          params.push('application/pdf', 'text/plain')
          break
        case 'video':
          conditions.push('mime_type LIKE ?')
          params.push('video/%')
          break
        case 'audio':
          conditions.push('mime_type LIKE ?')
          params.push('audio/%')
          break
      }
    }
    
    // Search in filename and alt text
    if (search) {
      conditions.push('(filename LIKE ? OR original_name LIKE ? OR alt LIKE ?)')
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }
    
    // Build final query
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }
    
    query += ` ORDER BY uploaded_at DESC LIMIT ${limit} OFFSET ${offset}`
    
    const stmt = db.prepare(query)
    const { results } = await stmt.bind(...params).all()
    
    // Parse metadata for each file
    const mediaFiles = results.map((row: any) => ({
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : [],
      uploadedAt: new Date(row.uploaded_at).toISOString()
    }))
    
    return c.json({
      data: mediaFiles,
      meta: {
        count: results.length,
        limit,
        offset,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return c.json({ error: 'Failed to fetch media files' }, 500)
  }
})

// Get single media file
mediaRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = c.env.DB
    
    const stmt = db.prepare('SELECT * FROM media WHERE id = ?')
    const result = await stmt.bind(id).first() as any
    
    if (!result) {
      return c.json({ error: 'Media file not found' }, 404)
    }
    
    // Parse tags
    const mediaFile = {
      ...result,
      tags: result.tags ? JSON.parse(result.tags) : [],
      uploadedAt: new Date(result.uploaded_at).toISOString()
    }
    
    return c.json({ data: mediaFile })
  } catch (error) {
    console.error('Error fetching media file:', error)
    return c.json({ error: 'Failed to fetch media file' }, 500)
  }
})

// Upload file endpoint
mediaRoutes.post('/upload',
  requireAuth(),
  async (c) => {
    try {
      const user = c.get('user')
      const db = c.env.DB
      const bucket = c.env.MEDIA_BUCKET
      
      if (!bucket) {
        return c.json({ error: 'Media storage not configured' }, 500)
      }
      
      // Parse multipart form data
      const formData = await c.req.formData()
      const file = formData.get('file') as File
      const folder = (formData.get('folder') as string) || 'uploads'
      const alt = formData.get('alt') as string
      const caption = formData.get('caption') as string
      const tags = formData.get('tags') as string
      
      if (!file) {
        return c.json({ error: 'No file provided' }, 400)
      }
      
      // Validate file
      const validation = validateUploadedFile(file)
      if (!validation.valid) {
        return c.json({ error: 'Invalid file', details: validation.errors }, 400)
      }
      
      // Generate file metadata
      const fileId = crypto.randomUUID()
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()?.toLowerCase()
      const sanitizedName = sanitizeFilename(file.name)
      const r2Key = `${folder}/${timestamp}-${fileId}.${extension}`
      
      // Upload to R2
      const fileBuffer = await file.arrayBuffer()
      await bucket.put(r2Key, fileBuffer, {
        httpMetadata: {
          contentType: file.type,
          cacheControl: 'public, max-age=31536000', // 1 year
        },
        customMetadata: {
          originalName: file.name,
          uploadedBy: user.userId,
          uploadedAt: timestamp.toString(),
          alt: alt || '',
          caption: caption || ''
        }
      })
      
      // Generate public URL (this would be your R2 custom domain)
      const publicUrl = `https://media.yourdomain.com/${r2Key}`
      
      // Get image dimensions if it's an image
      let width: number | undefined
      let height: number | undefined
      
      if (file.type.startsWith('image/')) {
        // In production, you'd extract actual dimensions
        // For now, set placeholder values
        width = 800
        height = 600
      }
      
      // Save to database
      const insertStmt = db.prepare(`
        INSERT INTO media (
          id, filename, original_name, mime_type, size, width, height,
          folder, uploaded_by, uploaded_at, tags, alt, caption, r2_key, public_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      
      await insertStmt.bind(
        fileId,
        sanitizedName,
        file.name,
        file.type,
        file.size,
        width || null,
        height || null,
        folder,
        user.userId,
        timestamp,
        tags ? JSON.stringify(tags.split(',').map(t => t.trim())) : JSON.stringify([]),
        alt || null,
        caption || null,
        r2Key,
        publicUrl
      ).run()
      
      const mediaFile = {
        id: fileId,
        filename: sanitizedName,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        width,
        height,
        folder,
        uploadedBy: user.userId,
        uploadedAt: new Date(timestamp).toISOString(),
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        alt,
        caption,
        publicUrl
      }
      
      return c.json({
        message: 'File uploaded successfully',
        data: mediaFile
      }, 201)
    } catch (error) {
      console.error('Error uploading file:', error)
      return c.json({ error: 'Failed to upload file' }, 500)
    }
  }
)

// Bulk upload endpoint
mediaRoutes.post('/upload/bulk',
  requireAuth(),
  async (c) => {
    try {
      const user = c.get('user')
      const db = c.env.DB
      const bucket = c.env.MEDIA_BUCKET
      
      if (!bucket) {
        return c.json({ error: 'Media storage not configured' }, 500)
      }
      
      const formData = await c.req.formData()
      const files = formData.getAll('files') as File[]
      const folder = (formData.get('folder') as string) || 'uploads'
      
      if (!files || files.length === 0) {
        return c.json({ error: 'No files provided' }, 400)
      }
      
      const results: Array<{ success: boolean; file?: any; error?: string; filename: string }> = []
      
      // Process each file
      for (const file of files) {
        try {
          const validation = validateUploadedFile(file)
          if (!validation.valid) {
            results.push({
              success: false,
              error: validation.errors.join(', '),
              filename: file.name
            })
            continue
          }
          
          // Upload file (simplified version of single upload)
          const fileId = crypto.randomUUID()
          const timestamp = Date.now()
          const extension = file.name.split('.').pop()?.toLowerCase()
          const sanitizedName = sanitizeFilename(file.name)
          const r2Key = `${folder}/${timestamp}-${fileId}.${extension}`
          
          const fileBuffer = await file.arrayBuffer()
          await bucket.put(r2Key, fileBuffer, {
            httpMetadata: {
              contentType: file.type,
              cacheControl: 'public, max-age=31536000',
            }
          })
          
          const publicUrl = `https://media.yourdomain.com/${r2Key}`
          
          // Save to database
          const insertStmt = db.prepare(`
            INSERT INTO media (
              id, filename, original_name, mime_type, size, folder,
              uploaded_by, uploaded_at, tags, r2_key, public_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `)
          
          await insertStmt.bind(
            fileId,
            sanitizedName,
            file.name,
            file.type,
            file.size,
            folder,
            user.userId,
            timestamp,
            JSON.stringify([]),
            r2Key,
            publicUrl
          ).run()
          
          results.push({
            success: true,
            filename: file.name,
            file: {
              id: fileId,
              filename: sanitizedName,
              publicUrl
            }
          })
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          results.push({
            success: false,
            error: 'Upload failed',
            filename: file.name
          })
        }
      }
      
      const successCount = results.filter(r => r.success).length
      const errorCount = results.filter(r => !r.success).length
      
      return c.json({
        message: `Bulk upload completed: ${successCount} successful, ${errorCount} failed`,
        results,
        summary: {
          total: files.length,
          successful: successCount,
          failed: errorCount
        }
      })
    } catch (error) {
      console.error('Error in bulk upload:', error)
      return c.json({ error: 'Bulk upload failed' }, 500)
    }
  }
)

// Update media metadata
const updateMediaSchema = z.object({
  alt: z.string().optional(),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional(),
  folder: z.string().optional()
})

mediaRoutes.put('/:id',
  requireAuth(),
  zValidator('json', updateMediaSchema),
  async (c) => {
    try {
      const id = c.req.param('id')
      const user = c.get('user')
      const updateData = c.req.valid('json')
      const db = c.env.DB
      
      // Check if file exists
      const existingStmt = db.prepare('SELECT * FROM media WHERE id = ?')
      const existing = await existingStmt.bind(id).first() as any
      
      if (!existing) {
        return c.json({ error: 'Media file not found' }, 404)
      }
      
      // Check permissions (authors can only edit their own files)
      if (user.role === 'author' && existing.uploaded_by !== user.userId) {
        return c.json({ error: 'Insufficient permissions' }, 403)
      }
      
      // Update metadata
      const updateStmt = db.prepare(`
        UPDATE media 
        SET alt = COALESCE(?, alt),
            caption = COALESCE(?, caption),
            tags = COALESCE(?, tags),
            folder = COALESCE(?, folder),
            updated_at = ?
        WHERE id = ?
      `)
      
      await updateStmt.bind(
        updateData.alt || null,
        updateData.caption || null,
        updateData.tags ? JSON.stringify(updateData.tags) : null,
        updateData.folder || null,
        Date.now(),
        id
      ).run()
      
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
  requireRole(['admin', 'editor']),
  async (c) => {
    try {
      const id = c.req.param('id')
      const db = c.env.DB
      const bucket = c.env.MEDIA_BUCKET
      
      // Get file info
      const stmt = db.prepare('SELECT * FROM media WHERE id = ?')
      const mediaFile = await stmt.bind(id).first() as any
      
      if (!mediaFile) {
        return c.json({ error: 'Media file not found' }, 404)
      }
      
      // Delete from R2 if bucket is available
      if (bucket && mediaFile.r2_key) {
        try {
          await bucket.delete(mediaFile.r2_key)
        } catch (error) {
          console.error('Error deleting from R2:', error)
          // Continue with database deletion even if R2 deletion fails
        }
      }
      
      // Delete from database
      const deleteStmt = db.prepare('DELETE FROM media WHERE id = ?')
      await deleteStmt.bind(id).run()
      
      return c.json({ message: 'Media file deleted successfully' })
    } catch (error) {
      console.error('Error deleting media file:', error)
      return c.json({ error: 'Failed to delete media file' }, 500)
    }
  }
)

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