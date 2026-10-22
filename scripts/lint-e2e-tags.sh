#!/usr/bin/env bash
# Reject E2E tests that no CI tag selects.
#
# CI never runs the whole suite — it runs `--grep "@smoke|@<tag>"` for the tags
# the changed paths map to. A test carrying none of those tags is invisible to
# every PR: written, reviewed, merged, never executed. Two separate passes on
# this repo found 14 whole spec files and then 62 more tests in that state.
#
# Playwright greps the joined title path, so a tag anywhere in the chain counts
# — on the test, on its describe, or on an enclosing describe.
#
# The tag vocabulary is read out of the workflow rather than duplicated here, so
# adding a tag to the mapping cannot silently leave this check behind.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

WORKFLOW=".github/workflows/pr-tests.yml"
[ -f "$WORKFLOW" ] || { echo "cannot find $WORKFLOW"; exit 1; }

TAGS=$(grep -oE 'TAGS="[^"]*"' "$WORKFLOW" \
  | grep -oE '@[a-z0-9-]+' \
  | sort -u \
  | tr '\n' '|' \
  | sed 's/|$//')

[ -n "$TAGS" ] || { echo "no tags parsed out of $WORKFLOW"; exit 1; }

echo "CI tag vocabulary: $TAGS"

# Playwright exits non-zero when a filter matches nothing, which here is the
# success case, so the status is deliberately discarded and the output parsed.
OUT=$(npx playwright test --config tests/playwright.config.ts --grep-invert "$TAGS" --list 2>&1 || true)

if echo "$OUT" | grep -qE '^Total: 0 tests|No tests found'; then
  echo -e "${GREEN}OK${NC}: every E2E test is selected by at least one CI tag."
  exit 0
fi

echo -e "${RED}UNTAGGED${NC}: these tests match no CI tag, so no PR will ever run them."
echo "$OUT" | grep -E '^\s*\[' || true
echo "$OUT" | grep -E '^Total:' || true
echo
echo "Add a feature tag (and @smoke if it covers login/nav/a core flow) to the test"
echo "title or its describe. See the tag table in CLAUDE.md."
exit 1
