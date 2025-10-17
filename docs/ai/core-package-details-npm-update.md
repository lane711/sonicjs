# SonicJS Core Package Extraction Plan

## Executive Summary

Extract core SonicJS functionality into an npm package (`@sonicjs/core`) to enable:

- Easy upgrades via `npm update @sonicjs/core`
- Version control of core features
- Separation of framework code from user customizations
- Faster bug fixes and feature releases
- Better testing and stability

## Goals

1. **Easy Upgrades**: Developers run `npm update` to get latest core
2. **Clean Separation**: User code stays separate from framework code
3. **Customization**: Developers can override/extend core functionality
4. **Backward Compatibility**: Minimize breaking changes
5. **Developer Experience**: Clear upgrade path and migration guides

## Package Structure

### Core Package: `@sonicjs/core`

```
@sonicjs/core/
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
│   ├── plugins/                # Core plugins
│   │   └── core-plugins/
│   │       ├── database-tools-plugin/
│   │       └── seed-data-plugin/
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
├── package.json                # Depends on @sonicjs/core
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
- `src/plugins/available/` - User/optional plugins (workflow, cache, FAQ, etc.)
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

## Optional Plugins

These should be separate packages that users can install:

### `@sonicjs/plugin-workflow`

- Workflow automation plugin
- Install: `npm install @sonicjs/plugin-workflow`

### `@sonicjs/plugin-cache`

- Three-tier caching system
- Install: `npm install @sonicjs/plugin-cache`

### `@sonicjs/plugin-faq`

- FAQ management
- Install: `npm install @sonicjs/plugin-faq`

### `@sonicjs/plugin-email`

- Email templates and sending
- Install: `npm install @sonicjs/plugin-email`

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
   - Document exports from `@sonicjs/core`
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
   - Minimal project structure
   - Example collections
   - Sample custom plugin
   - Documentation

2. **Migration Guide**
   - Step-by-step upgrade instructions
   - Breaking changes documentation
   - Code examples

3. **CLI Tool** (Optional)
   - `npx create-sonicjs-app my-app`
   - Project scaffolding
   - Upgrade utilities

### Phase 4: Plugin Ecosystem (Week 4-5)

1. **Extract Optional Plugins**
   - Move to separate packages
   - Document plugin API
   - Publish to npm

2. **Plugin Registry**
   - List available plugins
   - Installation instructions
   - Version compatibility

### Phase 5: Documentation & Launch (Week 5-6)

1. **Documentation**
   - API reference
   - Migration guides
   - Tutorials
   - Examples

2. **Release**
   - Semantic versioning
   - Changelog
   - Upgrade path

## Package API Design

### Main Export (`@sonicjs/core`)

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
} from '@sonicjs/core'

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
import { SonicJSConfig } from '@sonicjs/core'

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

- **Major (1.0.0)**: Breaking changes
- **Minor (0.1.0)**: New features (backward compatible)
- **Patch (0.0.1)**: Bug fixes

### Release Cadence

- **Patch**: As needed (bug fixes)
- **Minor**: Monthly (new features)
- **Major**: Quarterly or as needed (breaking changes)

### Deprecation Policy

1. Mark feature as deprecated
2. Maintain for 2 minor versions
3. Remove in next major version
4. Provide migration path

## Upgrade Experience

### Current (Without Package)

```bash
# User must manually merge changes from upstream
git pull upstream main
# Resolve conflicts manually
# Test everything
# Hope nothing breaks
```

### Future (With Package)

```bash
# Simple npm update
npm update @sonicjs/core

# Check changelog
npm run sonicjs changelog

# Run migrations if needed
npm run db:migrate

# Done!
```

## Breaking Changes Management

### Migration Scripts

```typescript
// @sonicjs/core/migrations/upgrade-scripts/
export const v1_to_v2 = {
  name: 'Upgrade from v1.x to v2.0',

  async up(project: Project) {
    // Rename old APIs
    project.replaceImports(
      'oldFunction',
      'newFunction'
    )

    // Update configs
    project.updateConfig({
      oldKey: 'newKey'
    })

    // Run code mods
    project.applyCodemod('v2-migration')
  },

  instructions: `
    # Manual Steps
    1. Update collection configs to use new field types
    2. Review deprecated middleware usage
    3. Test all custom plugins
  `
}
```

### CLI Migration Tool

```bash
npx @sonicjs/migrate v1 v2
# Analyzes project
# Shows breaking changes
# Applies automatic fixes
# Lists manual steps
```

## Benefits Analysis

### For Core Developers

✅ Faster iteration on core features
✅ Better testing of core functionality
✅ Cleaner separation of concerns
✅ Easier to maintain
✅ Can version and release independently

### For Users

✅ **Easy upgrades**: `npm update @sonicjs/core`
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
// @sonicjs/core/tests/
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
├── guides/
│   ├── creating-collections.md
│   ├── building-plugins.md
│   └── customizing-admin.md
└── migration/
    ├── v1-to-v2.md
    └── upgrade-guide.md
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

### Phase 4: v1.0 Release

- Stable release to npm
- Migration guide published
- Announcement and marketing
- Support channels established

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

- ✅ Upgrade time < 15 minutes
- ✅ Breaking changes per major version < 10
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

- Clear migration path
- Demonstrate value
- Excellent documentation
- Community support

### Risk 2: Breaking Existing Projects

**Mitigation**:

- Maintain backward compatibility layer
- Provide automated migration tools
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

### Month 3: User Template

- Create starter template
- Build CLI tool
- Write documentation
- Alpha testing

### Month 4: Plugin Ecosystem

- Extract optional plugins
- Document plugin API
- Beta testing
- Gather feedback

### Month 5: Polish & Launch

- Final bug fixes
- Complete documentation
- Migration guides
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
