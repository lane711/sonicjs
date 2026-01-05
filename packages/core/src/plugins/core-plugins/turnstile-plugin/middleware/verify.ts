import type { Context, Next } from 'hono'
import { TurnstileService } from '../services/turnstile'

/**
 * Middleware to verify Turnstile token on form submissions
 * 
 * Usage:
 * ```typescript
 * import { verifyTurnstile } from '@sonicjs-cms/core/plugins'
 * 
 * app.post('/api/contact', verifyTurnstile, async (c) => {
 *   // Token already verified, process form...
 * })
 * ```
 */
export async function verifyTurnstile(c: Context, next: Next) {
  const db = c.get('db') || (c as any).env?.DB
  
  if (!db) {
    console.error('Turnstile middleware: Database not available')
    return c.json({ error: 'Database not available' }, 500)
  }

  const turnstileService = new TurnstileService(db)

  // Check if Turnstile is enabled
  const isEnabled = await turnstileService.isEnabled()
  
  if (!isEnabled) {
    // Turnstile not enabled, allow through
    return next()
  }

  // Get token from request
  let token: string | undefined
  let body: any

  if (c.req.method === 'POST') {
    const contentType = c.req.header('content-type') || ''
    
    if (contentType.includes('application/json')) {
      body = await c.req.json()
      token = body['cf-turnstile-response'] || body['turnstile-token']
      // Store parsed body in context so route handler can access it
      c.set('requestBody', body)
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await c.req.formData()
      token = formData.get('cf-turnstile-response')?.toString() || formData.get('turnstile-token')?.toString()
    }
  }

  if (!token) {
    return c.json({ 
      error: 'Turnstile token missing',
      message: 'Please complete the verification challenge'
    }, 400)
  }

  // Verify token
  const remoteIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')
  const result = await turnstileService.verifyToken(token, remoteIp)

  if (!result.success) {
    return c.json({ 
      error: 'Turnstile verification failed',
      message: result.error || 'Verification failed. Please try again.'
    }, 403)
  }

  // Verification successful, continue
  return next()
}

/**
 * Middleware factory that allows custom error handling
 */
export function createTurnstileMiddleware(options?: {
  onError?: (c: Context, error: string) => Response
  onMissing?: (c: Context) => Response
}) {
  return async (c: Context, next: Next) => {
    const db = c.get('db') || (c as any).env?.DB
    
    if (!db) {
      return options?.onError?.(c, 'Database not available') || 
        c.json({ error: 'Database not available' }, 500)
    }

    const turnstileService = new TurnstileService(db)
    const isEnabled = await turnstileService.isEnabled()
    
    if (!isEnabled) {
      return next()
    }

    let token: string | undefined
    const contentType = c.req.header('content-type') || ''
    
    if (contentType.includes('application/json')) {
      const body = await c.req.json()
      token = body['cf-turnstile-response'] || body['turnstile-token']
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await c.req.formData()
      token = formData.get('cf-turnstile-response')?.toString() || formData.get('turnstile-token')?.toString()
    }

    if (!token) {
      return options?.onMissing?.(c) || 
        c.json({ error: 'Turnstile token missing' }, 400)
    }

    const remoteIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for')
    const result = await turnstileService.verifyToken(token, remoteIp)

    if (!result.success) {
      return options?.onError?.(c, result.error || 'Verification failed') ||
        c.json({ error: 'Turnstile verification failed', message: result.error }, 403)
    }

    return next()
  }
}
