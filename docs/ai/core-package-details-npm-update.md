# SonicJS Core Package Extraction Plan

## Executive Summary

**Status: ACTIVE - Core Package v2.0.2**

The core SonicJS functionality has been successfully extracted into an npm package (`@sonicjs-cms/core` v2.0.2) to enable:

- ✅ Easy upgrades via `npm update @sonicjs-cms/core`
- ✅ Version control of core features
- ✅ Separation of framework code from user customizations
- ✅ Faster bug fixes and feature releases
- ✅ Better testing and stability

**Current Version**: 2.0.2 (Published to npm)
**Latest Updates**: User management routes, permission system integration, admin route consolidation

## Goals

1. **Easy Installation**: Quick start with `npx create-sonicjs`
2. **Easy Upgrades**: Developers run `npm update` to get latest core
3. **Clean Separation**: User code stays separate from framework code
4. **Customization**: Developers can override/extend core functionality
5. **Developer Experience**: Standard npm workflow for greenfield projects

## Package Structure

### Core Package: `@sonicjs-cms/core`

```
@sonicjs-cms/core/
├── src/
│   ├── db/                     # Database schemas and utilities
│   │   ├── schema.ts
│   │   └── migrations/
│   ├── services/               # Core services
│   │   ├── collection-loader.ts
│   │   ├── collection-sync.ts
│   │   ├── logger.ts
│   │   ├── migrations.ts
│   │   └── plugin-bootstrap.ts
│   ├── middleware/             # Core middleware
│   │   ├── auth.ts
│   │   ├── bootstrap.ts
│   │   ├── logging.ts
│   │   ├── performance.ts
│   │   └── permissions.ts
│   ├── routes/                 # Core admin routes
│   │   ├── admin.ts
│   │   ├── admin-content.ts
│   │   ├── admin-users.ts
│   │   ├── admin-media.ts
│   │   ├── admin-plugins.ts
│   │   ├── admin-logs.ts
│   │   ├── api.ts
│   │   ├── api-media.ts
│   │   └── auth.ts
│   ├── templates/              # Core UI templates
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── components/
│   ├── types/                  # TypeScript definitions
│   │   ├── collection-config.ts
│   │   ├── plugin.ts
│   │   └── index.ts
│   ├── plugins/                # All plugins
│   │   ├── core-plugins/       # Core essential plugins
│   │   │   ├── database-tools-plugin/
│   │   │   └── seed-data-plugin/
│   │   └── available/          # Optional plugins
│   │       ├── workflow-plugin/
│   │       ├── cache-plugin/
│   │       ├── faq-plugin/
│   │       └── email-plugin/
│   └── index.ts                # Main export
├── migrations/                 # Core migrations
├── package.json
├── tsconfig.json
└── README.md
```

### User Project Structure

```
my-sonicjs-site/
├── src/
│   ├── collections/            # USER: Collection configs
│   │   ├── blog-posts.collection.ts
│   │   └── products.collection.ts
│   ├── plugins/                # USER: Custom plugins
│   │   └── my-plugin/
│   ├── templates/              # USER: Custom templates (overrides)
│   │   └── pages/
│   ├── routes/                 # USER: Custom routes
│   │   └── custom.ts
│   └── index.ts                # USER: App entry point
├── wrangler.toml               # USER: Cloudflare config
├── package.json                # Depends on @sonicjs-cms/core
└── README.md
```

## What Goes in Core Package

### ✅ Include in Core

#### Database Layer

- `src/db/schema.ts` - Core database schema
- `src/db/migrations/` - Core migrations
- Migration utilities and services

#### Core Services

- `src/services/collection-loader.ts` - Collection loading
- `src/services/collection-sync.ts` - Collection syncing
- `src/services/logger.ts` - Logging system
- `src/services/migrations.ts` - Migration management
- `src/services/plugin-bootstrap.ts` - Plugin system

#### Authentication & Authorization

- `src/middleware/auth.ts` - Auth middleware
- `src/middleware/permissions.ts` - Permission system
- `src/routes/auth.ts` - Auth routes

#### Admin Interface

