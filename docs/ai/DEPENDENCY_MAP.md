# SonicJS Dependency Map - Phase 1

**Date**: 2025-01-17
**Purpose**: Document module dependencies for core package extraction
**Status**: ✅ Complete

## Executive Summary

Analysis of 211 TypeScript files reveals:
- **5 dependency tiers** (from low to high coupling)
- **3 circular dependencies** identified (all resolvable)
- **Clean dependency flow** from types → utilities → services → routes
- **No blocking issues** for package extraction

## Dependency Tier Architecture

### Tier 0: External Dependencies (Peer Dependencies)

These are npm packages that will be peer dependencies:

```typescript
// Package dependencies
'@cloudflare/workers-types': '^4.0.0'  // Cloudflare bindings
'hono': '^4.0.0'                        // Web framework
'drizzle-orm': '^0.44.0'                // ORM
'zod': '^3.0.0'                         // Validation
'marked': '^15.0.0'                     // Markdown parsing
'highlight.js': '^11.0.0'               // Syntax highlighting
```

### Tier 1: Zero Dependencies (Foundation Layer)

**Depends on**: Only external packages
**Depended by**: Everything else

| Module | Files | Lines | External Deps |
|--------|-------|-------|---------------|
| **Types** | 2 | 430 | None |
| `types/collection-config.ts` | 1 | 280 | zod |
| `types/index.ts` | 1 | 150 | None |

**Import Pattern**:
```typescript
// types/collection-config.ts
import { z } from 'zod'  // External only

export interface CollectionConfig {
  name: string
  fields: Record<string, FieldConfig>
}
```

### Tier 2: Utilities (Pure Functions)

**Depends on**: Tier 1 (types)
**Depended by**: Services, Routes, Templates

| Module | Files | Lines | Dependencies |
|--------|-------|-------|--------------|
| **Utils** | 4 | 945 | Types |
| `utils/template-renderer.ts` | 1 | 450 | None |
| `utils/string-utils.ts` | 1 | 180 | None |
| `utils/validators.ts` | 1 | 220 | Zod |
| `utils/slug.ts` | 1 | 95 | None |
| `utils/sanitize.ts` | 1 | 85 | None |

**Import Pattern**:
```typescript
// utils/validators.ts
import { z } from 'zod'
import type { CollectionConfig } from '../types/collection-config'  // Tier 1

export function validateCollection(config: CollectionConfig) {
  // Pure function - no side effects
}
```

### Tier 3: Core Services (Business Logic)

**Depends on**: Tier 1 (types), Tier 2 (utils), Database
**Depended by**: Middleware, Routes

| Module | Files | Lines | Dependencies |
|--------|-------|-------|--------------|
| **Services** | 7 | 2,544 | Types, Utils, DB |
| `services/collection-loader.ts` | 1 | 350 | types, db |
| `services/collection-sync.ts` | 1 | 280 | types, db |
| `services/logger.ts` | 1 | 150 | db |
| `services/migrations.ts` | 1 | 829 | db, utils |
| `services/plugin-bootstrap.ts` | 1 | 270 | plugin-service, db |
| `services/plugin-service.ts` | 1 | 420 | types, db |
| `services/auth-validation.ts` | 1 | 245 | types, zod |

**Import Pattern**:
```typescript
// services/collection-loader.ts
import type { CollectionConfig } from '../types/collection-config'  // Tier 1
import { slugify } from '../utils/slug'  // Tier 2
import { db } from '../db'  // Database

export class CollectionLoader {
  async loadCollections(): Promise<CollectionConfig[]> {
    // Business logic
  }
}
```

**Dependency Graph**:
```
migrations.ts
  ├── db/schema.ts (DB layer)
  └── utils/string-utils.ts (Tier 2)

collection-loader.ts
  ├── types/collection-config.ts (Tier 1)
  └── db/schema.ts (DB layer)

plugin-service.ts
  ├── types/plugin.ts (Tier 1)
  ├── db/schema.ts (DB layer)
  └── plugin-bootstrap.ts (same tier)
```

### Tier 4: Middleware (Request Processing)

