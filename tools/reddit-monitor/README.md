# SonicJS Reddit Monitor

A Cloudflare Worker that monitors Reddit for posts relevant to SonicJS and sends email notifications.

## Features

- Runs every hour via Cloudflare Cron Triggers
- Monitors multiple subreddits for keyword matches
- Tracks seen posts to avoid duplicate notifications
- Sends formatted HTML email notifications via Resend

## Setup

### 1. Create a Resend Account (for email)

1. Go to [resend.com](https://resend.com) and create a free account
2. Add and verify your domain (or use their test domain for testing)
3. Create an API key

### 2. Create Cloudflare KV Namespace

```bash
cd tools/reddit-monitor
wrangler kv:namespace create SEEN_POSTS
```

Copy the ID and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "SEEN_POSTS"
id = "YOUR_ACTUAL_KV_ID_HERE"
```

### 3. Set Secrets

```bash
wrangler secret put RESEND_API_KEY
# Paste your Resend API key when prompted
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Deploy

```bash
npm run deploy
```

## Configuration

Edit `wrangler.toml` to customize:

```toml
[vars]
NOTIFICATION_EMAIL = "your@email.com"
KEYWORDS = "headless CMS,Strapi alternative,..."
SUBREDDITS = "webdev,nextjs,node,..."
```

## Testing

### Test Locally

```bash
npm run dev
```

Then in another terminal:

```bash
# Trigger the scheduled job manually
npm run test-cron

# Or send a test email
curl http://localhost:8787/test-email
```

### Test in Production

```bash
# View logs
wrangler tail

# Manual trigger (after deploying)
curl https://sonicjs-reddit-monitor.YOUR_SUBDOMAIN.workers.dev/__scheduled
```

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `/__scheduled` | Manually trigger the monitor |
| `/test-email` | Send a test email |

## Monitored Subreddits

- r/webdev
- r/nextjs
- r/node
- r/CloudFlare
- r/selfhosted
- r/javascript
- r/typescript
- r/reactjs

## Keywords

- headless CMS
- Strapi alternative
- Cloudflare Workers CMS
- lightweight CMS
- Node.js CMS
- edge CMS
- serverless CMS
- API framework Node

## Costs

- **Cloudflare Workers**: Free tier includes 100,000 requests/day
- **KV Storage**: Free tier includes 100,000 reads/day, 1,000 writes/day
- **Resend**: Free tier includes 3,000 emails/month

This monitor uses ~24 requests/day (hourly checks), well within free tiers.
