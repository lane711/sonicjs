# SonicJS Core Package - NPM Update Strategy

## Overview

This document outlines the strategy for enabling seamless npm-based updates for SonicJS core, allowing developers to update their cloned projects without manual git merges or conflict resolution.

## Current State vs Future State

### Current State (Git-Based Monolith)

Developers must clone entire repository and manually manage core updates.

**Pain Points:**
- ❌ Core updates mixed with custom code
- ❌ Difficult to identify what changed in core
- ❌ No version control of core functionality
- ❌ Can't easily rollback core updates

### Future Experience (NPM-Based, Greenfield)

```bash
# Future workflow - clean and simple
npm update @sonicjs-cms/core

# Check what changed
npm show @sonicjs-cms/core changelog

# Run any new migrations
npm run db:migrate

# Test your app
npm run test

# Deploy
npm run deploy

# Done! ✅
```

**Benefits:**
- ✅ Core updates via standard npm workflow
- ✅ Clear separation: core vs custom code
- ✅ Semantic versioning for predictable updates
- ✅ Easy rollback: `npm install @sonicjs-cms/core@1.2.3`
- ✅ Automated migration scripts
- ✅ Test compatibility before deploying

## Package Architecture

### Core Package: `@sonicjs-cms/core`

```
@sonicjs-cms/core/
├── package.json                 # Published to npm
├── dist/                        # Compiled for distribution
│   ├── index.js                # Main entry point
│   ├── index.d.ts              # TypeScript definitions
│   ├── services/               # Core services
│   ├── routes/                 # Core routes
│   ├── middleware/             # Core middleware
│   └── templates/              # Core templates
├── migrations/                  # Core database migrations
│   ├── 001_initial_schema.sql
│   ├── 002_add_collections.sql
│   └── ...
└── README.md
```

### User Project Structure

```
my-sonicjs-project/
├── package.json                 # Depends on @sonicjs-cms/core
│   {
│     "dependencies": {
│       "@sonicjs-cms/core": "^1.2.3"
│     }
│   }
├── src/
│   ├── collections/            # USER: Custom collections
│   │   ├── blog-posts.collection.ts
│   │   └── products.collection.ts
│   ├── plugins/                # USER: Custom plugins
│   │   └── my-custom-plugin/
│   ├── routes/                 # USER: Custom routes
│   │   └── custom-api.ts
│   ├── templates/              # USER: Template overrides
│   │   └── pages/
│   │       └── custom-admin-dashboard.template.ts
│   └── index.ts                # USER: App entry point
├── migrations/                  # USER: Custom migrations
│   └── 100_add_custom_fields.sql
├── wrangler.toml               # USER: Cloudflare config
└── sonicjs.config.ts           # USER: SonicJS configuration
```

## Version Management Strategy

### Semantic Versioning

Following strict semantic versioning (MAJOR.MINOR.PATCH):

```
@sonicjs-cms/core@1.2.3
              │ │ │
              │ │ └─ PATCH: Bug fixes (safe to update)
              │ └─── MINOR: New features (backward compatible)
              └───── MAJOR: Breaking changes (requires migration)
```

### Version Examples

**Patch Release (1.2.3 → 1.2.4)**
- Bug fixes only
- No API changes
- No migration required
- Auto-update safe

```bash
npm update @sonicjs-cms/core
# No migration needed, just restart
npm run dev
```

**Minor Release (1.2.4 → 1.3.0)**
- New features added
- Backward compatible
- Optional new migrations
- Safe to update

```bash
npm update @sonicjs-cms/core
npm run db:migrate    # Apply new optional features
npm run dev
```

**Major Release (1.3.0 → 2.0.0)**
- Breaking changes
- API changes
- Required migrations
- Review changelog first

```bash
# Read changelog first!
npm info @sonicjs-cms/core@2.0.0

# Update when ready
npm install @sonicjs-cms/core@2.0.0
npm run db:migrate
npm run test
npm run dev
```

## Update Workflows

### 1. Check for Updates

```bash
# Check for available updates
npm outdated

# Output:
# Package          Current  Wanted  Latest  Location
# @sonicjs-cms/core    1.2.3    1.2.5   2.0.0   my-project

# View changelog for specific version
npm show @sonicjs-cms/core@1.2.5 changelog
```

### 2. Safe Update (Patch/Minor)