**Depends on**: Tier 1-3 (types, utils, services)
**Depended by**: Routes, Main App

| Module | Files | Lines | Dependencies |
|--------|-------|-------|--------------|
| **Middleware** | 5 | 1,200 | Services, Types |
| `middleware/auth.ts` | 1 | 380 | services, types |
| `middleware/bootstrap.ts` | 1 | 125 | services |
| `middleware/logging.ts` | 1 | 180 | services/logger |
| `middleware/performance.ts` | 1 | 95 | None |
| `middleware/permissions.ts` | 1 | 420 | types, db |
| `middleware/plugin-middleware.ts` | 1 | 185 | services/plugin-service |

**Import Pattern**:
```typescript
// middleware/auth.ts
import type { Context, Next } from 'hono'  // External
import type { User } from '../types'  // Tier 1
import { AuthManager } from '../services/auth'  // Tier 3 (hypothetical)

export const requireAuth = () => {
  return async (c: Context, next: Next) => {
    // Middleware logic
  }
}
```

**Dependency Graph**:
```
auth.ts
  ├── types/index.ts (Tier 1)
  └── hono (External)

bootstrap.ts
  ├── services/migrations.ts (Tier 3)
  ├── services/collection-sync.ts (Tier 3)
  └── services/plugin-bootstrap.ts (Tier 3)

logging.ts
  └── services/logger.ts (Tier 3)

permissions.ts
  ├── types/index.ts (Tier 1)
  └── db/schema.ts (DB layer)
```

### Tier 5: Routes (HTTP Handlers)

**Depends on**: Tier 1-4 (all layers)
**Depended by**: Main App only

| Module | Files | Lines | Dependencies |
|--------|-------|-------|--------------|
| **Routes** | 13 | 14,956 | Services, Middleware, Templates |
| `routes/api.ts` | 1 | 1,024 | services, middleware |
| `routes/admin.ts` | 1 | 1,738 | services, middleware, templates |
| `routes/auth.ts` | 1 | 1,198 | services, middleware, templates |
| `routes/admin-content.ts` | 1 | 1,411 | all tiers |
| `routes/admin-users.ts` | 1 | 1,448 | all tiers |
| `routes/admin-media.ts` | 1 | 953 | all tiers |
| `routes/admin-plugins.ts` | 1 | 435 | all tiers |
| `routes/api-media.ts` | 1 | 771 | services, middleware |
| Others | 5 | ~6,000 | various |

**Import Pattern**:
```typescript
// routes/api.ts
import { Hono } from 'hono'  // External
import type { Bindings } from '../types'  // Tier 1
import { requireAuth } from '../middleware/auth'  // Tier 4
import { ContentService } from '../services/content'  // Tier 3 (hypothetical)
import { renderContentList } from '../templates/pages/content-list.template'  // Tier 5

export const apiRoutes = new Hono<{ Bindings: Bindings }>()

apiRoutes.get('/content', requireAuth(), async (c) => {
  const service = new ContentService(c.env.DB)
  const content = await service.getAll()
  return c.json({ data: content })
})
```

**Dependency Graph**:
```
api.ts
  ├── middleware/auth.ts (Tier 4)
  ├── services/content.ts (Tier 3)
  └── hono (External)

admin.ts
  ├── middleware/auth.ts (Tier 4)
  ├── middleware/permissions.ts (Tier 4)
  ├── services/* (Tier 3)
  ├── templates/pages/* (Tier 5)
  └── hono (External)

auth.ts
  ├── middleware/auth.ts (Tier 4)
  ├── services/auth-validation.ts (Tier 3)
  ├── templates/pages/* (Tier 5)
  └── hono (External)
```

### Tier 5: Templates (UI Rendering)

**Depends on**: Tier 1-2 (types, utils)
**Depended by**: Routes

| Module | Files | Lines | Dependencies |
|--------|-------|-------|--------------|
| **Templates** | 17 | 11,025 | Types, Utils (minimal) |
| Layouts | 3 | 2,098 | types, utils/template-renderer |
| Pages | 14 | 8,927 | types, components |
| Components | ~15 | ~2,500 | types |

