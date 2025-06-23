import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { apiRoutes } from './routes/api'
import { adminRoutes } from './routes/admin'
import { docsRoutes } from './routes/docs'
import { authRoutes } from './routes/auth'
import { requireAuth, requireRole, optionalAuth } from './middleware/auth'

// Define the Cloudflare Workers environment
type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', logger())
app.use('*', cors())
app.use('/api/*', prettyJSON())

// Public routes
app.route('/auth', authRoutes)
app.route('/docs', docsRoutes)

// API routes with optional auth (for public content)
app.use('/api/*', optionalAuth())
app.route('/api', apiRoutes)

// Admin routes require authentication and admin/editor role
app.use('/admin/*', requireAuth())
app.use('/admin/*', requireRole(['admin', 'editor']))
app.route('/admin', adminRoutes)

// Health check
app.get('/', (c) => {
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
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal Server Error', status: 500 }, 500)
})

export default app