```bash
# Update to latest compatible version
npm update @sonicjs-cms/core

# This updates within your semver range:
# ^1.2.3 → updates to latest 1.x.x
# ~1.2.3 → updates to latest 1.2.x

# Run migrations (if any)
npm run db:migrate

# Run tests
npm run test

# Restart dev server
npm run dev
```

### 3. Major Version Update

```bash
# 1. Backup your database
wrangler d1 backup DB

# 2. Review breaking changes
npm show @sonicjs-cms/core@2.0.0

# 3. Install new major version
npm install @sonicjs-cms/core@2.0.0

# 4. Run database migrations
npm run db:migrate

# 5. Test thoroughly
npm run test
npm run test:e2e

# 6. Test in dev mode
npm run dev

# 7. Deploy to preview
npm run deploy:preview

# 8. Test preview environment

# 9. Deploy to production
npm run deploy:production
```

### 4. Rollback Strategy

```bash
# If something breaks after update, rollback:

# 1. Reinstall previous version
npm install @sonicjs-cms/core@1.2.3

# 2. Restore database (if migrations ran)
wrangler d1 restore DB --backup=<backup-id>

# 3. Restart
npm run dev

# Everything back to working state ✅
```

## Migration Management

### Core Migrations vs User Migrations

**Separation Strategy:**

```sql
-- Core migrations: 001-099
-- migrations/001_initial_schema.sql (from @sonicjs-cms/core)
-- migrations/002_add_collections.sql (from @sonicjs-cms/core)

-- User migrations: 100+
-- migrations/100_add_custom_fields.sql (in user project)
-- migrations/101_custom_table.sql (in user project)
```

**Migration Tracking:**

```sql
CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY,
  filename TEXT NOT NULL,
  applied_at INTEGER NOT NULL,
  source TEXT NOT NULL,  -- 'core' or 'user'
  version TEXT           -- Core version when applied
);
```

### Automated Migration Runner

```typescript
// From @sonicjs-cms/core
export class MigrationManager {
  async runAllMigrations() {
    // 1. Run core migrations first
    const coreMigrations = await this.getCoreMigrations()
    for (const migration of coreMigrations) {
      await this.runMigration(migration, 'core')
    }

    // 2. Run user migrations
    const userMigrations = await this.getUserMigrations()
    for (const migration of userMigrations) {
      await this.runMigration(migration, 'user')
    }
  }

  async runMigration(migration: Migration, source: 'core' | 'user') {
    const applied = await this.isMigrationApplied(migration.id)
    if (applied) return

    console.log(`Running ${source} migration: ${migration.filename}`)
    await this.db.exec(migration.sql)

    await this.markApplied(migration.id, migration.filename, source)
  }
}
```

## Breaking Changes Management

### Deprecation Policy

1. **Announce deprecation** (in version X.Y.0)
   ```typescript
   // @deprecated Will be removed in v2.0.0 - Use newFunction() instead
   export function oldFunction() {
     console.warn('oldFunction is deprecated, use newFunction()')
     return newFunction()
   }
   ```

2. **Maintain for 2 minor versions** (X.Y.0 → X.Y+2.0)
   - Give developers time to migrate
   - Show warnings in console
   - Document migration path

3. **Remove in next major** (X.Y.0 → X+1.0.0)
   - Breaking change
   - Major version bump
   - Migration guide provided

### Breaking Change Documentation

```markdown
# Migration Guide: v1.x to v2.0.0

## Breaking Changes

### 1. Collection Field Type Changes

**What changed:**
`string` field type renamed to `text` for clarity.

**Before (v1.x):**
```typescript
{
  fields: {
    name: { type: 'string' }
  }
}
```

**After (v2.0):**
```typescript
{
  fields: {
    name: { type: 'text' }
  }
}
```

**Migration:**
```bash
npx @sonicjs/migrate --fix=field-types
# Automatically updates all collection configs
```

### 2. Auth Middleware API Change

**What changed:**
`requireAuth()` now returns user object directly.

**Before (v1.x):**
```typescript
const user = c.get('user')
```

**After (v2.0):**
```typescript
const user = await requireAuth(c)
```

**Migration:**
Manual code change required. Use search/replace:
```bash
# Find instances
grep -r "c.get('user')" src/

# Update to new API
```
```

## Breaking Changes Communication

### Changelog Format

Breaking changes are clearly documented in changelog with upgrade notes:

