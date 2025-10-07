// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  MediaStorage,
  R2StorageManager,
  CloudflareImagesManager,
  generateSafeFilename,
  generateR2Key,
  validateFile,
  getFileCategory,
  formatFileSize,
  getMediaConfigByType,
  MEDIA_CONFIG,
  MEDIA_FOLDERS,
  SUPPORTED_FILE_TYPES
} from '../media/storage'

describe('generateSafeFilename', () => {
  it('should generate safe filename with timestamp and random string', () => {
    const filename = generateSafeFilename('Test File.png')
    expect(filename).toMatch(/^test-file-\d+-[a-z0-9]{6}\.png$/)
  })

  it('should handle special characters', () => {
    const filename = generateSafeFilename('Test@File#123!.jpg')
    // Should sanitize special chars and lowercase
    expect(filename).toMatch(/^test-file-123-*\d+-[a-z0-9]{6}\.jpg$/)
  })

  it('should handle long filenames', () => {
    const longName = 'a'.repeat(100) + '.txt'
    const filename = generateSafeFilename(longName)
    const nameWithoutExt = filename.split('.')[0]
    expect(nameWithoutExt.split('-').slice(0, -2).join('-').length).toBeLessThanOrEqual(50)
  })
})

describe('generateR2Key', () => {
  it('should generate R2 key with year/month structure', () => {
    const key = generateR2Key('test-file.jpg', 'images')
    expect(key).toMatch(/^images\/\d{4}\/\d{2}\/test-file\.jpg$/)
  })

  it('should use default folder when not specified', () => {
    const key = generateR2Key('test-file.jpg')
    expect(key).toMatch(/^uploads\/\d{4}\/\d{2}\/test-file\.jpg$/)
  })
})

describe('validateFile', () => {
  it('should validate a valid image file', () => {
    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }) // 1MB

    const result = validateFile(file)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject file exceeding size limit', () => {
    const file = new File(['content'], 'large.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 51 * 1024 * 1024 }) // 51MB

    const result = validateFile(file)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('File size exceeds 50MB limit')
  })

  it('should reject unsupported file type', () => {
    const file = new File(['content'], 'test.xyz', { type: 'application/unknown' })
    Object.defineProperty(file, 'size', { value: 1024 })

    const result = validateFile(file)
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('Unsupported file type')
  })

  it('should reject file without name', () => {
    const file = new File(['content'], '', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: 1024 })

    const result = validateFile(file)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Filename is required')
  })
})

describe('getFileCategory', () => {
  it('should categorize image files', () => {
    expect(getFileCategory('image/jpeg')).toBe('image')
    expect(getFileCategory('image/png')).toBe('image')
  })

  it('should categorize document files', () => {
    expect(getFileCategory('application/pdf')).toBe('document')
    expect(getFileCategory('text/plain')).toBe('document')
  })

  it('should categorize video files', () => {
    expect(getFileCategory('video/mp4')).toBe('video')
  })

  it('should categorize audio files', () => {
    expect(getFileCategory('audio/mpeg')).toBe('audio')
  })

  it('should return other for unknown types', () => {
    expect(getFileCategory('application/unknown')).toBe('other')
  })
})

describe('formatFileSize', () => {
  it('should format zero bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes')
  })

  it('should format bytes', () => {
    expect(formatFileSize(500)).toBe('500 Bytes')
  })

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(1536)).toBe('1.5 KB')
  })

  it('should format megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB')
    expect(formatFileSize(1024 * 1024 * 5.5)).toBe('5.5 MB')
  })

  it('should format gigabytes', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
  })
})

describe('getMediaConfigByType', () => {
  it('should return image config', () => {
    const config = getMediaConfigByType('image')
    expect(config).toEqual(MEDIA_CONFIG.images)
  })

  it('should return document config', () => {
    const config = getMediaConfigByType('document')
    expect(config).toEqual(MEDIA_CONFIG.documents)
  })

  it('should return video config', () => {
    const config = getMediaConfigByType('video')
    expect(config).toEqual(MEDIA_CONFIG.videos)
  })

  it('should return audio config', () => {
    const config = getMediaConfigByType('audio')
    expect(config).toEqual(MEDIA_CONFIG.audio)
  })

  it('should return default config for unknown type', () => {
    const config = getMediaConfigByType('unknown' as any)
    expect(config).toEqual(MEDIA_CONFIG.images)
  })
})

