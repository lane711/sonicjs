# Testing Quick Start Guide

## Available Test Commands

### Smoke Tests (Fast - 2-3 minutes)
```bash
# Run smoke tests - quick critical path validation
npm run e2e:smoke

# Run with interactive UI
npm run e2e:smoke:ui
```

### Full E2E Tests (Comprehensive - 10-15 minutes)
```bash
# Run all e2e tests
npm run e2e

# Run with interactive UI
npm run e2e:ui
```

### Unit Tests
```bash
# Run unit tests
npm test

# Run with coverage
npm run test:cov

# Run in watch mode
npm run test:watch
```

## When to Use Each

### Before Every Commit
```bash
npm run e2e:smoke  # 2-3 minutes
```

### Before Creating a PR
```bash
npm run e2e        # 10-15 minutes
```

### During Development
```bash
npm run test:watch # Continuous unit tests
```

## Quick Smoke Test Overview

The smoke test suite validates:
- ✅ API health & infrastructure (4 tests)
- ✅ Authentication & security (5 tests)
- ✅ Core functionality (4 tests)
- ✅ Content & media operations (2 tests)

**Total: 15 critical tests in ~2-3 minutes**

## CI/CD Recommendations

### On Push (Fast Feedback)
```yaml
- npm run e2e:smoke
```

### On PR (Comprehensive)
```yaml
- npm run e2e:smoke  # Gate 1: Quick check
- npm run e2e        # Gate 2: Full coverage
```

### Before Deploy
```yaml
- npm run e2e        # Full validation
```

## Need Help?

- **Smoke Tests**: See `tests/SMOKE_TESTS.md`
- **E2E Tests**: See existing tests in `tests/e2e/`
- **Test Helpers**: See `tests/e2e/utils/test-helpers.ts`
