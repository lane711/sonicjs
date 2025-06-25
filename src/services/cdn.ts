/**
 * CDN Service for asset delivery and image optimization
 * Integrates with Cloudflare Images and R2 for optimal delivery
 */

export interface ImageTransformOptions {
  width?: number
  height?: number
  format?: 'auto' | 'jpeg' | 'png' | 'webp' | 'avif'
  quality?: number
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad'
  gravity?: 'auto' | 'left' | 'right' | 'top' | 'bottom' | 'center'
  background?: string
  blur?: number
  sharpen?: number
}

export class CDNService {
  constructor(
    private imagesAccountId?: string,
    private r2BucketName?: string,
    private customDomain?: string
  ) {}

  /**
   * Generate optimized image URL using Cloudflare Images
   */
  getOptimizedImageUrl(r2Key: string, options: ImageTransformOptions = {}): string {
    if (!this.imagesAccountId) {
      // Fallback to direct R2 URL if Images not configured
      return this.getDirectUrl(r2Key)
    }

    const params = new URLSearchParams()
    
    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (options.format && options.format !== 'auto') params.set('f', options.format)
    if (options.quality) params.set('q', options.quality.toString())
    if (options.fit) params.set('fit', options.fit)
    if (options.gravity) params.set('gravity', options.gravity)
    if (options.background) params.set('background', options.background)
    if (options.blur) params.set('blur', options.blur.toString())
    if (options.sharpen) params.set('sharpen', options.sharpen.toString())

    const variant = params.toString() ? `?${params.toString()}` : ''
    return `https://imagedelivery.net/${this.imagesAccountId}/${r2Key}/public${variant}`
  }

  /**
   * Generate thumbnail URL
   */
  getThumbnailUrl(r2Key: string, size: number = 200): string {
    return this.getOptimizedImageUrl(r2Key, {
      width: size,
      height: size,
      fit: 'cover',
      format: 'auto',
      quality: 85
    })
  }

  /**
   * Generate responsive image URLs for different screen sizes
   */
  getResponsiveUrls(r2Key: string): { [key: string]: string } {
    return {
      thumbnail: this.getOptimizedImageUrl(r2Key, { width: 200, height: 200, fit: 'cover' }),
      small: this.getOptimizedImageUrl(r2Key, { width: 400, format: 'auto', quality: 80 }),
      medium: this.getOptimizedImageUrl(r2Key, { width: 800, format: 'auto', quality: 85 }),
      large: this.getOptimizedImageUrl(r2Key, { width: 1200, format: 'auto', quality: 90 }),
      original: this.getDirectUrl(r2Key)
    }
  }

  /**
   * Generate direct R2 URL without optimization
   */
  getDirectUrl(r2Key: string): string {
    if (this.customDomain) {
      return `https://${this.customDomain}/${r2Key}`
    }
    
    if (this.r2BucketName) {
      return `https://pub-${this.r2BucketName}.r2.dev/${r2Key}`
    }

    // Fallback - this shouldn't happen in production
    return `/media/file/${r2Key}`
  }

  /**
   * Get video streaming URL
   */
  getVideoUrl(r2Key: string): string {
    // For now, use direct R2 URL for videos
    // In the future, could integrate with Cloudflare Stream
    return this.getDirectUrl(r2Key)
  }

  /**
   * Get download URL with proper headers
   */
  getDownloadUrl(r2Key: string, filename: string): string {
    const baseUrl = this.getDirectUrl(r2Key)
    // Add download disposition if needed
    return `${baseUrl}?response-content-disposition=attachment;filename="${encodeURIComponent(filename)}"`
  }

  /**
   * Generate srcset for responsive images
   */
  generateSrcSet(r2Key: string): string {
    const urls = this.getResponsiveUrls(r2Key)
    return [
      `${urls.small} 400w`,
      `${urls.medium} 800w`,
      `${urls.large} 1200w`
    ].join(', ')
  }

  /**
   * Check if file type supports optimization
   */
  supportsOptimization(mimeType: string): boolean {
    return mimeType.startsWith('image/') && 
           !mimeType.includes('svg') && 
           Boolean(this.imagesAccountId)
  }

  /**
   * Get appropriate URL based on file type and use case
   */
  getAssetUrl(r2Key: string, mimeType: string, useCase: 'thumbnail' | 'display' | 'download' = 'display', filename?: string): string {
    if (useCase === 'download' && filename) {
      return this.getDownloadUrl(r2Key, filename)
    }

    if (mimeType.startsWith('image/') && this.supportsOptimization(mimeType)) {
      if (useCase === 'thumbnail') {
        return this.getThumbnailUrl(r2Key)
      }
      return this.getOptimizedImageUrl(r2Key, {
        format: 'auto',
        quality: 85,
        width: useCase === 'display' ? 1200 : undefined
      })
    }

    if (mimeType.startsWith('video/')) {
      return this.getVideoUrl(r2Key)
    }

    return this.getDirectUrl(r2Key)
  }
}

/**
 * Create CDN service instance
 */
export function createCDNService(env: {
  IMAGES_ACCOUNT_ID?: string
  MEDIA_BUCKET?: R2Bucket
  CDN_DOMAIN?: string
}, bucketName?: string): CDNService {
  // Default bucket names based on environment
  const defaultBucketName = bucketName || 'sonicjs-media-dev'
  
  return new CDNService(
    env.IMAGES_ACCOUNT_ID,
    defaultBucketName,
    env.CDN_DOMAIN
  )
}