describe('MediaStorage', () => {
  let mediaStorage: MediaStorage
  let mockR2: any
  let mockConfig: any

  beforeEach(() => {
    mockR2 = {
      put: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue({ key: 'test-key' }),
      delete: vi.fn().mockResolvedValue(undefined),
      list: vi.fn().mockResolvedValue({
        objects: [],
        truncated: false
      })
    }

    mockConfig = {
      bucketName: 'test-bucket',
      accountId: 'test-account',
      accessKeyId: 'test-key',
      secretAccessKey: 'test-secret',
      publicUrl: 'https://cdn.example.com'
    }

    mediaStorage = new MediaStorage(mockR2, mockConfig)
  })

  describe('constructor', () => {
    it('should initialize with config', () => {
      expect(mediaStorage).toBeInstanceOf(MediaStorage)
    })
  })

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const buffer = new ArrayBuffer(1024)
      const result = await mediaStorage.uploadFile(
        buffer,
        'test.jpg',
        'image/jpeg',
        'user-123'
      )

      expect(result).toMatchObject({
        filename: expect.any(String),
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        uploadedBy: 'user-123',
        folder: 'uploads'
      })
      expect(mockR2.put).toHaveBeenCalled()
    })

    it('should upload with custom folder', async () => {
      const buffer = new ArrayBuffer(1024)
      const result = await mediaStorage.uploadFile(
        buffer,
        'test.jpg',
        'image/jpeg',
        'user-123',
        { folder: 'images' }
      )

      expect(result.folder).toBe('images')
    })

    it('should upload with tags and metadata', async () => {
      const buffer = new ArrayBuffer(1024)
      const result = await mediaStorage.uploadFile(
        buffer,
        'test.jpg',
        'image/jpeg',
        'user-123',
        {
          tags: ['tag1', 'tag2'],
          alt: 'Test image',
          caption: 'Test caption'
        }
      )

      expect(result.tags).toEqual(['tag1', 'tag2'])
      expect(result.alt).toBe('Test image')
      expect(result.caption).toBe('Test caption')
    })

    it('should handle upload errors', async () => {
      mockR2.put.mockRejectedValue(new Error('Upload failed'))
      const buffer = new ArrayBuffer(1024)

      await expect(
        mediaStorage.uploadFile(buffer, 'test.jpg', 'image/jpeg', 'user-123')
      ).rejects.toThrow('Failed to upload file')
    })
  })

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      await mediaStorage.deleteFile('test-key.jpg')
      expect(mockR2.delete).toHaveBeenCalledWith('test-key.jpg')
    })

    it('should attempt to delete thumbnail', async () => {
      await mediaStorage.deleteFile('test-key.jpg')
      expect(mockR2.delete).toHaveBeenCalledWith('test-key_thumb.jpg')
    })

    it('should handle delete errors', async () => {
      mockR2.delete.mockRejectedValue(new Error('Delete failed'))

      await expect(
        mediaStorage.deleteFile('test-key.jpg')
      ).rejects.toThrow('Failed to delete file')
    })
  })

  describe('getFile', () => {
    it('should get file successfully', async () => {
      const file = await mediaStorage.getFile('test-key')
      expect(file).toEqual({ key: 'test-key' })
      expect(mockR2.get).toHaveBeenCalledWith('test-key')
    })

    it('should return null on error', async () => {
      mockR2.get.mockRejectedValue(new Error('Get failed'))
      const file = await mediaStorage.getFile('test-key')
      expect(file).toBeNull()
    })
  })

  describe('listFiles', () => {
    it('should list files with default parameters', async () => {
      const result = await mediaStorage.listFiles()
      expect(result).toEqual({
        files: [],
        hasMore: false
      })
      expect(mockR2.list).toHaveBeenCalledWith({
        limit: 100,
        prefix: undefined
      })
    })

    it('should list files with folder prefix', async () => {
      await mediaStorage.listFiles('images', 50)
      expect(mockR2.list).toHaveBeenCalledWith({
        limit: 50,
        prefix: 'images/'
      })
    })

    it('should handle pagination cursor', async () => {
      await mediaStorage.listFiles('', 100, 'cursor-123')
      expect(mockR2.list).toHaveBeenCalledWith({
        limit: 100,
        prefix: undefined,
        cursor: 'cursor-123'
      })
    })

    it('should return empty array on error', async () => {
      mockR2.list.mockRejectedValue(new Error('List failed'))
      const result = await mediaStorage.listFiles()
      expect(result).toEqual({ files: [], hasMore: false })
    })
  })

  describe('generatePublicUrl', () => {
    it('should use custom public URL if provided', () => {
      const url = mediaStorage.generatePublicUrl('test-key.jpg')
      expect(url).toBe('https://cdn.example.com/test-key.jpg')
    })

    it('should generate default R2 URL if no public URL', () => {
      const storage = new MediaStorage(mockR2, {
        ...mockConfig,
        publicUrl: undefined
      })
      const url = storage.generatePublicUrl('test-key.jpg')
      expect(url).toBe('https://test-bucket.test-account.r2.cloudflarestorage.com/test-key.jpg')
    })
  })

  describe('validateFile', () => {
    it('should validate file size', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 }) // 11MB

      const result = mediaStorage.validateFile(file, { maxSize: 10 * 1024 * 1024 })
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('exceeds')
    })

    it('should validate MIME type', () => {
      const file = new File(['content'], 'test.jpg', { type: 'application/unknown' })
      Object.defineProperty(file, 'size', { value: 1024 })

      const result = mediaStorage.validateFile(file, {
        allowedTypes: ['image/jpeg', 'image/png']
      })
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('not allowed')
    })

    it('should validate file extension', () => {
      const file = new File(['content'], 'test.xyz', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 1024 })

      const result = mediaStorage.validateFile(file, {
        allowedExtensions: ['jpg', 'png']
      })
      expect(result.valid).toBe(false)
      expect(result.errors[0]).toContain('extension')
    })

    it('should pass valid file', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      Object.defineProperty(file, 'size', { value: 1024 })

      const result = mediaStorage.validateFile(file, {
        maxSize: 10 * 1024 * 1024,
        allowedTypes: ['image/jpeg'],
        allowedExtensions: ['jpg']
      })
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
})

