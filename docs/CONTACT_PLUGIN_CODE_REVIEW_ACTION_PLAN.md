# Contact Form Plugin - Code Review Action Plan

**Date**: January 21, 2026  
**PR**: #445 - Feature/contact plugin v1  
**Reviewer**: lane711 (Lead)  
**Review Date**: January 15, 2026

---

## 📋 Code Review Summary

The lead reviewed PR #445 and provided detailed feedback with critical issues that must be fixed before merge.

**Overall Assessment**: "The architecture follows SonicJS patterns well and the Turnstile integration is solid."

---

## 🚨 Critical Issues (MUST FIX)

### 1. Debug Route Exposed ⚠️ **SECURITY RISK**
**File**: `my-sonicjs-app/src/index.ts`  
**Lines**: 65-72  
**Issue**: `/debug-db` route exposes database schema information  
**Action**: Remove the entire debug route before merge  
**Priority**: CRITICAL - Security vulnerability

```typescript
// REMOVE THIS ENTIRE SECTION:
app.get('/debug-db', async (c) => {
  // ... database schema exposure code ...
})
```

---

### 2. Query Mismatch - Messages Won't Be Retrieved 🔴
**File**: `services/contact.ts`  
**Lines**: 179-183 (getMessages), compared with saveMessage()  
**Issue**: 
- `saveMessage()` stores with dynamically looked up `collection.id` (e.g., `col-contact_messages-xxxxx`)
- `getMessages()` queries with hardcoded `WHERE collection_id = 'contact_messages'`
- **Result**: Messages saved will NEVER be retrieved!

**Action**: Fix `getMessages()` to use the same dynamic collection ID lookup

```typescript
// CURRENT (BROKEN):
const stmt = db.prepare(`
  SELECT * FROM content 
  WHERE collection_id = 'contact_messages'  // ❌ Hardcoded
  ORDER BY created_at DESC
`)

// FIX TO:
// Look up the actual collection ID first (same as saveMessage does)
const collection = await db.prepare(`
  SELECT id FROM collections WHERE name = 'contact_messages'
`).first()

const stmt = db.prepare(`
  SELECT * FROM content 
  WHERE collection_id = ?  // ✅ Use actual ID
  ORDER BY created_at DESC
`).bind(collection.id)
```

---

### 3. Production Config Committed 🔴
**File**: `my-sonicjs-app/wrangler.production.toml`  
**Issue**: Contains environment-specific settings, should not be in repo  
**Action**: **ALREADY FIXED** by lead in commit `78d76dda`  
**Status**: ✅ Lead has pushed a fix - we need to pull it

**Lead's note**: "I've pushed a commit to the main repo branch `feature/contact-plugin-v1` that removes `wrangler.production.toml` and updates `.gitignore`. You can cherry-pick it: `78d76dda`"

---

## ⚠️ High Priority Issues

### 4. Missing Email Validation
**File**: `routes/public.ts`  
**Lines**: 219-224  
**Issue**: Only checks if fields exist, no format validation  
**Action**: Add email format validation using regex

```typescript
// CURRENT:
if (!name || !email || !message) {
  return c.json({ error: 'All fields required' }, 400)
}

// ADD EMAIL FORMAT VALIDATION:
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(email)) {
  return c.json({ error: 'Invalid email format' }, 400)
}
```

---

### 5. Debug Logging in Production
**File**: `routes/public.ts`  
**Lines**: 50-52 (and others)  
**Issue**: Multiple `console.log` statements leak internal state to production logs  
**Action**: Remove or make conditional on environment

**Files to clean**:
- `routes/public.ts` - Lines 50-52
- `services/contact.ts` - Lines 60-78, 101-102

```typescript
// REMOVE:
console.log('Turnstile config:', turnstileConfig)
console.log('Contact settings:', contactSettings)
console.log('[getContactSettings] Found settings:', settings)

// OR MAKE CONDITIONAL:
if (c.env.ENVIRONMENT === 'development') {
  console.log('[Debug] Contact settings:', contactSettings)
}
```

---

## 📊 Medium Priority Issues

### 6. Loose Typing
**File**: `types.ts`  
**Lines**: 24, 28  
**Issue**: `showMap: boolean | number | string` is too permissive

**Action**: Tighten types or add validation

```typescript
// CURRENT:
export interface ContactFormSettings {
  showMap: boolean | number | string  // ❌ Too loose
  mapApiKey?: string
}

// BETTER:
export interface ContactFormSettings {
  showMap: boolean  // ✅ Single type
  mapApiKey?: string
}

// OR add runtime coercion helper:
function normalizeBoolean(value: unknown): boolean {
  return value === 1 || value === true || value === 'true' || value === 'on'
}
```

---

### 7. Coercion Duplication
**Issue**: `isEnabled` check (`=== 1 || === true || === 'true' || === 'on'`) repeated in 3+ files  
**Action**: Create a shared utility function

