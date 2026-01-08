# Infowall.net Production SonicJS Instance - Project Plan

## Overview

Create a production instance of SonicJS at **infowall.net** to:
- Test features in a real-world production environment
- Validate contributions (AI Search, plugins) before submitting to upstream
- Serve as a live demo/portfolio of SonicJS capabilities
- Provide hands-on experience with deployment and operations

---

## Project Structure

### Repository Strategy

```
GitHub Organization Structure:
├── mmcintosh/sonicjs (fork)          # Development - PR contributions to lane711/sonicjs
└── mmcintosh/infowall (new)          # Production - Your live website
```

### Why Separate Repos?

| Aspect | Fork (sonicjs) | Production (infowall) |
|--------|---------------|----------------------|
| **Purpose** | Contribute to open source | Run actual website |
| **Upstream** | Syncs with lane711/sonicjs | Pulls from npm releases |
| **Branches** | Feature branches for PRs | main + staging |
| **Changes** | Generic features for everyone | Site-specific customizations |
| **Plugins** | Test/develop core plugins | Use stable + custom plugins |
| **Content** | Test/seed data | Real production content |
| **Updates** | Frequent (latest dev) | Controlled (stable releases) |

---

## Three-Environment Strategy

### 1. Development Environment

```
Location:     Local machine (localhost:8787)
Database:     Local D1 (.wrangler/state/)
R2 Bucket:    infowall-media-dev (local)
KV Cache:     infowall-cache-dev (local)
Domain:       localhost:8787
Purpose:      Local development and testing
Wrangler:     wrangler dev
```

**Workflow:**
- Rapid iteration
- Test new features
- Debug issues
- No cost (local)

### 2. Preview Environment

```
Location:     Cloudflare Workers (*.workers.dev)
Database:     infowall-preview-db (shared D1)
R2 Bucket:    infowall-media-preview
KV Cache:     infowall-cache-preview
Domain:       infowall-preview.mmcintosh.workers.dev
Purpose:      Test deployments before production
Wrangler:     wrangler deploy --env preview
```

**Workflow:**
- Test deployment process
- Share previews with others
- Validate on real Cloudflare infrastructure
- Low cost (minimal usage)

### 3. Production Environment

```
Location:     Cloudflare Workers (global edge)
Database:     infowall-prod-db (production D1)
R2 Bucket:    infowall-media-prod
KV Cache:     infowall-cache-prod
Domain:       infowall.net (custom domain)
Purpose:      Live public website
Wrangler:     wrangler deploy --env production
```

**Workflow:**
- Stable releases only
- Automated backups
- Monitoring and alerts
- Production-grade reliability

---

## Cloudflare Resources Setup

### Account Structure

```
Cloudflare Account: siddhartha (your account)
├── Domain: infowall.net
│   ├── DNS managed by Cloudflare
│   └── SSL certificate (auto)
│
├── Workers & Pages
│   ├── infowall-dev (development worker)
│   ├── infowall-preview (preview worker)
│   └── infowall-prod (production worker)
│
├── D1 Databases
│   ├── infowall-dev-db (local, free)
│   ├── infowall-preview-db ($5/month)
│   └── infowall-prod-db ($5/month)
│
├── R2 Buckets
│   ├── infowall-media-dev (free tier: 10GB)
│   ├── infowall-media-preview (free tier: 10GB)
│   └── infowall-media-prod (free tier: 10GB)
│
└── KV Namespaces
    ├── infowall-cache-dev (free tier: 1GB)
    ├── infowall-cache-preview (free tier: 1GB)
    └── infowall-cache-prod (free tier: 1GB)
```

### Cost Estimation

| Service | Usage | Cost |
|---------|-------|------|
| Workers | ~1M requests/month | $5/month (paid plan) |
| D1 Database (2x) | Preview + Prod | ~$5/month total |
| R2 Storage | <10GB | Free |
| KV Cache | <1GB | Free |
| **Total Estimated** | | **~$10/month** |

---

## Initial Setup Checklist

### Phase 1: Repository Creation

- [ ] Create new GitHub repo: `mmcintosh/infowall`
- [ ] Initialize with `create-sonicjs-app` or copy from stable release
- [ ] Set up `.gitignore` (exclude wrangler.toml with secrets)
- [ ] Create separate `wrangler.production.toml` (gitignored)
- [ ] Document setup in project README
- [ ] Set up GitHub Actions for CI/CD

### Phase 2: Cloudflare Infrastructure

**Domain Configuration:**
- [ ] Verify `infowall.net` is in Cloudflare account
- [ ] Set nameservers to Cloudflare (if not already)
- [ ] Enable "Proxy" (orange cloud) for DNS
- [ ] Set SSL/TLS mode to "Full (strict)"

**Workers Setup:**
- [ ] Create Workers: dev, preview, prod
- [ ] Configure custom routes for infowall.net
- [ ] Set up environment variables/secrets

**D1 Databases:**
- [ ] Create: `infowall-preview-db`
- [ ] Create: `infowall-prod-db`
- [ ] Run migrations on both
- [ ] Create admin user on both
- [ ] Set up backup strategy