describe('R2StorageManager', () => {
  let manager: R2StorageManager
  let mockBucket: any

  beforeEach(() => {
    mockBucket = {
      put: vi.fn().mockResolvedValue(undefined),
      get: vi.fn().mockResolvedValue({ key: 'test' }),
      delete: vi.fn().mockResolvedValue(undefined)
    }
    manager = new R2StorageManager(mockBucket, 'cdn.example.com')
  })

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const result = await manager.uploadFile(file, 'uploads/test.jpg', { userId: '123' })

      expect(result.success).toBe(true)
      expect(result.key).toBe('uploads/test.jpg')
      expect(result.publicUrl).toBe('https://cdn.example.com/uploads/test.jpg')
      expect(mockBucket.put).toHaveBeenCalled()
    })

    it('should handle upload errors', async () => {
      mockBucket.put.mockRejectedValue(new Error('Upload failed'))
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const result = await manager.uploadFile(file, 'test.jpg')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should use API endpoint URL when CDN domain not provided', async () => {
      const managerNoCDN = new R2StorageManager(mockBucket)
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const result = await managerNoCDN.uploadFile(file, 'test.jpg')

      expect(result.publicUrl).toContain('/media/serve/')
    })
  })

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const result = await manager.deleteFile('test.jpg')
      expect(result.success).toBe(true)
      expect(mockBucket.delete).toHaveBeenCalledWith('test.jpg')
    })

    it('should handle delete errors', async () => {
      mockBucket.delete.mockRejectedValue(new Error('Delete failed'))
      const result = await manager.deleteFile('test.jpg')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('getFile', () => {
    it('should get file successfully', async () => {
      const file = await manager.getFile('test.jpg')
      expect(file).toEqual({ key: 'test' })
    })

    it('should return null on error', async () => {
      mockBucket.get.mockRejectedValue(new Error('Get failed'))
      const file = await manager.getFile('test.jpg')
      expect(file).toBeNull()
    })
  })

  describe('generatePresignedUrl', () => {
    it('should return not implemented error', async () => {
      const result = await manager.generatePresignedUrl('test.jpg')
      expect(result.success).toBe(false)
      expect(result.error).toContain('not implemented')
    })
  })
})

