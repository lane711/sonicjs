import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { serveStatic } from 'hono/cloudflare-workers'
import { apiRoutes } from './routes/api'
import { adminRoutes } from './routes/admin'
import { adminContentRoutes } from './routes/admin-content'
import adminFAQRoutes from './routes/admin-faq'
import { adminDesignRoutes } from './routes/admin-design'
import { adminCheckboxRoutes } from './routes/admin-checkboxes'
import { adminLogsRoutes } from './routes/admin-logs'
import { docsRoutes } from './routes/docs'
import { authRoutes } from './routes/auth'
import { contentRoutes } from './routes/content'
import { mediaRoutes } from './routes/media'
import { adminMediaRoutes } from './routes/admin-media'
import { apiMediaRoutes } from './routes/api-media'
// import emailRoutes from './routes/admin/email'
import { userRoutes } from './routes/admin-users'
// Workflow routes are loaded dynamically through plugin system
import { createWorkflowRoutes } from './plugins/available/workflow-plugin/routes'
import { createWorkflowAdminRoutes } from './plugins/available/workflow-plugin/admin-routes'
// Cache plugin routes
import cacheRoutes from './plugins/cache/routes'
import { requireAuth, requireRole, optionalAuth } from './middleware/auth'
import { requireActivePlugin } from './middleware/plugin-middleware'
import { bootstrapMiddleware } from './middleware/bootstrap'
import { loggingMiddleware, securityLoggingMiddleware, performanceLoggingMiddleware } from './middleware/logging'
import { compressionMiddleware, securityHeaders, cacheHeaders } from './middleware/performance'

// Define the Cloudflare Workers environment
type Bindings = {
  DB: D1Database
  KV: KVNamespace
  MEDIA_BUCKET: R2Bucket
  ASSETS: Fetcher
  EMAIL_QUEUE?: Queue
  SENDGRID_API_KEY?: string
  DEFAULT_FROM_EMAIL?: string
  IMAGES_ACCOUNT_ID?: string
  IMAGES_API_TOKEN?: string
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

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Bootstrap middleware - runs system initialization
app.use('*', bootstrapMiddleware())

// Logging middleware - capture all requests
app.use('*', loggingMiddleware())
app.use('*', securityLoggingMiddleware())
app.use('*', performanceLoggingMiddleware(1000)) // Log requests slower than 1 second

// Middleware
app.use('*', logger())
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
app.route('/auth', authRoutes)
app.route('/docs', docsRoutes)

// API routes with optional auth (for public content)
app.use('/api/*', optionalAuth())
app.route('/api', apiRoutes)
app.route('/api/media', apiMediaRoutes)
// Workflow API routes are loaded dynamically through plugin system

// Content API routes with optional auth
app.use('/content/*', optionalAuth())
app.route('/content', contentRoutes)

// Media API routes (require auth for uploads)
app.use('/media/*', requireAuth())
app.route('/media', mediaRoutes)

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
app.route('/admin', adminRoutes)
app.route('/admin/media', adminMediaRoutes)
app.route('/admin/content', adminContentRoutes)
// FAQ routes with plugin activation check
app.use('/admin/faq/*', requireActivePlugin('faq'))
app.route('/admin/faq', adminFAQRoutes)
// Workflow routes with plugin activation check
app.use('/admin/workflow/*', requireActivePlugin('workflow'))
app.route('/admin/workflow', createWorkflowAdminRoutes())
app.use('/api/workflow/*', requireActivePlugin('workflow'))
app.route('/api/workflow', createWorkflowRoutes())
app.route('/admin/design', adminDesignRoutes)
app.route('/admin/checkboxes', adminCheckboxRoutes)
app.route('/admin/logs', adminLogsRoutes)
// app.route('/admin/email', emailRoutes)
app.route('/admin/users', userRoutes)
// Cache routes with plugin activation check
app.use('/admin/cache/*', requireActivePlugin('cache'))
app.route('/admin/cache', cacheRoutes)

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

// Health check
app.get('/health', (c) => {
  return c.json({
    name: 'SonicJS AI',
    version: '0.1.0',
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
    const { getLogger } = await import('./services/logger')
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