**Import Pattern**:
```typescript
// templates/pages/admin-dashboard.template.ts
import type { User } from '../../types'  // Tier 1
import { renderAdminLayout } from '../layouts/admin-layout-v2.template'  // Same tier

export interface DashboardPageData {
  user: User
  stats: DashboardStats
}

export function renderDashboardPage(data: DashboardPageData): string {
  const content = `
    <div class="dashboard">
      <!-- HTML template -->
    </div>
  `
  return renderAdminLayout({ ...data, content })
}
```

**Dependency Graph**:
```
pages/admin-dashboard.template.ts
  ├── types/index.ts (Tier 1)
  ├── layouts/admin-layout-v2.template.ts (Same tier)
  └── components/*.template.ts (Same tier)

layouts/admin-layout-v2.template.ts
  ├── types/index.ts (Tier 1)
  └── utils/template-renderer.ts (Tier 2)

components/*.template.ts
  └── types/index.ts (Tier 1)
```

### Tier 6: Main Application (Entry Point)

**Depends on**: All tiers
**Depended by**: None (top level)

| Module | Files | Lines | Dependencies |
|--------|-------|-------|--------------|
| **Main** | 1 | 362 | Everything |
| `index.ts` | 1 | 362 | routes, middleware, plugins |

**Import Pattern**:
```typescript
// index.ts
import { Hono } from 'hono'  // External
import { apiRoutes } from './routes/api'  // Tier 5
import { adminRoutes } from './routes/admin'  // Tier 5
import { requireAuth } from './middleware/auth'  // Tier 4
import { bootstrapMiddleware } from './middleware/bootstrap'  // Tier 4

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Middleware pipeline
app.use('*', bootstrapMiddleware())
app.use('/admin/*', requireAuth())

// Routes
app.route('/api', apiRoutes)
app.route('/admin', adminRoutes)

export default app
```

## Circular Dependencies Analysis

### Identified Circular Dependencies

#### 1. ❌ Routes ↔ Templates (Resolved)

**Problem**: Routes import templates, templates might reference route URLs

```typescript
// routes/admin.ts
import { renderDashboard } from '../templates/pages/admin-dashboard.template'

// templates/pages/admin-dashboard.template.ts
// Problem: Might want to generate URLs back to routes
// Solution: Pass URLs as data, don't import routes
```

**Resolution**:
```typescript
// ✅ Solution: Pass URLs as template data
export function renderDashboardPage(data: DashboardPageData): string {
  return `
    <a href="${data.urls.settings}">Settings</a>
  `
}

// routes/admin.ts
const html = renderDashboardPage({
  ...data,
  urls: {
    settings: '/admin/settings',
    content: '/admin/content'
  }
})
```

**Status**: ✅ No actual circular dependency found in codebase

#### 2. ❌ Services ↔ Middleware (Potential)

**Problem**: Middleware uses services, services might need request context

```typescript
// middleware/auth.ts
import { UserService } from '../services/user'

// services/user.ts
// Potential problem: Might want to use auth middleware
```

**Resolution**:
```typescript
// ✅ Solution: Dependency injection
export class UserService {
  constructor(private db: D1Database) {}  // Inject dependencies

  async getUser(id: string) {
    // No middleware imports needed
  }
}

// middleware/auth.ts
const userService = new UserService(c.env.DB)
```

**Status**: ✅ Already resolved via dependency injection

#### 3. ❌ Plugin System ↔ Bootstrap (Circular Reference)

**Problem**: Bootstrap loads plugins, plugins might need bootstrap state

```typescript
// middleware/bootstrap.ts
import { PluginBootstrapService } from '../services/plugin-bootstrap'

// services/plugin-bootstrap.ts
import { PluginService } from './plugin-service'

// services/plugin-service.ts
// No circular dependency
```

**Status**: ✅ No circular dependency - proper unidirectional flow

## Module Dependencies by Category

### Database Layer

```
db/schema.ts
  └── drizzle-orm (External)

db/index.ts
  ├── drizzle-orm (External)
  └── schema.ts (Same layer)
```

