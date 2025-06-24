// Cloudflare Images API integration for image transformation and optimization
export interface CloudflareImagesConfig {
  accountId: string
  apiToken: string
  accountHash: string
  variantsBaseUrl?: string
}

export interface ImageVariant {
  id: string
  options: {
    fit: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
    width?: number
    height?: number
    quality?: number
    format?: 'auto' | 'webp' | 'jpeg' | 'png'
    sharpen?: number
    blur?: number
    brightness?: number
    contrast?: number
    gamma?: number
    background?: string
  }
  neverRequireSignedURLs?: boolean
}

export interface ImageUploadOptions {
  id?: string
  requireSignedURLs?: boolean
  metadata?: Record<string, string>
}

export interface TransformOptions {
  width?: number
  height?: number
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
  quality?: number
  format?: 'auto' | 'webp' | 'jpeg' | 'png'
  sharpen?: number
  blur?: number
  brightness?: number
  contrast?: number
  gamma?: number
  background?: string
  dpr?: number
}

export class CloudflareImages {
  private config: CloudflareImagesConfig

  constructor(config: CloudflareImagesConfig) {
    this.config = config
  }

  // Upload image to Cloudflare Images
  async uploadImage(
    imageData: ArrayBuffer | Uint8Array,
    options: ImageUploadOptions = {}
  ): Promise<{ id: string; filename: string; uploaded: string; variants: string[] }> {
    try {
      const formData = new FormData()
      const blob = new Blob([imageData])
      formData.append('file', blob)
      
      if (options.id) {
        formData.append('id', options.id)
      }
      
      if (options.requireSignedURLs !== undefined) {
        formData.append('requireSignedURLs', options.requireSignedURLs.toString())
      }
      
      if (options.metadata) {
        formData.append('metadata', JSON.stringify(options.metadata))
      }

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/images/v1`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
          },
          body: formData
        }
      )

      if (!response.ok) {
        const errorData = await response.json() as any
        throw new Error(`Cloudflare Images API error: ${errorData.errors?.[0]?.message || 'Unknown error'}`)
      }

      const data = await response.json() as any
      return data.result
    } catch (error) {
      console.error('Error uploading to Cloudflare Images:', error)
      throw new Error('Failed to upload image to Cloudflare Images')
    }
  }

  // Delete image from Cloudflare Images
  async deleteImage(imageId: string): Promise<void> {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/images/v1/${imageId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json() as any
        throw new Error(`Cloudflare Images API error: ${errorData.errors?.[0]?.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting from Cloudflare Images:', error)
      throw new Error('Failed to delete image from Cloudflare Images')
    }
  }

  // Get image details
  async getImageDetails(imageId: string): Promise<any> {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/images/v1/${imageId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json() as any
        throw new Error(`Cloudflare Images API error: ${errorData.errors?.[0]?.message || 'Unknown error'}`)
      }

      const data = await response.json() as any
      return data.result
    } catch (error) {
      console.error('Error getting image details:', error)
      throw new Error('Failed to get image details')
    }
  }

  // Create image variant
  async createVariant(variant: ImageVariant): Promise<any> {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/images/v1/variants`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(variant)
        }
      )

      if (!response.ok) {
        const errorData = await response.json() as any
        throw new Error(`Cloudflare Images API error: ${errorData.errors?.[0]?.message || 'Unknown error'}`)
      }

      const data = await response.json() as any
      return data.result
    } catch (error) {
      console.error('Error creating variant:', error)
      throw new Error('Failed to create image variant')
    }
  }

  // Generate image URL with transformations
  generateImageUrl(
    imageId: string,
    variant: string = 'public',
    transforms?: TransformOptions
  ): string {
    let url = `https://imagedelivery.net/${this.config.accountHash}/${imageId}/${variant}`
    
    if (transforms) {
      const params = new URLSearchParams()
      
      Object.entries(transforms).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
    }
    
    return url
  }

  // Generate responsive image URLs
  generateResponsiveUrls(
    imageId: string,
    variant: string = 'public'
  ): { [key: string]: string } {
    const sizes = {
      thumbnail: { width: 150, height: 150, fit: 'cover' as const },
      small: { width: 300, height: 300, fit: 'scale-down' as const },
      medium: { width: 600, height: 400, fit: 'scale-down' as const },
      large: { width: 1200, height: 800, fit: 'scale-down' as const },
      xl: { width: 1920, height: 1080, fit: 'scale-down' as const }
    }

    const urls: { [key: string]: string } = {}
    
    Object.entries(sizes).forEach(([sizeName, options]) => {
      urls[sizeName] = this.generateImageUrl(imageId, variant, options)
    })
    
    return urls
  }

  // Generate optimized image for different formats
  generateOptimizedUrls(
    imageId: string,
    variant: string = 'public',
    baseOptions: TransformOptions = {}
  ): { webp: string; jpeg: string; png: string; auto: string } {
    return {
      webp: this.generateImageUrl(imageId, variant, { ...baseOptions, format: 'webp' }),
      jpeg: this.generateImageUrl(imageId, variant, { ...baseOptions, format: 'jpeg' }),
      png: this.generateImageUrl(imageId, variant, { ...baseOptions, format: 'png' }),
      auto: this.generateImageUrl(imageId, variant, { ...baseOptions, format: 'auto' })
    }
  }

