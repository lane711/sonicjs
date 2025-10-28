console.log('[MAIN APP] Loading src/index.ts - THIS SHOULD BE THE MAIN APP')
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { serveStatic } from 'hono/cloudflare-workers'
// Import all routes from core package
import {
  apiRoutes,
  apiContentCrudRoutes,
  apiMediaRoutes,
  apiSystemRoutes,
  adminApiRoutes,
  authRoutes,
  adminContentRoutes,
  adminUsersRoutes,
  adminMediaRoutes,
  adminLogsRoutes,
  adminPluginRoutes,
  adminDesignRoutes,
  adminCheckboxRoutes,
  adminFAQRoutes,
  adminTestimonialsRoutes,
  adminCodeExamplesRoutes,
  adminDashboardRoutes,
  adminCollectionsRoutes,
  adminSettingsRoutes
} from '@sonicjs-cms/core'
// Design plugin routes
import { designRoutes } from './plugins/design/routes'
// Hello World plugin
import { helloWorldPlugin } from './plugins/core-plugins/hello-world-plugin'
// Workflow routes are loaded dynamically through plugin system
import { createWorkflowRoutes } from './plugins/available/workflow-plugin/routes'
import { createWorkflowAdminRoutes } from './plugins/available/workflow-plugin/admin-routes'
// Cache plugin routes
import cacheRoutes from './plugins/cache/routes'
// Database Tools plugin routes
import { createDatabaseToolsAdminRoutes } from './plugins/core-plugins/database-tools-plugin/admin-routes'
import { requireAuth, requireRole, optionalAuth } from '@sonicjs-cms/core'
import { requireActivePlugin } from '@sonicjs-cms/core'
import { bootstrapMiddleware } from './middleware/bootstrap'
import { loggingMiddleware, securityLoggingMiddleware, performanceLoggingMiddleware } from '@sonicjs-cms/core'
import { compressionMiddleware, securityHeaders, cacheHeaders } from '@sonicjs-cms/core'
import { VERSION } from '@sonicjs-cms/core'

// Store app version globally at startup (use core package version)
const APP_VERSION = `v${VERSION}`