- `src/routes/admin.ts` - Admin dashboard routes
- `src/routes/admin-content.ts` - Content management
- `src/routes/admin-users.ts` - User management
- `src/routes/admin-media.ts` - Media management
- `src/routes/admin-plugins.ts` - Plugin management
- `src/routes/admin-logs.ts` - Log viewer
- `src/templates/layouts/` - Admin layouts
- `src/templates/pages/` - Admin pages
- `src/templates/components/` - Reusable components

#### API Layer

- `src/routes/api.ts` - Core API routes
- `src/routes/api-media.ts` - Media API
- API middleware and utilities

#### Middleware

- `src/middleware/bootstrap.ts` - App initialization
- `src/middleware/logging.ts` - Request logging
- `src/middleware/performance.ts` - Performance optimizations
- `src/middleware/plugin-middleware.ts` - Plugin loading

#### Type System

- `src/types/collection-config.ts` - Collection types
- `src/types/plugin.ts` - Plugin types
- All core type definitions

#### Core Plugins

- `src/plugins/core-plugins/database-tools-plugin/`
- `src/plugins/core-plugins/seed-data-plugin/`
- Future core plugins

#### Utilities

- String utilities
- Validation helpers
- Common utilities

### ❌ Keep in User Project

#### User-Specific

- `src/collections/` - User collection configs
- `src/plugins/` - User custom plugins only
- Custom routes
- Custom templates (unless overriding core)

#### Configuration

- `wrangler.toml` - Cloudflare Workers config
- Environment-specific settings
- Custom scripts

#### Project Files

- `package.json` - User dependencies
- `tsconfig.json` - User TypeScript config (extends core)
- `.env` files

## Included Plugins

All plugins are included in the core package:

### Core Plugins

- Database tools plugin
- Seed data plugin

### Optional Plugins (included but opt-in)

- Workflow automation plugin
- Three-tier caching plugin
- FAQ management plugin
- Email templates plugin

Users can enable/disable plugins via configuration.

## Migration Strategy

### Phase 1: Preparation (Week 1)

1. **Audit Current Codebase**
   - Identify all core vs user-specific code
   - Document dependencies between modules
   - List breaking changes

2. **Create Package Structure**
   - Set up monorepo or separate repos
   - Configure build tooling (tsup, rollup, or esbuild)
   - Set up CI/CD for package publishing

3. **Define Public API**
   - Document exports from `@sonicjs-cms/core`
   - Create TypeScript definitions
   - Version all breaking changes

### Phase 2: Core Extraction (Week 2-3)

1. **Move Core Files**
   - Copy core files to package
   - Update import paths
   - Fix circular dependencies

2. **Build System**
   - Configure TypeScript compilation
   - Bundle for npm distribution
   - Generate type definitions

3. **Testing**
   - Unit tests for core functionality
   - Integration tests
   - E2E tests

### Phase 3: User Project Template (Week 3-4)

1. **Create Starter Template**
   - Minimal greenfield project structure
   - Example collections
   - Sample custom plugin
   - Documentation

2. **CLI Tool**
   - `npx create-sonicjs my-app`
   - Project scaffolding

### Phase 4: Testing & Polish (Week 4-5)

1. **Comprehensive Testing**
   - Test all plugins included in core
   - Integration testing
   - E2E testing with plugins

2. **Documentation**
   - Document all included plugins
   - Plugin development guide
   - API reference

### Phase 5: Documentation & Launch (Week 5-6)

1. **Documentation**
   - API reference
   - Getting started guide
   - Tutorials
   - Examples

2. **Release**
   - Semantic versioning
   - Changelog

## Package API Design

### Main Export (`@sonicjs-cms/core`)

```typescript
import {
  // Core app
  createSonicJSApp,

  // Services
  CollectionLoader,
  CollectionSync,
  MigrationService,
  Logger,

  // Middleware
  requireAuth,
  requireRole,
  bootstrapMiddleware,

  // Types
  CollectionConfig,
  PluginConfig,

  // Utilities
  validators,
  helpers,

  // Routes (for extending)
  adminRoutes,
  apiRoutes,
  authRoutes
} from '@sonicjs-cms/core'

// User's index.ts
const app = createSonicJSApp({
  collections: './src/collections',
  plugins: './src/plugins',
  routes: './src/routes',
  templates: './src/templates'
})

export default app
```

