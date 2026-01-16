# Infowall Manual Approval Setup - Complete Guide

**Date:** January 14, 2026  
**Status:** ⏳ WORKFLOW PR CREATED - NEEDS GITHUB SETTINGS CONFIGURATION

---

## What Was Done

### ✅ 1. Workflow Updated
- **File:** `.github/workflows/pr-tests.yml`
- **Change:** All `pull_request_target` events now use "external" environment
- **PR:** https://github.com/infowall/infowall-sonicjs/pull/3

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

---

## What You Need To Do

### Step 1: Merge the Workflow PR

1. Go to: https://github.com/infowall/infowall-sonicjs/pull/3
2. Review the changes
3. Merge the PR to `main`

### Step 2: Configure GitHub Environment (CRITICAL)

1. **Navigate to Environment Settings:**
   - Go to: https://github.com/infowall/infowall-sonicjs/settings/environments
   - Or: Repository → Settings → Environments

2. **Create/Edit "external" Environment:**
   - If "external" doesn't exist, click **"New environment"**
   - Name it exactly: `external` (lowercase, no spaces)

3. **Add Protection Rules:**
   - ✅ **Required reviewers:** 
     - Click "Add reviewer"
     - Add yourself and/or team members who can approve CI runs
     - This is who will approve PRs before CI runs
   
   - ⚠️ **Wait timer:** Optional (leave at 0 minutes)
   
   - ✅ **Deployment branches:**
     - Select "All branches" OR
     - "Selected branches" → Add `main` (if you only want PRs to main to require approval)

4. **Save the Environment**

### Step 3: Test It Works

1. Create a test PR (or use existing PRs #1 or #2)
2. Verify CI shows: **"Waiting for review"** or **"This check requires approval"**
3. Go to the PR → Click "Review deployments" → Approve "external" environment
4. Verify CI runs after approval

---

## How It Works

### Before Approval:
```
PR Created → CI Workflow Triggers → authorize job starts → WAITS at "external" environment → Status: "Waiting for review"
```

### After Approval:
```
Reviewer approves "external" → authorize job completes → test job runs → Full CI suite executes
```

---

## Current PRs Status

**PR #1 (Contact Form):** Currently running CI (will need approval after workflow PR merges)  
**PR #2 (Turnstile):** Currently running CI (will need approval after workflow PR merges)  
**PR #3 (Workflow Change):** Needs to be merged first

---

## After Setup Complete

Once the workflow PR is merged and environment is configured:

- ✅ All new PRs will require manual approval
- ✅ Existing PRs will need approval on next update
- ✅ Matches lane711's workflow pattern
- ✅ No automatic CI runs (saves resources)

---

## Troubleshooting

**Q: CI still runs automatically after setup?**  
A: Make sure:
- Workflow PR (#3) is merged to main
- "external" environment exists and has required reviewers set
- Check workflow file on main branch has the updated logic

**Q: Can't find "external" environment?**  
A: It will be created automatically when the workflow runs, but you should create it manually in settings first to configure reviewers.

**Q: Who can approve?**  
A: Anyone you add as a "Required reviewer" in the environment settings.

---

**Next Steps:**
1. Merge PR #3 (workflow change)
2. Configure "external" environment in GitHub settings
3. Test with PR #1 or #2
