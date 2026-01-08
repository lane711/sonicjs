# Post-CI-Pass Workflow: Creating Upstream PRs

## When to Use This
After your fork's PR has passed all CI tests ✅, follow these steps to create an upstream PR to the lead's repository.

---

## Step 1: Verify Fork CI Passed

```bash
# Check fork PR status
gh pr list --repo mmcintosh/sonicjs --state open

# Verify specific PR passed
gh pr view <PR_NUMBER> --repo mmcintosh/sonicjs --json statusCheckRollup

# Should show: "conclusion": "SUCCESS" for all checks
```

**✅ Checklist:**
- [ ] All E2E tests passed
- [ ] No linter errors
- [ ] Type-check passed
- [ ] Build successful

**⚠️ Do NOT proceed if fork CI is failing!**

---

## Step 2: Prepare PR Body Using Template

The upstream repo uses a standard PR template (`.github/pull_request_template.md`). You MUST follow this format:

### Template Format:
```markdown
## Description
<!-- Brief description of changes -->

Fixes #<issue_number>

## Changes
- Change 1
- Change 2
- Change 3

## Testing

### Unit Tests
- [ ] Added/updated unit tests
- [x] All unit tests passing

### E2E Tests
- [ ] Added/updated E2E tests
- [x] All E2E tests passing ✅

**Fork PR Results:**
- ✅ Type-check: Passed
- ✅ Build: Successful
- ✅ Lint: No errors
- ✅ E2E Tests: All <count> passed
- ✅ CI Run: https://github.com/mmcintosh/sonicjs/pull/<fork_pr_number>

## Screenshots/Videos
<!-- If UI changes, add screenshots/videos. Otherwise: -->
N/A - No UI changes

## Checklist
- [x] Code follows project conventions
- [x] Tests added/updated and passing
- [x] Type checking passes
- [x] No console errors or warnings
- [x] Documentation updated (if needed)

---
**Related:**
- Fork PR: mmcintosh/sonicjs#<fork_pr_number>
- Part of issue #<issue_number>

---
Generated with Claude Code in Conductor
```

---

## Step 3: Create PR Body File

**Why use a file?** Multi-line strings in bash can have escaping issues. Using a file is more reliable.

```bash
# Create PR body file
cat > /tmp/pr-body-<branch-name>.md << 'EOF'
## Description
[Your description here]

Fixes #435

## Changes
- [Change 1]
- [Change 2]

[... rest of template ...]
EOF
```

