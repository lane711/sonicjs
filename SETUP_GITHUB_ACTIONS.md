# Setting Up GitHub Actions for SonicJS Testing

This guide shows how to set up GitHub Actions on your fork to test PRs independently.

## Prerequisites

You need Cloudflare credentials to run the E2E tests (they deploy to Cloudflare Workers).

## Step 1: Get Cloudflare Credentials

### A. Get your Account ID
1. Go to https://dash.cloudflare.com/
2. Select any of your domains/zones
3. Look in the right sidebar under "API" section
4. Copy your **Account ID** (looks like: `af25b16dfa05cb40dbc370b1708db83b`)

### B. Create an API Token
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use the **"Edit Cloudflare Workers"** template
4. **IMPORTANT**: Under **Permissions**, make sure it includes:
   - ✅ Account - Workers Scripts - Edit
   - ✅ Account - D1 - Edit (required for database creation)
   - ✅ Zone - Workers Routes - Edit (if using custom domains)
5. Under **Account Resources**, select your account
6. Under **Zone Resources**, select "All zones" or specific zones
7. Click "Continue to summary" → "Create Token"
8. **Copy the token** (you won't be able to see it again!)

## Step 2: Add Secrets to GitHub

1. Go to your fork: https://github.com/mmcintosh/sonicjs
2. Click **Settings** tab
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Click **"New repository secret"**
5. Add these two secrets:

### Secret 1: CLOUDFLARE_API_TOKEN
- Name: `CLOUDFLARE_API_TOKEN`
- Value: [paste the API token from Step 1.B]
- Click "Add secret"

### Secret 2: CLOUDFLARE_ACCOUNT_ID
- Name: `CLOUDFLARE_ACCOUNT_ID`  
- Value: [paste the Account ID from Step 1.A]
- Click "Add secret"

## Step 3: Enable GitHub Actions

1. Go to your fork's **Actions** tab
2. If prompted, click **"I understand my workflows, go ahead and enable them"**
3. You should see the "PR Tests" workflow listed

## Step 4: Test It!

Now when you push to your fork, GitHub Actions will automatically:

1. ✅ Run unit tests
2. ✅ Build the core package  
3. ✅ Create a fresh D1 database on Cloudflare
4. ✅ Run all migrations
5. ✅ Deploy to Cloudflare Workers preview
6. ✅ Run E2E tests against the preview
7. ✅ Report results

### To trigger a test run:

```bash
# Push your branch to your fork
git push origin feature/contact-plugin-v1

# Or create a PR within your fork (from feature branch to your main)
```

## Step 5: View Test Results

1. Go to your fork's **Actions** tab
2. Click on the latest workflow run
3. Click on the **"test"** job
4. Expand each step to see logs
5. Check the **"Run E2E tests against preview"** step for test results

## Troubleshooting

### "Resource location: remote" errors
- Check that your CLOUDFLARE_API_TOKEN has the right permissions
- Make sure you selected "Edit Cloudflare Workers" template

### "Account ID" errors  
- Verify CLOUDFLARE_ACCOUNT_ID is correct (no quotes, just the ID)

### "Database already exists" 
- This is normal - it reuses databases between runs
- Old preview databases are automatically reused

### Tests timeout or fail
- Check the Cloudflare dashboard to see if the Worker deployed
- Look at the preview URL in the workflow logs and test it manually
- Review the E2E test logs for specific failures

## Cost Note

Cloudflare Workers Free tier includes:
- ✅ 100,000 requests/day
- ✅ Unlimited Workers scripts
- ✅ D1 databases (up to 10 GB storage)

GitHub Actions should stay within free tier limits for normal development.

## What's Next?

Once this is working, you can:
1. Test all your changes independently  
2. Verify PRs pass before submitting to lane711/sonicjs
3. Debug E2E failures with real preview deployments
4. Iterate faster without waiting for upstream CI
