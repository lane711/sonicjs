# State Document - Skip CI Issue Investigation

**Date:** January 14, 2026, 12:30 AM EST  
**Status:** Investigation Complete - Issue Identified

---

## Problem

We added `[skip ci]` to commit messages when reverting `wrangler.toml` files, but CI still ran anyway. This created unnecessary CI runs and confusion.

---

## Root Cause

According to [GitHub's official documentation](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/skip-workflow-runs):

> **Skip instructions only apply to the `push` and `pull_request` events. For example, adding `[skip ci]` to a commit message won't stop a workflow that's triggered `on: pull_request_target` from running.**

**Our workflow uses `pull_request_target`**, which means `[skip ci]` in commit messages is **completely ignored**!

### Workflow Configuration
```yaml
on:
  pull_request_target:  # ← This event IGNORES [skip ci]
    branches:
      - main
```

---

## What Happened

1. ✅ We reverted `wrangler.toml` on 3 plugin branches
2. ✅ We added `[skip ci]` to commit messages
3. ❌ CI still ran because `pull_request_target` ignores skip instructions
4. ❌ Multiple CI runs were triggered (on both `-clean` branches and original branches)

### CI Runs That Were Triggered

- `feature/ai-search-plugin-clean` - CI ran (should have been skipped)
- `feature/turnstile-plugin-clean` - CI ran (should have been skipped)
- `feature/contact-plugin-v1-clean` - CI ran (should have been skipped)
- `feature/ai-search-plugin` - CI ran (when we pushed to update PR)
- `feature/turnstile-plugin` - CI ran (when we pushed to update PR)
- `feature/contact-plugin-v1` - CI ran (when we pushed to update PR)

---

## Current State

### Branches Status

**All 3 plugin branches are prepared:**
- ✅ `feature/ai-search-plugin-clean` - wrangler.toml reverted, pushed
- ✅ `feature/turnstile-plugin-clean` - wrangler.toml reverted, pushed
- ✅ `feature/contact-plugin-v1-clean` - wrangler.toml reverted, pushed

**PRs updated on lead's repo:**
- ✅ PR #483 (AI Search) - Updated with upstream config
- ✅ PR #466 (Turnstile) - Updated with upstream config
- ✅ PR #445 (Contact Form) - Updated with upstream config

### CI Status

**Unnecessary CI runs were triggered:**
- Multiple runs on `-clean` branches (shouldn't have run)
- Multiple runs on original branches (when updating PRs)

**All runs are failing** because:
- They're trying to deploy with upstream's `wrangler.toml` config
- But they're running on YOUR fork's CI which needs YOUR config
- This is expected - these runs shouldn't have happened anyway

---

## Solutions

### Option 1: Add Skip Check in Workflow (Recommended)

Modify `.github/workflows/pr-tests.yml` to check commit messages manually:

```yaml
jobs:
  check-skip:
    runs-on: ubuntu-latest
    outputs:
      should-skip: ${{ steps.check.outputs.skip }}
    steps:
      - name: Check for skip instructions
        id: check
        run: |
          COMMIT_MSG="${{ github.event.pull_request.head.commit.message || github.event.head_commit.message }}"
          if echo "$COMMIT_MSG" | grep -qiE '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'; then
            echo "skip=true" >> $GITHUB_OUTPUT
            echo "⏭️ Skipping workflow - commit message contains skip instruction"
          else
            echo "skip=false" >> $GITHUB_OUTPUT
          fi

  test:
    needs: check-skip
    if: needs.check-skip.outputs.should-skip != 'true'
    # ... rest of workflow
```

### Option 2: Don't Push Config Reverts (Current Workaround)

Instead of committing config reverts:
- Keep config changes local only
- Or use `git commit --amend` to squash config into feature commit
- Or manually update PRs without pushing config commits

### Option 3: Accept CI Runs (Not Recommended)

Just let CI run - it will fail but that's okay since these are config-only changes.

---

## Documentation Update Needed

**File:** `WORKFLOW_UPSTREAM_REVERT_PROTOCOL.md`

**Current (Incorrect):**
> Use `[skip ci]` in commit messages for ANY commit that reverts configuration files

**Should Be:**
> **Note:** `[skip ci]` does NOT work with `pull_request_target` events. For config-only commits, either:
> 1. Add skip check to workflow (see Option 1 above)
> 2. Keep config changes local (don't commit)
> 3. Squash config into feature commit

---

## Next Steps

1. **Immediate:** Document this limitation in `WORKFLOW_UPSTREAM_REVERT_PROTOCOL.md`
2. **Short-term:** Decide which solution to implement (Option 1 recommended)
3. **Long-term:** Update workflow to respect skip instructions for `pull_request_target`

---

## Key Learnings

1. `[skip ci]` only works for `push` and `pull_request` events
2. `pull_request_target` events ignore skip instructions completely
3. Need to add manual skip checking in workflow if we want to skip CI
4. Config-only commits will always trigger CI unless we prevent it in workflow

---

## Related Files

- `.github/workflows/pr-tests.yml` - Workflow that needs skip logic
- `WORKFLOW_UPSTREAM_REVERT_PROTOCOL.md` - Protocol doc that needs updating
- `AGENT_SUMMARY_JAN13.md` - Overall project status

---

**Status:** Investigation complete. Awaiting decision on which solution to implement.
