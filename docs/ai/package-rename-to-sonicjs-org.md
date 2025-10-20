# Package Rename: @sonicjs-cms → @sonicjs

**Date**: October 20, 2024
**Status**: ✅ Complete

## Summary

Renamed all package references from `@sonicjs-cms` to `@sonicjs` organization throughout the codebase.

## Rationale

Using the `@sonicjs` npm organization name for consistency and branding.

## Changes Made

### Package Names

| Old Name | New Name |
|----------|----------|
| `@sonicjs-cms/core` | `@sonicjs-cms/core` |

### Files Updated

#### Core Package (packages/core/)
- ✅ `package.json` - Changed package name
- ✅ `README.md` - Updated all references (installation, imports, examples)
- ✅ `CHANGELOG.md` - Updated package name throughout

#### Create-App Package (packages/create-app/)
- ✅ `src/cli.js` - Updated dependency injection
- ✅ `test-cli.js` - Updated test assertions
- ✅ `README.md` - Updated all references

#### Templates (templates/starter/)
- ✅ `package.json` - Updated core dependency
- ✅ `src/index.ts` - Updated import statements
- ✅ `src/collections/blog-posts.collection.ts` - Updated type imports
- ✅ `README.md` - Updated installation instructions
- ✅ `wrangler.toml` - Updated migrations directory path

#### Documentation (docs/ai/)
- ✅ `publishing-guide.md`
- ✅ `phase-3-greenfield-template.md`
- ✅ `phase-4-testing-results.md`
- ✅ `phase-5-publishing-prep-complete.md`
- ✅ `phase-6-create-app-cli-complete.md`
- ✅ `npm-migration-complete.md`

## Verification

### Tests Passed ✅

```bash
cd packages/create-app
npm test
```

**Result**: All checks passed
- ✓ CLI creates projects with `@sonicjs-cms/core` dependency
- ✓ package.json correctly references `@sonicjs-cms/core`
- ✓ Test assertions updated and passing

### Manual Verification ✅

```bash
# Generated project has correct dependency
cat verify-test/package.json | grep "@sonicjs"
# Output: "@sonicjs-cms/core": "^2.0.0-alpha.1"
```

## Publishing Impact

### Before Publishing

The following files will be included in npm packages:

#### @sonicjs-cms/core package:
- `package.json` - Contains `"name": "@sonicjs-cms/core"`
- `README.md` - All examples use `@sonicjs-cms/core`
- `CHANGELOG.md` - All references use `@sonicjs-cms/core`

#### create-sonicjs-app package:
- Generated projects will have `@sonicjs-cms/core` dependency
- All documentation references `@sonicjs-cms/core`

### Publishing Commands (Updated)

```bash
# Core package
cd packages/core
npm publish --tag alpha --access public

# Verify
npm view @sonicjs-cms/core@alpha

# Create-app package
cd packages/create-app
mkdir -p templates
cp -r ../../templates/starter templates/
npm publish --tag alpha --access public

# Verify
npm view create-sonicjs-app@alpha
```

### Installation (Updated)

```bash
# Install core package
npm install @sonicjs-cms/core@alpha

# Use CLI
npx create-sonicjs-app@alpha my-app
```

## Import Statements (Updated)

### Before:
```typescript
import { createSonicJSApp } from '@sonicjs-cms/core'
import type { CollectionConfig } from '@sonicjs-cms/core'
```

### After:
```typescript
import { createSonicJSApp } from '@sonicjs-cms/core'
import type { CollectionConfig } from '@sonicjs-cms/core'
```

## NPM Organization

### Requirements

To publish to `@sonicjs`:
1. Must have access to `@sonicjs` npm organization
2. If organization doesn't exist, create it at: https://www.npmjs.com/org/create
3. Add collaborators as needed

### Scope Availability

Check if scope is available:
```bash
npm view @sonicjs-cms/core
# If not found, scope is available
```

## Migration Notes

### No User Impact

Since this is the first publication (alpha.1), there are no existing users to migrate. The package has never been published under `@sonicjs-cms`, so this rename has no breaking changes.

### Future Considerations

If we ever need to reserve the `@sonicjs-cms` scope for other purposes, we can publish a deprecation package:

```json
{
  "name": "@sonicjs-cms/core",
  "version": "0.0.1",
  "description": "DEPRECATED: Use @sonicjs-cms/core instead",
  "deprecated": "This package has been renamed to @sonicjs-cms/core"
}
```

## Checklist

- ✅ Core package renamed
- ✅ CLI updated to use new package name
- ✅ Templates updated
- ✅ Documentation updated
- ✅ Tests passing
- ✅ Publishing commands updated
- ✅ No breaking changes (first release)

## Status

**Ready for Publication**: Both packages are now ready to publish under the `@sonicjs` organization.

---

**Next Steps**:
1. Ensure access to `@sonicjs` npm organization
2. Copy templates to create-app package
3. Publish `@sonicjs-cms/core`
4. Publish `create-sonicjs-app`
5. Test published packages
