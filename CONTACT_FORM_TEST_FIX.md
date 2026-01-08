# Contact Form Test Fix - Login Redirect Issue

## 🐛 Problem
Test times out at line 41 because after login, user is redirected to `/admin/dashboard` instead of the requested `/admin/plugins/contact-form` page.

## ✅ Good News
- No more 401 error! requireAuth() middleware IS working! 🎉
- Authentication is successful
- Just need to fix the redirect logic

## 🔍 Root Cause
The auth middleware redirects to login with the current URL, but after successful login, it goes to dashboard instead of the original destination.

## 🛠️ Solution Options

### Option 1: Fix the Test (Simplest)
Update test to navigate AFTER login completes:

```typescript
// tests/e2e/37-contact-form-plugin.spec.ts
test('should allow admin to enable the Google Map', async ({ page }) => {
  // Login first
  await loginAsAdmin(page); // This will go to dashboard
  
  // THEN navigate to Contact Form settings
  await page.goto('/admin/plugins/contact-form');
  await page.waitForLoadState('networkidle');
  
  // Rest of test...
  const checkbox = page.locator('#showMap');
  if (!(await checkbox.isChecked())) {
    await checkbox.check({ force: true });
  }
  // ... etc
});
```

### Option 2: Fix Auth Redirect (More Complex)
Update auth middleware to preserve original destination:

```typescript
// packages/core/src/middleware/auth.ts (around line 96)
if (!token) {
  const acceptHeader = c.req.header('Accept') || ''
  if (acceptHeader.includes('text/html')) {
    const originalUrl = c.req.url // Capture original destination
    return c.redirect(`/auth/login?redirect=${encodeURIComponent(originalUrl)}`)
  }
  return c.json({ error: 'Authentication required' }, 401)
}

// packages/core/src/routes/auth.ts (login handler)
// After successful login:
const redirectUrl = c.req.query('redirect') || '/admin/dashboard'
return c.redirect(redirectUrl)
```

## 📋 Recommendation: Option 1 (Test Fix)

**Why:**
- ✅ Simpler, lower risk
- ✅ Follows pattern of other E2E tests
- ✅ Doesn't change core auth behavior
- ✅ Can be done in 5 minutes tomorrow

**Option 2 requires:**
- Updating auth middleware
- Updating login route handler
- Testing all login flows
- Checking other tests don't break
- More comprehensive change

## 🚀 Tomorrow's Quick Fix

```bash
# Edit the test file
code tests/e2e/37-contact-form-plugin.spec.ts

# Replace lines 34-42 with:
test('should allow admin to enable the Google Map', async ({ page }) => {
  // Login first (will redirect to dashboard)
  await loginAsAdmin(page);
  
  // Navigate to Contact Form settings
  await page.goto('/admin/plugins/contact-form');
  await page.waitForLoadState('networkidle');
  
  // Check the "Enable Map" box
  // ... rest stays the same
```

Test locally:
```bash
npm run e2e -- tests/e2e/37-contact-form-plugin.spec.ts
```

Commit and push.

## 🎯 Success Criteria
- ✅ Test navigates to settings after login
- ✅ Test passes locally
- ✅ Test passes in CI
- ✅ No 401 errors (auth middleware working!)
