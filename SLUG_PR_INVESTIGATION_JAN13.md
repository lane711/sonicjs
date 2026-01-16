# Slug PR #499 Test Failure Investigation

**Date:** January 13, 2026
**PR:** https://github.com/lane711/sonicjs/pull/499
**Branch:** `feature/slug-generation-clean`
**CI Run:** https://github.com/lane711/sonicjs/actions/runs/20926704336

## Executive Summary

The Slug PR has **2 critical issues** causing test failures on the lead's CI:

1. **404 Handler Broken** (Hard failure) - Admin setup middleware redirects ALL routes to registration when no admin exists, preventing 404s
2. **Admin User Not Persisting** (8 flaky tests) - Database state isn't maintained between tests in lead's CI environment

## Issue #1: 404 Routes Return 200 Instead of 404

### Root Cause

The `adminSetupMiddleware` (added in recent changes) intercepts ALL routes when no admin user exists and redirects to `/auth/register?setup=true`.

**File:** `packages/core/src/middleware/admin-setup.ts` (lines 43-46)

```typescript
// Check if admin exists (uses in-memory cache after first check)
const db = c.env.DB
const adminExists = await checkAdminUserExists(db)

if (!adminExists) {
  // Redirect to registration with setup flag
  return c.redirect('/auth/register?setup=true')  // ❌ Returns 302/307, not 404!
}
```

### What Happens

1. Test navigates to `/nonexistent-route`
2. `adminSetupMiddleware` runs (line 148 in app.ts)
3. Checks if admin exists → returns `false` in CI (fresh D1 database)
4. Returns `302 Redirect` to `/auth/register?setup=true`
5. Playwright follows redirect
6. `/auth/register?setup=true` returns `200 OK`
7. Test expects `404` but receives `200` ❌

### Why It Fails

The middleware has exemptions for:
- ✅ `/auth/*` routes (line 20)
- ✅ Static assets (line 25)
- ✅ `/health` endpoint (line 30)
- ✅ `/api/*` routes (line 35)

But `/nonexistent-route` doesn't match any exemption, so it gets redirected instead of returning 404.

### Solution

The middleware should skip the redirect for routes that should 404. Add exemption before the admin check:

```typescript
// Skip redirect for routes that should naturally 404
// Let the 404 handler deal with truly non-existent routes
if (!path.match(/^\/(admin|auth|api|health|files)/)) {
  return next()  // Let it fall through to 404 handler
}
```

OR better: Only redirect for `/admin/*` routes specifically:

```typescript
// Only redirect admin routes when no admin exists
if (!adminExists && path.startsWith('/admin')) {
  return c.redirect('/auth/register?setup=true')
}

return next()
```

---

## Issue #2: Admin User Not Persisting (8 Flaky Tests)

### Root Cause

All 8 flaky tests fail with the same error:

```
Expected pattern: /\/admin/
Received string: "https://sonicjs-pr-feature-slug-generation-clean.ldc0618847.workers.dev/auth/register?setup=true"
```

This means `loginAsAdmin()` is being redirected to registration because the admin user doesn't exist.

### Why Admin User Disappears

**Test Setup:**
```typescript
// tests/e2e/utils/test-helpers.ts:34
export async function ensureAdminUserExists(page: Page) {
  try {
    await page.request.post('/auth/seed-admin');
  } catch (error) {
    // Admin might already exist, ignore errors
  }
}
```

**The Problem:**
1. Each test calls `ensureAdminUserExists()` via `loginAsAdmin()`
2. In lead's CI, each test gets a **fresh D1 database** (ephemeral)
3. The `/auth/seed-admin` endpoint might not exist or might fail silently
4. Admin user is never created
5. All routes redirect to `/auth/register?setup=true`
6. Tests fail

### Evidence From CI Logs

```
Error: expect(page).toHaveURL(expected) failed
Expected pattern: /\/admin/
Received string:  "...workers.dev/auth/register?setup=true"
```

This happens in:
- `02-authentication.spec.ts:39` - should logout successfully
- `02-authentication.spec.ts:52` - should protect admin routes
- `03-admin-dashboard.spec.ts:82` - should display system status
- `03-admin-dashboard.spec.ts:119` - should navigate to media page
- `04-collections.spec.ts:206` - should show collection actions
- `39-slug-generation.spec.ts:287` - should show checking status

### Why This Works On User's Fork CI

User's CI (mmcintosh/sonicjs) likely:
- Uses a persistent D1 database across tests
- Has the admin user seeded once and reused
- Or has a different CI setup that maintains database state

### Solution

**Option 1: Ensure `/auth/seed-admin` endpoint exists**
Check if this endpoint is implemented. If not, tests need another way to create admin users.

**Option 2: Create admin user directly in test setup**
```typescript
export async function ensureAdminUserExists(page: Page) {
  // Use the registration endpoint instead
  try {
    await page.request.post('/auth/register', {
      data: {
        email: ADMIN_CREDENTIALS.email,
        password: ADMIN_CREDENTIALS.password,
        confirmPassword: ADMIN_CREDENTIALS.password
      }
    });
  } catch (error) {
    // May already exist, that's fine
  }
}
```

**Option 3: Fix adminSetupMiddleware to not break 404s** (preferred)
This would fix both issues at once.

---

## Issue #3: Field Edit Test Timing (2 Flaky Tests)

These are the tests we already tried to fix:

- `22-collection-field-edit.spec.ts:143` - should preserve all field properties when editing
- `22-collection-field-edit.spec.ts:208` - should show appropriate options for different field types

The timing fixes (`toBeChecked({ timeout: 3000 })`) aren't enough. The modal population logic has nested `setTimeout` calls that are too slow for CI.

### Solution

Need to increase timeouts even more or refactor the frontend code to not use nested timeouts.

---

## Recommended Fix Priority

### Priority 1: Fix adminSetupMiddleware (Fixes 9 tests)

Change from redirect-everything to redirect-only-admin:

```typescript
// Only redirect admin routes when no admin exists
if (!adminExists && path.startsWith('/admin')) {
  return c.redirect('/auth/register?setup=true')
}

return next()  // Allow other routes to proceed (including 404s)
```

This fixes:
- ✅ Test #1: 404 routes return 404
- ✅ Tests #2-9: Admin tests stop redirecting (if admin user issue is separate)

### Priority 2: Verify `/auth/seed-admin` endpoint

Check if this endpoint exists and works in CI environment.

### Priority 3: Increase field edit test timeouts

Change `timeout: 3000` to `timeout: 5000` or `timeout: 10000` for CI environments.

---

## Files That Need Changes

1. **`packages/core/src/middleware/admin-setup.ts`** (lines 43-46)
   - Change redirect logic to only affect `/admin/*` routes
   
2. **`tests/e2e/utils/test-helpers.ts`** (line 34-40)
   - Verify `/auth/seed-admin` works or use `/auth/register` instead
   
3. **`tests/e2e/22-collection-field-edit.spec.ts`** (lines 195, 256)
   - Increase timeout from 3000 to 10000

---

## Test With User's CI

Once fixes are applied:
1. Update `wrangler.toml` with user's CI config
2. Push to user's fork (mmcintosh/sonicjs)
3. Verify tests pass on user's CI
4. Compare with lead's CI to identify environmental differences

---

## Conclusion

The Slug PR changes are good, but the `adminSetupMiddleware` is too aggressive. It should only redirect admin routes, not all routes. This single fix should resolve 9 out of 10 failing tests.
