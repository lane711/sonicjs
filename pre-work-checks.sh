#!/bin/bash
# pre-work-checks.sh
# Run these checks before starting ANY work session
# Usage: ./pre-work-checks.sh

set -e

REPO_ROOT="/home/siddhartha/Documents/cursor-sonicjs/sonicjs/github/sonicjs"
cd "$REPO_ROOT"

echo "🔍 Running Pre-Work Safety Checks..."
echo ""

# Check 1: Are we on main?
echo "✓ Check 1: Current Branch"
CURRENT_BRANCH=$(git branch --show-current)
echo "  Current: $CURRENT_BRANCH"
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "  ⚠️  WARNING: Not on main branch!"
    echo "  Run: git checkout main"
    exit 1
fi
echo "  ✅ On main branch"
echo ""

# Check 2: Is working tree clean?
echo "✓ Check 2: Working Tree Status"
if [ -n "$(git status --porcelain)" ]; then
    echo "  ❌ Working tree is NOT clean:"
    git status --short
    echo ""
    echo "  Fix: git stash or git commit"
    exit 1
fi
echo "  ✅ Working tree is clean"
echo ""

# Check 3: Is fork synced with upstream?
echo "✓ Check 3: Fork vs Upstream Sync"
git fetch upstream main --quiet
git fetch origin main --quiet

BEHIND_UPSTREAM=$(git log HEAD..upstream/main --oneline | wc -l)
AHEAD_OF_UPSTREAM=$(git log upstream/main..HEAD --oneline | wc -l)

echo "  Commits behind upstream: $BEHIND_UPSTREAM"
echo "  Commits ahead of upstream: $AHEAD_OF_UPSTREAM"

if [ "$BEHIND_UPSTREAM" -gt 0 ]; then
    echo "  ⚠️  Fork is behind upstream!"
    echo "  Run: git merge upstream/main && git push origin main"
    exit 1
fi
echo "  ✅ Fork is synced with upstream"
echo ""

# Check 4: Any unexpected test files?
echo "✓ Check 4: Unexpected Test Files on Main"
UNEXPECTED_TESTS=$(git diff upstream/main --name-only | grep -E "test|spec" || true)
if [ -n "$UNEXPECTED_TESTS" ]; then
    echo "  ⚠️  WARNING: Unexpected test files found:"
    echo "$UNEXPECTED_TESTS" | sed 's/^/     /'
    echo ""
    echo "  These test files exist on your main but not upstream."
    echo "  They may cause all PRs to fail CI!"
    exit 1
fi
echo "  ✅ No unexpected test files"
echo ""

# Check 5: Are there any open PRs in bad state?
echo "✓ Check 5: Open PR Status"
echo "  Checking PRs on fork..."
gh pr list --repo mmcintosh/sonicjs --state open --limit 5 --json number,title,headRefName,statusCheckRollup 2>/dev/null | \
  jq -r '.[] | "  PR #\(.number): \(.title | .[0:50]) - \(.statusCheckRollup[0].conclusion // "pending")"' || \
  echo "  (gh CLI not available or no PRs)"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 ALL PRE-WORK CHECKS PASSED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ You're safe to start working on a new file"
echo ""
echo "Next Steps:"
echo "1. Pick a file from ANY_TYPE_PROGRESS.md Tier 1 list"
echo "2. Run: ./any-type-fix-workflow.sh FILENAME"
echo "3. Follow the prompts"
echo ""