**R2 Buckets:**
- [ ] Create: `infowall-media-preview`
- [ ] Create: `infowall-media-prod`
- [ ] Configure CORS policies
- [ ] Set up custom domain: `media.infowall.net` (optional)

**KV Namespaces:**
- [ ] Create: `infowall-cache-preview`
- [ ] Create: `infowall-cache-prod`
- [ ] Configure TTL policies

### Phase 3: Configuration Files

**wrangler.toml (committed to repo):**
```toml
name = "infowall"
main = "src/index.ts"
compatibility_date = "2024-01-15"

[env.development]
# Local development - uses local resources

[env.preview]
name = "infowall-preview"
# Preview environment bindings (IDs from setup)

[env.production]
name = "infowall-prod"
# Production bindings (kept in separate file)
```

**wrangler.production.toml (gitignored):**
```toml
# Production-specific configuration
# Kept separate to avoid committing sensitive IDs

name = "infowall-prod"

[[d1_databases]]
binding = "DB"
database_name = "infowall-prod-db"
database_id = "<prod-db-id>"

[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "infowall-media-prod"

[[kv_namespaces]]
binding = "CACHE_KV"
id = "<prod-kv-id>"

[[vectorize]]
binding = "VECTORIZE_INDEX"
index_name = "infowall-search-prod"

[ai]
binding = "AI"

[env.production]
routes = [
  { pattern = "infowall.net/*", zone_name = "infowall.net" },
  { pattern = "www.infowall.net/*", zone_name = "infowall.net" }
]
```

### Phase 4: Secrets Management

Set up secrets for each environment:

```bash
# Preview environment
wrangler secret put JWT_SECRET --env preview
wrangler secret put ADMIN_PASSWORD --env preview
wrangler secret put SMTP_PASSWORD --env preview  # if using email

# Production environment
wrangler secret put JWT_SECRET --env production
wrangler secret put ADMIN_PASSWORD --env production
wrangler secret put SMTP_PASSWORD --env production
```

### Phase 5: Initial Deployment

- [ ] Deploy to preview: `wrangler deploy --env preview`
- [ ] Test preview site thoroughly
- [ ] Verify all features work
- [ ] Create initial content
- [ ] Deploy to production: `wrangler deploy --env production --config wrangler.production.toml`
- [ ] Verify DNS and SSL
- [ ] Test production site

---

## Content Strategy

### Site Purpose: Infowall.net

**Concept:** A curated information hub/knowledge base

**Content Ideas:**
1. **Tech Articles** - Software development insights
2. **Project Showcases** - Portfolio of your work
3. **Tutorials** - Development guides and how-tos
4. **AI/ML Experiments** - AI Search demonstrations
5. **Product Reviews** - Technology reviews
6. **SonicJS Case Studies** - Real-world usage examples

### Collections Structure

```
Collections:
├── articles (main content)
│   ├── Tech tutorials
│   ├── Development guides
│   └── Opinion pieces
│
├── projects (portfolio)
│   ├── GitHub project links
│   ├── Screenshots/demos
│   └── Case studies
│
├── resources (curated links)
│   ├── External resources
│   ├── Tool recommendations
│   └── Bookmarks
│
└── pages (static pages)
    ├── About
    ├── Contact
    └── Privacy Policy
```

### AI Search Use Cases

Perfect opportunity to showcase AI Search:

1. **Semantic Article Discovery** - "Find articles about React performance"
2. **Cross-Collection Search** - Search projects AND articles
3. **Tutorial Finder** - "How do I deploy a Node.js app?"
4. **Resource Discovery** - Find related resources automatically
5. **Content Recommendations** - AI-powered "similar articles"

---

## Plugin Testing Workflow

### Test Pipeline

```
1. Develop in Fork (sonicjs)
   ├── Create feature branch
   ├── Develop plugin
   ├── Write E2E tests
   └── Submit PR to upstream

2. Test in Infowall (production instance)
   ├── Install as npm dependency OR
   ├── Copy plugin to local project
   ├── Deploy to preview environment
   ├── Test with real content
   ├── Verify performance and UX
   └── Deploy to production (if stable)

3. Gather Feedback
   ├── Monitor real-world usage
   ├── Identify issues/improvements
   └── Feed back to fork/upstream
```

### Plugin Categories

**Core Plugins (from SonicJS):**
- ✅ Authentication
- ✅ Media Manager
- ✅ Database Tools
- ✅ Cache System
- ✅ AI Search (when ready)
- ✅ Seed Data

**Custom Plugins (site-specific):**
- 📧 Newsletter Subscription
- 📊 Analytics Dashboard
- 🔖 Bookmark Manager
- 💬 Comments System
- 🔍 Advanced Filters

---

## Deployment Workflow

### Git Branch Strategy

```
Repository: mmcintosh/infowall

Branches:
├── main (production)
│   └── Deployed to infowall.net
│
├── staging (preview)
│   └── Deployed to preview.workers.dev
│
└── feature/* (development)
    └── Local testing only
```