**Tips:**
- Use actual issue number (e.g., #435 for 'any' type fixes)
- Link to fork PR: `https://github.com/mmcintosh/sonicjs/pull/<number>`
- Mark all checklist items as `[x]` if they're done
- Mark as `[ ]` if not applicable (but explain why in parentheses)

---

## Step 4: Create Upstream PR

```bash
cd /path/to/sonicjs

gh pr create \
  --repo lane711/sonicjs \
  --head mmcintosh:<branch-name> \
  --base main \
  --title "<PR title matching fork PR>" \
  --body-file /tmp/pr-body-<branch-name>.md
```

**Parameters:**
- `--repo lane711/sonicjs` - Target repository (lead's repo)
- `--head mmcintosh:<branch-name>` - Your fork's branch
- `--base main` - Target branch (usually `main`)
- `--title` - Copy from fork PR or make it clear and descriptive
- `--body-file` - Path to your PR body markdown file

**Example:**
```bash
gh pr create \
  --repo lane711/sonicjs \
  --head mmcintosh:refactor/types-plugin-middleware \
  --base main \
  --title "refactor(types): replace 'any' with proper types in plugin-middleware.ts" \
  --body-file /tmp/pr-body-plugin-middleware.md
```

**Output:**
```
https://github.com/lane711/sonicjs/pull/490
```

---

## Step 5: Verify Upstream PR Created

```bash
# View the created PR
gh pr view <upstream_pr_number> --repo lane711/sonicjs

# Check CI status (wait a few minutes for it to start)
gh pr view <upstream_pr_number> --repo lane711/sonicjs --json statusCheckRollup
```

---

## Step 6: Update Progress Tracking

After creating upstream PRs, update your progress documents:

```markdown
| # | File | Fork PR | Upstream PR | Status |
|---|------|---------|-------------|--------|
| 1 | app.ts | #1 ✅ | #489 ⏳ | CI Running |
| 2 | plugin-middleware.ts | #3 ✅ | #490 ⏳ | CI Running |
| 3 | tinymce-plugin/index.ts | #4 ✅ | #491 ⏳ | CI Running |
| 4 | easy-mdx/index.ts | #5 ✅ | #492 ⏳ | CI Running |
```

---

## Example: Complete Workflow for One File

### Context:
- Fork PR #3: `refactor/types-plugin-middleware` - ✅ CI PASSED
- Ready to create upstream PR

### Commands:

```bash
# Step 1: Verify fork CI passed
gh pr view 3 --repo mmcintosh/sonicjs --json statusCheckRollup
# ✅ All checks passed

# Step 2 & 3: Create PR body file
cat > /tmp/pr-body-plugin-middleware.md << 'EOF'
## Description
Replaces `Promise<any[]>` with `Promise<Plugin[]>` in plugin-middleware.ts to improve type safety.

Fixes #435

## Changes
- Changed `getActivePlugins()` return type from `Promise<any[]>` to `Promise<Plugin[]>`
- Added `Plugin` type import from `../db/schema`
- Added explicit type cast for D1 query results: `results as Plugin[]`

## Testing

### Unit Tests
- [ ] Added/updated unit tests (N/A - refactoring only)
- [x] All unit tests passing

### E2E Tests
- [ ] Added/updated E2E tests (N/A - internal type change)
- [x] All E2E tests passing ✅

**Fork PR Results:**
- ✅ Type-check: Passed
- ✅ Build: Successful
- ✅ Lint: No errors
- ✅ E2E Tests: All 195 passed
- ✅ CI Run: https://github.com/mmcintosh/sonicjs/pull/3

## Screenshots/Videos
N/A - No UI changes (internal type refactoring)

## Checklist
- [x] Code follows project conventions
- [x] Tests added/updated and passing
- [x] Type checking passes
- [x] No console errors or warnings
- [x] Documentation updated (if needed) - N/A for type changes

---
**Related:**
- Fork PR: mmcintosh/sonicjs#3
- Part of issue #435 - Systematic replacement of 'any' types

---
Generated with Claude Code in Conductor
EOF

# Step 4: Create upstream PR
gh pr create \
  --repo lane711/sonicjs \
  --head mmcintosh:refactor/types-plugin-middleware \
  --base main \
  --title "refactor(types): replace 'any' with proper types in plugin-middleware.ts" \
  --body-file /tmp/pr-body-plugin-middleware.md

# Output: https://github.com/lane711/sonicjs/pull/490

# Step 5: Verify
gh pr view 490 --repo lane711/sonicjs

# Step 6: Update progress tracking (manual)
```

---

## Today's Success (Jan 8, 2026)

### Upstream PRs Created:
1. ✅ PR #489: `app.ts` - https://github.com/lane711/sonicjs/pull/489
2. ✅ PR #490: `plugin-middleware.ts` - https://github.com/lane711/sonicjs/pull/490
3. ✅ PR #491: `tinymce-plugin/index.ts` - https://github.com/lane711/sonicjs/pull/491
4. ✅ PR #492: `easy-mdx/index.ts` - https://github.com/lane711/sonicjs/pull/492

**Success Rate:** 4/4 (100%)
**Time:** ~15 minutes for all 4 PRs

---

## Tips & Best Practices

### ✅ DO:
- Wait for fork CI to pass completely before creating upstream PR
- Use the full PR template format
- Link to fork PR in the description
- Include CI results and links
- Mark checklists accurately
- Test locally before fork PR
- Document related issues

### ❌ DON'T:
- Create upstream PR if fork CI is failing
- Skip sections of the PR template
- Use vague commit messages or PR titles
- Forget to reference the issue number
- Rush multiple PRs without verification

---

## Troubleshooting

### Issue: `gh pr create` fails with escaping errors
**Solution:** Use `--body-file` instead of `--body` for multi-line content

### Issue: PR body not properly formatted
**Solution:** Review `.github/pull_request_template.md` and match it exactly

### Issue: Can't find fork PR number
**Command:** `gh pr list --repo mmcintosh/sonicjs --state open`

### Issue: Upstream CI fails but fork CI passed
**Cause:** Environment differences (e.g., secrets, database state)
**Solution:** Check upstream CI logs, may need to adjust for their environment

---

## Integration with Main Workflow

This is **Phase 7+** of the `any` type fix workflow:

1-6. [Main workflow phases - create branch, fix, test, commit, push, create fork PR]
7. **Wait for fork CI to pass** ⏳
8. **Verify all checks green** ✅ (this document, Step 1)
9. **Create upstream PR** 🚀 (this document, Steps 2-4)
10. **Monitor upstream CI** 👀
11. **Update progress docs** 📝

---

Last Updated: 2026-01-08 15:30 UTC
