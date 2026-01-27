/**
 * Admin API Reference Routes
 *
 * Provides the API Reference page for the admin dashboard
 */

import { Hono } from 'hono'
import type { D1Database, KVNamespace, R2Bucket } from '@cloudflare/workers-types'
import { requireAuth } from '../middleware'
import {
  renderAPIReferencePage,
  type APIEndpoint,
  type APIReferencePageData
} from '../templates/pages/admin-api-reference.template'
import { getCoreVersion } from '../utils/version'

const VERSION = getCoreVersion()

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
 * Define all API endpoints for documentation
 */
const apiEndpoints: APIEndpoint[] = [
  // Auth endpoints
  {
    method: 'POST',
    path: '/auth/login',
    description: 'Authenticate user with email and password',
    authentication: false,
    category: 'Auth'
  },
  {
    method: 'POST',
    path: '/auth/register',
    description: 'Register a new user account',
    authentication: false,
    category: 'Auth'
  },
  {
    method: 'POST',
    path: '/auth/logout',
    description: 'Log out the current user and invalidate session',
    authentication: true,
    category: 'Auth'
  },
  {
    method: 'GET',
    path: '/auth/me',
    description: 'Get current authenticated user information',
    authentication: true,
    category: 'Auth'
  },
  {
    method: 'POST',
    path: '/auth/refresh',
    description: 'Refresh authentication token',
    authentication: true,
    category: 'Auth'
  },

  // Content endpoints
  {
    method: 'GET',
    path: '/api/collections',
    description: 'List all available collections',
    authentication: false,
    category: 'Content'
  },
  {
    method: 'GET',
    path: '/api/collections/:collection/content',
    description: 'Get all content items from a specific collection',
    authentication: false,
    category: 'Content'
  },
  {
    method: 'GET',
    path: '/api/content/:id',
    description: 'Get a specific content item by ID',
    authentication: false,
    category: 'Content'
  },
  {
    method: 'POST',
    path: '/api/content',
    description: 'Create a new content item',
    authentication: true,
    category: 'Content'
  },
  {
    method: 'PUT',
    path: '/api/content/:id',
    description: 'Update an existing content item',
    authentication: true,
    category: 'Content'
  },
  {
    method: 'DELETE',
    path: '/api/content/:id',
    description: 'Delete a content item',
    authentication: true,
    category: 'Content'
  },

  // Media endpoints
  {
    method: 'GET',
    path: '/api/media',
    description: 'List all media files with pagination',
    authentication: false,
    category: 'Media'
  },
  {
    method: 'GET',
    path: '/api/media/:id',
    description: 'Get a specific media file by ID',
    authentication: false,
    category: 'Media'
  },
  {
    method: 'POST',
    path: '/api/media/upload',
    description: 'Upload a new media file to R2 storage',
    authentication: true,
    category: 'Media'
  },
  {
    method: 'DELETE',
    path: '/api/media/:id',
    description: 'Delete a media file from storage',
    authentication: true,
    category: 'Media'
  },

  // Admin endpoints
  {
    method: 'GET',
    path: '/admin/api/stats',
    description: 'Get dashboard statistics (collections, content, media, users)',
    authentication: true,
    category: 'Admin'
  },
  {
    method: 'GET',
    path: '/admin/api/storage',
    description: 'Get storage usage information',
    authentication: true,
    category: 'Admin'
  },
  {
    method: 'GET',
    path: '/admin/api/activity',
    description: 'Get recent activity logs',
    authentication: true,
    category: 'Admin'
  },
  {
    method: 'GET',
    path: '/admin/api/collections',
    description: 'List all collections with field counts',
    authentication: true,
    category: 'Admin'
  },
  {
    method: 'POST',
    path: '/admin/api/collections',
    description: 'Create a new collection',
    authentication: true,
    category: 'Admin'
  },
  {
    method: 'PATCH',
    path: '/admin/api/collections/:id',
    description: 'Update an existing collection',
    authentication: true,
    category: 'Admin'
  },
  {
    method: 'DELETE',
    path: '/admin/api/collections/:id',
    description: 'Delete a collection (must be empty)',
    authentication: true,
    category: 'Admin'
  },
  {
    method: 'GET',
    path: '/admin/api/migrations/status',
    description: 'Get database migration status',
    authentication: true,
    category: 'Admin'
  },
  {
    method: 'POST',
    path: '/admin/api/migrations/run',
    description: 'Run pending database migrations',
    authentication: true,
    category: 'Admin'
  },

  // System endpoints
  {
    method: 'GET',
    path: '/health',
    description: 'Health check endpoint for monitoring',
    authentication: false,
    category: 'System'
  },
  {
    method: 'GET',
    path: '/api/health',
    description: 'API health check with schema information',
    authentication: false,
    category: 'System'
  },
  {
    method: 'GET',
    path: '/api',
    description: 'API root - returns API information and OpenAPI spec',
    authentication: false,
    category: 'System'
  }
]

/**
 * GET /admin/api-reference - API Reference Page
 */
router.get('/', async (c) => {
  const user = c.get('user')

  try {
    const pageData: APIReferencePageData = {
      endpoints: apiEndpoints,
      user: user ? {
        name: user.email.split('@')[0] || user.email,
        email: user.email,
        role: user.role
      } : undefined,
      version: VERSION
    }

    return c.html(renderAPIReferencePage(pageData))
  } catch (error) {
    console.error('API Reference page error:', error)

    // Return page with empty endpoints on error
    const pageData: APIReferencePageData = {
      endpoints: [],
      user: user ? {
        name: user.email,
        email: user.email,
        role: user.role
      } : undefined,
      version: VERSION
    }

    return c.html(renderAPIReferencePage(pageData))
  }
})

export { router as adminApiReferenceRoutes }
