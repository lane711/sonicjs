# Claude + Conductor GitHub Workflow

This document outlines the workflow for using Claude in Conductor to fix GitHub issues.

## Workflow Overview

1. **Start in Conductor** - Conductor automatically creates a worktree and branch
2. **Claude fixes the issue** - Implement the fix with tests
3. **Create PR** - Push changes and create pull request
4. **CI runs tests** - GitHub Actions runs unit and E2E tests
5. **Manual review** - You review and merge the PR

## Steps for Claude

When given a GitHub issue to fix, follow these steps:

### 1. Understand the Issue
- Read the GitHub issue thoroughly
- Identify the root cause
- Plan the fix

### 2. Implement the Fix
- Make necessary code changes
- Follow existing code patterns and conventions
- Ensure no security vulnerabilities (XSS, SQL injection, etc.)

### 3. Write Unit Tests
- Add tests in `packages/core/src/__tests__/`
- Use Vitest framework
- Test both happy path and edge cases
- Run: `npm test`

### 4. Write E2E Tests
- Add tests in `tests/e2e/`
- Use Playwright framework
- Test user-facing functionality
- Run: `npm run e2e`

### 5. Verify All Tests Pass
```bash
npm run type-check  # Type checking
npm test            # Unit tests
npm run e2e         # E2E tests
```

### 6. Create Pull Request
```bash
# Commit changes
git add .
git commit -m "fix: [description]

Fixes #[issue-number]

Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote
git push -u origin [branch-name]

# Create PR using GitHub CLI
gh pr create --title "fix: [description]" --body "$(cat <<'EOF'
## Description
[Describe the fix]

Fixes #[issue-number]

## Changes
- [Change 1]
- [Change 2]

## Testing
### Unit Tests
- Added tests for [functionality]
- All unit tests passing

### E2E Tests
- Added E2E test for [user scenario]
- All E2E tests passing

Generated with Claude Code in Conductor
EOF
)"
```

## Testing Requirements

Every PR must include:

1. **Unit Tests** - Test individual functions/components (REQUIRED)
2. **E2E Tests** - Test complete user workflows (REQUIRED)
3. **All tests passing** - Both unit and E2E must pass in CI

**E2E Testing**:
E2E tests run automatically in CI against a Cloudflare Workers preview deployment.

To run E2E tests locally:
```bash
# In one terminal - start dev server
cd my-sonicjs-app
npm run dev

# In another terminal - run E2E tests
npm run e2e
```

**Note**: CI automatically deploys each PR to a preview environment and runs E2E tests against it.

## CI/CD Pipeline

GitHub Actions will automatically:
- Run unit tests (325 tests)
- Deploy PR to Cloudflare Workers preview environment
- Run E2E tests against preview deployment
- Upload test artifacts and videos on failure

The PR cannot be merged until all tests pass (unit + E2E).

## Branch Naming

Conductor creates branches automatically. Use descriptive names:
- `fix-user-auth-bug`
- `add-media-upload`
- `refactor-collections`

## Commit Message Format

```
<type>: <short description>

<detailed description>

Fixes #<issue-number>

Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

Types: `fix`, `feat`, `refactor`, `test`, `docs`, `chore`

## Example Complete Workflow

```bash
# 1. Conductor already created worktree/branch
# 2. Make changes to fix issue #123

# 3. Add unit test
# Create: packages/core/src/__tests__/services/my-feature.test.ts

# 4. Add E2E test
# Create: tests/e2e/99-my-feature.spec.ts

# 5. Run all tests
npm run type-check && npm test && npm run e2e

# 6. Commit and push
git add .
git commit -m "fix: resolve authentication timeout issue

- Increase timeout from 5s to 10s
- Add retry logic for failed auth attempts
- Add unit tests for timeout handling
- Add E2E test for slow network conditions

Fixes #123

Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

git push -u origin fix-auth-timeout

# 7. Create PR
gh pr create --title "fix: resolve authentication timeout issue" \
  --body "Fixes #123 - see commit message for details"

# 8. Wait for CI to pass
# 9. Manual review and merge
```

## Troubleshooting

### E2E Tests Failing in CI
- Check if database migrations are applied
- Verify Wrangler local mode is working
- Check test artifacts in GitHub Actions

### Type Check Failures
- Run `npm run type-check` locally
- Fix TypeScript errors before pushing

### Unit Test Failures
- Run `npm test` locally
- Check test output for specific failures
- Ensure mocks are properly configured

## Notes

- Conductor handles worktree creation - no manual worktree commands needed
- Always run tests locally before creating PR
- CI runs the same tests - if they pass locally, they should pass in CI
- E2E tests use local Wrangler dev server with in-memory D1/R2/KV
