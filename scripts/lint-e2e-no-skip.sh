#!/usr/bin/env bash
# Reject skipped E2E tests — only runtime feature-detection guards are allowed.
# Usage: scripts/lint-e2e-no-skip.sh [files...]
# With no args, scans all tests/e2e/*.spec.ts and tests/www/*.spec.ts files.

set -euo pipefail

RED='\033[0;31m'
NC='\033[0m'

files=("$@")
if [ ${#files[@]} -eq 0 ]; then
  files=(tests/e2e/*.spec.ts tests/www/*.spec.ts)
fi

violations=0

for f in "${files[@]}"; do
  [ -f "$f" ] || continue

  # describe.skip — always banned
  if grep -nE 'describe\.skip\(' "$f" 2>/dev/null; then
    echo -e "${RED}BANNED${NC}: describe.skip in $f"
    violations=$((violations + 1))
  fi

  # test.skip('name' — writing a test just to skip it
  if grep -nE "test\.skip\('" "$f" 2>/dev/null; then
    echo -e "${RED}BANNED${NC}: test.skip('name') in $f"
    violations=$((violations + 1))
  fi

  # bare test.skip() NOT inside an if/ternary (unconditional skip)
  if grep -nE '^\s+test\.skip\(\)' "$f" 2>/dev/null | grep -vE 'if\s*\(|&&|\|\||\?' ; then
    echo -e "${RED}BANNED${NC}: unconditional test.skip() in $f"
    violations=$((violations + 1))
  fi

  # test.fixme — known broken = should be fixed or deleted
  if grep -nE 'test\.fixme\(' "$f" 2>/dev/null; then
    echo -e "${RED}BANNED${NC}: test.fixme in $f"
    violations=$((violations + 1))
  fi

  # test.todo — placeholder = should not exist
  if grep -nE 'test\.todo\(' "$f" 2>/dev/null; then
    echo -e "${RED}BANNED${NC}: test.todo in $f"
    violations=$((violations + 1))
  fi
done

if [ "$violations" -gt 0 ]; then
  echo ""
  echo -e "${RED}Found $violations file(s) with banned skip patterns.${NC}"
  echo "Rules: https://github.com/SonicJs-Org/sonicjs/blob/main/CLAUDE.md#no-skipped-tests-non-negotiable"
  exit 1
fi

echo "✓ No banned skip patterns found."
