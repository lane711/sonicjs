# Infowall.net Implementation Guide

**Status:** Ready to begin  
**Created:** 2026-01-07  
**Target Domain:** infowall.net  
**Repository:** mmcintosh/infowall (to be created)

---

## Phase 1: Repository Setup

### Step 1.1: Create New GitHub Repository

**Via GitHub Web UI:**
1. Go to https://github.com/new
2. **Owner:** mmcintosh
3. **Repository name:** infowall
4. **Description:** "Production SonicJS instance for infowall.net - A modern information hub"
5. **Visibility:** Public (or Private if preferred)
6. **Initialize:** ✅ Add README file
7. **Add .gitignore:** Node
8. **License:** MIT (to match SonicJS)

**Or via GitHub CLI:**
```bash
gh repo create mmcintosh/infowall \
  --public \
  --description "Production SonicJS instance for infowall.net" \
  --add-readme \
  --gitignore Node \
  --license MIT
```

### Step 1.2: Clone Repository Locally

```bash
# Create workspace directory
mkdir -p ~/Documents/infowall
cd ~/Documents/infowall

# Clone the new repo
git clone https://github.com/mmcintosh/infowall.git
cd infowall
```

### Step 1.3: Initialize SonicJS Project

**Option A: Use create-sonicjs-app (recommended for stable release)**
```bash
# Will be available when SonicJS has published packages
npx create-sonicjs-app@latest .
```

**Option B: Copy from stable my-sonicjs-app template**
```bash
# Copy from your fork's stable template
cp -r ~/Documents/cursor-sonicjs/sonicjs/github/sonicjs/my-sonicjs-app/* .

# Clean up development-specific files
rm -rf .wrangler
rm -rf node_modules
rm wrangler.toml  # We'll create new ones

# Install dependencies
npm install
```

**Option C: Start from scratch with minimal setup**
```bash
# Initialize package.json
npm init -y

# Add SonicJS dependencies (when published to npm)
npm install @sonicjs-cms/core@latest

# Create basic structure
mkdir -p src/{collections,plugins,routes}
```

### Step 1.4: Create Project Structure

```bash
# Create directory structure
mkdir -p src/{collections,plugins,routes,templates,public}
mkdir -p docs
mkdir -p scripts

# Create configuration files
touch wrangler.toml
touch wrangler.preview.toml
touch wrangler.production.toml
touch .env.example
touch README.md
```

### Step 1.5: Update .gitignore

```gitignore
# Node
node_modules/
npm-debug.log
*.log

# Wrangler
.wrangler/
.dev.vars

# Environment files
.env
.env.local
wrangler.production.toml

# Build
dist/
.cache/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Backups
backups/
*.sql
*.db
```

### Step 1.6: Create Initial Commit

```bash
git add .
git commit -m "chore: initialize infowall.net project

- Set up project structure
- Configure .gitignore
- Add wrangler configuration templates

Initial setup for production SonicJS instance"

git push origin main
```

---

## Phase 2: Cloudflare Infrastructure

### Step 2.1: Verify Domain Configuration

```bash
# Check current DNS settings
wrangler pages project list

# Or via Cloudflare dashboard
# https://dash.cloudflare.com/ → infowall.net
```

**Verify:**
- ✅ Domain is active in Cloudflare
- ✅ Nameservers point to Cloudflare
- ✅ SSL/TLS mode is "Full (strict)"
- ✅ "Proxy" (orange cloud) is enabled

### Step 2.2: Create D1 Databases

```bash
# Preview database
wrangler d1 create infowall-preview-db

# Save the output - you'll need the database_id
# Example output:
# database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

# Production database
wrangler d1 create infowall-prod-db

# Save this database_id as well
```

**Record the IDs:**
```
Preview DB ID:  ___________________________________
Production DB ID: ___________________________________
```

### Step 2.3: Create R2 Buckets

```bash
# Preview bucket
wrangler r2 bucket create infowall-media-preview

# Production bucket
wrangler r2 bucket create infowall-media-prod

# Verify creation
wrangler r2 bucket list
```

**Configure CORS (optional but recommended):**
```bash
# Create cors.json
cat > cors.json << 'EOF'
{
  "allowed_origins": ["https://infowall.net", "https://preview.infowall.net"],
  "allowed_methods": ["GET", "HEAD"],
  "allowed_headers": ["*"],
  "expose_headers": ["ETag"],
  "max_age_seconds": 3600
}
EOF

# Apply to production bucket
wrangler r2 bucket cors put infowall-media-prod --cors-file cors.json
```

### Step 2.4: Create KV Namespaces

```bash
# Preview namespace
wrangler kv:namespace create "CACHE_KV" --preview

# Save the preview_id
# Example: preview_id = "x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6"

# Production namespace
wrangler kv:namespace create "CACHE_KV"

# Save the id
# Example: id = "n7o8p9q0r1s2t3u4v5w6x7y8z9a0b1c2"
```