### Configuration

```typescript
// sonicjs.config.ts
import { SonicJSConfig } from '@sonicjs-cms/core'

export default {
  collections: {
    directory: './src/collections',
    autoSync: true
  },
  plugins: {
    directory: './src/plugins',
    autoLoad: true
  },
  templates: {
    directory: './src/templates',
    theme: 'default'
  },
  database: {
    migrations: './migrations'
  }
} satisfies SonicJSConfig
```

## Versioning Strategy

### Semantic Versioning

Starting at v2.0.0 to differentiate from v1.x (monolith):

- **Major (2.0.0)**: Breaking changes
- **Minor (2.1.0)**: New features (backward compatible)
- **Patch (2.0.2)**: Bug fixes (current version)

### Release Cadence

Starting at v2.0.0 (v1.x was the monolith):

- **Patch**: As needed (bug fixes)
- **Minor**: Monthly (new features)
- **Major**: As needed (breaking changes)

### Deprecation Policy

1. Mark feature as deprecated
2. Maintain for 2 minor versions
3. Remove in next major version
4. Provide migration path

## Installation Experience (Greenfield Only)

### Create New Project

```bash
# Create new SonicJS project
npx create-sonicjs my-app

# Or manually
npm init
npm install @sonicjs-cms/core

# Run migrations
npm run db:migrate

# Start development
npm run dev
```

### Update Core

```bash
# Simple npm update
npm update @sonicjs-cms/core

# Run any new migrations
npm run db:migrate

# Done!
```

## Breaking Changes Management

### Database Migrations Only

Since we're targeting greenfield projects only:

```bash
# Core migrations run automatically on startup
npm run dev

# Or run manually
npm run db:migrate
```

Database migrations are tracked and versioned in the core package.

## Benefits Analysis

### For Core Developers

✅ Faster iteration on core features
✅ Better testing of core functionality
✅ Cleaner separation of concerns
✅ Easier to maintain
✅ Can version and release independently

### For Users

✅ **Easy upgrades**: `npm update @sonicjs-cms/core`
✅ **Stable projects**: Core changes don't affect user code
✅ **Better DX**: Clear separation of user vs framework code
✅ **Faster bug fixes**: Update package, not entire codebase
✅ **Plugin ecosystem**: Install only what you need

### For Ecosystem

✅ Third-party plugins can target specific core versions
✅ Community can contribute to core more easily
✅ Better documentation (API reference auto-generated)
✅ Stronger typing and intellisense

## Challenges & Solutions

### Challenge 1: Circular Dependencies

**Problem**: Core and user code may reference each other
**Solution**:

- Use dependency injection
- Plugin system for extensibility
- Clear interfaces/contracts

### Challenge 2: Template Overrides

**Problem**: Users want to customize admin UI
**Solution**:

- Template override system
- User templates take precedence
- Document override points

### Challenge 3: Database Migrations

**Problem**: Core migrations + user migrations
**Solution**:

- Separate migration namespaces
- Core migrations run first
- User migrations reference core version

### Challenge 4: Breaking Changes

**Problem**: Updates might break user projects
**Solution**:

- Semantic versioning (MAJOR.MINOR.PATCH)
- Deprecation warnings
- Migration scripts
- Comprehensive changelog

### Challenge 5: Build Complexity

**Problem**: Need to bundle for npm + Cloudflare Workers
**Solution**:

- Use esbuild/tsup for fast builds
- Provide both ESM and CJS
- Pre-bundle dependencies

## Testing Strategy

### Core Package Testing

```typescript
// @sonicjs-cms/core/tests/
├── unit/
│   ├── services/
│   ├── middleware/
│   └── utilities/
├── integration/
│   ├── api/
│   ├── admin/
│   └── plugins/
└── e2e/
    └── workflows/
```

### User Project Testing

- Test custom collections
- Test custom plugins
- Test overrides
- Integration with core

## Documentation Structure

