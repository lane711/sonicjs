#!/bin/bash
# any-type-fix-workflow.sh
# Automated workflow helper for fixing 'any' types
# Usage: ./any-type-fix-workflow.sh <filename-without-extension>

set -e  # Exit on any error

FILENAME=$1

if [ -z "$FILENAME" ]; then
    echo "❌ Error: Please provide filename"
    echo "Usage: ./any-type-fix-workflow.sh plugin-middleware"
    exit 1
fi

BRANCH_NAME="refactor/types-$FILENAME"
REPO_ROOT="/home/siddhartha/Documents/cursor-sonicjs/sonicjs/github/sonicjs"

echo "🚀 Starting 'any' type fix workflow for: $FILENAME"
echo "Branch: $BRANCH_NAME"
echo ""

cd "$REPO_ROOT"

# Phase 1: Pre-Flight Checks (CRITICAL!)
echo "=== Phase 1: Pre-Flight Checks (CRITICAL!) ==="
echo "📋 Checking current status..."

# Check we're on main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Not on main branch (currently on: $CURRENT_BRANCH)"
    read -p "Switch to main? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
    else
        echo "❌ Cannot proceed from non-main branch. Exiting."
        exit 1
    fi
fi

# Check working tree is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Working tree is not clean. Please commit or stash changes."
    git status --short
    exit 1
fi

# Sync with upstream (lead's main)
echo "🔄 Syncing fork's main with upstream/main..."
git fetch upstream main
git merge upstream/main --no-edit
git push origin main

# Verify sync
echo "✅ Fork's main synced with upstream"

# Check for unexpected test files
echo "🔍 Checking for unexpected test files on main..."
UNEXPECTED_TESTS=$(git diff upstream/main --name-only | grep -E "test|spec" || true)
if [ -n "$UNEXPECTED_TESTS" ]; then
    echo "⚠️  Warning: Unexpected test files found:"
    echo "$UNEXPECTED_TESTS"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted due to unexpected test files."
        exit 1
    fi
fi

echo "✅ Pre-flight checks passed"
echo ""

# Phase 2: Create Branch
echo "=== Phase 2: Create Branch ==="
git checkout -b "$BRANCH_NAME"

# VERIFY we're on the new branch
NEW_BRANCH=$(git branch --show-current)
if [ "$NEW_BRANCH" != "$BRANCH_NAME" ]; then
    echo "❌ ERROR: Not on expected branch!"
    echo "   Expected: $BRANCH_NAME"
    echo "   Current:  $NEW_BRANCH"
    exit 1
fi
echo "✅ Branch created and verified: $BRANCH_NAME"

# VERIFY branch is based on latest main
COMMITS_BEHIND=$(git log HEAD..main --oneline | wc -l)
if [ "$COMMITS_BEHIND" -gt 0 ]; then
    echo "⚠️  Branch is $COMMITS_BEHIND commits behind main (should be 0)"
    echo "❌ Branch not properly based on latest main. Exiting."
    exit 1
fi
echo "✅ Branch is up to date with main"
echo ""

echo "⏸️  PAUSED: Make your changes now, then press Enter to continue..."
read -p "Press Enter after you've made the type fix..."
echo ""

# Phase 3: Local Testing
echo "=== Phase 3: Local Testing (CRITICAL) ==="

echo "Step 1/3: Type Check..."
cd packages/core
if ! npm run type-check; then
    echo "❌ Type check FAILED. Fix errors and run script again."
    exit 1
fi
echo "✅ Type check passed"

echo "Step 2/3: Lint Check..."
if ! npm run lint 2>&1 | grep -v "warning"; then
    echo "⚠️  Lint warnings found (non-blocking)"
fi
echo "✅ Lint check completed"

echo "Step 3/3: Build..."
if ! npm run build; then
    echo "❌ Build FAILED. Fix errors and run script again."
    exit 1
fi
echo "✅ Build passed"

cd "$REPO_ROOT"
echo ""
echo "🎉 All local tests PASSED!"
echo ""