**Record the IDs:**
```
Preview KV ID:  ___________________________________
Production KV ID: ___________________________________
```

### Step 2.5: Create Vectorize Index (for AI Search)

```bash
# Preview index
wrangler vectorize create infowall-search-preview \
  --dimensions=768 \
  --metric=cosine

# Production index
wrangler vectorize create infowall-search-prod \
  --dimensions=768 \
  --metric=cosine

# Verify
wrangler vectorize list
```

---

## Phase 3: Configuration Files

### Step 3.1: Create wrangler.toml (Development & Preview)

**File: `wrangler.toml`** (committed to git)

```toml
name = "infowall"
main = "src/index.ts"
compatibility_date = "2024-01-15"
node_compat = true

# Development (local)
[env.development]
name = "infowall-dev"

# Preview (Cloudflare Workers)
[env.preview]
name = "infowall-preview"
route = "preview.infowall.net/*"

[[env.preview.d1_databases]]
binding = "DB"
database_name = "infowall-preview-db"
database_id = "PASTE_PREVIEW_DB_ID_HERE"

[[env.preview.r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "infowall-media-preview"

[[env.preview.kv_namespaces]]
binding = "CACHE_KV"
id = "PASTE_PREVIEW_KV_ID_HERE"

[[env.preview.vectorize]]
binding = "VECTORIZE_INDEX"
index_name = "infowall-search-preview"

[env.preview.ai]
binding = "AI"

[env.preview.vars]
ENVIRONMENT = "preview"
```

### Step 3.2: Create wrangler.production.toml (Gitignored)

**File: `wrangler.production.toml`** (NOT committed - contains sensitive IDs)

```toml
name = "infowall-prod"
main = "src/index.ts"
compatibility_date = "2024-01-15"
node_compat = true

[[d1_databases]]
binding = "DB"
database_name = "infowall-prod-db"
database_id = "PASTE_PRODUCTION_DB_ID_HERE"

[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "infowall-media-prod"

[[kv_namespaces]]
binding = "CACHE_KV"
id = "PASTE_PRODUCTION_KV_ID_HERE"

[[vectorize]]
binding = "VECTORIZE_INDEX"
index_name = "infowall-search-prod"

[ai]
binding = "AI"

[vars]
ENVIRONMENT = "production"

# Custom domain routes
[[routes]]
pattern = "infowall.net/*"
zone_name = "infowall.net"

[[routes]]
pattern = "www.infowall.net/*"
zone_name = "infowall.net"
```

### Step 3.3: Create .env.example

```bash
# Example environment variables
# Copy to .env.local for local development

# Security
JWT_SECRET=your-secret-key-here-change-in-production
ADMIN_PASSWORD=change-this-password

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password

# Analytics (optional)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Feature Flags
ENABLE_AI_SEARCH=true
ENABLE_NEWSLETTER=false
```

### Step 3.4: Create package.json Scripts

Add to `package.json`:

```json
{
  "name": "infowall",
  "version": "1.0.0",
  "description": "Production SonicJS instance for infowall.net",
  "scripts": {
    "dev": "wrangler dev",
    "build": "tsc && wrangler deploy --dry-run",
    "deploy:preview": "wrangler deploy --env preview",
    "deploy:prod": "wrangler deploy --config wrangler.production.toml",
    "db:migrate:preview": "wrangler d1 migrations apply infowall-preview-db --env preview",
    "db:migrate:prod": "wrangler d1 migrations apply infowall-prod-db --config wrangler.production.toml",
    "db:backup:prod": "wrangler d1 export infowall-prod-db --output backups/db-$(date +%Y%m%d-%H%M%S).sql",
    "logs:preview": "wrangler tail --env preview",
    "logs:prod": "wrangler tail --config wrangler.production.toml",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

---

## Phase 4: Database Setup

### Step 4.1: Apply Migrations to Preview

```bash
# Navigate to project
cd ~/Documents/infowall/infowall

# Apply all migrations
npm run db:migrate:preview

# Or manually
wrangler d1 migrations apply infowall-preview-db --env preview
```

### Step 4.2: Create Admin User (Preview)

```bash
# Generate secure password
ADMIN_PASS=$(openssl rand -base64 32)
echo "Preview Admin Password: $ADMIN_PASS"

# Create admin user
wrangler d1 execute infowall-preview-db --env preview --command="
INSERT INTO users (id, email, username, first_name, last_name, role, is_active, created_at, updated_at)
VALUES (
  'admin-preview',
  'admin@infowall.net',
  'admin',
  'Admin',
  'User',
  'admin',
  1,
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
);
"
```

### Step 4.3: Apply Migrations to Production

```bash
# Apply migrations
npm run db:migrate:prod