**Create**: `packages/core/src/utils/coercion.ts`
```typescript
export function toBoolean(value: unknown): boolean {
  return value === 1 || value === true || value === 'true' || value === 'on'
}
```

**Then use**:
```typescript
import { toBoolean } from '@sonicjs-cms/core/utils'

if (toBoolean(settings.showMap)) {
  // ...
}
```

---

### 8. Duplicate Migration Files
**Issue**: Both migration files exist with identical content:
- `my-sonicjs-app/migrations/030_contact_form_plugin.sql`
- `my-sonicjs-app/src/plugins/contact-form/migrations/001_contact_form_plugin.sql`

**Action**: Keep only the plugin-local one, remove the top-level migration

---

### 9. Admin User Lookup Fails Silently
**File**: `services/contact.ts`  
**Lines**: 134-142  
**Issue**: If no admin user exists, the query fails silently  
**Action**: Add error handling

```typescript
const adminUser = await db.prepare(`
  SELECT id FROM users 
  WHERE role = 'admin' AND is_active = 1 
  ORDER BY created_at LIMIT 1
`).first()

// ADD:
if (!adminUser) {
  throw new Error('No admin user found. Cannot save contact message.')
}
```

---

### 10. Manifest Path Mismatch
**File**: `manifest.json`  
**Line**: 102  
**Issue**: Shows `/admin/contact-form/settings` but actual route is `/admin/plugins/contact-form/settings`

**Action**: Fix the manifest

```json
{
  "adminMenu": {
    "label": "Settings",
    "path": "/admin/plugins/contact-form/settings"  // ✅ Correct path
  }
}
```

---

## 🧪 Test Coverage Issues

### Issue: Test File Location
**File**: `plugins/contact-form/test/contact.spec.ts`  
**Problem**: Uses Playwright syntax but located in unit test directory  
**Action**: Either:
- Convert to Vitest for unit testing, OR
- Move to `tests/e2e/` if it's an E2E test

### Missing Tests
- Service method unit tests
- Validation edge cases
- Error path coverage

---

## 🔐 Security Notes

**Good** ✅:
- Admin routes use `requireAuth()` middleware
- Turnstile verification validates server-side
- Input sanitization before storage

**Concerns** ⚠️:
- No rate limiting on `/api/contact` (spam vector)
- Debug route exposes schema (CRITICAL - must remove)

**Recommendation**: Consider adding rate limiting middleware for the contact endpoint

---

## ✅ Action Checklist

### Must Fix Before Merge (Critical)
- [ ] 1. Remove `/debug-db` route from `my-sonicjs-app/src/index.ts`
- [ ] 2. Fix `getMessages()` query to use dynamic collection ID
- [ ] 3. Pull lead's commit `78d76dda` (removes wrangler.production.toml)

### Should Fix Before Merge (High Priority)
- [ ] 4. Add email format validation in `routes/public.ts`
- [ ] 5. Remove debug `console.log` statements from:
  - [ ] `routes/public.ts`
  - [ ] `services/contact.ts`

### Recommended Improvements (Medium Priority)
- [ ] 6. Tighten types in `types.ts` (showMap)
- [ ] 7. Create shared `toBoolean()` utility
- [ ] 8. Remove duplicate migration file
- [ ] 9. Add error handling for admin user lookup
- [ ] 10. Fix manifest path in `manifest.json`

### Testing
- [ ] Run E2E tests after fixes
- [ ] Verify messages can be retrieved after saving
- [ ] Test email validation with invalid formats
- [ ] Ensure no debug output in production mode

---

## 📝 Implementation Order

### Phase 1: Critical Fixes (Do First)
1. Pull lead's commit: `git fetch upstream && git cherry-pick 78d76dda`
2. Remove debug route
3. Fix getMessages() query

### Phase 2: High Priority
4. Add email validation
5. Remove console.log statements

### Phase 3: Medium Priority
6-10. Address remaining issues

### Phase 4: Testing
- Run full E2E suite
- Manual testing of contact form
- Verify admin can retrieve messages

---

## 🔗 References

**PR**: https://github.com/lane711/sonicjs/pull/445  
**Review Comment**: https://github.com/lane711/sonicjs/pull/445#issuecomment-3756908781  
**Lead's Fix Commit**: `78d76dda` (removes wrangler.production.toml)

---

## 📊 Estimated Time

- **Critical fixes**: 1-2 hours
- **High priority**: 1 hour
- **Medium priority**: 2-3 hours
- **Testing**: 1 hour

**Total**: ~5-7 hours of work

---

## 🎯 Next Steps

1. Review this action plan
2. Check out the `feature/contact-plugin-v1` branch
3. Pull the lead's fix commit
4. Start with Phase 1 (Critical Fixes)
5. Test after each phase
6. Update PR when all fixes are complete

---

*Document created: January 21, 2026*  
*Based on lead's code review from January 15, 2026*
