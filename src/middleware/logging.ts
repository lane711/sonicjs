import { Context, Next } from 'hono'
import { getLogger } from '../services/logger'

type Bindings = {
  DB: D1Database
}

type Variables = {
  user?: {
    userId: string
    email: string
    role: string
    exp: number
    iat: number
  }
  requestId?: string
  startTime?: number
}

/**
 * Logging middleware that captures HTTP requests and responses
 */
export function loggingMiddleware() {
  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    const startTime = Date.now()
    const requestId = globalThis.crypto.randomUUID()
    
    // Set request context
    c.set('requestId', requestId)
    c.set('startTime', startTime)

    try {
      const logger = getLogger(c.env.DB)
      const user = c.get('user')
      
      // Extract request information
      const method = c.req.method
      const url = c.req.url
      const userAgent = c.req.header('user-agent') || ''
      const ipAddress = c.req.header('cf-connecting-ip') || 
                       c.req.header('x-forwarded-for') || 
                       c.req.header('x-real-ip') || 
                       'unknown'

      // Continue with request processing
      await next()
      
      const duration = Date.now() - startTime
      const status = c.res.status

      // Log the request
      await logger.logRequest(method, url, status, duration, {
        userId: user?.userId,
        requestId,
        ipAddress,
        userAgent,
        source: 'http-middleware'
      })

      // Log errors if status >= 400
      if (status >= 400) {
        await logger.warn('api', `HTTP ${status} error for ${method} ${url}`, {
          method,
          url,
          status,
          duration,
          userAgent,
          userId: user?.userId
        }, {
          userId: user?.userId,
          requestId,
          ipAddress,
          userAgent,
          method,
          url,
          statusCode: status,
          duration,
          source: 'http-middleware',
          tags: ['http-error', `status-${status}`]
        })
      }

    } catch (error) {
      const duration = Date.now() - startTime
      
      try {
        const logger = getLogger(c.env.DB)
        const user = c.get('user')
        
        await logger.error('api', `Unhandled error in ${c.req.method} ${c.req.url}`, error, {
          userId: user?.userId,
          requestId,
          ipAddress: c.req.header('cf-connecting-ip') || 'unknown',
          userAgent: c.req.header('user-agent') || '',
          method: c.req.method,
          url: c.req.url,
          duration,
          source: 'http-middleware',
          tags: ['unhandled-error']
        })
      } catch (logError) {
        // Fallback to console if logging fails
        console.error('Failed to log error:', logError)
        console.error('Original error:', error)
      }
      
      throw error
    }
  }
}

/**
 * Enhanced logging middleware with more detailed request/response logging
 */
export function detailedLoggingMiddleware() {
  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    const startTime = Date.now()
    const requestId = globalThis.crypto.randomUUID()
    
    c.set('requestId', requestId)
    c.set('startTime', startTime)

    try {
      const logger = getLogger(c.env.DB)
      const user = c.get('user')
      
      const method = c.req.method
      const url = c.req.url
      const userAgent = c.req.header('user-agent') || ''
      const ipAddress = c.req.header('cf-connecting-ip') || 
                       c.req.header('x-forwarded-for') || 
                       c.req.header('x-real-ip') || 
                       'unknown'
      const contentType = c.req.header('content-type') || ''
      const contentLength = c.req.header('content-length') || ''

      // Log request start
      await logger.debug('api', `Starting ${method} ${url}`, {
        method,
        url,
        userAgent,
        contentType,
        contentLength,
        headers: Object.fromEntries(c.req.raw.headers.entries())
      }, {
        userId: user?.userId,
        requestId,
        ipAddress,
        userAgent,
        method,
        url,
        source: 'detailed-middleware',
        tags: ['request-start']
      })

      await next()
      
      const duration = Date.now() - startTime
      const status = c.res.status
      const responseHeaders = Object.fromEntries(c.res.headers.entries())

      // Log request completion
      await logger.info('api', `Completed ${method} ${url} - ${status} (${duration}ms)`, {
        method,
        url,
        status,
        duration,
        responseHeaders,
        responseSize: c.res.headers.get('content-length')
      }, {
        userId: user?.userId,
        requestId,
        ipAddress,
        userAgent,
        method,
        url,
        statusCode: status,
        duration,
        source: 'detailed-middleware',
        tags: ['request-complete', `status-${Math.floor(status / 100)}xx`]
      })

    } catch (error) {
      const duration = Date.now() - startTime
      
      try {
        const logger = getLogger(c.env.DB)
        const user = c.get('user')
        
        await logger.error('api', `Request failed: ${c.req.method} ${c.req.url}`, error, {
          userId: user?.userId,
          requestId,
          ipAddress: c.req.header('cf-connecting-ip') || 'unknown',
          userAgent: c.req.header('user-agent') || '',
          method: c.req.method,
          url: c.req.url,
          duration,
          source: 'detailed-middleware',
          tags: ['request-error']
        })
      } catch (logError) {
        console.error('Failed to log detailed error:', logError)
        console.error('Original error:', error)
      }
      
      throw error
    }
  }
}