  // Generate srcset for responsive images
  generateSrcSet(
    imageId: string,
    variant: string = 'public',
    widths: number[] = [300, 600, 900, 1200, 1500]
  ): string {
    return widths
      .map(width => {
        const url = this.generateImageUrl(imageId, variant, { width, fit: 'scale-down' })
        return `${url} ${width}w`
      })
      .join(', ')
  }
}

// Pre-defined image variants for common use cases
export const DEFAULT_IMAGE_VARIANTS: ImageVariant[] = [
  {
    id: 'thumbnail',
    options: {
      fit: 'cover',
      width: 150,
      height: 150,
      quality: 85,
      format: 'auto'
    }
  },
  {
    id: 'small',
    options: {
      fit: 'scale-down',
      width: 300,
      quality: 85,
      format: 'auto'
    }
  },
  {
    id: 'medium',
    options: {
      fit: 'scale-down',
      width: 600,
      quality: 85,
      format: 'auto'
    }
  },
  {
    id: 'large',
    options: {
      fit: 'scale-down',
      width: 1200,
      quality: 85,
      format: 'auto'
    }
  },
  {
    id: 'hero',
    options: {
      fit: 'cover',
      width: 1920,
      height: 1080,
      quality: 90,
      format: 'auto'
    }
  },
  {
    id: 'avatar',
    options: {
      fit: 'cover',
      width: 200,
      height: 200,
      quality: 85,
      format: 'auto'
    }
  }
]

// Image optimization utilities
export class ImageOptimizer {
  private cfImages: CloudflareImages

  constructor(cfImages: CloudflareImages) {
    this.cfImages = cfImages
  }

  // Optimize image for web delivery
  async optimizeForWeb(
    imageData: ArrayBuffer,
    options: {
      maxWidth?: number
      maxHeight?: number
      quality?: number
      format?: 'auto' | 'webp' | 'jpeg'
    } = {}
  ): Promise<{
    original: string
    optimized: { [key: string]: string }
    responsive: { [key: string]: string }
  }> {
    try {
      // Upload to Cloudflare Images
      const uploadResult = await this.cfImages.uploadImage(imageData)
      const imageId = uploadResult.id

      // Generate optimized URLs
      const optimizedUrls = this.cfImages.generateOptimizedUrls(imageId, 'public', {
        width: options.maxWidth,
        height: options.maxHeight,
        quality: options.quality || 85,
        format: options.format || 'auto'
      })

      // Generate responsive URLs
      const responsiveUrls = this.cfImages.generateResponsiveUrls(imageId)

      return {
        original: this.cfImages.generateImageUrl(imageId),
        optimized: optimizedUrls,
        responsive: responsiveUrls
      }
    } catch (error) {
      console.error('Error optimizing image:', error)
      throw new Error('Failed to optimize image')
    }
  }

  // Generate picture element HTML for responsive images
  generatePictureElement(
    imageId: string,
    alt: string = '',
    className: string = '',
    variant: string = 'public'
  ): string {
    const webpSrcSet = this.cfImages.generateSrcSet(imageId, variant)
    const jpegSrcSet = this.cfImages.generateSrcSet(imageId, variant)
    const fallbackUrl = this.cfImages.generateImageUrl(imageId, variant, { width: 800 })

    return `
      <picture${className ? ` class="${className}"` : ''}>
        <source srcset="${webpSrcSet}" type="image/webp">
        <source srcset="${jpegSrcSet}" type="image/jpeg">
        <img 
          src="${fallbackUrl}" 
          alt="${alt}"
          loading="lazy"
          decoding="async"
        >
      </picture>
    `
  }

  // Generate responsive image with sizes
  generateResponsiveImage(
    imageId: string,
    alt: string = '',
    sizes: string = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    className: string = '',
    variant: string = 'public'
  ): string {
    const srcSet = this.cfImages.generateSrcSet(imageId, variant)
    const fallbackUrl = this.cfImages.generateImageUrl(imageId, variant, { width: 800 })

    return `
      <img 
        src="${fallbackUrl}"
        srcset="${srcSet}"
        sizes="${sizes}"
        alt="${alt}"
        loading="lazy"
        decoding="async"
        ${className ? `class="${className}"` : ''}
      >
    `
  }
}

// Helper function to detect image type from buffer
export function detectImageType(buffer: ArrayBuffer): string | null {
  const uint8Array = new Uint8Array(buffer)
  
  // Check for common image file signatures
  if (uint8Array.length >= 4) {
    // PNG
    if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47) {
      return 'image/png'
    }
    
    // JPEG
    if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8) {
      return 'image/jpeg'
    }
    
    // GIF
    if (uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46) {
      return 'image/gif'
    }
    
    // WebP
    if (uint8Array[0] === 0x52 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46 && uint8Array[3] === 0x46) {
      return 'image/webp'
    }
  }
  
  return null
}

// Helper function to get optimal image format based on browser support
export function getOptimalImageFormat(userAgent: string): 'webp' | 'jpeg' {
  // Check for WebP support in user agent
  const supportsWebP = /Chrome|Opera|Edge|Firefox/.test(userAgent) && 
                      !/Safari/.test(userAgent) || 
                      /Safari/.test(userAgent) && /Version\/1[4-9]/.test(userAgent)
  
  return supportsWebP ? 'webp' : 'jpeg'
}