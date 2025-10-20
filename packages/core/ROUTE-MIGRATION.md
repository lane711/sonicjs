# Route Migration Guide

This document tracks the gradual migration of routes from the SonicJS monolith to the `@sonicjs-cms/core` package.

## Migration Strategy

Routes are being migrated incrementally, one-by-one, with the following approach:

1. **Select a route** - Choose the simplest route with fewest dependencies
2. **Create dependencies** - Build any missing services/utilities needed by the route
3. **Refactor the route** - Remove monolith-specific dependencies
4. **Test locally** - Use `npm link` to test without publishing
5. **Verify** - Ensure route works correctly in a test application
6. **Document** - Record the migration for future reference

## Local Testing Setup

The core package is set up for local testing using npm link:

```bash
# In packages/core
npm run build
npm link

# In test project
npm link @sonicjs-cms/core

# After making changes to core
cd packages/core
npm run build
# Changes are immediately available in linked projects!
```

See `/templates/starter/SETUP-TESTING.md` for complete testing workflow.

## Migrated Routes

### ✅ API Content CRUD (`/api/content`)

**Status**: Migrated
**File**: `packages/core/src/routes/api-content-crud.ts`
**Mounted at**: `/api/content`

**Endpoints**:
- `GET /api/content/:id` - Get content by ID
- `POST /api/content` - Create new content (requires auth)
- `PUT /api/content/:id` - Update content (requires auth)
- `DELETE /api/content/:id` - Delete content (requires auth)

**Dependencies Created**:
- `CacheService` - Simple in-memory caching service
- `CACHE_CONFIGS` - Cache configuration presets

**Changes from Monolith**:
- Updated imports to use `@sonicjs-cms/core` types
- Replaced monolith cache plugin with core `CacheService`
- Removed references to external plugin system

**Testing**:
```bash
# Get content by ID
curl http://localhost:8787/api/content/some-id

# Create content (requires auth token)
curl -X POST http://localhost:8787/api/content \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -d '{"collectionId":"blog","title":"Test Post","data":{}}'
```

## Routes To Migrate (Priority Order)

### High Priority
1. **Auth Routes** (`/auth`) - Login, register, logout, password reset
   - Dependencies: Auth templates, validation service
   - Complexity: High (many dependencies)
   - Impact: Critical for basic CMS functionality

2. **Admin Dashboard** (`/admin`) - Main admin landing page
   - Dependencies: Dashboard templates, stats queries
   - Complexity: Medium
   - Impact: High (entry point for admin)

3. **Content Management** (`/admin/content`) - CRUD interface for content
   - Dependencies: Content templates, form builders
   - Complexity: High
   - Impact: Critical for CMS

### Medium Priority
4. **User Management** (`/admin/users`) - User CRUD operations
5. **Media Library** (`/admin/media`) - File upload and management
6. **API Routes** (`/api`) - Public API endpoints
7. **Plugin Management** (`/admin/plugins`) - Plugin configuration

### Low Priority
8. **Public Content Routes** (`/content`) - Frontend content delivery
9. **Public Media Routes** (`/media`) - Media file serving

## Dependencies Tracking

### Services Created
- ✅ `CacheService` - Basic caching (memory-based)
- ⏳ `AuthValidationService` - Auth form validation
- ⏳ `EmailService` - Email sending
- ⏳ `MediaStorageService` - R2 file operations

### Templates Needed
- ⏳ Login/Register pages
- ⏳ Admin dashboard
- ⏳ Content forms
- ⏳ Media library UI
- ⏳ User management UI

### Middleware Available
- ✅ `requireAuth()` - Authentication check
- ✅ `requireRole()` - Role-based access
- ✅ `loggingMiddleware` - Request logging
- ✅ `securityHeaders` - Security headers

## Migration Patterns

### Pattern 1: Simple API Routes
For routes with minimal dependencies (like content CRUD):
1. Copy route file to `packages/core/src/routes/`
2. Update imports to use core types
3. Replace external dependencies with core services
4. Export from `routes/index.ts`
5. Mount in `app.ts`

### Pattern 2: Template-Heavy Routes
For routes that render HTML pages:
1. Migrate template files first to `templates/pages/`
2. Create any missing template utilities
3. Migrate route with template dependencies
4. Test rendered output

### Pattern 3: Complex Admin Routes
For routes with many dependencies:
1. Identify all dependencies (templates, services, plugins)
2. Create stub versions of dependencies
3. Migrate route incrementally
4. Enhance stubs as needed
5. Test thoroughly

## Testing Checklist

For each migrated route:

- [ ] Route builds without errors
- [ ] Route mounts correctly in app
- [ ] GET endpoints return expected data
- [ ] POST endpoints create data correctly
- [ ] Authentication works where required
- [ ] Error handling returns proper status codes
- [ ] Cache invalidation works (if applicable)
- [ ] TypeScript types are correct
- [ ] No console errors in development
- [ ] Manual testing passes

## Known Issues

### Circular Import
Some monolith routes import from `@sonicjs-cms/core` while being part of it. Solution: Use relative imports for internal dependencies.

### Cache Service Limitations
Current `CacheService` is memory-based. For production:
- Consider KV-based implementation
- Add TTL management
- Implement cache warming

### Template System
Templates need to be migrated separately from routes. Consider:
- Creating a template migration guide
- Building component library
- Standardizing template patterns

## Next Steps

1. ✅ Set up npm link for local testing
2. ✅ Migrate first route (API Content CRUD)
3. ⏳ Test migrated route in linked project
4. ⏳ Migrate auth routes next
5. ⏳ Create template migration process
6. ⏳ Document patterns for complex routes
7. ⏳ Continue incremental migration

## Questions / Decisions Needed

1. **Template Strategy**: Should templates live in core or be user-provided?
   - Current: Core package includes base templates
   - Alternative: Make templates fully customizable

2. **Cache Backend**: Memory vs KV vs hybrid?
   - Current: Memory-based (simple, works everywhere)
   - Future: KV-backed for persistence

3. **Plugin System**: How to handle plugin routes?
   - Option A: Plugins can register their own routes
   - Option B: Core provides plugin route mounting utilities

## Resources

- [npm link documentation](https://docs.npmjs.com/cli/v8/commands/npm-link)
- [Local Testing Guide](/templates/starter/SETUP-TESTING.md)
- [SonicJS Documentation](https://docs.sonicjs.com)
