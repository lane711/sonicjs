# Smoke Test Suite

## Overview

The smoke test suite is a fast, focused set of tests that validates critical functionality in 2-3 minutes. It's designed to catch major issues quickly before running the full test suite.

## Running Smoke Tests

```bash
# Run smoke tests
npm run e2e:smoke

# Run with Playwright UI (interactive mode)
npm run e2e:smoke:ui
```

## What Gets Tested (15 Tests)

### 1. **API Health & Infrastructure** (4 tests)
- ✅ API health check returns running status
- ✅ API error handling returns proper status codes
- ✅ CORS headers are present on API endpoints
- ✅ API returns correct content-type headers

### 2. **Authentication & Security** (5 tests)
- ✅ Home page redirects to login when not authenticated
- ✅ Admin routes require authentication
- ✅ Login with valid credentials succeeds
- ✅ Session persists across page reloads
- ✅ Logout successfully clears session

### 3. **Core Functionality** (4 tests)
- ✅ Dashboard loads with stats and recent activity
- ✅ Database connectivity via stats query
- ✅ Collections API is accessible and returns data
- ✅ Recent activity displays content changes

### 4. **Content & Media Operations** (2 tests)
- ✅ Create, retrieve, and delete content (full CRUD)
- ✅ Media upload and cleanup works

## Test Coverage Comparison

| Suite | Tests | Duration | Purpose |
|-------|-------|----------|---------|
| **Smoke** | 15 | 2-3 min | Critical path validation |
| **Full E2E** | 38+ | 10-15 min | Comprehensive coverage |
| **Unit Tests** | Many | < 1 min | Code-level testing |

## When to Use

### Use Smoke Tests:
- ✅ Before committing code
- ✅ On every push to CI/CD
- ✅ Quick sanity check after changes
- ✅ When time is limited

### Use Full E2E Tests:
- ✅ Before merging PRs
- ✅ Before deploying to production
- ✅ Weekly regression testing
- ✅ After major changes

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run e2e:smoke  # Fast feedback

  full-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    needs: smoke  # Only run if smoke tests pass
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run e2e  # Full test suite
```

## Configuration

The smoke tests use a dedicated configuration file:
- **Config**: `tests/playwright.smoke.config.ts`
- **Test File**: `tests/e2e/smoke.spec.ts`
- **Report Output**: `playwright-report-smoke/`

### Key Settings:
- **Retries**: 0 (fail fast)
- **Workers**: 1 (serial execution for stability)
- **Timeout**: 30 seconds per test
- **Reporter**: List (clean terminal output) + HTML

## Adding New Smoke Tests

When adding a new smoke test, ask yourself:

1. **Is this critical functionality?** If the app is unusable without it, add it.
2. **Does it test a unique path?** Don't duplicate existing coverage.
3. **Is it fast?** Smoke tests should complete in < 30 seconds each.
4. **Is it stable?** No flaky tests allowed in smoke suite.

### Example:

```typescript
test('New critical feature works', async ({ page }) => {
  await loginAsAdmin(page);

  // Test the critical path only
  await page.goto('/new-feature');
  await expect(page.locator('h1')).toContainText('Expected Text');
});
```

## Troubleshooting

### Smoke tests fail but full tests pass?
- Check if server is running (`npm run dev`)
- Verify database is initialized
- Check for port conflicts (8787)

### Tests timeout?
- Increase timeout in `playwright.smoke.config.ts`
- Check server startup time
- Look for slow database queries

### Flaky tests?
- Remove from smoke suite and fix in full suite
- Add explicit waits for HTMX/async operations
- Check for race conditions

## Maintenance

Review the smoke test suite:
- **Monthly**: Ensure tests are still relevant
- **After major features**: Add new critical paths
- **When tests slow down**: Remove redundant tests
- **On failures**: Fix immediately or remove

## Best Practices

1. **Keep it minimal**: 15-20 tests maximum
2. **Test critical paths only**: Not edge cases
3. **Fail fast**: No retries, immediate feedback
4. **Clean up**: Always delete test data
5. **Document changes**: Update this file when adding tests

## Questions?

- Check existing tests: `tests/e2e/*.spec.ts`
- Read Playwright docs: https://playwright.dev
- Review test helpers: `tests/e2e/utils/test-helpers.ts`
