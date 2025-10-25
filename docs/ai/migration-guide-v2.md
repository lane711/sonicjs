# SonicJS v2.0 Migration Guide

**Version**: 2.0.x
**Last Updated**: October 24, 2025
**Status**: Production Ready

## Overview

This guide helps you migrate from SonicJS v1.x (monolithic architecture) to v2.0.x (core package architecture) or start fresh with the new core package system.

## Migration Paths

### Path 1: New Projects (Recommended)

For new projects, use the `create-sonicjs` CLI tool:

```bash
npx create-sonicjs my-project
cd my-project
npm install
npm run db:migrate
npm run dev
```

### Path 2: Existing Projects

For existing SonicJS v1.x projects, follow the incremental migration strategy below.

---

## What's Changed in v2.0

### Architecture Changes

| v1.x (Monolithic) | v2.0 (Core Package) |
|-------------------|---------------------|
| All code in one repository | Core extracted to `@sonicjs-cms/core` |
| Manual updates required | `npm update` for core updates |
| Mixed user/framework code | Clear separation |
| Custom build process | Standard npm workflow |
| No versioning | Semantic versioning |

### Package Structure

**Before (v1.x)**:
```
sonicjs/
├── src/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── templates/
│   ├── plugins/
│   └── collections/
```

**After (v2.0)**:
```
my-app/
├── node_modules/
│   └── @sonicjs-cms/core/  # Core framework
├── src/
│   ├── collections/         # User collections only
│   ├── plugins/             # User plugins only
│   ├── routes/              # User routes only
│   └── index.ts             # App entry
└── package.json             # Depends on @sonicjs-cms/core
```

---

## Step-by-Step Migration

### Step 1: Install Core Package

Add the core package to your project:

```bash
npm install @sonicjs-cms/core@latest
```

### Step 2: Update Entry Point

**Before (v1.x)**:
```typescript
// src/index.ts
import { Hono } from 'hono'
import { adminRoutes } from './routes/admin'
import { apiRoutes } from './routes/api'
import { authMiddleware } from './middleware/auth'

const app = new Hono()

app.use('/admin/*', authMiddleware)
app.route('/admin', adminRoutes)
app.route('/api', apiRoutes)

export default app
```

**After (v2.0)**:
```typescript
// src/index.ts
import { Hono } from 'hono'
import {
  adminDashboardRoutes,
  adminContentRoutes,
  adminUsersRoutes,
  apiRoutes,
  authRoutes,
  requireAuth,
  requireRole,
  optionalAuth,
  bootstrapMiddleware,
  loggingMiddleware,
  securityHeaders
} from '@sonicjs-cms/core'

const app = new Hono()

// Core middleware
app.use('*', bootstrapMiddleware())
app.use('*', loggingMiddleware())
app.use('*', securityHeaders())

// Auth routes (public)
app.route('/auth', authRoutes)

// API routes (optional auth)
app.use('/api/*', optionalAuth())
app.route('/api', apiRoutes)

// Admin routes (requires auth)
app.use('/admin/*', requireAuth())
app.use('/admin/*', requireRole(['admin', 'editor']))
app.route('/admin', adminDashboardRoutes)
app.route('/admin/content', adminContentRoutes)
app.route('/admin', adminUsersRoutes)

export default app
```

### Step 3: Update Collections

**Before (v1.x)**:
Collections were defined inline or in various formats.

**After (v2.0)**:
Use the standardized `CollectionConfig` type:

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
        maxLength: 200
      },
      slug: {
        type: 'slug',
        required: true
      },
      content: {
        type: 'richtext'
      },
      excerpt: {
        type: 'text',
        maxLength: 500
      },
      featured_image: {
        type: 'media',
        accept: 'image/*'
      },
      author: {
        type: 'reference',
        collection: 'users'
      },
      tags: {
        type: 'array',
        items: { type: 'string' }
      },
      published: {
        type: 'boolean',
        default: false
      }
    }
  },
  icon: '📝',
  managed: true,
  isActive: true,
  defaultSort: 'created_at',
  defaultSortOrder: 'desc'
}
```

### Step 4: Update Custom Plugins

**Before (v1.x)**:
Plugins had various formats and structures.

**After (v2.0)**:
Use the standardized `Plugin` interface:

```typescript
// src/plugins/my-plugin/index.ts
import type { Plugin, PluginContext } from '@sonicjs-cms/core'

