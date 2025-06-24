// Cloudflare R2 storage integration
export interface R2Config {
  bucketName: string
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  endpoint?: string
  publicUrl?: string
}

export interface FileMetadata {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  width?: number
  height?: number
  folder: string
  uploadedBy: string
  uploadedAt: number
  tags: string[]
  alt?: string
  caption?: string
  r2Key: string
  publicUrl: string
  thumbnailUrl?: string
}

export interface UploadOptions {
  folder?: string
  generateThumbnail?: boolean
  maxWidth?: number
  maxHeight?: number
  quality?: number
  tags?: string[]
  alt?: string
  caption?: string
}

export class MediaStorage {
  private r2: R2Bucket
  private config: R2Config

  constructor(r2: R2Bucket, config: R2Config) {
    this.r2 = r2
    this.config = config
  }

  // Upload file to R2
  async uploadFile(
    file: File | ArrayBuffer,
    filename: string,
    mimeType: string,
    userId: string,
    options: UploadOptions = {}
  ): Promise<FileMetadata> {
    try {
      const fileId = crypto.randomUUID()
      const extension = filename.split('.').pop()
      const sanitizedName = this.sanitizeFilename(filename)
      const folder = options.folder || 'uploads'
      const timestamp = Date.now()
      
      // Generate R2 key
      const r2Key = `${folder}/${timestamp}-${fileId}.${extension}`
      
      // Determine content type
      const contentType = mimeType || this.getMimeTypeFromExtension(extension || '')
      
      // Upload to R2
      const uploadData = file instanceof File ? await file.arrayBuffer() : file
      
      await this.r2.put(r2Key, uploadData, {
        httpMetadata: {
          contentType,
          cacheControl: 'public, max-age=31536000', // 1 year
        },
        customMetadata: {
          originalName: filename,
          uploadedBy: userId,
          uploadedAt: timestamp.toString(),
          tags: (options.tags || []).join(','),
          alt: options.alt || '',
          caption: options.caption || ''
        }
      })

      // Get file info
      const fileSize = file instanceof File ? file.size : uploadData.byteLength
      let dimensions: { width?: number; height?: number } = {}
      
      // Extract image dimensions if it's an image
      if (this.isImage(contentType)) {
        dimensions = await this.getImageDimensions(uploadData)
      }

      // Generate public URL
      const publicUrl = this.generatePublicUrl(r2Key)
      
      // Create file metadata
      const metadata: FileMetadata = {
        id: fileId,
        filename: sanitizedName,
        originalName: filename,
        mimeType: contentType,
        size: fileSize,
        width: dimensions.width,
        height: dimensions.height,
        folder,
        uploadedBy: userId,
        uploadedAt: timestamp,
        tags: options.tags || [],
        alt: options.alt,
        caption: options.caption,
        r2Key,
        publicUrl
      }

      // Generate thumbnail for images
      if (this.isImage(contentType) && options.generateThumbnail !== false) {
        metadata.thumbnailUrl = await this.generateThumbnail(uploadData, r2Key, options)
      }

      return metadata
    } catch (error) {
      console.error('Error uploading file:', error)
      throw new Error('Failed to upload file')
    }
  }

  // Generate thumbnail
  async generateThumbnail(
    imageData: ArrayBuffer,
    originalKey: string,
    options: UploadOptions
  ): Promise<string> {
    try {
      // For now, return a placeholder. In production, you'd use Cloudflare Images API
      // or implement image resizing with a library like sharp in a Worker
      const thumbnailKey = originalKey.replace(/(\.[^.]+)$/, '_thumb$1')
      
      // Upload smaller version (this is a simplified version)
      await this.r2.put(thumbnailKey, imageData, {
        httpMetadata: {
          contentType: 'image/jpeg',
          cacheControl: 'public, max-age=31536000',
        },
        customMetadata: {
          type: 'thumbnail',
          originalKey
        }
      })

      return this.generatePublicUrl(thumbnailKey)
    } catch (error) {
      console.error('Error generating thumbnail:', error)
      throw new Error('Failed to generate thumbnail')
    }
  }