```
docs/
├── getting-started/
│   ├── installation.md
│   ├── quick-start.md
│   └── project-structure.md
├── core-concepts/
│   ├── collections.md
│   ├── plugins.md
│   ├── routing.md
│   └── authentication.md
├── api-reference/
│   ├── services/
│   ├── middleware/
│   └── utilities/
└── guides/
    ├── creating-collections.md
    ├── building-plugins.md
    └── customizing-admin.md
```

## Rollout Plan

### Phase 1: Alpha (Internal Testing)

- Package published to npm with `-alpha` tag
- Core team tests in real projects
- Fix critical issues

### Phase 2: Beta (Early Adopters)

- Package published with `-beta` tag
- Selected community members test
- Gather feedback
- Refine API

### Phase 3: Release Candidate

- Package published with `-rc` tag
- Public testing
- Documentation review
- Final bug fixes

### Phase 4: v2.0.2 Release (CURRENT)

- ✅ Stable release to npm (v2.0.2)
- ✅ Core package published and functional
- ✅ User routes fully implemented
- ✅ Permission system integrated
- 🔄 Documentation in progress
- 🔄 Community support channels active

### Phase 5: Ongoing

- Regular updates (patch/minor)
- Community contributions
- Plugin ecosystem growth
- Major versions as needed

## Success Metrics

### Technical Metrics

- ✅ Package size < 500KB
- ✅ Build time < 30s
- ✅ Test coverage > 80%
- ✅ Zero critical security issues

### User Metrics

- ✅ Setup time < 5 minutes (greenfield)
- ✅ Upgrade time < 5 minutes (npm update)
- ✅ Documentation completeness > 90%
- ✅ Community satisfaction > 80%

### Ecosystem Metrics

- ✅ 10+ community plugins in first year
- ✅ Weekly npm downloads > 1000
- ✅ GitHub stars > 2000
- ✅ Active contributors > 20

## Risks & Mitigation

### Risk 1: Adoption Resistance

**Mitigation**:

- Clear getting started guide
- Demonstrate value
- Excellent documentation
- Community support

### Risk 2: Limited Ecosystem Initially

**Mitigation**:

- Start with strong core functionality
- Provide plugin examples
- Extensive testing
- Beta period for feedback

### Risk 3: Maintenance Burden

**Mitigation**:

- Good test coverage
- Clear contribution guidelines
- Automated releases
- Community involvement

### Risk 4: Versioning Hell

**Mitigation**:

- Strict semantic versioning
- Clear dependency requirements
- Lock file support
- Version compatibility matrix

## Timeline

### Month 1: Foundation

- Audit codebase
- Design package structure
- Set up build system
- Create migration plan

### Month 2: Core Extraction

- Move core code to package
- Fix imports and dependencies
- Write tests
- Create TypeScript definitions

### Month 3: Greenfield Template

- ✅ Create starter template for new projects
- ✅ Build CLI scaffolding tool (`create-sonicjs`)
- ✅ Write getting started documentation
- ✅ Alpha testing complete

### Month 4: Testing & Polish

- Test all included plugins
- Document plugin API
- Beta testing
- Gather feedback

### Month 5: Polish & Launch

- Final bug fixes
- Complete documentation
- Getting started guides
- Release v1.0

### Month 6+: Iterate

- Community support
- Regular updates
- New features
- Ecosystem growth

## Conclusion

Extracting SonicJS core into an npm package will:

1. **Simplify upgrades** from manual merges to `npm update`
2. **Enable rapid iteration** on core features
3. **Foster ecosystem growth** through plugins
4. **Improve developer experience** with clear separation
5. **Ensure stability** through versioning and testing

This is a significant undertaking but will position SonicJS as a modern, maintainable, and developer-friendly CMS framework.

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Prioritize phases** based on resources
3. **Create detailed tickets** for each phase
4. **Assign ownership** of different components
5. **Begin Phase 1** with codebase audit

---

**Estimated Total Effort**: 5-6 months with 1-2 developers
**Recommended Team**: 1 lead + 1 contributor + community
**Investment**: High upfront, but pays dividends in maintainability