const myPlugin: Plugin = {
  name: 'my-custom-plugin',
  version: '1.0.0',
  description: 'My custom functionality',

  async install(context: PluginContext) {
    const { db, logger } = context

    // Run plugin-specific migrations
    await logger.info('plugin', 'Plugin installed', { plugin: this.name })
  },

  async activate(context: PluginContext) {
    const { hookSystem, logger } = context

    // Register hooks
    hookSystem.register('content:beforeSave', async (data) => {
      // Transform content
      return data
    })

    await logger.info('plugin', 'Plugin activated', { plugin: this.name })
  },

  async deactivate(context: PluginContext) {
    const { logger } = context
    await logger.info('plugin', 'Plugin deactivated', { plugin: this.name })
  },

  async uninstall(context: PluginContext) {
    const { db, logger } = context

    // Cleanup
    await logger.info('plugin', 'Plugin uninstalled', { plugin: this.name })
  }
}

export default myPlugin
```

### Step 5: Update Middleware

**Before (v1.x)**:
Custom middleware everywhere.

**After (v2.0)**:
Use core middleware and only add custom when needed:

```typescript
import {
  requireAuth,
  requireRole,
  requirePermission,
  loggingMiddleware,
  securityHeaders,
  cacheHeaders,
  bootstrapMiddleware
} from '@sonicjs-cms/core'

// Use core middleware
app.use('*', bootstrapMiddleware())
app.use('*', loggingMiddleware())
app.use('*', securityHeaders())

// Add custom middleware only when needed
app.use('/custom/*', async (c, next) => {
  // Your custom logic
  await next()
})
```

### Step 6: Update Database Operations

**Before (v1.x)**:
Direct SQL queries.

**After (v2.0)**:
Use Drizzle ORM with typed schemas:

```typescript
import { createDb, users, content } from '@sonicjs-cms/core'
import { eq, and, desc } from 'drizzle-orm'

const db = createDb(env.DB)

// Query users
const allUsers = await db.select().from(users).all()

// Query with conditions
const activeContent = await db
  .select()
  .from(content)
  .where(
    and(
      eq(content.status, 'published'),
      eq(content.collection_id, 'blog_posts')
    )
  )
  .orderBy(desc(content.created_at))
  .limit(10)
  .all()
```

### Step 7: Update Templates

**Before (v1.x)**:
HTML strings everywhere.

**After (v2.0)**:
Use core template helpers:

```typescript
import {
  renderForm,
  renderTable,
  renderAlert,
  renderPagination
} from '@sonicjs-cms/core'

// Render a form
const formHtml = renderForm({
  action: '/admin/users/new',
  method: 'POST',
  fields: [
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true }
  ],
  submitLabel: 'Create User'
})

// Render a table
const tableHtml = renderTable({
  columns: [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true }
  ],
  rows: users
})

// Render an alert
const alertHtml = renderAlert({
  type: 'success',
  message: 'User created successfully!'
})
```

### Step 8: Update Package Scripts

**Before (v1.x)**:
Custom scripts.

**After (v2.0)**:
Standardized scripts:

```json
{
  "scripts": {
    "dev": "wrangler dev",
    "build": "tsc && wrangler deploy --dry-run",
    "deploy": "wrangler deploy",
    "db:migrate": "wrangler d1 migrations apply DB --local",
    "db:migrate:prod": "wrangler d1 migrations apply DB --env production",
    "test": "vitest --run",
    "test:watch": "vitest"
  }
}
```

---

## Breaking Changes

### Removed Features

#### 1. Direct Route Registration
**Old**:
```typescript
app.get('/admin/custom', handler)
```

**New**:
```typescript
// Use core routes or create plugin routes
import { createCustomRoutes } from './routes/custom'
app.route('/admin/custom', createCustomRoutes())
```

#### 2. Custom Auth Implementations
**Old**:
```typescript
const authMiddleware = async (c, next) => {
  // Custom auth logic
}
```

**New**:
```typescript
// Use core auth
import { requireAuth, AuthManager } from '@sonicjs-cms/core'