describe('CloudflareImagesManager', () => {
  let manager: CloudflareImagesManager
  let fetchMock: any

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock
    manager = new CloudflareImagesManager('account-123', 'token-456')
  })

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      fetchMock.mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          success: true,
          result: {
            id: 'image-123',
            variants: ['https://imagedelivery.net/account-123/image-123/public']
          }
        })
      })

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const result = await manager.uploadImage(file, { alt: 'Test' })

      expect(result.success).toBe(true)
      expect(result.id).toBe('image-123')
      expect(result.url).toContain('imagedelivery.net')
    })

    it('should handle upload errors', async () => {
      fetchMock.mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          success: false,
          errors: [{ message: 'Upload failed' }]
        })
      })

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const result = await manager.uploadImage(file)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Upload failed')
    })

    it('should handle network errors', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'))

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const result = await manager.uploadImage(file)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      fetchMock.mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          success: true
        })
      })

      const result = await manager.deleteImage('image-123')
      expect(result.success).toBe(true)
    })

    it('should handle delete errors', async () => {
      fetchMock.mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          success: false,
          errors: [{ message: 'Delete failed' }]
        })
      })

      const result = await manager.deleteImage('image-123')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Delete failed')
    })
  })

  describe('generateImageUrl', () => {
    it('should generate URL without transformations', () => {
      const url = manager.generateImageUrl('image-123')
      expect(url).toBe('https://imagedelivery.net/account-123/image-123/public')
    })

    it('should generate URL with transformations', () => {
      const url = manager.generateImageUrl('image-123', {
        width: 800,
        height: 600,
        fit: 'cover',
        format: 'webp',
        quality: 80
      })
      expect(url).toContain('width=800')
      expect(url).toContain('height=600')
      expect(url).toContain('fit=cover')
      expect(url).toContain('format=webp')
      expect(url).toContain('quality=80')
    })
  })
})

describe('MEDIA_CONFIG', () => {
  it('should have proper image config', () => {
    expect(MEDIA_CONFIG.images).toMatchObject({
      allowedTypes: expect.arrayContaining(['image/jpeg', 'image/png']),
      allowedExtensions: expect.arrayContaining(['jpg', 'png']),
      maxSize: expect.any(Number)
    })
  })

  it('should have proper document config', () => {
    expect(MEDIA_CONFIG.documents).toMatchObject({
      allowedTypes: expect.arrayContaining(['application/pdf']),
      maxSize: expect.any(Number)
    })
  })
})

describe('MEDIA_FOLDERS', () => {
  it('should define standard folder structure', () => {
    expect(MEDIA_FOLDERS.uploads).toBe('uploads')
    expect(MEDIA_FOLDERS.images).toBe('images')
    expect(MEDIA_FOLDERS.documents).toBe('documents')
    expect(MEDIA_FOLDERS.videos).toBe('videos')
    expect(MEDIA_FOLDERS.audio).toBe('audio')
  })
})

describe('SUPPORTED_FILE_TYPES', () => {
  it('should define supported image types', () => {
    expect(SUPPORTED_FILE_TYPES.images).toContain('image/jpeg')
    expect(SUPPORTED_FILE_TYPES.images).toContain('image/png')
  })

  it('should define supported document types', () => {
    expect(SUPPORTED_FILE_TYPES.documents).toContain('application/pdf')
  })

  it('should define supported video types', () => {
    expect(SUPPORTED_FILE_TYPES.videos).toContain('video/mp4')
  })

  it('should define supported audio types', () => {
    expect(SUPPORTED_FILE_TYPES.audio).toContain('audio/mpeg')
  })
})
