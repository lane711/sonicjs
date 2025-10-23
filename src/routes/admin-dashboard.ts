import { Hono } from 'hono'
import type { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types'
import { requireAuth } from '@sonicjs-cms/core'
import { renderDashboardPage, type DashboardPageData } from '../templates/pages/admin-dashboard.template'
import { VERSION } from '@sonicjs-cms/core'

type Bindings = {
  DB: D1Database
  CACHE_KV: KVNamespace
  MEDIA_BUCKET: R2Bucket
}

type Variables = {
  user?: {
    userId: string
    email: string
    role: string
  }
}

const router = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Apply authentication middleware
router.use('*', requireAuth())

/**
 * GET /admin - Admin Dashboard
 */
router.get('/', async (c) => {
  const user = c.get('user')

  try {
    const pageData: DashboardPageData = {
      user: {
        name: user!.email.split('@')[0] || user!.email,
        email: user!.email,
        role: user!.role
      },
      version: VERSION
    }

    return c.html(renderDashboardPage(pageData))
  } catch (error) {
    console.error('Dashboard error:', error)

    // Return dashboard with error state
    const pageData: DashboardPageData = {
      user: {
        name: user!.email,
        email: user!.email,
        role: user!.role
      },
      version: VERSION
    }

    return c.html(renderDashboardPage(pageData))
  }
})

export { router as adminDashboardRoutes }
