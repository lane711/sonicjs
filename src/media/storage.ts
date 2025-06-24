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

// Media storage and processing utilities for Cloudflare R2
import { z } from 'zod'

// File validation schemas
export const fileValidationSchema = z.object({
  filename: z.string().min(1),
  size: z.number().positive().max(50 * 1024 * 1024), // 50MB max
  type: z.string().min(1),
})

// Supported file types
export const SUPPORTED_FILE_TYPES = {
  images: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ],
  documents: [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  videos: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo'
  ],
  audio: [
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'audio/webm'
  ]
}

// Cloudflare API response types
interface CloudflareAPIResponse {
  success: boolean
  result?: {
    id: string
    variants: string[]
    [key: string]: any
  }
  errors?: Array<{
    message: string
    [key: string]: any
  }>
}

// File type detection
export function getFileCategory(mimeType: string): string {
  if (SUPPORTED_FILE_TYPES.images.includes(mimeType)) return 'image'
  if (SUPPORTED_FILE_TYPES.documents.includes(mimeType)) return 'document'
  if (SUPPORTED_FILE_TYPES.videos.includes(mimeType)) return 'video'
  if (SUPPORTED_FILE_TYPES.audio.includes(mimeType)) return 'audio'
  return 'other'
}

// Generate safe filename
export function generateSafeFilename(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()?.toLowerCase() || ''
  const baseName = originalName.split('.')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)
  
  return `${baseName}-${timestamp}-${randomString}.${extension}`
}

// Generate R2 key path
export function generateR2Key(filename: string, folder: string = 'uploads'): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  
  return `${folder}/${year}/${month}/${filename}`
}

// File validation
export function validateFile(file: File): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check file size (50MB limit)
  if (file.size > 50 * 1024 * 1024) {
    errors.push('File size exceeds 50MB limit')
  }
  
  // Check file type
  const allSupportedTypes = [
    ...SUPPORTED_FILE_TYPES.images,
    ...SUPPORTED_FILE_TYPES.documents,
    ...SUPPORTED_FILE_TYPES.videos,
    ...SUPPORTED_FILE_TYPES.audio
  ]
  
  if (!allSupportedTypes.includes(file.type)) {
    errors.push(`Unsupported file type: ${file.type}`)
  }
  
  // Check filename
  if (!file.name || file.name.length === 0) {
    errors.push('Filename is required')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Image processing utilities
export interface ImageDimensions {
  width: number
  height: number
}

export async function getImageDimensions(file: File): Promise<ImageDimensions | null> {
  if (!file.type.startsWith('image/')) return null
  
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }
    img.onerror = () => resolve(null)
    img.src = URL.createObjectURL(file)
  })
}

// R2 Storage Manager
export class R2StorageManager {
  private bucket: R2Bucket
  private cdnDomain?: string
  
  constructor(bucket: R2Bucket, cdnDomain?: string) {
    this.bucket = bucket
    this.cdnDomain = cdnDomain
  }
  
  // Upload file to R2
  async uploadFile(
    file: File,
    key: string,
    metadata: Record<string, string> = {}
  ): Promise<{ success: boolean; key: string; publicUrl: string; error?: string }> {
    try {
      const buffer = await file.arrayBuffer()
      
      await this.bucket.put(key, buffer, {
        httpMetadata: {
          contentType: file.type,
        },
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          ...metadata
        }
      })
      
      // Generate public URL - for now we'll use a placeholder that can be configured
      // In production, this should be set to your actual R2 bucket public domain
      const publicUrl = this.cdnDomain ? 
        `https://${this.cdnDomain}/${key}` : 
        `/media/serve/${encodeURIComponent(key)}` // Serve through our API endpoint
      
      return {
        success: true,
        key,
        publicUrl
      }
    } catch (error) {
      console.error('Error uploading file to R2:', error)
      return {
        success: false,
        key,
        publicUrl: '',
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }
  
  // Delete file from R2
  async deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.bucket.delete(key)
      return { success: true }
    } catch (error) {
      console.error('Error deleting file from R2:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      }
    }
  }
  
  // Get file from R2
  async getFile(key: string): Promise<R2Object | null> {
    try {
      return await this.bucket.get(key)
    } catch (error) {
      console.error('Error getting file from R2:', error)
      return null
    }
  }
  
  // Generate presigned URL for direct uploads
  async generatePresignedUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Note: R2 presigned URLs would need to be implemented via CF API
      // For now, we'll use direct upload through our API
      return {
        success: false,
        error: 'Presigned URLs not implemented yet'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate presigned URL'
      }
    }
  }
}

// Cloudflare Images integration
export class CloudflareImagesManager {
  private accountId: string
  private apiToken: string
  
  constructor(accountId: string, apiToken: string) {
    this.accountId = accountId
    this.apiToken = apiToken
  }
  
  // Upload image to Cloudflare Images
  async uploadImage(
    file: File,
    metadata: Record<string, string> = {}
  ): Promise<{ success: boolean; id?: string; url?: string; error?: string }> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      Object.entries(metadata).forEach(([key, value]) => {
        formData.append(`metadata[${key}]`, value)
      })
      
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
          body: formData
        }
      )
      
      const result = await response.json() as CloudflareAPIResponse
      
      if (result.success && result.result) {
        return {
          success: true,
          id: result.result.id,
          url: result.result.variants[0] // Default variant
        }
      } else {
        return {
          success: false,
          error: result.errors?.[0]?.message || 'Upload failed'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }
  
  // Delete image from Cloudflare Images
  async deleteImage(imageId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1/${imageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          }
        }
      )
      
      const result = await response.json() as CloudflareAPIResponse
      
      if (result.success) {
        return { success: true }
      } else {
        return {
          success: false,
          error: result.errors?.[0]?.message || 'Delete failed'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      }
    }
  }
  
  // Generate image URL with transformations
  generateImageUrl(
    imageId: string,
    transformations: {
      width?: number
      height?: number
      fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
      format?: 'webp' | 'avif' | 'jpeg' | 'png'
      quality?: number
    } = {}
  ): string {
    const params = new URLSearchParams()
    
    if (transformations.width) params.set('width', transformations.width.toString())
    if (transformations.height) params.set('height', transformations.height.toString())
    if (transformations.fit) params.set('fit', transformations.fit)
    if (transformations.format) params.set('format', transformations.format)
    if (transformations.quality) params.set('quality', transformations.quality.toString())
    
    const queryString = params.toString()
    const baseUrl = `https://imagedelivery.net/${this.accountId}/${imageId}/public`
    
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }
}

// File size formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Generate thumbnail for images
export async function generateThumbnail(
  file: File,
  maxWidth: number = 300,
  maxHeight: number = 300
): Promise<Blob | null> {
  if (!file.type.startsWith('image/')) return null
  
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Calculate thumbnail dimensions
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }
      
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
      }
      
      canvas.toBlob(
        (blob) => resolve(blob || null),
        'image/jpeg',
        0.8
      )
    }
    
    img.onerror = () => resolve(null)
    img.src = URL.createObjectURL(file)
  })
}