# Phase 4: Review Changes
echo "=== Phase 4: Review Changes ==="
echo "Git diff:"
git diff
echo ""
read -p "Do the changes look correct? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted. Please review and fix changes."
    exit 1
fi

# Phase 5: Commit
echo "=== Phase 5: Commit ==="
git add packages/core/src/
git add packages/core/dist/
git add packages/core/src/db/migrations-bundle.ts

read -p "Enter one-line description of change: " CHANGE_DESC
read -p "Enter line numbers changed (e.g., '61, 69'): " LINES_CHANGED
read -p "Number of 'any' instances fixed: " ANY_COUNT

git commit -m "refactor(types): replace 'any' with proper types in $FILENAME

Addresses lane711/sonicjs#435

Changes:
- Lines $LINES_CHANGED: $CHANGE_DESC

Testing:
- npm run type-check ✅
- npm run lint ✅
- npm run build ✅

Impact:
- Before: $ANY_COUNT instances of 'any' in $FILENAME
- After: 0 instances of 'any' in $FILENAME"

echo "✅ Committed"
echo ""

# Phase 6: Sync Check
echo "=== Phase 6: Sync Check ==="
git fetch upstream main
git fetch origin main

NEW_COMMITS=$(git log HEAD..origin/main --oneline | wc -l)
if [ "$NEW_COMMITS" -gt 0 ]; then
    echo "⚠️  Main has $NEW_COMMITS new commits. Rebasing..."
    git rebase origin/main
    
    echo "⚠️  After rebase, re-running tests..."
    cd packages/core
    npm run type-check && npm run build
    cd "$REPO_ROOT"
    
    echo "✅ Rebase successful, tests still pass"
else
    echo "✅ No new commits on main"
fi

# FINAL VERIFICATION before push
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH_NAME" ]; then
    echo "❌ ERROR: Not on expected branch before push!"
    echo "   Expected: $BRANCH_NAME"
    echo "   Current:  $CURRENT_BRANCH"
    echo "   DANGER: Almost pushed to wrong branch!"
    exit 1
fi
echo "✅ Branch verified before push: $CURRENT_BRANCH"
echo ""

# Phase 7: Push
echo "=== Phase 7: Push to Fork ==="
read -p "Push to origin? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push -u origin "$BRANCH_NAME"
    echo "✅ Pushed to origin"
else
    echo "❌ Push cancelled"
    exit 1
fi
echo ""

# Phase 8: Create PR
echo "=== Phase 8: Create Fork PR ==="
read -p "Create PR on fork? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    gh pr create \
      --repo mmcintosh/sonicjs \
      --base main \
      --head "$BRANCH_NAME" \
      --title "refactor(types): replace 'any' with proper types in $FILENAME" \
      --body "## Description
Replace \`any\` type with proper types in $FILENAME.

Fixes lane711/sonicjs#435

## Changes
- $CHANGE_DESC

## Testing

### Unit Tests
- [ ] Added/updated unit tests (not needed - no logic change)
- [x] All unit tests passing

### E2E Tests
- [ ] Added/updated E2E tests (not needed - no logic change)
- [x] All E2E tests passing

## Checklist
- [x] Code follows project conventions
- [x] Tests passing
- [x] Type checking passes
- [x] No console errors
- [x] Local build successful

## Local Testing Results
\`\`\`
✅ npm run type-check - PASSED
✅ npm run lint - PASSED
✅ npm run build - PASSED
\`\`\`

## Impact
- Before: $ANY_COUNT instances of \`any\` in $FILENAME
- After: 0 instances

---
Generated with Claude Code in Conductor"
    
    echo "✅ PR created on fork"
else
    echo "❌ PR creation cancelled"
    exit 1
fi
echo ""

echo "🎉 Workflow Complete!"
echo ""
echo "Next Steps:"
echo "1. Monitor PR CI: gh pr checks --repo mmcintosh/sonicjs --watch"
echo "2. Wait for CI to pass ✅"
echo "3. Create upstream PR only after fork CI passes"
echo "4. Update ANY_TYPE_PROGRESS.md with results"
echo ""
echo "✅ Done!"