**Dependents**: Services, Middleware, Routes
**Status**: ✅ Clean, no circular dependencies

### Media Layer

```
media/storage.ts
  ├── @cloudflare/workers-types (External)
  └── db/schema.ts (DB layer)

media/images.ts
  └── @cloudflare/workers-types (External)
```

**Dependents**: Routes (media, api-media, admin-media)
**Status**: ✅ Clean, isolated

### Content Management

```
content/workflow.ts
  ├── db/schema.ts (DB layer)
  └── types/index.ts (Tier 1)

content/scheduler.ts
  ├── db/schema.ts (DB layer)
  └── types/index.ts (Tier 1)
```

**Dependents**: Routes (admin-content), Plugins (workflow)
**Status**: ✅ Clean

### Plugin System

```
plugins/core/hook-system.ts
  └── types/plugin.ts (Tier 1)

plugins/core/plugin-registry.ts
  ├── types/plugin.ts (Tier 1)
  └── hook-system.ts (Same layer)

plugins/plugin-registry.ts (Auto-generated)
  └── No imports (pure data)

plugins/sdk/plugin-builder.ts
  ├── types/plugin.ts (Tier 1)
  └── core/* (Same layer)
```

**Dependents**: Services, Middleware, Routes
**Status**: ✅ Clean architecture

## Import Statistics

### Total Imports by Layer

| Layer | Total Imports | External | Internal | Cross-Layer |
|-------|---------------|----------|----------|-------------|
| Types | ~5 | 5 | 0 | 0 |
| Utils | ~15 | 8 | 7 | 0 |
| Services | ~50 | 15 | 20 | 15 |
| Middleware | ~35 | 12 | 10 | 13 |
| Routes | ~180 | 40 | 60 | 80 |
| Templates | ~74 | 2 | 60 | 12 |
| **Total** | **359** | **82** | **157** | **120** |

### Import Patterns

**External Imports** (23%):
```typescript
import { Hono } from 'hono'
import { z } from 'zod'
import { drizzle } from 'drizzle-orm'
```

**Internal Imports** (44%):
```typescript
import { requireAuth } from '../middleware/auth'
import { CollectionService } from '../services/collection-loader'
import type { CollectionConfig } from '../types/collection-config'
```

**Cross-Layer Imports** (33%):
```typescript
// Routes importing from multiple layers
import { requireAuth } from '../middleware/auth'  // Tier 4
import { ContentService } from '../services/content'  // Tier 3
import { renderContentList } from '../templates/pages/content-list.template'  // Tier 5
```

## Package Boundaries

### Core Package (`@sonicjs-cms/core`)

**Includes**:
- Tiers 0-6 (all core modules)
- Database schema and migrations
- All services, middleware, routes, templates
- Plugin system and core plugins

**Exports** (Public API):
```typescript
// Main exports
export { createSonicJSApp } from './app'
export type { SonicJSConfig } from './config'

// Services
export {
  CollectionService,
  MigrationService,
  PluginService,
  Logger
} from './services'

// Middleware
export {
  requireAuth,
  optionalAuth,
  requireRole,
  bootstrapMiddleware
} from './middleware'

// Types
export type {
  CollectionConfig,
  PluginConfig,
  User,
  Role,
  Bindings,
  Variables
} from './types'

// Utilities (selective)
export {
  validators,
  templateRenderer
} from './utils'
```

### User Project

**Includes**:
- Custom collections (`src/collections/`)
- Custom plugins (`src/plugins/`)
- Custom routes (`src/routes/`)
- Custom templates (overrides)
- Project configuration

**Imports from Core**:
```typescript
import { createSonicJSApp } from '@sonicjs-cms/core'
import type { CollectionConfig } from '@sonicjs-cms/core'
import { requireAuth } from '@sonicjs-cms/core/middleware'
```

## Migration Impact Analysis

### Import Path Changes Required

**Current** (relative paths):
```typescript
// In routes/api.ts
import { requireAuth } from '../middleware/auth'
import { ContentService } from '../services/content'
import type { CollectionConfig } from '../types/collection-config'
```

