/**
 * Core Media Plugin
 * 
 * Provides media management and processing extensions
 */

import { Hono } from 'hono'
// import { z } from 'zod'
import { PluginBuilder, PluginHelpers } from '../../sdk/plugin-builder'
import { Plugin, HOOKS } from '@sonicjs-cms/core'

export function createMediaPlugin(): Plugin {
  const builder = PluginBuilder.create({
    name: 'core-media',
    version: '1.0.0-beta.1',
    description: 'Core media management and processing plugin'
  })

  // Add media metadata
  builder.metadata({
    author: {
      name: 'SonicJS Team',
      email: 'team@sonicjs.com'
    },
    license: 'MIT',
    compatibility: '^0.1.0',
    dependencies: ['core-auth'] // Requires auth for upload permissions
  })

  // Create media API routes
  const mediaAPI = new Hono()

  // GET /media - List media files
  mediaAPI.get('/', async (c) => {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const ____type = c.req.query('type') // image, video, document, etc.

    return c.json({
      message: 'Media list',
      data: {
        files: [],
        pagination: { page, limit, total: 0 }
      }
    })
  })

  // POST /media/upload - Upload media file
  mediaAPI.post('/upload', async (c) => {
    // File upload logic would integrate with existing media service
    return c.json({
      message: 'File uploaded successfully',
      data: {
        id: 'media-123',
        filename: 'example.jpg',
        url: '/media/example.jpg',
        size: 1024,
        type: 'image/jpeg'
      }
    })
  })

  // GET /media/:id - Get media file info
  mediaAPI.get('/:id', async (c) => {
    const id = c.req.param('id')
    return c.json({
      message: 'Media file info',
      data: {
        id,
        filename: 'example.jpg',
        url: `/media/${id}`,
        metadata: {
          width: 1920,
          height: 1080,
          format: 'JPEG'
        }
      }
    })
  })

  // DELETE /media/:id - Delete media file
  mediaAPI.delete('/:id', async (c) => {
    const id = c.req.param('id')
    return c.json({
      message: 'Media file deleted',
      data: { id }
    })
  })

  // POST /media/process - Process media (resize, compress, etc.)
  mediaAPI.post('/process', async (c) => {
    const { id, operations } = await c.req.json()

    return c.json({
      message: 'Media processing started',
      data: {
        jobId: `job-${Date.now()}`,
        status: 'processing'
      }
    })
  })

  // POST /media/create-folder - Create a new folder
  mediaAPI.post('/create-folder', async (c) => {
    try {
      const { folderName } = await c.req.json()

      if (!folderName || typeof folderName !== 'string') {
        return c.json({ success: false, error: 'Folder name is required' }, 400)
      }

      // Validate folder name format
      const folderPattern = /^[a-z0-9-_]+$/
      if (!folderPattern.test(folderName)) {
        return c.json({
          success: false,
          error: 'Folder name can only contain lowercase letters, numbers, hyphens, and underscores'
        }, 400)
      }

      // Note: In a real implementation, you would check if the folder already exists
      // and create it in R2 or update the database accordingly
      // For now, we'll return success as folders are tracked in the media files table

      return c.json({
        success: true,
        message: `Folder "${folderName}" created successfully`,
        data: { folderName }
      })
    } catch (error) {
      console.error('Create folder error:', error)
      return c.json({ success: false, error: 'Failed to create folder' }, 500)
    }
  })

  // POST /media/bulk-move - Move multiple files to a folder
  mediaAPI.post('/bulk-move', async (c) => {
    try {
      const { fileIds, folder } = await c.req.json()

      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return c.json({ success: false, error: 'File IDs array is required' }, 400)
      }

      if (!folder || typeof folder !== 'string') {
        return c.json({ success: false, error: 'Target folder is required' }, 400)
      }

      // Note: In a real implementation, you would update the database
      // to move the files to the specified folder
      // For now, we'll return a success response

      return c.json({
        success: true,
        message: `Successfully moved ${fileIds.length} file(s) to ${folder}`,
        summary: {
          successful: fileIds.length,
          failed: 0,
          total: fileIds.length
        }
      })
    } catch (error) {
      console.error('Bulk move error:', error)
      return c.json({ success: false, error: 'Failed to move files' }, 500)
    }
  })

  builder.addRoute('/api/media', mediaAPI, {
    description: 'Media management API endpoints',
    requiresAuth: true,
    priority: 2
  })

  // Add media processing middleware
  builder.addSingleMiddleware('media-validator', async (c: any, next: any) => {
    const path = c.req.path
    if (path.startsWith('/api/media/upload')) {
      // Validate file uploads
      const contentType = c.req.header('content-type')
      const allowedTypes = ['image/', 'video/', 'application/pdf']
      
      if (contentType && !allowedTypes.some(type => contentType.startsWith(type))) {
        return c.json({ error: 'Unsupported file type' }, 400)
      }
    }
    await next()
  }, {
    description: 'Validate media file uploads',
    routes: ['/api/media/*'],
    priority: 5
  })

  // Add media service
  builder.addService('mediaService', {
    uploadFile: async (file: File, _options?: any) => {
      // File upload implementation
      return {
        id: `media-${Date.now()}`,
        url: `/media/${file.name}`,
        size: file.size,
        type: file.type
      }
    },
    
    deleteFile: async (fileId: string) => {
      // File deletion implementation
      console.info(`Deleting media file: ${fileId}`)
      return true
    },
    
    processImage: async (fileId: string, operations: any[]) => {
      // Image processing implementation
      console.info(`Processing image ${fileId} with operations:`, operations)
      return { jobId: `job-${fileId}-${Date.now()}` }
    },
    
    getMetadata: async (_id: string) => {
      // Extract file metadata
      return {
        width: 1920,
        height: 1080,
        format: 'JPEG',
        size: 1024000
      }
    }
  }, {
    description: 'Core media processing service',
    singleton: true
  })

  // Add media model for database storage
  const mediaSchema = PluginHelpers.createSchema([
    { name: 'filename', type: 'string', optional: false },
    { name: 'originalName', type: 'string', optional: false },
    { name: 'mimeType', type: 'string', optional: false },
    { name: 'size', type: 'number', optional: false },
    { name: 'url', type: 'string', optional: false },
    { name: 'thumbnailUrl', type: 'string', optional: true },
    { name: 'metadata', type: 'object', optional: true },
    { name: 'uploadedBy', type: 'number', optional: true },
    { name: 'tags', type: 'array', optional: true }
  ])

  const mediaMigration = PluginHelpers.createMigration('media_files', [
    { name: 'id', type: 'INTEGER', primaryKey: true },
    { name: 'filename', type: 'TEXT', nullable: false },
    { name: 'original_name', type: 'TEXT', nullable: false },
    { name: 'mime_type', type: 'TEXT', nullable: false },
    { name: 'size', type: 'INTEGER', nullable: false },
    { name: 'url', type: 'TEXT', nullable: false },
    { name: 'thumbnail_url', type: 'TEXT', nullable: true },
    { name: 'metadata', type: 'TEXT', nullable: true },
    { name: 'uploaded_by', type: 'INTEGER', nullable: true },
    { name: 'tags', type: 'TEXT', nullable: true }
  ])

  builder.addModel('MediaFile', {
    tableName: 'media_files',
    schema: mediaSchema,
    migrations: [mediaMigration],
    relationships: [
      {
        type: 'oneToMany',
        target: 'User',
        foreignKey: 'uploaded_by'
      }
    ]
  })

  // Add media hooks
  builder.addHook('media:upload', async (data: any, _context: any) => {
    console.info(`Media upload event: ${data.filename}`)
    
    // Auto-generate thumbnails for images
    if (data.mimeType?.startsWith('image/')) {
      // Trigger thumbnail generation
      data.generateThumbnail = true
    }
    
    return data
  }, {
    priority: 10,
    description: 'Handle media upload events'
  })

  builder.addHook('media:delete', async (data: any, _context: any) => {
    console.info(`Media delete event: ${data.id}`)
    
    // Clean up related files (thumbnails, processed versions)
    data.cleanupFiles = true
    
    return data
  }, {
    priority: 10,
    description: 'Handle media deletion events'
  })

  builder.addHook(HOOKS.CONTENT_SAVE, async (data: any, _context: any) => {
    // Extract media references from content
    const content = data.content || ''
    const mediaReferences = content.match(/\/media\/[a-zA-Z0-9-]+/g) || []
    
    if (mediaReferences.length > 0) {
      data.mediaReferences = mediaReferences
      console.debug(`Content references ${mediaReferences.length} media files`)
    }
    
    return data
  }, {
    priority: 8,
    description: 'Track media usage in content'
  })

  // Add admin pages
  builder.addAdminPage(
    '/media',
    'Media Library',
    'MediaLibraryView',
    {
      description: 'Browse and manage media files',
      permissions: ['admin', 'media:manage'],
      icon: 'photo'
    }
  )

  builder.addAdminPage(
    '/media/upload',
    'Upload Media',
    'MediaUploadView',
    {
      description: 'Upload new media files',
      permissions: ['admin', 'media:upload'],
      icon: 'upload'
    }
  )

  builder.addAdminPage(
    '/media/settings',
    'Media Settings',
    'MediaSettingsView',
    {
      description: 'Configure media processing and storage',
      permissions: ['admin', 'media:configure'],
      icon: 'cog'
    }
  )

  // Add menu items
  builder.addMenuItem('Media', '/admin/media', {
    icon: 'photo',
    order: 30,
    permissions: ['admin', 'media:manage']
  })

  builder.addMenuItem('Library', '/admin/media', {
    icon: 'photo',
    parent: 'Media',
    order: 1,
    permissions: ['admin', 'media:manage']
  })

  builder.addMenuItem('Upload', '/admin/media/upload', {
    icon: 'upload',
    parent: 'Media',
    order: 2,
    permissions: ['admin', 'media:upload']
  })

  builder.addMenuItem('Settings', '/admin/media/settings', {
    icon: 'cog',
    parent: 'Media',
    order: 3,
    permissions: ['admin', 'media:configure']
  })

  // Add lifecycle hooks
  builder.lifecycle({
    install: async () => {
      console.info('Installing media plugin...')
      // Create media storage directories and configurations
    },

    activate: async () => {
      console.info('Activating media plugin...')
      // Initialize media processing services
    },

    deactivate: async () => {
      console.info('Deactivating media plugin...')
      // Clean up media processing resources
    },

    configure: async (config) => {
      console.info('Configuring media plugin...', config)
      // Update media processing settings
    }
  })

  return builder.build() as Plugin
}

// Export the plugin instance
export const mediaPlugin = createMediaPlugin()
