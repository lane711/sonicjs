import { Context, Next } from 'hono'
import { compress } from 'hono/compress'

/**
 * Add cache headers for static admin pages
 * Only caches authenticated pages with short TTL
 */
export const cacheHeaders = (maxAge: number = 60) => {
  return async (c: Context, next: Next) => {
    await next()

    // Only cache successful HTML responses
    if (c.res.status === 200 && c.res.headers.get('Content-Type')?.includes('text/html')) {
      c.res.headers.set('Cache-Control', `private, max-age=${maxAge}`)
    }
  }
}

/**
 * Compression middleware - only compress if client supports it
 */
export const compressionMiddleware = compress()

/**
 * Set security headers
 */
export const securityHeaders = () => {
  return async (c: Context, next: Next) => {
    await next()

    // Add security headers
    c.res.headers.set('X-Content-Type-Options', 'nosniff')
    c.res.headers.set('X-Frame-Options', 'SAMEORIGIN')
    c.res.headers.set('X-XSS-Protection', '1; mode=block')
  }
}
