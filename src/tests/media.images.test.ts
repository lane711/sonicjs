// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CloudflareImages, CloudflareImagesConfig, TransformOptions } from '../media/images'

// Mock fetch globally
global.fetch = vi.fn()

describe('CloudflareImages', () => {
  let cloudflareImages: CloudflareImages
  let mockConfig: CloudflareImagesConfig

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockConfig = {
      accountId: 'test-account-id',
      apiToken: 'test-api-token',
      accountHash: 'test-account-hash',
      variantsBaseUrl: 'https://imagedelivery.net/test-account-hash'
    }
    
    cloudflareImages = new CloudflareImages(mockConfig)
  })

  describe('constructor', () => {
    it('should initialize with config', () => {
      expect(cloudflareImages).toBeInstanceOf(CloudflareImages)
    })

    it('should use default variantsBaseUrl if not provided', () => {
      const configWithoutBaseUrl = {
        accountId: 'test-account',
        apiToken: 'test-token',
        accountHash: 'test-hash'
      }
      
      const instance = new CloudflareImages(configWithoutBaseUrl)
      const url = instance.generateImageUrl('test-id')
      
      expect(url).toBe('https://imagedelivery.net/test-hash/test-id/public')
    })
  })

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          result: {
            id: 'uploaded-image-id',
            filename: 'test-image.jpg',
            uploaded: '2023-01-01T00:00:00Z',
            variants: ['https://imagedelivery.net/test-hash/uploaded-image-id/public']
          }
        })
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      const buffer = new ArrayBuffer(100)
      const options = {
        id: 'custom-id',
        metadata: { alt: 'Test image' }
      }

      const result = await cloudflareImages.uploadImage(buffer, options)

      expect(fetch).toHaveBeenCalledWith(
        'https://api.cloudflare.com/client/v4/accounts/test-account-id/images/v1',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-api-token'
          }
        })
      )

      expect(result.id).toBe('uploaded-image-id')
      expect(result.filename).toBe('test-image.jpg')
    })

    it('should handle upload errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue('File too large'),
        json: vi.fn().mockResolvedValue({
          errors: [{ message: 'File too large' }]
        })
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      const buffer = new ArrayBuffer(100)

      await expect(cloudflareImages.uploadImage(buffer)).rejects.toThrow(
        'Failed to upload image to Cloudflare Images'
      )
    })

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      const buffer = new ArrayBuffer(100)

      await expect(cloudflareImages.uploadImage(buffer)).rejects.toThrow('Failed to upload image to Cloudflare Images')
    })
  })

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          result: {}
        })
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      await cloudflareImages.deleteImage('test-image-id')

      expect(fetch).toHaveBeenCalledWith(
        'https://api.cloudflare.com/client/v4/accounts/test-account-id/images/v1/test-image-id',
        {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer test-api-token'
          }
        }
      )
    })

    it('should handle delete errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue('Image not found'),
        json: vi.fn().mockResolvedValue({
          errors: [{ message: 'Image not found' }]
        })
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      await expect(cloudflareImages.deleteImage('non-existent-id')).rejects.toThrow(
        'Failed to delete image from Cloudflare Images'
      )
    })
  })

  describe('getImageDetails', () => {
    it('should get image details successfully', async () => {
      const mockImageDetails = {
        id: 'test-id',
        filename: 'test.jpg',
        uploaded: '2023-01-01T00:00:00Z',
        variants: ['https://imagedelivery.net/test-hash/test-id/public']
      }

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          result: mockImageDetails
        })
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      const result = await cloudflareImages.getImageDetails('test-id')

      expect(fetch).toHaveBeenCalledWith(
        'https://api.cloudflare.com/client/v4/accounts/test-account-id/images/v1/test-id',
        {
          headers: {
            'Authorization': 'Bearer test-api-token'
          }
        }
      )

      expect(result).toEqual(mockImageDetails)
    })

    it('should handle image not found', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue('Image not found'),
        json: vi.fn().mockResolvedValue({
          errors: [{ message: 'Image not found' }]
        })
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      await expect(cloudflareImages.getImageDetails('non-existent')).rejects.toThrow(
        'Failed to get image details'
      )
    })
  })

  describe('generateImageUrl', () => {
    it('should generate public image URL', () => {
      const url = cloudflareImages.generateImageUrl('test-image-id')
      
      expect(url).toBe('https://imagedelivery.net/test-account-hash/test-image-id/public')
    })

    it('should generate image URL with variant', () => {
      const url = cloudflareImages.generateImageUrl('test-image-id', 'thumbnail')
      
      expect(url).toBe('https://imagedelivery.net/test-account-hash/test-image-id/thumbnail')
    })

    it('should generate image URL with transform options', () => {
      const transforms: TransformOptions = {
        width: 300,
        height: 200,
        fit: 'cover',
        quality: 80,
        format: 'webp'
      }
      
      const url = cloudflareImages.generateImageUrl('test-image-id', 'public', transforms)
      
      expect(url).toContain('width=300')
      expect(url).toContain('height=200')
      expect(url).toContain('fit=cover')
      expect(url).toContain('quality=80')
      expect(url).toContain('format=webp')
    })

    it('should handle transforms with special characters', () => {
      const transforms: TransformOptions = {
        background: '#ff0000',
        fit: 'scale-down'
      }
      
      const url = cloudflareImages.generateImageUrl('test-image-id', 'public', transforms)
      
      expect(url).toContain('background=%23ff0000')
      expect(url).toContain('fit=scale-down')
    })
  })

  describe('generateResponsiveUrls', () => {
    it('should generate responsive URLs', () => {
      const urls = cloudflareImages.generateResponsiveUrls('test-image-id')
      
      expect(urls).toHaveProperty('thumbnail')
      expect(urls).toHaveProperty('small')
      expect(urls).toHaveProperty('medium')
      expect(urls).toHaveProperty('large')
      expect(urls).toHaveProperty('xl')
      
      expect(urls.thumbnail).toContain('width=150')
      expect(urls.small).toContain('width=300')
      expect(urls.medium).toContain('width=600')
    })

    it('should generate responsive URLs with custom variant', () => {
      const urls = cloudflareImages.generateResponsiveUrls('test-image-id', 'custom-variant')
      
      expect(urls.thumbnail).toContain('test-image-id/custom-variant')
    })
  })

  describe('generateOptimizedUrls', () => {
    it('should generate URLs for different formats', () => {
      const urls = cloudflareImages.generateOptimizedUrls('test-image-id')
      
      expect(urls).toHaveProperty('webp')
      expect(urls).toHaveProperty('jpeg')
      expect(urls).toHaveProperty('png')
      expect(urls).toHaveProperty('auto')
      
      expect(urls.webp).toContain('format=webp')
      expect(urls.jpeg).toContain('format=jpeg')
      expect(urls.png).toContain('format=png')
      expect(urls.auto).toContain('format=auto')
    })
  })

  describe('generateSrcSet', () => {
    it('should generate srcset string with default widths', () => {
      const srcset = cloudflareImages.generateSrcSet('test-image-id')
      
      expect(srcset).toContain('?width=300&fit=scale-down 300w')
      expect(srcset).toContain('?width=600&fit=scale-down 600w')
      expect(srcset).toContain('?width=900&fit=scale-down 900w')
      expect(srcset).toContain('?width=1200&fit=scale-down 1200w')
      expect(srcset).toContain('?width=1500&fit=scale-down 1500w')
    })

    it('should generate srcset string with custom widths', () => {
      const customWidths = [400, 800, 1200]
      const srcset = cloudflareImages.generateSrcSet('test-image-id', 'public', customWidths)
      
      expect(srcset).toContain('?width=400&fit=scale-down 400w')
      expect(srcset).toContain('?width=800&fit=scale-down 800w')
      expect(srcset).toContain('?width=1200&fit=scale-down 1200w')
      expect(srcset).not.toContain('?width=300')
    })
  })

  describe('createVariant', () => {
    it('should create image variant successfully', async () => {
      const variant = {
        id: 'thumbnail',
        options: {
          fit: 'cover' as const,
          width: 200,
          height: 200,
          quality: 85
        },
        neverRequireSignedURLs: true
      }

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          result: { variant }
        })
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      const result = await cloudflareImages.createVariant(variant)

      expect(fetch).toHaveBeenCalledWith(
        'https://api.cloudflare.com/client/v4/accounts/test-account-id/images/v1/variants',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-api-token',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(variant)
        }
      )

      expect(result).toBeDefined()
    })

    it('should handle variant creation errors', async () => {
      const variant = {
        id: 'invalid',
        options: { fit: 'cover' as const }
      }

      const mockResponse = {
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue('Invalid variant configuration'),
        json: vi.fn().mockResolvedValue({
          errors: [{ message: 'Invalid variant configuration' }]
        })
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      await expect(cloudflareImages.createVariant(variant)).rejects.toThrow(
        'Failed to create image variant'
      )
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle network timeout', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('fetch timeout'))

      const buffer = new ArrayBuffer(100)

      await expect(cloudflareImages.uploadImage(buffer)).rejects.toThrow('Failed to upload image to Cloudflare Images')
    })

    it('should handle empty response body', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue(''),
        json: vi.fn().mockResolvedValue({})
      }

      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      await expect(cloudflareImages.deleteImage('test-id')).rejects.toThrow(
        'Failed to delete image from Cloudflare Images'
      )
    })
  })
})