# Or manually
wrangler d1 migrations apply infowall-prod-db --config wrangler.production.toml
```

### Step 4.4: Create Admin User (Production)

```bash
# Generate different secure password for production
PROD_ADMIN_PASS=$(openssl rand -base64 32)
echo "Production Admin Password: $PROD_ADMIN_PASS"

# Create admin user
wrangler d1 execute infowall-prod-db --config wrangler.production.toml --command="
INSERT INTO users (id, email, username, first_name, last_name, role, is_active, created_at, updated_at)
VALUES (
  'admin-prod',
  'admin@infowall.net',
  'admin',
  'Admin',
  'User',
  'admin',
  1,
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
);
"

# IMPORTANT: Save this password securely!
```

---

## Phase 5: Secrets Management

### Step 5.1: Set Preview Secrets

```bash
# Generate JWT secret for preview
PREVIEW_JWT=$(openssl rand -base64 32)

# Set secrets
echo "$PREVIEW_JWT" | wrangler secret put JWT_SECRET --env preview
echo "$ADMIN_PASS" | wrangler secret put ADMIN_PASSWORD --env preview
```

### Step 5.2: Set Production Secrets

```bash
# Generate JWT secret for production (different from preview!)
PROD_JWT=$(openssl rand -base64 32)

# Set secrets
echo "$PROD_JWT" | wrangler secret put JWT_SECRET --config wrangler.production.toml
echo "$PROD_ADMIN_PASS" | wrangler secret put ADMIN_PASSWORD --config wrangler.production.toml
```

**📝 IMPORTANT: Save these in a secure password manager:**
```
Preview Environment:
- JWT_SECRET: [saved in wrangler secrets]
- ADMIN_PASSWORD: [saved in wrangler secrets]
- Admin Email: admin@infowall.net

Production Environment:
- JWT_SECRET: [saved in wrangler secrets]
- ADMIN_PASSWORD: [saved in wrangler secrets]
- Admin Email: admin@infowall.net
```

---

## Phase 6: Initial Deployment

### Step 6.1: Test Local Development

```bash
# Start local dev server
npm run dev

# Should start on http://localhost:8787
# Test: Open browser and verify it loads

# Check health endpoint
curl http://localhost:8787/api/health
```

### Step 6.2: Deploy to Preview

```bash
# Build and deploy
npm run build
npm run deploy:preview

# Output should show:
# ✨ Deployment complete!
# 🌍 https://infowall-preview.workers.dev
```

### Step 6.3: Test Preview Deployment

```bash
# Check health
curl https://infowall-preview.workers.dev/api/health

# Access admin panel
# https://infowall-preview.workers.dev/admin

# Login with:
# Email: admin@infowall.net
# Password: [the preview password you saved]
```

### Step 6.4: Configure Custom Domain for Preview (Optional)

```bash
# Option 1: Via dashboard
# Cloudflare Dashboard → Workers → infowall-preview → Triggers → Add Custom Domain
# Enter: preview.infowall.net

# Option 2: Add to wrangler.toml
# Already configured in route = "preview.infowall.net/*"
```

### Step 6.5: Deploy to Production

```bash
# Final check
git status
git pull origin main

# Deploy to production
npm run deploy:prod

# Output:
# ✨ Deployment complete!
# 🌍 https://infowall.net
```

### Step 6.6: Verify Production Deployment

```bash
# Check health
curl https://infowall.net/api/health

# Check SSL
curl -vI https://infowall.net 2>&1 | grep -i ssl

# Access admin panel
# https://infowall.net/admin
# Login with production credentials
```

---

## Phase 7: Custom Design Implementation

### Step 7.1: Design System Planning

**Create design document:** `docs/DESIGN_SYSTEM.md`

```markdown
# Infowall.net Design System

## Design Principles
- **Modern:** Clean, contemporary aesthetics
- **Simple:** Minimal clutter, focus on content
- **Fast:** Optimized for performance
- **Accessible:** WCAG 2.1 AA compliance

## Color Palette
- Primary: #2563eb (Blue)
- Secondary: #7c3aed (Purple)
- Accent: #06b6d4 (Cyan)
- Neutral: #64748b (Slate)
- Background: #ffffff / #0f172a (Light/Dark)

## Typography
- Headings: Inter (Google Fonts)
- Body: System fonts stack
- Code: JetBrains Mono

## Layout
- Max width: 1280px
- Sidebar: 280px
- Spacing: 8px base unit

## Components
- [ ] Header/Navigation
- [ ] Hero section
- [ ] Article cards
- [ ] Sidebar widgets
- [ ] Footer
- [ ] Search bar (with AI integration)
```

### Step 7.2: Create Template Structure

```bash
# Create template directories
mkdir -p src/templates/{layouts,components,pages}

# Create base layout
touch src/templates/layouts/main.ts
touch src/templates/layouts/admin.ts

