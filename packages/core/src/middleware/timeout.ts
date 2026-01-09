import { Context, Next } from 'hono'

/**
 * Request timeout middleware
 * Ensures requests don't hang indefinitely
 */
export const requestTimeout = (timeoutMs: number = 10000) => {
  return async (c: Context, next: Next) => {
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeoutMs}ms`))
      }, timeoutMs)
    })

    try {
      // Race between the request and timeout
      await Promise.race([
        next(),
        timeoutPromise
      ])
      
      return // Explicitly return after successful next()
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        console.error(`Request timeout: ${c.req.method} ${c.req.path}`)
        
        // Check if this is a browser request
        const acceptHeader = c.req.header('Accept') || ''
        if (acceptHeader.includes('text/html')) {
          return c.html('<h1>Request Timeout</h1><p>The server took too long to respond. Please try again.</p>', 408)
        }
        
        return c.json({ 
          error: 'Request timeout',
          message: `Request took longer than ${timeoutMs}ms`
        }, 408)
      }
      
      // Re-throw other errors
      throw error
    }
  }
}

/**
 * Database query timeout wrapper
 * Wraps database queries with a timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timeout'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(errorMessage))
    }, timeoutMs)
  })

  return Promise.race([promise, timeoutPromise])
}
