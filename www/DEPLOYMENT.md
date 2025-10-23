# Deployment Guide for SonicJS Documentation

This guide covers deploying the SonicJS documentation site to Cloudflare Workers.

## Prerequisites

- Node.js 20.0.0 or higher
- npm 10.0.0 or higher
- Cloudflare account
- Wrangler CLI (installed as dev dependency)

## Quick Deploy to Cloudflare Workers

⚠️ **IMPORTANT**: This project uses `@opennextjs/cloudflare` to deploy Next.js to Cloudflare Workers.

### 1. Install Dependencies

```bash
npm install
```

### 2. Authenticate with Cloudflare

```bash
npx wrangler login
```

### 3. Deploy

```bash
# Build and deploy in one command (RECOMMENDED)
npm run deploy
```

This will:
1. Build the Next.js site
2. Transform it for Cloudflare Workers using OpenNext
3. Deploy to Cloudflare

**What happens:**
- Creates `.open-next/` directory with Worker-compatible code
- Deploys via Wrangler
- Your site will be live at `https://sonicjs-docs.workers.dev`

## Deployment Commands

| Command | Description |
|---------|-------------|
| `npm run preview` | Build and preview locally before deploying |
| `npm run deploy` | Build and deploy to Cloudflare Workers |
| `npm run upload` | Alias for deploy command |

## Configuration Files

### wrangler.jsonc

The Cloudflare Workers configuration:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "main": ".open-next/worker.js",
  "name": "sonicjs-docs",
  "compatibility_date": "2024-12-30",
  "compatibility_flags": [
    "nodejs_compat",
    "global_fetch_strictly_public"
  ],
  "node_compat": true,
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  }
}
```

### Node Version Files

- `.node-version` - Specifies Node.js 20.18.0
- `.nvmrc` - For nvm users
- `package.json` engines field - Enforces minimum Node.js version

## Cloudflare Pages Alternative

If you prefer Cloudflare Pages over Workers:

### 1. Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create Application** → **Pages**
3. Connect your GitHub repository

### 2. Build Configuration

**Framework preset**: **None** (select Custom)

**Build command**:
```bash
npx @opennextjs/cloudflare build
```

**Build output directory**:
```
.open-next
```

**Node.js version**:
```
20.18.0
```

**Environment Variables**:
Add this in Cloudflare Pages settings:
- Name: `NODE_VERSION`
- Value: `20.18.0`

### 3. Deploy

Cloudflare Pages will automatically deploy on every push to your main branch.

### ⚠️ Critical: Remove Wrong Build Command

If you see this error:
```
`next export` has been removed...
```

This means Cloudflare has a saved build command with `next export`.

**Fix it:**
1. Go to your Cloudflare Pages project
2. Click **Settings** → **Builds & deployments**
3. Find **Build command** and click **Edit**
4. Change to: `npx @opennextjs/cloudflare build`
5. Change **Build output directory** to: `.open-next`
6. Save and retry deployment

## Vercel Alternative

For deploying to Vercel instead:

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Deploy

```bash
vercel
```

Follow the prompts to complete deployment.

## Environment-Specific Configuration

### Development
```bash
npm run dev
# Site runs at http://localhost:3010
```

### Preview (Cloudflare)
```bash
npm run preview
# Builds and runs local preview
```

### Production
```bash
npm run deploy
# Deploys to Cloudflare Workers
```

## Troubleshooting

### Node.js Version Error

**Error**: `You are using Node.js 18.17.1. For Next.js, Node.js version "^18.18.0 || ^19.8.0 || >= 20.0.0" is required.`

**Solution**: Update Node.js to version 20+

```bash
# Using nvm
nvm install 20
nvm use 20

# Using n
n 20

# Verify version
node --version  # Should show v20.x.x
```

### Build Command Error

**Error**: `next export` is not recognized

**Solution**: This project uses App Router and doesn't need `next export`. Use the proper commands:

```bash
# ✅ Correct
npm run build
npm run deploy

# ❌ Wrong
npm run build && npm run export
```

### Cloudflare Build Settings

If deploying via Cloudflare Dashboard, ensure:

**Build command**: `npm run build` (NOT `npx next build && npx next export`)

**Build output**: `.next`

**Node.js version**: `20.18.0` or higher

### Memory Issues

If you encounter memory issues during build:

```bash
# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

Add to package.json:

```json
{
  "scripts": {
    "build": "NODE_OPTIONS=--max-old-space-size=4096 next build"
  }
}
```

## Custom Domain

### Cloudflare Workers

1. Go to your Worker in Cloudflare Dashboard
2. Navigate to **Settings** → **Triggers**
3. Click **Add Custom Domain**
4. Enter your domain (e.g., `docs.sonicjs.com`)
5. Cloudflare will automatically configure DNS

### Cloudflare Pages

1. Go to your Pages project
2. Navigate to **Custom Domains**
3. Click **Set up a custom domain**
4. Enter your domain and follow instructions

## Performance Optimization

### Cloudflare Features to Enable

1. **Auto Minify** - HTML, CSS, JavaScript
2. **Brotli Compression** - Better than gzip
3. **HTTP/3** - Faster protocol
4. **Early Hints** - Improve perceived performance
5. **Rocket Loader** - Async JavaScript loading (optional)

### CDN Configuration

Cloudflare automatically provides:
- Global CDN with 300+ locations
- DDoS protection
- SSL/TLS encryption
- Web Application Firewall (WAF)

## Monitoring

### Cloudflare Analytics

View in Cloudflare Dashboard:
- Page views and requests
- Bandwidth usage
- Cache hit ratio
- Top pages and referrers
- Geographic distribution

### Web Vitals

Monitor Core Web Vitals:
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Cloudflare
        run: npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## Support

For deployment issues:
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [OpenNext Cloudflare](https://opennext.js.org/cloudflare)

## Cost

### Cloudflare Workers
- **Free Tier**: 100,000 requests/day
- **Paid**: $5/month for 10M requests

### Cloudflare Pages
- **Free Tier**: Unlimited requests, 500 builds/month
- **Paid**: $20/month for more builds

Both options are excellent for documentation sites and should stay within free tier limits.
