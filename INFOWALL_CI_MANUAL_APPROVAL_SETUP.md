# Infowall CI Manual Approval Setup

**Date:** January 14, 2026  
**Purpose:** Configure infowall fork to require manual approval before CI runs (like lane711)

---

## What Was Changed

**File:** `.github/workflows/pr-tests.yml`

**Change:** Updated environment logic to require approval for ALL PRs (not just forks)

**Before:**
```yaml
environment:
  name: ${{ github.event_name == 'pull_request_target' && github.event.pull_request.head.repo.full_name != github.repository && 'external' || 'internal' }}
```

**After:**
```yaml
environment:
  name: ${{ github.event_name == 'pull_request_target' && 'external' || 'internal' }}
```

**Result:** All `pull_request_target` events now use the "external" environment, which requires manual approval.

---

## GitHub Settings Required

To complete the setup, you need to configure the "external" environment in GitHub:

### Steps:

1. **Go to Repository Settings:**
   - Navigate to: https://github.com/infowall/infowall-sonicjs/settings/environments

2. **Create/Edit "external" Environment:**
   - If it doesn't exist, click "New environment"
   - Name it: `external`
   - Add protection rules:
     - ✅ **Required reviewers:** Add yourself/team members who can approve
     - ✅ **Wait timer:** Optional (e.g., 0 minutes)
     - ✅ **Deployment branches:** "All branches" or "Selected branches" (main)

3. **Save the Environment**

---

## How It Works

### Before Approval:
- PR is created → CI workflow triggers
- `authorize` job starts → **WAITS** for approval
- Status shows: "Waiting for review" or "This check requires approval"

### After Approval:
- Reviewer approves the "external" environment
- `authorize` job completes
- `test` job runs automatically
- Full CI suite executes

---

## Testing

1. Create a test PR on infowall fork
2. Verify CI shows "Waiting for approval"
3. Approve the environment
4. Verify CI runs after approval

---

## Benefits

- ✅ No automatic CI runs (saves resources)
- ✅ Review before testing (catch issues early)
- ✅ Control over when CI executes
- ✅ Matches lane711's workflow pattern

---

## Next Steps

1. ✅ Workflow updated (needs to be pushed to infowall fork)
2. ⏳ Configure "external" environment in GitHub settings
3. ⏳ Test with a PR to verify approval is required

---

**Note:** The workflow change needs to be pushed to the infowall fork's main branch for it to take effect.