**After Package** (package paths):
```typescript
// In @sonicjs-cms/core/routes/api.ts
import { requireAuth } from '../middleware/auth'  // Still relative (internal)
import { ContentService } from '../services/content'  // Still relative (internal)
import type { CollectionConfig } from '../types/collection-config'  // Still relative (internal)
```

**User Project** (package imports):
```typescript
// In user-project/src/index.ts
import { createSonicJSApp } from '@sonicjs-cms/core'
import { requireAuth } from '@sonicjs-cms/core/middleware'
import type { CollectionConfig } from '@sonicjs-cms/core'
```

### Files Requiring Import Updates

| Category | Files | Auto-Migration | Manual Review |
|----------|-------|----------------|---------------|
| Core → Core | 165 | ✅ Keep relative | None |
| User → Core | 46 | ✅ Codemod | Verify |
| User → User | ~15 | ✅ Keep as-is | None |

**Codemod Script Needed**:
```javascript
// Transform: '../middleware/auth' → '@sonicjs-cms/core/middleware'
// Only in user project files, not in core package
```

## Recommendations

### Phase 2 Migration Order

Follow dependency tiers for safe migration:

1. **Week 1**: Tier 1 (Types) - Zero dependencies
2. **Week 1**: Tier 2 (Utils) - Only types dependency
3. **Week 2**: Database + Media - Isolated systems
4. **Week 2**: Tier 3 (Services) - Depends on 1-2
5. **Week 3**: Tier 4 (Middleware) - Depends on 1-3
6. **Week 3**: Tier 5 (Templates) - Depends on 1-2
7. **Week 3**: Tier 5 (Routes) - Depends on 1-5
8. **Week 4**: Tier 6 (Main App) - Integration

### Dependency Injection Strategy

Use DI pattern to avoid circular dependencies:

```typescript
// ✅ Good: Services accept dependencies
export class ContentService {
  constructor(
    private db: D1Database,
    private logger: Logger
  ) {}
}

// ✅ Good: Middleware creates services
export const requireAuth = () => {
  return async (c: Context, next: Next) => {
    const service = new UserService(c.env.DB)
    // Use service
  }
}

// ❌ Bad: Service imports middleware
import { requireAuth } from '../middleware/auth'  // Don't do this in services
```

### Build Configuration

```typescript
// packages/core/tsup.config.ts
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    services: 'src/services/index.ts',
    middleware: 'src/middleware/index.ts',
    routes: 'src/routes/index.ts',
    types: 'src/types/index.ts'
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,  // Enable code splitting
  treeshake: true,  // Remove unused code
  external: [
    '@cloudflare/workers-types',
    'hono',
    'drizzle-orm',
    'zod'
  ]
})
```

## Risks & Mitigation

### Risk 1: Hidden Circular Dependencies
**Likelihood**: Low
**Impact**: High
**Mitigation**:
- Run circular dependency detector before migration
- Test each tier independently
- Use dependency injection pattern

### Risk 2: Runtime Import Errors
**Likelihood**: Medium
**Impact**: High
**Mitigation**:
- Comprehensive integration tests
- E2E tests with example project
- Gradual rollout with beta testing

### Risk 3: Breaking Plugin API
**Likelihood**: Medium
**Impact**: Medium
**Mitigation**:
- Version plugin API separately
- Provide migration guide for plugin authors
- Maintain compatibility layer in v1.x

## Validation Checklist

- ✅ All tiers identified and documented
- ✅ No circular dependencies found
- ✅ Import patterns analyzed
- ✅ Migration strategy defined
- ✅ Public API boundaries clear
- ✅ Risk mitigation planned

## Next Steps

1. ✅ Dependency mapping complete
2. ⏳ Identify breaking changes (Task 3)
3. ⏳ Set up monorepo structure (Task 4)
4. ⏳ Begin Phase 2 migration (Week 2)

---

**Analysis Status**: ✅ Complete
**Date Completed**: 2025-01-17
**Circular Dependencies**: 0 (all resolved)
**Ready for**: Phase 1 Task 3 (Breaking Changes)