```markdown
# Changelog

## [2.0.0] - 2025-03-01

### 🚨 Breaking Changes

- **Collections**: Field type `string` renamed to `text`
  - Update your collection configs manually
  - Example: Change `type: 'string'` to `type: 'text'`

- **Auth**: `requireAuth()` signature changed
  - See documentation for new usage

### Upgrade Instructions

1. Update to v2.0.0: `npm install @sonicjs-cms/core@2.0.0`
2. Run database migrations: `npm run db:migrate`
3. Review breaking changes above and update your code
4. Test your application thoroughly
```

## Dependency Management

### Peer Dependencies

```json
// @sonicjs-cms/core/package.json
{
  "name": "@sonicjs-cms/core",
  "version": "2.0.0-alpha.1",
  "peerDependencies": {
    "hono": "^4.0.0",
    "drizzle-orm": "^0.44.0",
    "zod": "^3.0.0"
  },
  "peerDependenciesMeta": {
    "hono": {
      "optional": false
    }
  }
}
```

All plugins are included in the core package, so no separate plugin versioning is needed.

## Testing Strategy

### Pre-Release Testing

```bash
# Install pre-release version
npm install @sonicjs-cms/core@2.0.0-beta.1

# Run full test suite
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run type-check     # TypeScript validation

# Test in development
npm run dev

# Test in preview environment
npm run deploy:preview
```

### Automated Compatibility Tests

```typescript
// tests/compatibility.test.ts

describe('Core Version Compatibility', () => {
  it('should work with core v1.2.x', async () => {
    // Test your custom code against specific core version
  })

  it('should migrate collections correctly', async () => {
    // Test migration scripts
  })

  it('should preserve user customizations', async () => {
    // Test that updates don't break custom code
  })
})
```

## Distribution Strategy

### NPM Publishing

```bash
# Build for distribution
cd packages/core
npm run build

# Test the build
npm run test:dist

# Publish to npm
npm publish --access public

# Tag specific versions
git tag v1.2.3
git push --tags
```

### Build Configuration

```typescript
// @sonicjs-cms/core/tsup.config.ts

import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,           // Generate .d.ts files
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    'hono',
    'drizzle-orm',
    '@cloudflare/workers-types'
  ]
})
```

## Documentation Strategy

### Changelog Format

```markdown
# Changelog

## [2.0.0] - 2025-03-01

### 🚨 Breaking Changes

- **Collections**: Field type `string` renamed to `text`
  - Migration: Run `npx @sonicjs/migrate --fix=field-types`
  - See: [Migration Guide](./migration/v2.md)

- **Auth**: `requireAuth()` now returns user directly
  - Migration: Update `c.get('user')` to `await requireAuth(c)`
  - See: [Auth Migration](./migration/v2-auth.md)

### ✨ New Features

- **Collections**: Added `rich_text` field type
- **API**: New bulk operations endpoint
- **Plugins**: Hot reload in development mode

### 🐛 Bug Fixes

- Fixed memory leak in cache service
- Fixed race condition in migration runner
- Fixed validation error messages

### 📚 Documentation

- Added migration guide for v2.0
- Updated API reference
- Added code examples for new features

### ⚠️ Deprecations

- `oldFunction()` is deprecated, use `newFunction()`
  - Will be removed in v3.0.0

## [1.2.3] - 2025-02-15

### 🐛 Bug Fixes

- Fixed authentication token expiration
- Fixed media upload error handling
```

### Update Notification System

```typescript
// Built into @sonicjs-cms/core

export class UpdateChecker {
  async checkForUpdates(): Promise<UpdateInfo | null> {
    const currentVersion = require('../package.json').version
    const response = await fetch('https://registry.npmjs.org/@sonicjs-cms/core/latest')
    const data = await response.json()
    const latestVersion = data.version

    if (semver.gt(latestVersion, currentVersion)) {
      return {
        current: currentVersion,
        latest: latestVersion,
        type: semver.diff(latestVersion, currentVersion), // 'major' | 'minor' | 'patch'
        changelog: data.changelog
      }
    }

    return null
  }
}

// Show notification in admin UI
app.get('/admin', async (c) => {
  const updateInfo = await updateChecker.checkForUpdates()

  if (updateInfo) {
    // Show banner: "New version available: 1.2.5"
  }
})
```

## CLI Tool: `sonicjs` Command

### Installation

```bash
# Installed with @sonicjs-cms/core
npm install @sonicjs-cms/core

# Available commands
npx sonicjs --help
```

