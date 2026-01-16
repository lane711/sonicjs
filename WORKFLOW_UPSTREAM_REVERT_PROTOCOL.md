# Upstream Send & Revert Protocol

**Date Created:** January 13, 2026  
**Purpose:** Prevent CI noise and confusion when reverting config files after upstream push

---

## The Problem

When sending PRs upstream to the lead's repository, we often need to:
1. Configure files for the lead's environment (e.g., their `wrangler.toml`)
2. Push to upstream PR
3. Revert those files back to our fork's configuration
4. The revert triggers unnecessary CI runs that create noise and confusion

---

## The Solution: Always Use `[skip ci]`

### When to Use `[skip ci]`

Use `[skip ci]` in commit messages for ANY commit that:
- Reverts configuration files after an upstream push
- Changes `wrangler.toml` back to fork-specific settings
- Updates any environment-specific files that don't need CI validation
- Is purely for branch cleanup or documentation

### Standard Workflow

```bash
# 1. Send to upstream with lead's config
git commit -m "feat: add awesome feature"
git push origin feature-branch

# 2. Lead reviews PR, all good

# 3. Revert config files to fork settings (WITH [skip ci])
git add my-sonicjs-app/wrangler.toml
git commit -m "chore: revert wrangler.toml to fork config [skip ci]"
git push origin feature-branch

# Result: No CI noise, clean history
```

### Examples of Commits That Should Use `[skip ci]`

✅ `chore: revert wrangler.toml to fork config [skip ci]`  
✅ `chore: restore CI-specific settings [skip ci]`  
✅ `docs: update project status [skip ci]`  
✅ `chore: cleanup after upstream push [skip ci]`

### Examples of Commits That Should NOT Use `[skip ci]`

❌ `feat: add new feature` (needs CI validation)  
❌ `fix: resolve bug in middleware` (needs CI validation)  
❌ `test: add E2E tests` (needs CI validation)

---

## Why This Matters

**Without `[skip ci]`:**
- ❌ Unnecessary CI runs consume resources
- ❌ Failed runs create confusion ("Did we break something?")
- ❌ Notification spam for the team
- ❌ Harder to identify actual problems

**With `[skip ci]`:**
- ✅ Clean CI history
- ✅ Only real issues trigger alerts
- ✅ Saves CI minutes/costs
- ✅ Less confusion for everyone

---

## Special Cases

### Testing Config Changes
If you DO need to test a config change on your fork's CI:
```bash
# Explicitly trigger CI (omit [skip ci])
git commit -m "test: verify new wrangler settings"
git push origin feature-branch
```

### Upstream Has Manual CI
If the lead's CI is manual (requires review before running):
- Still use `[skip ci]` for fork reverts
- The lead will manually trigger their CI when ready
- Your fork doesn't need to run CI after upstream push

---

## Quick Reference

| Action | Use [skip ci]? | Reason |
|--------|---------------|--------|
| Revert wrangler.toml after upstream push | ✅ YES | Config-only, no code changes |
| Add new feature code | ❌ NO | Needs CI validation |
| Update documentation | ✅ YES | No code to test |
| Fix bug in middleware | ❌ NO | Needs CI validation |
| Cleanup after PR merge | ✅ YES | Housekeeping only |
| Change test timeouts | ❌ NO | Tests need validation |

---

## Remember

**Default Rule:** If the change doesn't affect code behavior or test outcomes, use `[skip ci]`.

**When in Doubt:** Ask yourself: "Does this change need CI validation?" If no, use `[skip ci]`.

---

## Related Documents

- `AGENTS.md` - General agent guidelines
- `SLUG_PR_READY_FOR_LEAD.md` - Example of proper upstream workflow
- `CONTRIBUTING.md` - Contribution guidelines
