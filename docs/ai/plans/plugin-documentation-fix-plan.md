# Plugin Documentation Fix Implementation Plan

## Overview

Fix documentation issues reported in GitHub issue #408 comment #3765843242. Export `PluginBuilder` class and correct all package name references from `@sonicjs/core` to `@sonicjs-cms/core`.

## Requirements

- [x] Analyze and confirm reported issues
- [ ] Export PluginBuilder from @sonicjs-cms/core package
- [ ] Fix all incorrect package name references
- [ ] Add @beta annotation to PluginBuilder
- [ ] Export PluginHelpers for migration/schema utilities
- [ ] Document PLUGIN_REGISTRY configuration
- [ ] Ensure both plain object and builder patterns are documented
- [ ] Run all tests to verify no regressions

## Technical Approach

### Architecture

The plugin SDK consists of three classes that should be exported:

1. **PluginBuilder** - Fluent API for building plugins
2. **PluginHelpers** - Utilities for migrations, schemas, model APIs
3. **PluginTemplates** - Pre-built templates for common plugin types

These are currently defined in `packages/core/src/plugins/sdk/plugin-builder.ts` but not exported from the main package entry point.

### File Changes

| File | Action | Description |
|------|--------|-------------|
| `packages/core/src/index.ts` | Modify | Uncomment PluginBuilder export, add PluginHelpers |
| `packages/core/src/plugins/sdk/plugin-builder.ts` | Modify | Add @beta JSDoc annotations |
| `packages/core/src/plugins/sdk/index.ts` | Modify | Ensure proper exports |
| `www/src/app/plugins/development/page.mdx` | Modify | Fix `@sonicjs/core` → `@sonicjs-cms/core` |
| `www/src/app/coding-standards/page.mdx` | Modify | Fix `@sonicjs/core` → `@sonicjs-cms/core` |
| `README.md` | Modify | Fix `@sonicjs/core` → `@sonicjs-cms/core` |
| `CODING_STANDARDS.md` | Modify | Fix `@sonicjs/core` → `@sonicjs-cms/core` |
| `packages/core/src/app.ts` | Modify | Fix JSDoc example import |
| `docs/ai/plans/user-profile-json-field-plan.md` | Modify | Fix import references |

### Export Structure

After changes, users should be able to:

```typescript
import {
  PluginBuilder,      // Fluent plugin builder
  PluginHelpers,      // Migration/schema utilities
  PluginTemplates,    // Pre-built templates
  Plugin,             // Type interface
  PluginContext,      // Context type
  HOOKS               // Standard hook names
} from '@sonicjs-cms/core'
```

## Implementation Steps

### Step 1: Update Plugin SDK Exports

1. Add @beta JSDoc to PluginBuilder class
2. Ensure PluginHelpers and PluginTemplates are exported from SDK index
3. Verify types are properly exported

### Step 2: Update Main Package Entry Point

1. Uncomment PluginBuilder export line
2. Add PluginHelpers export
3. Add PluginTemplates export (optional, may keep internal for now)

### Step 3: Fix Package Name in Documentation

Files to update:
- `www/src/app/plugins/development/page.mdx` (lines 139-140, 420)
- `www/src/app/coding-standards/page.mdx` (line 331)
- `README.md` (line 329)
- `CODING_STANDARDS.md` (line 282)
- `packages/core/src/app.ts` (line 112 JSDoc)
- `docs/ai/plans/user-profile-json-field-plan.md` (lines 80, 169)

### Step 4: Add PLUGIN_REGISTRY Documentation

Add a section to the plugin development guide explaining:
- What PLUGIN_REGISTRY is
- When this message appears
- How to configure it (or that it's optional for most users)

### Step 5: Verify Both Patterns Documented

Ensure www docs show:
- Quick start with plain Plugin object
- Full guide with PluginBuilder

### Step 6: Build and Test

1. Run `npm run build` in packages/core
2. Run `npm test` for unit tests
3. Run `npm run e2e` for e2e tests
4. Verify no TypeScript errors

## Testing Strategy

### Unit Tests

No new unit tests needed - PluginBuilder already has internal usage (EasyMDE plugin).

Verification:
- [ ] `npm test` passes
- [ ] `npm run type-check` passes
- [ ] Build completes without errors

### Manual Verification

- [ ] Import PluginBuilder from @sonicjs-cms/core works
- [ ] Import PluginHelpers from @sonicjs-cms/core works
- [ ] IDE autocomplete shows builder methods
- [ ] Example code from docs compiles

## Risks & Considerations

| Risk | Mitigation |
|------|------------|
| API changes break users | @beta annotation sets expectations |
| PluginHelpers have stub implementations | Document which helpers are complete vs experimental |
| Breaking change for existing users | This is additive - plain objects still work |

## Questions for Review

- [x] Should PluginTemplates also be exported? → Keep internal for now, templates are experimental
- [x] Should we mark specific helpers as @experimental? → Yes, createModelAPI is a stub

## Approval

- [ ] Plan reviewed and approved by user
