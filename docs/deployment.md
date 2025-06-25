# Deployment Guide

This comprehensive guide covers deploying SonicJS AI to production using Cloudflare Workers, D1 database, and R2 storage.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Deployment](#database-deployment)
- [Application Deployment](#application-deployment)
- [Domain Configuration](#domain-configuration)
- [Environment Variables](#environment-variables)
- [SSL & Security](#ssl--security)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Overview

SonicJS AI is designed to run on Cloudflare's edge computing platform, providing global distribution and optimal performance:

- **Cloudflare Workers** - Application runtime
- **D1 Database** - SQLite-based edge database
- **R2 Object Storage** - File and media storage
- **Pages** - Static asset hosting (optional)
- **Analytics** - Performance monitoring

## Prerequisites

### Required Accounts & Tools

1. **Cloudflare Account** with Workers paid plan
2. **Node.js** 18+ and npm/yarn
3. **Wrangler CLI** 3.0+
4. **Git** for version control

### Cloudflare Plan Requirements

| Service | Free Tier | Paid Required |
|---------|-----------|---------------|
| Workers | 100k requests/day | Production apps |
| D1 Database | Limited | Yes |
| R2 Storage | 10GB free | Depends on usage |
| Custom Domains | Limited | Recommended |

### Install Wrangler

```bash
npm install -g wrangler@latest
wrangler --version

# Login to Cloudflare
wrangler auth login
```

## Environment Setup

### 1. Clone and Install

```bash
git clone https://github.com/your-org/sonicjs-ai.git
cd sonicjs-ai
npm install
```

### 2. Environment Configuration

Create production environment file:

```bash
cp .env.example .env.production
```

Edit `.env.production`:

```bash
# Database
DATABASE_URL="your-d1-database-url"

# Authentication
JWT_SECRET="your-super-secure-256-bit-secret"
JWT_EXPIRES_IN="7d"

# Media Storage
R2_BUCKET_NAME="your-r2-bucket"
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"

# Application
NODE_ENV="production"
APP_URL="https://your-domain.com"
ADMIN_EMAIL="admin@your-domain.com"

# Security
BCRYPT_ROUNDS="12"
RATE_LIMIT_ENABLED="true"
CORS_ORIGIN="https://your-domain.com"
```

### 3. Wrangler Configuration

Update `wrangler.toml` for production:

```toml
name = "sonicjs-ai-production"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[env.production]
name = "sonicjs-ai-production"
route = "your-domain.com/*"

# D1 Database binding
[[env.production.d1_databases]]
binding = "DB"
database_name = "sonicjs-ai-prod"
database_id = "your-d1-database-id"

# R2 Storage binding
[[env.production.r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "sonicjs-ai-media-prod"

# KV Storage binding
[[env.production.kv_namespaces]]
binding = "KV"
id = "your-kv-namespace-id"

# Environment variables
[env.production.vars]
NODE_ENV = "production"
JWT_EXPIRES_IN = "7d"
BCRYPT_ROUNDS = "12"
RATE_LIMIT_ENABLED = "true"

# Secrets (set via wrangler secret put)
# JWT_SECRET
# R2_ACCESS_KEY_ID
# R2_SECRET_ACCESS_KEY
```

## Database Deployment

### 1. Create Production Database

```bash
# Create D1 database
wrangler d1 create sonicjs-ai-prod

# Note the database ID and update wrangler.toml
```

### 2. Run Database Migrations

```bash
# Apply schema to production
wrangler d1 execute sonicjs-ai-prod --file=./schema.sql --env=production

# Or run migrations
npm run db:migrate:prod
```

### 3. Seed Initial Data

```bash
# Create admin user and default content
wrangler d1 execute sonicjs-ai-prod --file=./seed-production.sql --env=production
```

Create `seed-production.sql`:

```sql
-- Insert admin user (update with your details)
INSERT INTO users (
  id, email, password_hash, first_name, last_name, role, 
  is_active, email_verified, created_at, updated_at
) VALUES (
  'admin-uuid-here',
  'admin@your-domain.com',
  '$2b$12$your-hashed-password-here',
  'Admin',
  'User',
  'admin',
  1,
  1,
  datetime('now'),
  datetime('now')
);

-- Insert default collections
INSERT INTO collections (
  id, name, display_name, description, schema, 
  is_active, created_at, updated_at
) VALUES 
(
  'pages-collection',
  'pages',
  'Pages',
  'Static pages and content',
  '{"fields":{"content":{"type":"rich_text","label":"Content"}}}',
  1,
  datetime('now'),
  datetime('now')
),
(
  'blog-posts-collection',
  'blog-posts',
  'Blog Posts',
  'Blog articles and news',
  '{"fields":{"excerpt":{"type":"textarea","label":"Excerpt"},"content":{"type":"rich_text","label":"Content"},"featured_image":{"type":"text","label":"Featured Image URL"}}}',
  1,
  datetime('now'),
  datetime('now')
);
```

## Application Deployment

### 1. Set Production Secrets

```bash
# Set JWT secret
echo "your-super-secure-jwt-secret" | wrangler secret put JWT_SECRET --env=production

# Set R2 credentials
echo "your-r2-access-key" | wrangler secret put R2_ACCESS_KEY_ID --env=production
echo "your-r2-secret-key" | wrangler secret put R2_SECRET_ACCESS_KEY --env=production

# Set admin password (for initial setup)
echo "secure-admin-password" | wrangler secret put ADMIN_PASSWORD --env=production
```

### 2. Build and Deploy

```bash
# Build for production
npm run build

# Deploy to production
wrangler deploy --env=production

# Verify deployment
curl https://your-worker.your-subdomain.workers.dev/health
```

### 3. Verify Deployment

```bash
# Check application status
curl https://your-domain.com/api/health

# Test authentication
curl -X POST https://your-domain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@your-domain.com","password":"your-admin-password"}'
```

## Domain Configuration

### 1. Add Custom Domain

```bash
# Add route to wrangler.toml
route = "your-domain.com/*"

# Or add via Cloudflare dashboard:
# Workers & Pages > your-worker > Settings > Triggers > Custom Domains
```

### 2. DNS Configuration

In Cloudflare DNS settings:

```
Type: AAAA
Name: @
Content: 100::
Proxy: Enabled (Orange Cloud)

Type: AAAA  
Name: www
Content: 100::
Proxy: Enabled (Orange Cloud)
```

### 3. SSL Certificate

SSL is automatically handled by Cloudflare:

- **Universal SSL** is enabled by default
- **Full (Strict)** encryption mode recommended
- **HSTS** headers are automatically added

## Environment Variables

### Production Environment Variables

```bash
# Application
NODE_ENV=production
APP_URL=https://your-domain.com
ADMIN_EMAIL=admin@your-domain.com

# Database
DATABASE_URL=your-d1-connection-string

# Authentication  
JWT_SECRET=your-256-bit-secret
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# File Storage
R2_BUCKET_NAME=your-media-bucket
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
CDN_DOMAIN=your-cdn-domain.com

# Security
RATE_LIMIT_ENABLED=true
CORS_ORIGIN=https://your-domain.com
CSRF_PROTECTION=true

# Features
MEDIA_UPLOAD_ENABLED=true
EMAIL_NOTIFICATIONS=true
ANALYTICS_ENABLED=true
```

### Setting Variables

```bash
# Via Wrangler CLI
wrangler secret put VARIABLE_NAME --env=production

# Via Cloudflare Dashboard
# Workers & Pages > your-worker > Settings > Variables
```

## SSL & Security

### 1. SSL Configuration

```bash
# Force HTTPS redirects
# Add to wrangler.toml:
[env.production.routes]
pattern = "your-domain.com/*"
zone_name = "your-domain.com"
```

### 2. Security Headers

SonicJS automatically adds security headers:

```typescript
// Automatically applied in production
{
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}
```

### 3. CORS Configuration

```typescript
// Production CORS settings
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

## Monitoring & Logging

### 1. Cloudflare Analytics

Enable analytics in Cloudflare dashboard:

- **Real User Monitoring (RUM)**
- **Core Web Vitals**
- **Security insights**
- **Performance metrics**

### 2. Application Logging

```typescript
// Production logging configuration
const logger = {
  level: 'info',
  format: 'json',
  transports: ['console', 'cloudflare-logs']
}

// Log important events
console.log(JSON.stringify({
  level: 'info',
  message: 'User login',
  userId: user.id,
  timestamp: new Date().toISOString()
}))
```

### 3. Error Tracking

```typescript
// Error reporting
addEventListener('error', (event) => {
  console.error(JSON.stringify({
    level: 'error',
    message: event.error.message,
    stack: event.error.stack,
    timestamp: new Date().toISOString()
  }))
})
```

### 4. Health Checks

```bash
# Set up monitoring
curl https://your-domain.com/health

# Response
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0",
  "database": "connected",
  "storage": "available"
}
```

## Backup & Recovery

### 1. Database Backup

```bash
# Export database
wrangler d1 export sonicjs-ai-prod --output=backup-$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
wrangler d1 export sonicjs-ai-prod --output=backups/db-backup-$DATE.sql
```

### 2. Media Backup

```bash
# R2 bucket backup using rclone or aws-cli
aws s3 sync r2://your-bucket/ ./media-backup/ --endpoint-url=https://your-account-id.r2.cloudflarestorage.com
```

### 3. Automated Backups

```yaml
# GitHub Actions backup workflow
name: Backup Production Data
on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install -g wrangler
      - run: wrangler d1 export sonicjs-ai-prod --output=backup.sql
      - run: # Upload to secure storage
```

## Performance Optimization

### 1. Caching Strategy

```typescript
// Cache static assets
app.get('/static/*', cache({ maxAge: 31536000 })) // 1 year

// Cache API responses
app.get('/api/content/*', cache({ maxAge: 300 })) // 5 minutes

// Cache media files
app.get('/media/*', cache({ maxAge: 86400 })) // 1 day
```

### 2. Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_collection ON content(collection_id);
CREATE INDEX idx_media_folder ON media(folder);
CREATE INDEX idx_users_email ON users(email);
```

### 3. CDN Configuration

```bash
# Configure R2 with Cloudflare CDN
# Dashboard > R2 > your-bucket > Settings > Custom Domains
# Add: media.your-domain.com -> your-bucket.r2.dev
```

## Troubleshooting

### Common Deployment Issues

#### 1. Database Connection Errors

```bash
# Check D1 binding
wrangler d1 list

# Verify database ID in wrangler.toml
# Test connection
wrangler d1 execute sonicjs-ai-prod --command="SELECT 1" --env=production
```

#### 2. Secret Variables Not Found

```bash
# List secrets
wrangler secret list --env=production

# Re-add missing secrets
echo "your-secret" | wrangler secret put SECRET_NAME --env=production
```

#### 3. R2 Storage Issues

```bash
# Verify R2 bucket exists
wrangler r2 bucket list

# Check bucket permissions
wrangler r2 bucket get your-bucket-name
```

#### 4. Domain Routing Issues

```bash
# Check route configuration
wrangler routes list

# Verify DNS settings
dig your-domain.com
nslookup your-domain.com
```

### Debugging Production Issues

```bash
# View Worker logs
wrangler tail --env=production

# Check deployment status
wrangler deployments list --env=production

# Test specific endpoints
curl -I https://your-domain.com/api/health
```

### Performance Issues

```bash
# Analyze Worker metrics
# Cloudflare Dashboard > Analytics > Workers

# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/

# Monitor error rates
grep "error" <(wrangler tail --env=production)
```

### Rollback Procedure

```bash
# List deployments
wrangler deployments list --env=production

# Rollback to previous version
wrangler rollback --deployment-id=DEPLOYMENT_ID --env=production

# Verify rollback
curl https://your-domain.com/api/health
```

## Post-Deployment Checklist

- [ ] Application responds at custom domain
- [ ] SSL certificate is valid and active
- [ ] Database connection successful
- [ ] Authentication system working
- [ ] Media upload functionality operational
- [ ] Admin panel accessible
- [ ] Health check endpoint responding
- [ ] Error monitoring configured
- [ ] Backup system operational
- [ ] Performance metrics baseline established

## Related Documentation

- [Getting Started](getting-started.md) - Initial setup and development
- [Authentication](authentication.md) - Security configuration
- [Database](database.md) - Database management
- [Configuration](configuration.md) - Environment variables
- [Troubleshooting](troubleshooting.md) - Common issues and solutions