/**
 * Security logging middleware for sensitive operations
 */
export function securityLoggingMiddleware() {
  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    const startTime = Date.now()
    const requestId = c.get('requestId') || globalThis.crypto.randomUUID()
    
    try {
      const logger = getLogger(c.env.DB)
      const user = c.get('user')
      const method = c.req.method
      const url = c.req.url
      const ipAddress = c.req.header('cf-connecting-ip') || 'unknown'
      const userAgent = c.req.header('user-agent') || ''

      // Check for suspicious patterns
      const suspiciousPatterns = [
        /script[^>]*>/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /\.\.\/\.\.\//,
        /\/etc\/passwd/i,
        /union\s+select/i,
        /drop\s+table/i
      ]

      const isSuspicious = suspiciousPatterns.some(pattern => 
        pattern.test(url) || pattern.test(userAgent)
      )

      if (isSuspicious) {
        await logger.logSecurity('Suspicious request pattern detected', 'medium', {
          userId: user?.userId,
          requestId,
          ipAddress,
          userAgent,
          method,
          url,
          source: 'security-middleware',
          tags: ['suspicious-pattern']
        })
      }

      await next()

      const duration = Date.now() - startTime
      const status = c.res.status

      // Log authentication failures
      if (url.includes('/auth/') && status === 401) {
        await logger.logSecurity('Authentication failure', 'low', {
          userId: user?.userId,
          requestId,
          ipAddress,
          userAgent,
          method,
          url,
          statusCode: status,
          duration,
          source: 'security-middleware',
          tags: ['auth-failure']
        })
      }

      // Log admin access
      if (url.includes('/admin/') && status < 400) {
        await logger.logSecurity('Admin area access', 'low', {
          userId: user?.userId,
          requestId,
          ipAddress,
          userAgent,
          method,
          url,
          statusCode: status,
          duration,
          source: 'security-middleware',
          tags: ['admin-access']
        })
      }

    } catch (error) {
      try {
        const logger = getLogger(c.env.DB)
        await logger.error('security', 'Security middleware error', error, {
          requestId,
          source: 'security-middleware'
        })
      } catch (logError) {
        console.error('Failed to log security error:', logError)
      }
      
      throw error
    }
  }
}

/**
 * Performance logging middleware for slow requests
 */
export function performanceLoggingMiddleware(slowThreshold: number = 1000) {
  return async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: Next) => {
    const startTime = Date.now()
    const requestId = c.get('requestId') || globalThis.crypto.randomUUID()
    
    await next()
    
    const duration = Date.now() - startTime
    
    if (duration > slowThreshold) {
      try {
        const logger = getLogger(c.env.DB)
        const user = c.get('user')
        
        await logger.warn('system', `Slow request detected: ${c.req.method} ${c.req.url} took ${duration}ms`, {
          method: c.req.method,
          url: c.req.url,
          duration,
          threshold: slowThreshold
        }, {
          userId: user?.userId,
          requestId,
          method: c.req.method,
          url: c.req.url,
          duration,
          source: 'performance-middleware',
          tags: ['slow-request', 'performance']
        })
      } catch (error) {
        console.error('Failed to log slow request:', error)
      }
    }
  }
}