  // Delete file from R2
  async deleteFile(r2Key: string): Promise<void> {
    try {
      await this.r2.delete(r2Key)
      
      // Also delete thumbnail if exists
      const thumbnailKey = r2Key.replace(/(\.[^.]+)$/, '_thumb$1')
      try {
        await this.r2.delete(thumbnailKey)
      } catch {
        // Thumbnail might not exist, ignore error
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      throw new Error('Failed to delete file')
    }
  }

  // Get file from R2
  async getFile(r2Key: string): Promise<R2Object | null> {
    try {
      return await this.r2.get(r2Key)
    } catch (error) {
      console.error('Error getting file:', error)
      return null
    }
  }

  // List files in folder
  async listFiles(
    folder: string = '',
    limit: number = 100,
    cursor?: string
  ): Promise<{ files: R2Object[]; cursor?: string; hasMore: boolean }> {
    try {
      const options: R2ListOptions = {
        limit,
        prefix: folder ? `${folder}/` : undefined
      }
      
      if (cursor) {
        options.cursor = cursor
      }

      const result = await this.r2.list(options)
      
      return {
        files: result.objects,
        cursor: (result as any).cursor,
        hasMore: result.truncated
      }
    } catch (error) {
      console.error('Error listing files:', error)
      return { files: [], hasMore: false }
    }
  }

  // Generate signed URL for temporary access
  async generateSignedUrl(r2Key: string, expiresIn: number = 3600): Promise<string> {
    // This would require implementing signed URL generation
    // For now, return public URL
    return this.generatePublicUrl(r2Key)
  }

  // Generate public URL
  generatePublicUrl(r2Key: string): string {
    if (this.config.publicUrl) {
      return `${this.config.publicUrl}/${r2Key}`
    }
    
    // Default R2 public URL format
    return `https://${this.config.bucketName}.${this.config.accountId}.r2.cloudflarestorage.com/${r2Key}`
  }

  // File validation
  validateFile(file: File, options: {
    maxSize?: number
    allowedTypes?: string[]
    allowedExtensions?: string[]
  } = {}): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Check file size (default 10MB)
    const maxSize = options.maxSize || 10 * 1024 * 1024
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`)
    }
    
    // Check MIME type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`)
    }
    
    // Check file extension
    if (options.allowedExtensions) {
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (!extension || !options.allowedExtensions.includes(extension)) {
        errors.push(`File extension is not allowed`)
      }
    }
    
    return { valid: errors.length === 0, errors }
  }

  // Utility methods
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase()
  }

  private getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'mp4': 'video/mp4',
      'mp3': 'audio/mpeg',
      'zip': 'application/zip'
    }
    
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
  }

  private isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/')
  }

  private async getImageDimensions(imageData: ArrayBuffer): Promise<{ width?: number; height?: number }> {
    // This would require an image processing library
    // For now, return empty dimensions
    // In production, you could use a library like image-size or implement basic image header parsing
    return {}
  }
}

// Media file types configuration
export const MEDIA_CONFIG = {
  images: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
    thumbnailSizes: {
      small: { width: 150, height: 150 },
      medium: { width: 300, height: 300 },
      large: { width: 800, height: 600 }
    }
  },
  documents: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    allowedExtensions: ['pdf', 'doc', 'docx', 'txt'],
    maxSize: 50 * 1024 * 1024 // 50MB
  },
  videos: {
    allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    allowedExtensions: ['mp4', 'webm', 'mov'],
    maxSize: 100 * 1024 * 1024 // 100MB
  },
  audio: {
    allowedTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
    allowedExtensions: ['mp3', 'wav', 'ogg'],
    maxSize: 25 * 1024 * 1024 // 25MB
  }
}

// Folder structure
export const MEDIA_FOLDERS = {
  uploads: 'uploads',
  images: 'images',
  documents: 'documents',
  videos: 'videos',
  audio: 'audio',
  avatars: 'avatars',
  thumbnails: 'thumbnails',
  temp: 'temp'
} as const

// Helper function to get media configuration by type
export function getMediaConfigByType(type: 'image' | 'document' | 'video' | 'audio') {
  const configs = {
    image: MEDIA_CONFIG.images,
    document: MEDIA_CONFIG.documents,
    video: MEDIA_CONFIG.videos,
    audio: MEDIA_CONFIG.audio
  }
  
  return configs[type] || MEDIA_CONFIG.images
}