### Deployment Commands

```bash
# Deploy to preview (from staging branch)
git checkout staging
git pull origin main
wrangler deploy --env preview

# Deploy to production (from main branch)
git checkout main
wrangler deploy --env production --config wrangler.production.toml

# Or use npm scripts
npm run deploy:preview
npm run deploy:prod
```

### CI/CD with GitHub Actions

**`.github/workflows/deploy-preview.yml`:**
```yaml
name: Deploy to Preview
on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - run: npx wrangler deploy --env preview
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

**`.github/workflows/deploy-production.yml`:**
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npx wrangler deploy --env production --config wrangler.production.toml
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

---

## Monitoring and Operations

### Health Monitoring

**Set up monitoring for:**
- [ ] Uptime monitoring (UptimeRobot or Pingdom)
- [ ] SSL certificate expiration alerts
- [ ] Error rate monitoring
- [ ] Performance metrics
- [ ] Database size and growth

**Monitoring Endpoints:**
```
https://infowall.net/api/health
https://infowall.net/api/metrics (admin-only)
```

### Backup Strategy

**Automated Backups:**
```bash
# Daily database backup (via cron or GitHub Actions)
0 2 * * * wrangler d1 export infowall-prod-db \
  --output "backups/db-$(date +\%Y\%m\%d).sql"

# Weekly R2 backup (if needed)
0 3 * * 0 wrangler r2 object list infowall-media-prod \
  | backup-script.sh
```

**Retention Policy:**
- Daily backups: Keep 7 days
- Weekly backups: Keep 4 weeks
- Monthly backups: Keep 12 months

### Disaster Recovery

**Rollback Procedure:**
1. Identify issue in production
2. Rollback Worker: `wrangler rollback --env production`
3. Restore database if needed: `wrangler d1 execute --file backup.sql`
4. Verify health endpoint
5. Monitor for errors

---

## Integration with Fork Development

### Workflow: Fork → Production

```
Development Flow:
1. Develop feature in sonicjs fork
   └── Branch: feature/my-feature

2. Test locally
   └── npm run dev in fork

3. Submit PR to upstream
   └── Wait for review/merge

4. Test in production instance
   ├── Update infowall repo to latest SonicJS release
   ├── Or manually copy feature to test early
   └── Deploy to preview environment

5. Gather production feedback
   └── Use insights to improve feature

6. Contribute improvements back
   └── New PR with production-validated changes
```

### Sharing Improvements

**When to PR back to SonicJS:**
- Bug fixes discovered in production
- Performance optimizations
- UX improvements
- Documentation updates
- New plugin features

**When to keep in infowall:**
- Site-specific customizations
- Branding/design
- Custom content types
- Private/proprietary features

---

## Timeline and Milestones

### Week 1: Infrastructure Setup
- [ ] Create GitHub repo
- [ ] Set up Cloudflare resources
- [ ] Configure domains and SSL
- [ ] Deploy to preview environment

### Week 2: Initial Deployment
- [ ] Deploy to production
- [ ] Create initial content structure
- [ ] Configure plugins
- [ ] Set up monitoring

### Week 3: Content Creation
- [ ] Write first articles
- [ ] Test AI Search with real content
- [ ] Refine collections structure
- [ ] Optimize performance

### Week 4: Polish and Launch
- [ ] Final testing
- [ ] SEO optimization
- [ ] Analytics setup
- [ ] Soft launch

### Ongoing: Operations
- [ ] Regular content updates
- [ ] Monitor performance
- [ ] Update SonicJS versions
- [ ] Test new plugins
- [ ] Contribute improvements back

---

## Success Metrics

**Technical Metrics:**
- Uptime: >99.9%
- P95 response time: <100ms
- Error rate: <0.1%
- Cache hit rate: >80%

**Content Metrics:**
- Articles published: 20+ in first 3 months
- Search queries: Track usage patterns
- User engagement: Time on site, pages per session

**Contribution Metrics:**
- Bug reports filed: Based on production usage
- PRs submitted: Features validated in production
- Documentation improvements: Real-world insights

---

## Next Steps

1. **Review this plan** - Make any adjustments
2. **Create GitHub repo** - `mmcintosh/infowall`
3. **Set up Cloudflare resources** - Follow checklist above
4. **Initial deployment** - Get preview environment running
5. **Parallel development** - Continue AI Search work in fork

---

## Decisions Made ✅

1. **Domain Status:** ✅ `infowall.net` is in Cloudflare account and ready
2. **Content Ready:** Create on the fly as site develops
3. **Design Approach:** Custom design - modern, simple, SonicJS-compatible
4. **Launch Timeline:** Soft launch for testing and iteration
5. **Budget:** ✅ ~$10/month approved for Cloudflare services

**Status:** Ready to proceed with implementation

---

## Resources

- [SonicJS Deployment Docs](https://sonicjs.com/deployment)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

---

**Document Created:** 2026-01-07
**Last Updated:** 2026-01-07
**Author:** Siddhartha (mmcintosh)
**Project:** Infowall.net Production Instance