### Commands

```bash
# Check for updates
npx sonicjs check-updates

# Output:
# Current version: 1.2.3
# Latest version:  1.2.5
# Update type:     minor (safe)
#
# Changelog:
# - Fixed authentication bug
# - Added new field types
#
# To update: npm update @sonicjs-cms/core

# Update with migration
npx sonicjs update
# Interactive prompts:
# - Backup database? (Y/n)
# - Run migrations? (Y/n)
# - Run tests? (Y/n)

# Migrate between major versions
npx sonicjs migrate --from=1.x --to=2.0.0

# Show version info
npx sonicjs version
# Output:
# Core:     1.2.3
# Node:     20.0.0
# Wrangler: 4.0.0

# Validate project structure
npx sonicjs validate
# Output:
# ✓ Core package installed
# ✓ TypeScript configured
# ✓ Migrations folder exists
# ✓ Collections configured
# ⚠ No custom plugins found
```

## Timeline & Rollout

### Phase 1: Alpha (Month 1)
- Extract core to separate package
- Set up build system
- Internal testing only
- Tag: `@sonicjs-cms/core@1.0.0-alpha.1`

### Phase 2: Beta (Month 2-3)
- Public beta release
- Early adopter testing
- Gather feedback
- Tag: `@sonicjs-cms/core@1.0.0-beta.1`

### Phase 3: Release Candidate (Month 4)
- Feature freeze
- Bug fixes only
- Documentation finalized
- Tag: `@sonicjs-cms/core@1.0.0-rc.1`

### Phase 4: Stable Release (Month 5)
- Official v1.0.0 release
- Migration guide published
- Announcement and promotion
- Tag: `@sonicjs-cms/core@1.0.0`

### Phase 5: Ecosystem Growth (Month 6+)
- Plugin packages published
- Regular updates (monthly minors)
- Community contributions
- Long-term support

## Success Metrics

### Technical Metrics
- ✅ Package size < 500KB
- ✅ Build time < 30s
- ✅ Zero peer dependency conflicts
- ✅ 100% TypeScript coverage
- ✅ All tests passing

### User Experience Metrics
- ✅ Update time < 5 minutes (patch/minor)
- ✅ Update time < 30 minutes (major)
- ✅ Zero breaking changes per minor version
- ✅ < 5 breaking changes per major version
- ✅ 100% automated migration rate

### Adoption Metrics
- ✅ 1000+ weekly npm downloads
- ✅ 100+ projects using npm package
- ✅ 90%+ upgrade rate (within 30 days)
- ✅ < 1% rollback rate

## Risk Mitigation

### Risk 1: Breaking Existing Projects

**Mitigation:**
- Maintain v0.x as legacy branch
- Provide detailed migration guide
- Offer migration assistance
- Beta testing period

### Risk 2: Adoption Resistance

**Mitigation:**
- Clear benefits documentation
- Video tutorial for migration
- Community support channels
- Success stories

### Risk 3: Plugin Incompatibility

**Mitigation:**
- Version compatibility matrix
- Automated compatibility checks
- Plugin migration guides
- Grace period for plugin updates

## Support & Resources

### Documentation
- **Migration Guides**: Step-by-step instructions
- **API Reference**: Auto-generated from code
- **Changelog**: Detailed version history
- **Examples**: Real-world usage examples

### Community Support
- **Discord**: Real-time help
- **GitHub Issues**: Bug reports and feature requests
- **Stack Overflow**: Q&A with `sonicjs` tag
- **Twitter**: Updates and announcements

### Professional Support
- **Migration Assistance**: Help updating existing projects
- **Custom Development**: Feature requests and customization
- **Training**: Team training sessions
- **Consulting**: Architecture and best practices

## Conclusion

The npm package strategy will transform SonicJS from a "clone and customize" framework into a true "install and extend" platform. Developers will benefit from:

1. **Faster updates**: Minutes instead of hours
2. **Lower risk**: Rollback capability and tested migrations
3. **Clear separation**: Core vs custom code
4. **Better DX**: Standard npm workflow
5. **Growing ecosystem**: Installable plugins

This is a significant investment that will pay dividends in:
- Developer satisfaction
- Project maintainability
- Ecosystem growth
- Enterprise adoption

---

**Document Status**: Draft - Ready for Review
**Last Updated**: 2025-01-17
**Next Review**: After Phase 1 completion
**Owner**: SonicJS Core Team
