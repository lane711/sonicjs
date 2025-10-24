import { MiddlewareHandler } from 'hono'
import { metricsTracker } from '../utils/metrics'

/**
 * Middleware to track all HTTP requests for real-time analytics
 * Excludes the metrics endpoint itself to avoid inflating the count
 */
export const metricsMiddleware = (): MiddlewareHandler => {
  return async (c, next) => {
    const path = new URL(c.req.url).pathname

    // Don't track the metrics endpoint itself to avoid self-inflating counts
    if (path !== '/admin/dashboard/api/metrics') {
      metricsTracker.recordRequest()
    }

    // Continue with the request
    await next()
  }
}
