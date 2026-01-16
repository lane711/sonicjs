# Infowall CI Secrets Setup

**Date:** January 14, 2026  
**Problem:** CI failing because Cloudflare secrets are not configured  
**Error:** `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are missing

---

## The Problem

The CI workflow needs Cloudflare credentials to:
- Create D1 databases for PRs
- Deploy Workers previews
- Run E2E tests

These secrets need to be configured in the **infowall fork's GitHub repository settings**.

---

## Solution: Add Secrets to Infowall Fork

### Step 1: Get Cloudflare Credentials

You need:
1. **CLOUDFLARE_API_TOKEN** - API token with D1 and Workers permissions
2. **CLOUDFLARE_ACCOUNT_ID** - Your Cloudflare account ID

**To create API token:**
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template OR create custom token with:
   - **Account** → **Cloudflare Workers** → **Edit**
   - **Account** → **D1** → **Edit**
   - **Zone** → **Workers Routes** → **Edit** (if needed)
4. Copy the token (you'll only see it once!)

**To find Account ID:**
1. Go to: https://dash.cloudflare.com/
2. Select your account
3. Account ID is shown in the right sidebar

---

### Step 2: Add Secrets to GitHub Repository

1. **Navigate to Secrets:**
   - Go to: https://github.com/infowall/infowall-sonicjs/settings/secrets/actions
   - Or: Repository → Settings → Secrets and variables → Actions

2. **Add CLOUDFLARE_API_TOKEN:**
   - Click "New repository secret"
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: Paste your API token
   - Click "Add secret"

3. **Add CLOUDFLARE_ACCOUNT_ID:**
   - Click "New repository secret"
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: Paste your account ID
   - Click "Add secret"

---

## Verify Secrets Are Set

After adding secrets, you should see:
- ✅ `CLOUDFLARE_API_TOKEN` in the secrets list
- ✅ `CLOUDFLARE_ACCOUNT_ID` in the secrets list

**Note:** Secret values are hidden for security - you'll only see the names.

---

## After Adding Secrets

1. **Re-run failed CI:**
   - Go to PR #1 or #2
   - Click "Re-run jobs" or approve the environment (if manual approval is set up)
   - CI should now have access to secrets

2. **Future PRs:**
   - Will automatically have access to secrets
   - CI should run successfully

---

## Security Notes

- ✅ Secrets are encrypted and only accessible to GitHub Actions
- ✅ Secret values are never exposed in logs
- ✅ Only repository admins can add/edit secrets
- ✅ Use a token with minimal required permissions (D1 + Workers only)

---

## Alternative: Use Existing Secrets from mmcintosh Fork

If you have access to the mmcintosh fork's secrets, you can:
1. Copy the secret values from: https://github.com/mmcintosh/sonicjs/settings/secrets/actions
2. Add them to infowall fork using the same names

**Note:** Make sure the API token has permissions for the infowall Cloudflare account!

---

## Current Status

**PR #1 (Contact Form):** ❌ Failing - Missing secrets  
**PR #2 (Turnstile):** ❌ Will fail - Missing secrets  
**PR #3 (Workflow):** ⏳ Waiting for merge

**After adding secrets:** All PRs should pass CI ✅

---

**Next Steps:**
1. Add `CLOUDFLARE_API_TOKEN` secret
2. Add `CLOUDFLARE_ACCOUNT_ID` secret
3. Re-run CI on PRs #1 and #2