app.use('/admin/*', requireAuth())

// Or extend with custom logic
app.use('/admin/*', async (c, next) => {
  await requireAuth()(c, next)
  // Additional custom checks
})
```

#### 3. Database Schema Changes
**Old**:
Direct table modifications.

**New**:
Core schema is managed by the package. Extend via plugins:

```typescript
// In plugin install()
async install(context: PluginContext) {
  const { db } = context

  // Create plugin-specific tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS my_plugin_data (
      id TEXT PRIMARY KEY,
      data TEXT,
      created_at INTEGER
    )
  `)
}
```

### Deprecated APIs

These will be removed in v3.0:

- ❌ `app.customMiddleware()` → Use `requireAuth()` + custom logic
- ❌ `CollectionManager.create()` → Use `CollectionConfig` exports
- ❌ Direct template strings → Use `renderForm()`, `renderTable()`, etc.

---

## Testing Your Migration

### 1. Verify Build

```bash
npm run build
```

Should complete without errors.

### 2. Run Migrations

```bash
npm run db:migrate
```

Should apply all core migrations.

### 3. Start Development Server

```bash
npm run dev
```

Server should start on `http://localhost:8787`

### 4. Test Core Routes

- ✅ Login: `http://localhost:8787/auth/login`
- ✅ Dashboard: `http://localhost:8787/admin`
- ✅ API: `http://localhost:8787/api/collections`

### 5. Run Tests

```bash
npm test
```

All tests should pass.

---

## Common Migration Issues

### Issue 1: Import Errors

**Problem**: `Cannot find module '@sonicjs-cms/core'`

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: Type Errors

**Problem**: TypeScript type mismatches

**Solution**:
```bash
npm install --save-dev @cloudflare/workers-types@latest
npm install --save-dev typescript@latest
```

### Issue 3: Database Errors

**Problem**: `no such table: users`

**Solution**:
```bash
npm run db:migrate
```

### Issue 4: Route Not Found

**Problem**: Custom routes returning 404

**Solution**:
Ensure routes are mounted in the correct order:

```typescript
// Auth routes first (public)
app.route('/auth', authRoutes)

// API routes (optional auth)
app.use('/api/*', optionalAuth())
app.route('/api', apiRoutes)

// Admin routes last (requires auth)
app.use('/admin/*', requireAuth())
app.route('/admin', adminDashboardRoutes)
```

---

## Rollback Plan

If you need to rollback to v1.x:

### Step 1: Restore package.json

```bash
git checkout HEAD~1 package.json
npm install
```

### Step 2: Restore Source Files

```bash
git checkout HEAD~1 src/
```

### Step 3: Rebuild

```bash
npm run build
```

---

## Getting Help

### Resources

- 📚 **Documentation**: https://docs.sonicjs.com
- 💬 **Discussions**: https://github.com/sonicjs/sonicjs/discussions
- 🐛 **Issues**: https://github.com/sonicjs/sonicjs/issues
- 📖 **API Reference**: See `docs/ai/core-package-api-reference.md`

### Community

- **Discord**: [Join our server](https://discord.gg/sonicjs)
- **Twitter**: [@sonicjscms](https://twitter.com/sonicjscms)

---

## Next Steps

After completing your migration:

1. ✅ Review the [API Reference](./core-package-api-reference.md)
2. ✅ Explore [Plugin Development Guide](../plugins/plugin-development-guide.md)
3. ✅ Set up [Continuous Deployment](../deployment.md)
4. ✅ Configure [Monitoring & Logging](../monitoring.md)

---

**Migration Support**: If you encounter issues not covered in this guide, please open an issue on GitHub or ask in our Discord community.

**Last Updated**: October 24, 2025
**Core Version**: 2.0.2
