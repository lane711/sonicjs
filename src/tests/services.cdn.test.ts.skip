import { describe, it, expect, beforeEach } from 'vitest'
import { CDNService, createCDNService } from '../services/cdn'

describe('CDNService', () => {
  let cdnService: CDNService

  beforeEach(() => {
    cdnService = new CDNService('test-account-id', 'test-bucket', 'cdn.example.com')
  })

  describe('constructor', () => {
    it('should initialize with all parameters', () => {
      expect(cdnService).toBeInstanceOf(CDNService)
    })

    it('should initialize with optional parameters', () => {
      const service = new CDNService()
      expect(service).toBeInstanceOf(CDNService)
    })
  })

  describe('getOptimizedImageUrl', () => {
    it('should generate URL without options', () => {
      const url = cdnService.getOptimizedImageUrl('test-image.jpg')
      expect(url).toBe('https://imagedelivery.net/test-account-id/test-image.jpg/public')
    })

    it('should add width parameter', () => {
      const url = cdnService.getOptimizedImageUrl('test-image.jpg', { width: 800 })
      expect(url).toContain('w=800')
    })

    it('should add height parameter', () => {
      const url = cdnService.getOptimizedImageUrl('test-image.jpg', { height: 600 })
      expect(url).toContain('h=600')
    })

    it('should add format parameter', () => {
      const url = cdnService.getOptimizedImageUrl('test-image.jpg', { format: 'webp' })
      expect(url).toContain('f=webp')
    })

    it('should not add format parameter for auto', () => {
      const url = cdnService.getOptimizedImageUrl('test-image.jpg', { format: 'auto' })
      expect(url).not.toContain('f=auto')
    })

    it('should add quality parameter', () => {
      const url = cdnService.getOptimizedImageUrl('test-image.jpg', { quality: 85 })
      expect(url).toContain('q=85')
    })

    it('should add fit parameter', () => {
      const url = cdnService.getOptimizedImageUrl('test-image.jpg', { fit: 'cover' })
      expect(url).toContain('fit=cover')
    })

    it('should add gravity parameter', () => {
      const url = cdnService.getOptimizedImageUrl('test-image.jpg', { gravity: 'center' })
      expect(url).toContain('gravity=center')
    })

    it('should add background parameter', () => {
      const url = cdnService.getOptimizedImageUrl('test-image.jpg', { background: 'white' })
      expect(url).toContain('background=white')
    })

    it('should add blur parameter', () => {
      const url = cdnService.getOptimizedImageUrl('test-image.jpg', { blur: 10 })
      expect(url).toContain('blur=10')
    })

    it('should add sharpen parameter', () => {
      const url = cdnService.getOptimizedImageUrl('test-image.jpg', { sharpen: 5 })
      expect(url).toContain('sharpen=5')
    })

    it('should combine multiple options', () => {
      const url = cdnService.getOptimizedImageUrl('test-image.jpg', {
        width: 800,
        height: 600,
        format: 'webp',
        quality: 85,
        fit: 'cover'
      })
      expect(url).toContain('w=800')
      expect(url).toContain('h=600')
      expect(url).toContain('f=webp')
      expect(url).toContain('q=85')
      expect(url).toContain('fit=cover')
    })

    it('should fallback to direct URL when no account ID', () => {
      const serviceWithoutAccount = new CDNService(undefined, 'test-bucket', 'cdn.example.com')
      const url = serviceWithoutAccount.getOptimizedImageUrl('test-image.jpg')
      expect(url).toBe('https://cdn.example.com/test-image.jpg')
    })
  })

  describe('getThumbnailUrl', () => {
    it('should generate thumbnail with default size', () => {
      const url = cdnService.getThumbnailUrl('test-image.jpg')
      expect(url).toContain('w=200')
      expect(url).toContain('h=200')
      expect(url).toContain('fit=cover')
    })

    it('should generate thumbnail with custom size', () => {
      const url = cdnService.getThumbnailUrl('test-image.jpg', 300)
      expect(url).toContain('w=300')
      expect(url).toContain('h=300')
    })
  })

  describe('getResponsiveUrls', () => {
    it('should generate multiple responsive URLs', () => {
      const urls = cdnService.getResponsiveUrls('test-image.jpg')

      expect(urls).toHaveProperty('thumbnail')
      expect(urls).toHaveProperty('small')
      expect(urls).toHaveProperty('medium')
      expect(urls).toHaveProperty('large')
      expect(urls).toHaveProperty('original')
    })

    it('should have correct sizes for each variant', () => {
      const urls = cdnService.getResponsiveUrls('test-image.jpg')

      expect(urls.thumbnail).toContain('w=200')
      expect(urls.small).toContain('w=400')
      expect(urls.medium).toContain('w=800')
      expect(urls.large).toContain('w=1200')
    })

    it('should use direct URL for original', () => {
      const urls = cdnService.getResponsiveUrls('test-image.jpg')
      expect(urls.original).toBe('https://cdn.example.com/test-image.jpg')
    })
  })

  describe('getDirectUrl', () => {
    it('should use custom domain when provided', () => {
      const url = cdnService.getDirectUrl('test-file.pdf')
      expect(url).toBe('https://cdn.example.com/test-file.pdf')
    })

    it('should use R2 public URL when no custom domain', () => {
      const service = new CDNService('test-account', 'test-bucket')
      const url = service.getDirectUrl('test-file.pdf')
      expect(url).toBe('https://pub-test-bucket.r2.dev/test-file.pdf')
    })

    it('should fallback to local path when no config', () => {
      const service = new CDNService()
      const url = service.getDirectUrl('test-file.pdf')
      expect(url).toBe('/media/file/test-file.pdf')
    })
  })

  describe('getVideoUrl', () => {
    it('should return direct URL for videos', () => {
      const url = cdnService.getVideoUrl('test-video.mp4')
      expect(url).toBe('https://cdn.example.com/test-video.mp4')
    })
  })

  describe('getDownloadUrl', () => {
    it('should generate download URL with filename', () => {
      const url = cdnService.getDownloadUrl('test-file.pdf', 'document.pdf')
      expect(url).toContain('https://cdn.example.com/test-file.pdf')
      expect(url).toContain('response-content-disposition=attachment')
      expect(url).toContain('filename')
    })

    it('should encode special characters in filename', () => {
      const url = cdnService.getDownloadUrl('test.pdf', 'My Document (1).pdf')
      expect(url).toContain('filename')
      expect(url).toContain('My%20Document')
    })
  })

  describe('generateSrcSet', () => {
    it('should generate proper srcset string', () => {
      const srcset = cdnService.generateSrcSet('test-image.jpg')

      expect(srcset).toContain('400w')
      expect(srcset).toContain('800w')
      expect(srcset).toContain('1200w')
      expect(srcset.split(',').length).toBe(3)
    })

    it('should include URLs in srcset', () => {
      const srcset = cdnService.generateSrcSet('test-image.jpg')
      expect(srcset).toContain('imagedelivery.net')
    })
  })

  describe('supportsOptimization', () => {
    it('should return true for image types with account ID', () => {
      expect(cdnService.supportsOptimization('image/jpeg')).toBe(true)
      expect(cdnService.supportsOptimization('image/png')).toBe(true)
      expect(cdnService.supportsOptimization('image/webp')).toBe(true)
    })

    it('should return false for SVG images', () => {
      expect(cdnService.supportsOptimization('image/svg+xml')).toBe(false)
    })

    it('should return false for non-image types', () => {
      expect(cdnService.supportsOptimization('video/mp4')).toBe(false)
      expect(cdnService.supportsOptimization('application/pdf')).toBe(false)
    })

    it('should return false when no account ID', () => {
      const service = new CDNService(undefined, 'test-bucket')
      expect(service.supportsOptimization('image/jpeg')).toBe(false)
    })
  })

  describe('getAssetUrl', () => {
    it('should return download URL for download use case', () => {
      const url = cdnService.getAssetUrl('test.pdf', 'application/pdf', 'download', 'document.pdf')
      expect(url).toContain('response-content-disposition=attachment')
    })

    it('should return thumbnail for image with thumbnail use case', () => {
      const url = cdnService.getAssetUrl('test.jpg', 'image/jpeg', 'thumbnail')
      expect(url).toContain('w=200')
      expect(url).toContain('h=200')
    })

    it('should return optimized URL for image with display use case', () => {
      const url = cdnService.getAssetUrl('test.jpg', 'image/jpeg', 'display')
      expect(url).toContain('w=1200')
    })

    it('should return video URL for video types', () => {
      const url = cdnService.getAssetUrl('test.mp4', 'video/mp4', 'display')
      expect(url).toBe('https://cdn.example.com/test.mp4')
    })

    it('should return direct URL for non-optimizable types', () => {
      const url = cdnService.getAssetUrl('test.pdf', 'application/pdf', 'display')
      expect(url).toBe('https://cdn.example.com/test.pdf')
    })

    it('should default to display use case', () => {
      const url = cdnService.getAssetUrl('test.jpg', 'image/jpeg')
      expect(url).toContain('imagedelivery.net')
    })
  })
})

describe('createCDNService', () => {
  it('should create CDN service with all env variables', () => {
    const env = {
      IMAGES_ACCOUNT_ID: 'test-account',
      MEDIA_BUCKET: {} as R2Bucket,
      CDN_DOMAIN: 'cdn.example.com'
    }

    const service = createCDNService(env, 'custom-bucket')
    expect(service).toBeInstanceOf(CDNService)
  })

  it('should use default bucket name when not provided', () => {
    const env = {
      IMAGES_ACCOUNT_ID: 'test-account'
    }

    const service = createCDNService(env)
    expect(service).toBeInstanceOf(CDNService)
  })

  it('should work with minimal env config', () => {
    const env = {}
    const service = createCDNService(env)
    expect(service).toBeInstanceOf(CDNService)
  })

  it('should pass through environment variables correctly', () => {
    const env = {
      IMAGES_ACCOUNT_ID: 'test-account-123',
      MEDIA_BUCKET: {} as R2Bucket,
      CDN_DOMAIN: 'custom.cdn.com'
    }

    const service = createCDNService(env)
    const url = service.getDirectUrl('test.jpg')
    expect(url).toContain('custom.cdn.com')
  })
})