# Create components
touch src/templates/components/header.ts
touch src/templates/components/footer.ts
touch src/templates/components/article-card.ts
touch src/templates/components/search-bar.ts

# Create pages
touch src/templates/pages/home.ts
touch src/templates/pages/article.ts
touch src/templates/pages/about.ts
```

### Step 7.3: Implement Base Layout (Next Phase)

```typescript
// src/templates/layouts/main.ts
// To be implemented in next session
```

---

## Phase 8: Content Setup

### Step 8.1: Define Collections

```bash
# Create collection definitions
mkdir -p src/collections

# Main content collections
touch src/collections/articles.collection.ts
touch src/collections/projects.collection.ts
touch src/collections/resources.collection.ts
touch src/collections/pages.collection.ts
```

### Step 8.2: Create Initial Collections

```typescript
// src/collections/articles.collection.ts
export default {
  name: 'articles',
  display_name: 'Articles',
  description: 'Blog posts and technical articles',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true
    },
    {
      name: 'excerpt',
      type: 'textarea'
    },
    {
      name: 'content',
      type: 'markdown'
    },
    {
      name: 'featured_image',
      type: 'media'
    },
    {
      name: 'tags',
      type: 'array'
    },
    {
      name: 'published_at',
      type: 'datetime'
    }
  ]
}
```

---

## Phase 9: Monitoring Setup

### Step 9.1: Set Up Uptime Monitoring

**UptimeRobot (Free):**
1. Go to https://uptimerobot.com/
2. Create new monitor:
   - Type: HTTPS
   - URL: https://infowall.net/api/health
   - Interval: 5 minutes
   - Alert: Email when down

### Step 9.2: Configure Cloudflare Analytics

```bash
# Already automatic in Cloudflare Dashboard
# View at: Workers & Pages → infowall-prod → Analytics
```

### Step 9.3: Set Up Log Aggregation (Optional)

```bash
# View production logs in real-time
npm run logs:prod

# Or set up external service like:
# - Sentry (errors)
# - Datadog (metrics)
# - LogDNA (logs)
```

---

## Checkpoints & Validation

After each phase, verify:

### ✅ Phase 1-3: Configuration Complete
- [ ] Repository created and cloned
- [ ] Project structure in place
- [ ] All Cloudflare resources created
- [ ] Configuration files set up

### ✅ Phase 4-5: Infrastructure Ready
- [ ] Databases migrated
- [ ] Admin users created
- [ ] Secrets configured
- [ ] All bindings working

### ✅ Phase 6: Deployed
- [ ] Local dev works
- [ ] Preview environment accessible
- [ ] Production live at infowall.net
- [ ] SSL certificate active
- [ ] Admin panel accessible

### ✅ Phase 7-8: Content Ready
- [ ] Custom design implemented
- [ ] Collections defined
- [ ] First article published
- [ ] AI Search configured

### ✅ Phase 9: Operations
- [ ] Monitoring active
- [ ] Backups configured
- [ ] Documentation complete

---

## Next Steps After Setup

1. **Content Creation**
   - Write first article
   - Create About page
   - Add project showcases

2. **AI Search Configuration**
   - Enable AI Search plugin
   - Index existing content
   - Test semantic search

3. **Design Refinement**
   - Iterate on design
   - Add custom components
   - Optimize for mobile

4. **Performance Optimization**
   - Configure caching
   - Optimize images
   - Add CDN for media

5. **Marketing**
   - SEO optimization
   - Social media integration
   - Analytics setup

---

## Troubleshooting

### Common Issues

**Issue: `wrangler: command not found`**
```bash
npm install -g wrangler
```

**Issue: `Error: Not logged in`**
```bash
wrangler login
```

**Issue: `D1 database not found`**
- Verify database_id in wrangler.toml
- Check you're using correct environment

**Issue: `R2 bucket access denied`**
- Verify bucket name is correct
- Check R2 is enabled in your Cloudflare account

**Issue: `SSL certificate pending`**
- Wait up to 24 hours for certificate issuance
- Verify domain is proxied (orange cloud)

---

## Quick Reference Commands

```bash
# Development
npm run dev                    # Start local server

# Deployment
npm run deploy:preview         # Deploy to preview
npm run deploy:prod            # Deploy to production

# Database
npm run db:migrate:preview     # Migrate preview DB
npm run db:migrate:prod        # Migrate production DB
npm run db:backup:prod         # Backup production DB

# Logs
npm run logs:preview           # Tail preview logs
npm run logs:prod              # Tail production logs

# Wrangler
wrangler whoami                # Check login status
wrangler d1 list               # List databases
wrangler r2 bucket list        # List buckets
wrangler kv:namespace list     # List KV namespaces
```

---

**Ready to begin implementation!**

Current status: Planning complete, ready for Phase 1 execution.
