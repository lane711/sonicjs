# Fix: `next export` has been removed error

## The Problem

You're seeing this error on Cloudflare:
```
`next export` has been removed in favor of 'output: export' in next.config.js.
```

## Why This Happens

Cloudflare has saved the **wrong build command** in your project settings. It's trying to run:
```bash
npx next build && npx next export  # ❌ WRONG
```

## The Solution

This project uses **OpenNext for Cloudflare**, which requires different commands.

### Step 1: Update Build Command in Cloudflare

1. **Go to Cloudflare Dashboard**
   - Navigate to your Workers & Pages project

2. **Click Settings → Builds & deployments**

3. **Edit Build Configuration**
   - Click **Edit configuration** or **Configure build settings**

4. **Change These Settings:**

   **Framework preset:**
   ```
   None (or Custom)
   ```

   **Build command:**
   ```bash
   npx @opennextjs/cloudflare build
   ```

   Or use the npm script:
   ```bash
   npm run deploy
   ```

   **Build output directory:**
   ```
   .open-next
   ```

   **NOT** `.next`

5. **Save Changes**

6. **Retry Deployment**

### Step 2: Set Node.js Version

In **Environment Variables**, add:
- **Variable name:** `NODE_VERSION`
- **Value:** `20.18.0`

## What's Different?

| ❌ Wrong (Old Next.js) | ✅ Correct (OpenNext) |
|------------------------|----------------------|
| Framework: Next.js | Framework: None/Custom |
| Build: `next build && next export` | Build: `npx @opennextjs/cloudflare build` |
| Output: `.next` | Output: `.open-next` |
| Static site | Cloudflare Worker |

## Verify It Works

After changing settings, trigger a new deployment. You should see:

```
✅ Building with @opennextjs/cloudflare
✅ Transforming for Cloudflare Workers
✅ Deploying to workers.dev
```

## Still Having Issues?

### Method 1: Deploy from Command Line

Instead of using Cloudflare's automatic deployments:

```bash
# Install dependencies
npm install

# Authenticate with Cloudflare
npx wrangler login

# Deploy directly
npm run deploy
```

This bypasses Cloudflare's build system entirely.

### Method 2: Check Your Repository

Make sure your repository has:
- ✅ `.node-version` file (contains `20.18.0`)
- ✅ `.nvmrc` file (contains `20.18.0`)
- ✅ `wrangler.jsonc` (OpenNext configuration)
- ✅ Updated `package.json` with engines field

### Method 3: Fresh Project

If nothing works, delete the Cloudflare Pages project and create a new one with the correct settings from the start.

## Understanding OpenNext

OpenNext transforms Next.js apps to run on Cloudflare Workers:

```
Next.js App
    ↓
OpenNext Build
    ↓
Cloudflare Worker + Assets
    ↓
Deploy to Edge Network
```

This is different from static export, which just generates HTML files.

## Need More Help?

- [OpenNext Cloudflare Docs](https://opennext.js.org/cloudflare)
- [Cloudflare Pages Framework Guides](https://developers.cloudflare.com/pages/framework-guides/)
- Check `DEPLOYMENT.md` for full deployment guide
