# SonicJS v2.0 Code Examples and Usage Patterns

**Version**: 2.0.2
**Last Updated**: October 24, 2025
**Status**: Production Ready

## Table of Contents

1. [Getting Started](#getting-started)
2. [Application Setup](#application-setup)
3. [Collections](#collections)
4. [Content Management](#content-management)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Routes](#api-routes)
7. [Admin Routes](#admin-routes)
8. [Plugins](#plugins)
9. [Middleware](#middleware)
10. [Templates](#templates)
11. [Database Operations](#database-operations)
12. [Media Management](#media-management)
13. [Testing](#testing)

---

## Getting Started

### Create New Project

```bash
# Create a new SonicJS project
npx create-sonicjs my-cms

# Navigate to project
cd my-cms

# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Manual Installation

```bash
# Create new project
mkdir my-cms && cd my-cms
npm init -y

# Install core package
npm install @sonicjs-cms/core

# Install peer dependencies
npm install hono drizzle-orm zod @cloudflare/workers-types

# Install dev dependencies
npm install -D wrangler typescript tsx vitest
```

---

## Application Setup

### Basic App (src/index.ts)

```typescript
import { Hono } from 'hono'
import {
  // Routes
  authRoutes,
  apiRoutes,
  adminDashboardRoutes,
  adminContentRoutes,
  adminUsersRoutes,
  adminMediaRoutes,

  // Middleware
  requireAuth,
  requireRole,
  optionalAuth,
  bootstrapMiddleware,
  loggingMiddleware,
  securityHeaders,

  // Types
  type SonicJSEnv
} from '@sonicjs-cms/core'

const app = new Hono<SonicJSEnv>()

// Core middleware
app.use('*', bootstrapMiddleware())
app.use('*', loggingMiddleware())
app.use('*', securityHeaders())

// Public routes
app.route('/auth', authRoutes)

// API routes (optional auth)
app.use('/api/*', optionalAuth())
app.route('/api', apiRoutes)

// Admin routes (requires auth + role)
app.use('/admin/*', requireAuth())
app.use('/admin/*', requireRole(['admin', 'editor']))
app.route('/admin', adminDashboardRoutes)
app.route('/admin/content', adminContentRoutes)
app.route('/admin', adminUsersRoutes)
app.route('/admin/media', adminMediaRoutes)

export default app
```

### App with Custom Routes

```typescript
import { Hono } from 'hono'
import { setupCoreMiddleware, setupCoreRoutes } from '@sonicjs-cms/core'
import { myCustomRoutes } from './routes/custom'

const app = new Hono()

// Setup core functionality
setupCoreMiddleware(app)
setupCoreRoutes(app)

// Add custom routes
app.route('/custom', myCustomRoutes)

export default app
```

### Environment Variables

```typescript
// wrangler.toml
[vars]
JWT_SECRET = "your-secret-key-here"
SITE_NAME = "My CMS"
SITE_URL = "https://mycms.com"

[[d1_databases]]
binding = "DB"
database_name = "my-cms-db"
database_id = "your-database-id"

[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "my-cms-media"

[[kv_namespaces]]
binding = "CACHE_KV"
id = "your-kv-id"
```

---

## Collections

### Define a Collection

```typescript
// src/collections/blog-posts.collection.ts
import type { CollectionConfig } from '@sonicjs-cms/core'

export const blogPostsCollection: CollectionConfig = {
  name: 'blog_posts',
  displayName: 'Blog Posts',
  description: 'Blog article content',

  schema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        required: true,
        minLength: 3,
        maxLength: 200,
        description: 'Post title'
      },
      slug: {
        type: 'slug',
        required: true,
        unique: true,
        description: 'URL-friendly identifier'
      },
      content: {
        type: 'richtext',
        description: 'Post content (markdown)'
      },
      excerpt: {
        type: 'text',
        maxLength: 500,
        description: 'Short summary'
      },
      featured_image: {
        type: 'media',
        accept: 'image/*',
        description: 'Featured image'
      },
      author: {
        type: 'reference',
        collection: 'users',
        required: true
      },
      category: {
        type: 'reference',
        collection: 'categories'
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Post tags'
      },
      published: {
        type: 'boolean',
        default: false
      },
      published_at: {
        type: 'datetime'
      },
      seo: {
        type: 'object',
        properties: {
          meta_title: { type: 'string' },
          meta_description: { type: 'text' },
          og_image: { type: 'media' }
        }
      }
    }
  },

  icon: '📝',
  managed: true,
  isActive: true,
  defaultSort: 'created_at',
  defaultSortOrder: 'desc',

  hooks: {
    beforeSave: async (data) => {
      // Auto-generate slug from title
      if (!data.slug && data.title) {
        data.slug = data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      }

      // Set published_at timestamp
      if (data.published && !data.published_at) {
        data.published_at = new Date().toISOString()
      }

      return data
    },

    afterSave: async (data, context) => {
      // Clear cache after saving
      if (context.env.CACHE_KV) {
        await context.env.CACHE_KV.delete(`blog:${data.slug}`)
      }
    }
  }
}
```

### Register Collections

```typescript
// src/collections/index.ts
import { blogPostsCollection } from './blog-posts.collection'
import { categoriesCollection } from './categories.collection'
import { pagesCollection } from './pages.collection'

export const collections = [
  blogPostsCollection,
  categoriesCollection,
  pagesCollection
]
```

---

## Content Management

### Create Content

```typescript
import { createDb, content } from '@sonicjs-cms/core'

const db = createDb(env.DB)

// Create new blog post
const newPost = await db.insert(content).values({
  id: crypto.randomUUID(),
  collection_id: 'blog_posts',
  data: JSON.stringify({
    title: 'My First Post',
    slug: 'my-first-post',
    content: '# Hello World\n\nThis is my first post!',
    published: true,
    author: userId,
    tags: ['tutorial', 'getting-started']
  }),
  status: 'published',
  created_by: userId,
  created_at: Date.now(),
  updated_at: Date.now()
}).returning()
```

### Query Content

```typescript
import { createDb, content } from '@sonicjs-cms/core'
import { eq, and, desc, like } from 'drizzle-orm'

const db = createDb(env.DB)

// Get all published blog posts
const posts = await db
  .select()
  .from(content)
  .where(
    and(
      eq(content.collection_id, 'blog_posts'),
      eq(content.status, 'published')
    )
  )
  .orderBy(desc(content.created_at))
  .limit(10)
  .all()

// Search posts by title
const searchResults = await db
  .select()
  .from(content)
  .where(
    and(
      eq(content.collection_id, 'blog_posts'),
      like(content.data, '%search term%')
    )
  )
  .all()

// Get single post by slug
const post = await db
  .select()
  .from(content)
  .where(
    and(
      eq(content.collection_id, 'blog_posts'),
      eq(content.data, '%"slug":"my-first-post"%')
    )
  )
  .get()
```

### Update Content

```typescript
// Update existing post
await db
  .update(content)
  .set({
    data: JSON.stringify({
      ...JSON.parse(existingPost.data),
      title: 'Updated Title',
      updated_at: new Date().toISOString()
    }),
    updated_at: Date.now()
  })
  .where(eq(content.id, postId))
  .run()
```

### Delete Content

```typescript
// Soft delete (mark as deleted)
await db
  .update(content)
  .set({
    status: 'deleted',
    deleted_at: Date.now()
  })
  .where(eq(content.id, postId))
  .run()

// Hard delete (permanent)
await db
  .delete(content)
  .where(eq(content.id, postId))
  .run()
```

---

## Authentication & Authorization

### Login

```typescript
import { AuthManager } from '@sonicjs-cms/core'

// In your login route
app.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json()

  const authManager = new AuthManager(c.env)
  const result = await authManager.login(email, password)

  if (!result.success) {
    return c.json({ error: result.error }, 401)
  }

  return c.json({
    user: result.user,
    token: result.token
  })
})
```

### Protect Routes

```typescript
import { requireAuth, requireRole, requirePermission } from '@sonicjs-cms/core'

// Require authentication
app.get('/protected', requireAuth(), async (c) => {
  const user = c.get('user')
  return c.json({ message: `Hello ${user.email}` })
})

// Require specific role
app.get('/admin-only', requireAuth(), requireRole(['admin']), async (c) => {
  return c.json({ message: 'Admin access granted' })
})

// Require specific permission
app.get('/content-edit',
  requireAuth(),
  requirePermission('content.write'),
  async (c) => {
    return c.json({ message: 'Can edit content' })
  }
)

// Multiple roles (OR logic)
app.get('/editors',
  requireAuth(),
  requireRole(['admin', 'editor']),
  async (c) => {
    return c.json({ message: 'Editor access granted' })
  }
)
```

### Check Permissions Programmatically

```typescript
app.get('/content/:id/edit', requireAuth(), async (c) => {
  const user = c.get('user')
  const contentId = c.req.param('id')

  // Check if user has permission
  if (!user.permissions?.includes('content.write')) {
    return c.json({ error: 'No permission to edit content' }, 403)
  }

  // Check if user is owner or admin
  const content = await db
    .select()
    .from(content)
    .where(eq(content.id, contentId))
    .get()

  if (content.created_by !== user.id && user.role !== 'admin') {
    return c.json({ error: 'Can only edit own content' }, 403)
  }

  return c.json({ content })
})
```

### Custom Authentication

```typescript
import { AuthManager } from '@sonicjs-cms/core'

class CustomAuthManager extends AuthManager {
  async login(email: string, password: string) {
    // Custom login logic
    const user = await this.findUserByEmail(email)

    // Add custom checks
    if (user.is_suspended) {
      return { success: false, error: 'Account suspended' }
    }

    // Call parent method
    return super.login(email, password)
  }

  async validateTwoFactor(userId: string, code: string) {
    // Implement 2FA validation
    // ...
  }
}
```

---

## API Routes

### List Endpoint

```typescript
import { Hono } from 'hono'
import { createDb, content } from '@sonicjs-cms/core'
import { eq, desc } from 'drizzle-orm'

const api = new Hono()

api.get('/posts', async (c) => {
  const db = createDb(c.env.DB)

  // Pagination
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '10')
  const offset = (page - 1) * limit

  // Filters
  const status = c.req.query('status') || 'published'

  // Query
  const posts = await db
    .select()
    .from(content)
    .where(
      and(
        eq(content.collection_id, 'blog_posts'),
        eq(content.status, status)
      )
    )
    .orderBy(desc(content.created_at))
    .limit(limit)
    .offset(offset)
    .all()

  // Count total
  const total = await db
    .select({ count: sql`count(*)` })
    .from(content)
    .where(
      and(
        eq(content.collection_id, 'blog_posts'),
        eq(content.status, status)
      )
    )
    .get()

  return c.json({
    data: posts.map(p => ({
      id: p.id,
      ...JSON.parse(p.data),
      created_at: p.created_at,
      updated_at: p.updated_at
    })),
    pagination: {
      page,
      limit,
      total: total.count,
      pages: Math.ceil(total.count / limit)
    }
  })
})
```

### Detail Endpoint

```typescript
api.get('/posts/:id', async (c) => {
  const db = createDb(c.env.DB)
  const id = c.req.param('id')

  const post = await db
    .select()
    .from(content)
    .where(eq(content.id, id))
    .get()

  if (!post) {
    return c.json({ error: 'Post not found' }, 404)
  }

  return c.json({
    id: post.id,
    ...JSON.parse(post.data),
    created_at: post.created_at,
    updated_at: post.updated_at
  })
})
```

### Create Endpoint

```typescript
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const postSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  content: z.string(),
  published: z.boolean().default(false)
})

api.post('/posts',
  requireAuth(),
  requirePermission('content.write'),
  zValidator('json', postSchema),
  async (c) => {
    const db = createDb(c.env.DB)
    const user = c.get('user')
    const data = c.req.valid('json')

    const newPost = await db.insert(content).values({
      id: crypto.randomUUID(),
      collection_id: 'blog_posts',
      data: JSON.stringify(data),
      status: data.published ? 'published' : 'draft',
      created_by: user.id,
      created_at: Date.now(),
      updated_at: Date.now()
    }).returning()

    return c.json(newPost, 201)
  }
)
```

---

## Admin Routes

### Dashboard with Metrics

```typescript
import { Hono } from 'hono'
import { requireAuth, requireRole } from '@sonicjs-cms/core'
import { renderDashboard } from './templates/dashboard'

const admin = new Hono()

admin.get('/admin', requireAuth(), requireRole(['admin', 'editor']), async (c) => {
  const db = createDb(c.env.DB)

  // Get metrics
  const totalPosts = await db
    .select({ count: sql`count(*)` })
    .from(content)
    .where(eq(content.collection_id, 'blog_posts'))
    .get()

  const publishedPosts = await db
    .select({ count: sql`count(*)` })
    .from(content)
    .where(
      and(
        eq(content.collection_id, 'blog_posts'),
        eq(content.status, 'published')
      )
    )
    .get()

  const recentPosts = await db
    .select()
    .from(content)
    .where(eq(content.collection_id, 'blog_posts'))
    .orderBy(desc(content.created_at))
    .limit(5)
    .all()

  return c.html(renderDashboard({
    metrics: {
      total: totalPosts.count,
      published: publishedPosts.count,
      draft: totalPosts.count - publishedPosts.count
    },
    recentPosts
  }))
})
```

---

## Plugins

### Create a Plugin

```typescript
// src/plugins/analytics/index.ts
import type { Plugin, PluginContext } from '@sonicjs-cms/core'

export const analyticsPlugin: Plugin = {
  async install(context: PluginContext) {
    const { db } = context

    // Create analytics table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        event_data TEXT,
        user_id TEXT,
        created_at INTEGER NOT NULL
      )
    `)
  },

  async activate(context: PluginContext) {
    const { hookSystem, logger } = context

    // Track page views
    hookSystem.register('request:complete', async (data) => {
      await context.db.insert(analyticsEvents).values({
        id: crypto.randomUUID(),
        event_type: 'pageview',
        event_data: JSON.stringify({
          path: data.path,
          method: data.method,
          status: data.status
        }),
        user_id: data.userId,
        created_at: Date.now()
      })
    })

    await logger.info('plugin', 'Analytics plugin activated')
  },

  async deactivate(context: PluginContext) {
    const { hookSystem, logger } = context
    hookSystem.unregister('request:complete')
    await logger.info('plugin', 'Analytics plugin deactivated')
  },

  async uninstall(context: PluginContext) {
    const { db } = context
    await db.exec('DROP TABLE IF EXISTS analytics_events')
  }
}
```

### Use Plugin Hooks

```typescript
// In your application
import { PluginManager } from '@sonicjs-cms/core'

const pluginManager = new PluginManager(context)

// Trigger hooks
await pluginManager.trigger('content:beforeSave', contentData)
await pluginManager.trigger('user:login', userData)
await pluginManager.trigger('request:complete', requestData)
```

---

## Middleware

### Custom Logging Middleware

```typescript
app.use('*', async (c, next) => {
  const start = Date.now()

  await next()

  const duration = Date.now() - start
  console.log(`${c.req.method} ${c.req.path} - ${c.res.status} (${duration}ms)`)
})
```

### Rate Limiting Middleware

```typescript
const rateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>()

  return async (c: Context, next: Next) => {
    const ip = c.req.header('cf-connecting-ip') || 'unknown'
    const now = Date.now()

    if (!requests.has(ip)) {
      requests.set(ip, [])
    }

    const userRequests = requests.get(ip)!
    const recentRequests = userRequests.filter(time => now - time < windowMs)

    if (recentRequests.length >= maxRequests) {
      return c.json({ error: 'Rate limit exceeded' }, 429)
    }

    recentRequests.push(now)
    requests.set(ip, recentRequests)

    await next()
  }
}

// Usage
app.use('/api/*', rateLimit(100, 60000)) // 100 requests per minute
```

### Caching Middleware

```typescript
const cacheMiddleware = (ttl: number = 3600) => {
  return async (c: Context, next: Next) => {
    const key = `cache:${c.req.path}:${c.req.query()}`

    // Try to get from cache
    if (c.env.CACHE_KV) {
      const cached = await c.env.CACHE_KV.get(key)
      if (cached) {
        return c.json(JSON.parse(cached))
      }
    }

    await next()

    // Cache response
    if (c.res.status === 200 && c.env.CACHE_KV) {
      const body = await c.res.clone().text()
      await c.env.CACHE_KV.put(key, body, { expirationTtl: ttl })
    }
  }
}

// Usage
app.get('/api/posts', cacheMiddleware(300), async (c) => {
  // Your route handler
})
```

---

## Templates

### Render HTML Template

```typescript
import { renderTemplate } from '@sonicjs-cms/core'

app.get('/blog/:slug', async (c) => {
  const db = createDb(c.env.DB)
  const slug = c.req.param('slug')

  const post = await db
    .select()
    .from(content)
    .where(
      and(
        eq(content.collection_id, 'blog_posts'),
        like(content.data, `%"slug":"${slug}"%`)
      )
    )
    .get()

  if (!post) {
    return c.notFound()
  }

  const data = JSON.parse(post.data)

  const html = renderTemplate('blog-post', {
    title: data.title,
    content: data.content,
    author: data.author,
    date: new Date(post.created_at).toLocaleDateString()
  })

  return c.html(html)
})
```

### Use Template Components

```typescript
import { renderForm, renderTable, renderAlert } from '@sonicjs-cms/core'

// Render form
const formHtml = renderForm({
  action: '/admin/posts/new',
  method: 'POST',
  fields: [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      placeholder: 'Enter post title'
    },
    {
      name: 'content',
      label: 'Content',
      type: 'textarea',
      rows: 10
    },
    {
      name: 'published',
      label: 'Publish immediately',
      type: 'checkbox'
    }
  ],
  submitLabel: 'Create Post'
})

// Render table
const tableHtml = renderTable({
  columns: [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'created_at', label: 'Created', sortable: true }
  ],
  rows: posts,
  actions: [
    { label: 'Edit', href: '/admin/posts/{id}/edit' },
    { label: 'Delete', href: '/admin/posts/{id}/delete', confirm: true }
  ]
})

// Render alert
const alertHtml = renderAlert({
  type: 'success',
  message: 'Post created successfully!'
})
```

---

## Database Operations

### Complex Queries with Drizzle

```typescript
import { createDb, content, users } from '@sonicjs-cms/core'
import { eq, and, or, like, desc, sql } from 'drizzle-orm'

const db = createDb(env.DB)

// Join content with users
const postsWithAuthors = await db
  .select({
    id: content.id,
    title: sql`json_extract(${content.data}, '$.title')`,
    author: users.email,
    created_at: content.created_at
  })
  .from(content)
  .innerJoin(users, eq(content.created_by, users.id))
  .where(eq(content.collection_id, 'blog_posts'))
  .orderBy(desc(content.created_at))
  .all()

// Aggregate queries
const stats = await db
  .select({
    collection: content.collection_id,
    count: sql<number>`count(*)`,
    avgSize: sql<number>`avg(length(${content.data}))`
  })
  .from(content)
  .groupBy(content.collection_id)
  .all()

// Subqueries
const recentAuthors = await db
  .select()
  .from(users)
  .where(
    sql`${users.id} IN (
      SELECT DISTINCT created_by
      FROM content
      WHERE created_at > ${Date.now() - 7 * 24 * 60 * 60 * 1000}
    )`
  )
  .all()
```

### Transactions

```typescript
// Execute multiple operations atomically
await db.batch([
  db.insert(content).values(newPost),
  db.update(users).set({ post_count: sql`post_count + 1` }).where(eq(users.id, userId)),
  db.insert(analyticsEvents).values(trackingData)
])
```

---

## Media Management

### Upload Media

```typescript
import { MediaManager } from '@sonicjs-cms/core'

app.post('/admin/media/upload', requireAuth(), async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return c.json({ error: 'No file provided' }, 400)
  }

  const mediaManager = new MediaManager(c.env)
  const result = await mediaManager.upload({
    file,
    userId: c.get('user').id,
    folder: 'uploads'
  })

  return c.json(result)
})
```

### Serve Media

```typescript
app.get('/media/:id', async (c) => {
  const id = c.req.param('id')

  // Get media metadata from database
  const media = await db
    .select()
    .from(mediaTable)
    .where(eq(mediaTable.id, id))
    .get()

  if (!media) {
    return c.notFound()
  }

  // Get file from R2
  const object = await c.env.MEDIA_BUCKET.get(media.storage_key)

  if (!object) {
    return c.notFound()
  }

  return new Response(object.body, {
    headers: {
      'Content-Type': media.mime_type,
      'Content-Length': media.size.toString(),
      'Cache-Control': 'public, max-age=31536000'
    }
  })
})
```

---

## Testing

### Unit Tests (Vitest)

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { AuthManager } from '@sonicjs-cms/core'

describe('AuthManager', () => {
  let authManager: AuthManager
  let mockEnv: any

  beforeEach(() => {
    mockEnv = {
      DB: {
        /* mock D1 database */
      },
      JWT_SECRET: 'test-secret'
    }
    authManager = new AuthManager(mockEnv)
  })

  it('should hash passwords correctly', async () => {
    const hashed = await authManager.hashPassword('password123')
    expect(hashed).not.toBe('password123')
    expect(hashed.length).toBeGreaterThan(60)
  })

  it('should verify passwords correctly', async () => {
    const hashed = await authManager.hashPassword('password123')
    const valid = await authManager.verifyPassword('password123', hashed)
    expect(valid).toBe(true)
  })

  it('should reject invalid passwords', async () => {
    const hashed = await authManager.hashPassword('password123')
    const valid = await authManager.verifyPassword('wrongpassword', hashed)
    expect(valid).toBe(false)
  })
})
```

### Integration Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test'

test.describe('Blog Posts', () => {
  test('should create a new post', async ({ page }) => {
    // Login
    await page.goto('/auth/login')
    await page.fill('input[name="email"]', 'admin@sonicjs.com')
    await page.fill('input[name="password"]', 'sonicjs!')
    await page.click('button[type="submit"]')

    // Navigate to new post page
    await page.goto('/admin/content/blog_posts/new')

    // Fill form
    await page.fill('input[name="title"]', 'Test Post')
    await page.fill('textarea[name="content"]', 'This is a test post')
    await page.click('button[type="submit"]')

    // Verify success
    await expect(page.locator('.alert-success')).toContainText('Post created')
  })

  test('should list all posts', async ({ page }) => {
    await page.goto('/admin/content/blog_posts')

    // Verify table exists
    await expect(page.locator('table')).toBeVisible()

    // Verify columns
    await expect(page.locator('th')).toContainText(['Title', 'Status', 'Created'])
  })
})
```

---

## Conclusion

These examples demonstrate the core patterns and best practices for building with SonicJS v2.0. For more details:

- **API Reference**: See `docs/ai/core-package-api-reference.md`
- **Migration Guide**: See `docs/ai/migration-guide-v2.md`
- **Plugin System**: See `docs/ai/plugin-system-documentation.md`

**Happy coding with SonicJS!** 🚀
