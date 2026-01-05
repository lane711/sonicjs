# PR Testing Checklist

Run these commands **before creating or updating any Pull Request** to ensure your changes pass CI.

## Prerequisites

```bash
# Make sure you're on your feature branch
git branch --show-current

# Ensure dependencies are installed
npm install

# Build the core package
npm run build
```

## Required Tests (Run in Order)

### 1. Type Checking ✅
```bash
npm run type-check
```
- ✅ **Expected**: No TypeScript errors
- ❌ **If fails**: Fix type errors before proceeding

### 2. Linting ✅
```bash
npm run lint --workspace=@sonicjs-cms/core
```
- ✅ **Expected**: No linting errors
- ❌ **If fails**: Run `npm run lint:fix --workspace=@sonicjs-cms/core` to auto-fix

### 3. Unit Tests ✅
```bash
npm test
```
- ✅ **Expected**: All tests pass
- ✅ **Expected**: Coverage > 90%
- ❌ **If fails**: Fix failing tests before proceeding

### 4. Build Verification ✅
```bash
npm run build
```
- ✅ **Expected**: Build completes without errors
- ❌ **If fails**: Check for build errors in `packages/core/`

### 5. E2E Tests ✅

**Important**: E2E tests require the dev server to be running.

#### Option A: Run with Auto-Start Server (Recommended)
```bash
npm run e2e
```
The playwright.config.ts will automatically start the server.

#### Option B: Manual Server Start
```bash
# Terminal 1: Start dev server
cd my-sonicjs-app
npm run dev

# Terminal 2: Run E2E tests (after server is ready)
npm run e2e
```

- ✅ **Expected**: All E2E tests pass
- ❌ **If fails**: Check test output for specific failures

#### Run Smoke Tests Only (Quick Check)
```bash
npm run e2e:smoke
```

#### Run E2E in UI Mode (For Debugging)
```bash
npm run e2e:ui
```

## Common Issues & Fixes

### Issue 1: Wrangler OpenNext Detection Error
**Error**: `ERROR Could not find compiled Open Next config`

**Fix**: Ensure wrangler is pinned to 4.54.0 in `my-sonicjs-app/package.json`:
```json
{
  "devDependencies": {
    "wrangler": "4.54.0"
  }
}
```

And `my-sonicjs-app/wrangler.toml` has:
```toml
compatibility_date = "2025-05-05"
compatibility_flags = ["nodejs_compat"]
```

**Related Issues**:
- https://github.com/cloudflare/workers-sdk/issues/11739
- https://github.com/opennextjs/opennextjs-cloudflare/issues/910

### Issue 2: Tests Timing Out
**Error**: Playwright tests timeout

**Fix**: 
- Ensure dev server is running and accessible at http://localhost:8787
- Check for port conflicts
- Increase timeout in specific tests if needed

### Issue 3: Database Errors in Tests
**Error**: `Database not available` or migration errors

**Fix**: Reset the database:
```bash
cd my-sonicjs-app
npm run setup:db
```

### Issue 4: Generated Files Causing Git Issues
**Error**: Cannot switch branches due to dist files

**Fix**: Stash and clean generated files:
```bash
git stash
git clean -fd packages/core/dist
```

## Full Test Suite Command

Run everything in one go:
```bash
npm run type-check && \
npm run lint --workspace=@sonicjs-cms/core && \
npm test && \
npm run build && \
npm run e2e
```

## CI/CD Notes

### What GitHub Actions Will Run

The CI pipeline runs:
1. Type checking
2. Linting
3. Unit tests
4. Build
5. E2E tests
6. Deployment to preview environment

### Preview Deployments

Each PR automatically deploys to a preview URL:
- URL format: `https://sonicjs-pr-{branch-name}.{account}.workers.dev`
- D1 database is created automatically
- R2 bucket is shared or created per preview

### Viewing CI Logs

1. Go to your PR on GitHub
2. Scroll to "Checks" section
3. Click "Details" on any failed check
4. View the complete error log

## Before Pushing to PR

**Checklist**:
- [ ] All tests pass locally
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Code is formatted (Prettier runs on commit)
- [ ] New features have tests
- [ ] Documentation updated (if needed)
- [ ] Temporary/debug files removed
- [ ] Wrangler version pinned to 4.54.0
- [ ] Compatibility date set to 2025-05-05

## Additional Testing Commands

### Unit Tests with Watch Mode
```bash
npm run test:watch
```

### Unit Tests with Coverage UI
```bash
npm run test:cov:ui
```

### Run Specific E2E Test
```bash
npx playwright test tests/e2e/37-contact-form-plugin.spec.ts
```

### Run E2E Tests in Headed Mode (See Browser)
```bash
npx playwright test --headed
```

### Debug Specific E2E Test
```bash
npx playwright test tests/e2e/37-contact-form-plugin.spec.ts --debug
```

## Testing New Plugins

When creating a new plugin:

1. **Unit Tests**: Create `your-plugin/test/*.test.ts`
2. **E2E Tests**: Create `tests/e2e/##-plugin-name.spec.ts`
3. **Test Installation**: Verify plugin can be installed/uninstalled
4. **Test Settings**: Verify settings page renders and saves
5. **Test Functionality**: Test the actual plugin features

## Performance Testing

### Check Response Times
```bash
# Start server and test API endpoints
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8787/api/health
```

### Load Testing (Optional)
```bash
# Install autocannon
npm install -g autocannon

# Run load test
autocannon -c 10 -d 5 http://localhost:8787/api/health
```

## Final Notes

- **Always test locally before pushing** - CI minutes are limited
- **Run full suite before marking PR as ready** - Draft PRs are fine for WIP
- **Check CI logs if tests fail** - They often have more detail than local runs
- **Keep PRs small and focused** - Easier to test and review
- **Document any required setup** - Database seeds, environment variables, etc.

---

Generated: 2026-01-05
Updated: After Wrangler 4.55.0 OpenNext bug discovery