// Define the Cloudflare Workers environment
type Bindings = {
  DB: D1Database
  CACHE_KV: KVNamespace
  MEDIA_BUCKET: R2Bucket
  ASSETS: Fetcher
  EMAIL_QUEUE?: Queue
  SENDGRID_API_KEY?: string
  DEFAULT_FROM_EMAIL?: string
  IMAGES_ACCOUNT_ID?: string
  IMAGES_API_TOKEN?: string
  ENVIRONMENT?: string
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
  appVersion?: string
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Set app version globally from package.json
app.use('*', async (c, next) => {
  c.set('appVersion', APP_VERSION)
  await next()
})

// Bootstrap middleware - runs system initialization
app.use('*', bootstrapMiddleware())

// Logging middleware - capture all requests
app.use('*', loggingMiddleware())
app.use('*', securityLoggingMiddleware())
app.use('*', performanceLoggingMiddleware(1000)) // Log requests slower than 1 second

// Metrics tracking middleware - track requests for real-time analytics
app.use('*', async (c, next) => {
  // Don't track polling endpoints to avoid noise and feedback loops
  const path = c.req.path
  const shouldTrack = !path.includes('/admin/api/metrics') &&
                      !path.includes('/admin/dashboard/stats') &&
                      !path.includes('/admin/dashboard/recent-activity') &&
                      !path.includes('/admin/dashboard/system-status') &&
                      !path.includes('/admin/dashboard/storage')

  if (shouldTrack) {
    const { metricsTracker } = await import('@sonicjs-cms/core')
    metricsTracker.recordRequest()
  }
  await next()
})

// Middleware
app.use('*', async (c, next) => {
  // Skip logger for high-frequency endpoints to reduce noise
  const path = c.req.path
  const skipLogger = path.includes('/admin/api/metrics') ||
                     path.includes('/admin/dashboard/stats') ||
                     path.includes('/admin/dashboard/recent-activity') ||
                     path.includes('/admin/dashboard/system-status') ||
                     path.includes('/admin/dashboard/storage')

  if (skipLogger) {
    return next()
  }
  return logger()(c, next)
})
app.use('*', cors())
// Compression disabled - causes encoding issues
// app.use('*', compressionMiddleware)
app.use('*', securityHeaders())
app.use('/api/*', prettyJSON())

// Static file serving for images
app.get('/images/*', async (c) => {
  const path = c.req.path.replace('/images/', '')
  try {
    const response = await c.env.ASSETS.fetch(new Request(`http://localhost/images/${path}`))
    if (response.ok) {
      return response
    }
    return c.notFound()
  } catch (error) {
    console.error('Error serving static file:', error)
    return c.notFound()
  }
})

// Public routes
app.route('/auth', authRoutes as any)

// API routes with optional auth (for public content)
app.use('/api/*', optionalAuth())
app.route('/api', apiRoutes as any)
app.route('/api', apiContentCrudRoutes as any) // CRUD operations for content
app.route('/api/media', apiMediaRoutes as any)
app.route('/api', apiSystemRoutes as any) // System API endpoints
// Workflow API routes are loaded dynamically through plugin system

// Public media file serving (no auth required for viewing uploaded files)
app.get('/files/*', async (c) => {
  try {
    const r2Key = c.req.path.replace('/files/', '')
    console.log('[FILE SERVE] Requested path:', c.req.path)
    console.log('[FILE SERVE] Extracted R2 key:', r2Key)

    if (!r2Key) {
      console.log('[FILE SERVE] No R2 key provided')
      return c.notFound()
    }

    // Check if MEDIA_BUCKET is available
    console.log('[FILE SERVE] MEDIA_BUCKET available?', !!c.env.MEDIA_BUCKET)

    // Get file from R2
    const object = await c.env.MEDIA_BUCKET.get(r2Key)
    console.log('[FILE SERVE] Object found?', !!object)

    if (!object) {
      console.log('[FILE SERVE] File not found in R2:', r2Key)
      return c.notFound()
    }

    console.log('[FILE SERVE] Serving file:', r2Key, 'Content-Type:', object.httpMetadata?.contentType)

    // Set appropriate headers
    const headers = new Headers()
    object.httpMetadata?.contentType && headers.set('Content-Type', object.httpMetadata.contentType)
    object.httpMetadata?.contentDisposition && headers.set('Content-Disposition', object.httpMetadata.contentDisposition)
    headers.set('Cache-Control', 'public, max-age=31536000') // 1 year cache
    headers.set('Access-Control-Allow-Origin', '*')

    return new Response(object.body, {
      headers
    })
  } catch (error) {
    console.error('[FILE SERVE] Error serving file:', error)
    return c.notFound()
  }
})

// Admin routes require authentication and admin/editor role
app.use('/admin/*', async (c, next) => {
  try {
    return await requireAuth()(c, next)
  } catch (error) {
    // Redirect to login page if not authenticated
    return c.redirect('/auth/login?error=Please login to access the admin area')
  }
})
app.use('/admin/*', requireRole(['admin', 'editor']))
// Add caching for admin pages (60 second cache)
app.use('/admin/*', cacheHeaders(60))
app.route('/admin/api', adminApiRoutes as any) // Admin API endpoints for collections, fields, etc.
app.route('/admin', adminDashboardRoutes as any) // Admin dashboard (must be before other /admin routes to catch root)
app.route('/admin', adminUsersRoutes as any) // User profile, user management, activity logs
app.route('/admin/media', adminMediaRoutes as any)
app.route('/admin/content', adminContentRoutes as any)
app.route('/admin/plugins', adminPluginRoutes as any)
app.route('/admin/logs', adminLogsRoutes as any)
// Collections routes (from core)
app.route('/admin', adminCollectionsRoutes as any)
// Settings routes (from core)
app.route('/admin', adminSettingsRoutes as any)
// FAQ routes with plugin activation check (from core)
app.use('/admin/faq/*', requireActivePlugin('faq'))
app.route('/admin/faq', adminFAQRoutes as any)
// Testimonials routes with plugin activation check (from core)
app.use('/admin/testimonials/*', requireActivePlugin('testimonials'))
app.route('/admin/testimonials', adminTestimonialsRoutes as any)
// Code Examples routes with plugin activation check (from core)
app.use('/admin/code-examples/*', requireActivePlugin('code-examples'))
app.route('/admin/code-examples', adminCodeExamplesRoutes as any)
// Workflow routes with plugin activation check
app.use('/admin/workflow/*', requireActivePlugin('workflow'))
app.route('/admin/workflow', createWorkflowAdminRoutes())
app.use('/api/workflow/*', requireActivePlugin('workflow'))
app.route('/api/workflow', createWorkflowRoutes())
// Design routes with plugin activation check (from core)
app.use('/admin/design/*', requireActivePlugin('design'))
app.route('/admin/design', adminDesignRoutes as any)
// Checkboxes demo route (from core)
app.route('/admin/checkboxes', adminCheckboxRoutes as any)
// app.route('/admin/email', emailRoutes)
// Cache routes with plugin activation check
app.use('/admin/cache/*', requireActivePlugin('cache'))
app.route('/admin/cache', cacheRoutes)
// Database Tools routes with plugin activation check
app.use('/admin/database-tools/*', requireActivePlugin('database-tools'))
app.route('/admin/database-tools', createDatabaseToolsAdminRoutes())
// Hello World routes with plugin activation check
app.use('/admin/hello-world/*', requireActivePlugin('hello-world'))
// Register Hello World plugin routes
if (helloWorldPlugin.routes && helloWorldPlugin.routes.length > 0) {
  for (const route of helloWorldPlugin.routes) {
    app.route(route.path, route.handler)
  }
}

// Test cleanup endpoint (unauthenticated, only for development/testing)
app.post('/test-cleanup', async (c) => {
  const env = c.env.ENVIRONMENT || 'development'

  // Only allow in development/test environments
  if (env === 'production') {
    return c.json({ error: 'Not available in production' }, 403)
  }

  try {
    const db = c.env.DB
    let deletedCount = 0

    // Delete test collections
    try {
      const collectionsResult = await db.prepare(`
        DELETE FROM collections
        WHERE name LIKE 'test_%'
           OR name LIKE '%test%'
           OR name = 'test_collection'
           OR name = 'test_articles'
           OR name = 'test_collection_e2e'
      `).run()
      deletedCount += collectionsResult.meta.changes || 0
    } catch (error) {
      console.error('Error deleting test collections:', error)
    }

    // Delete test content
    try {
      const contentResult = await db.prepare(`
        DELETE FROM content
        WHERE title LIKE '%test%'
           OR title LIKE '%Test%'
           OR title LIKE '%E2E%'
           OR slug LIKE '%test%'
      `).run()
      deletedCount += contentResult.meta.changes || 0
    } catch (error) {
      console.error('Error deleting test content:', error)
    }

    // Delete test users (preserve admin user)
    try {
      const usersResult = await db.prepare(`
        DELETE FROM users
        WHERE email NOT LIKE '%admin%'
          AND (email LIKE '%test%'
               OR username LIKE '%test%'
               OR email LIKE '%example.com')
      `).run()
      deletedCount += usersResult.meta.changes || 0
    } catch (error) {
      console.error('Error deleting test users:', error)
    }

    // Clean up orphaned content
    try {
      const orphanedResult = await db.prepare(`
        DELETE FROM content
        WHERE collection_id NOT IN (SELECT id FROM collections WHERE is_active = 1)
      `).run()
      deletedCount += orphanedResult.meta.changes || 0
    } catch (error) {
      console.error('Error deleting orphaned content:', error)
    }

    return c.json({
      success: true,
      message: 'Test data cleanup completed',
      deletedCount
    })
  } catch (error) {
    console.error('Error cleaning up test data:', error)
    return c.json({
      success: false,
      message: `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, 500)
  }
})

// Root redirect to login
app.get('/', (c) => {
  return c.redirect('/auth/login')
})

// Health check - Must be registered after all other routes to override core package's health endpoint
app.get('/health', (c) => {
  console.log('[MAIN APP] Health endpoint called from src/index.ts!')
  return c.json({
    name: 'SonicJS AI',
    version: VERSION,
    description: 'A modern, TypeScript-first headless CMS built for Cloudflare\'s edge platform',
    status: 'running',
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', status: 404 }, 404)
})

// Error handler
app.onError(async (err, c) => {
  console.error(err)
  
  // Log the error using our logging system
  try {
    const { getLogger } = await import('@sonicjs-cms/core')
    const logger = getLogger(c.env.DB)
    const user = c.get('user')
    
    await logger.error('system', `Unhandled application error: ${err.message}`, err, {
      userId: user?.userId,
      requestId: c.get('requestId'),
      ipAddress: c.req.header('cf-connecting-ip') || 'unknown',
      userAgent: c.req.header('user-agent') || '',
      method: c.req.method,
      url: c.req.url,
      source: 'error-handler',
      tags: ['unhandled-error', 'application-error']
    })
  } catch (logError) {
    console.error('Failed to log application error:', logError)
  }
  
  return c.json({ error: 'Internal Server Error', status: 500 }, 500)
})

export default app