# SonicJS Telemetry

## Overview

SonicJS collects **anonymous, privacy-respecting telemetry data** to help us understand how the framework is being used and identify areas for improvement. We are committed to transparency and user privacy.

## What We Collect

### Installation Metrics
- Installation success/failure rates
- Installation duration
- Template selection
- Operating system (macOS, Linux, Windows)
- Node.js version (major.minor only)
- Package manager (npm, yarn, pnpm, bun)

### Runtime Metrics (Future)
- Development server start/stop events
- Plugin activation counts (no plugin names)
- Collection/content creation counts (no actual data)
- Generic feature usage patterns

### Admin UI Analytics (Future)
- Page views (route patterns only, sanitized)
- Error types (sanitized, no sensitive data)

## What We DON'T Collect

We are committed to **NEVER** collecting personally identifiable information (PII):

- ❌ Email addresses
- ❌ Usernames or passwords
- ❌ IP addresses
- ❌ File paths with usernames
- ❌ Content or data you create
- ❌ API keys or secrets
- ❌ Project names or identifiers
- ❌ Any other PII

All data is anonymized using:
- Random UUIDs for installation identification
- Sanitized error messages (type only)
- Sanitized routes (patterns only)
- Hash-based project identification

## How It Works

### Installation ID
- A random UUID is generated and stored in `~/.sonicjs/telemetry.json`
- This ID is used to track installations anonymously
- The ID persists across sessions but is unique per user
- You can delete this file at any time

### Data Collection
- Events are tracked using PostHog (privacy-first analytics platform)
- Events are batched and sent asynchronously
- Telemetry never blocks or slows down your application
- Silent failures - telemetry errors never crash your app

### Data Storage
- Data is stored on PostHog's secure servers
- We use PostHog Cloud (free tier) initially
- Option to self-host if needed in the future
- Data retention: 1 year

## Opting Out

We respect your choice to disable telemetry. You can opt out in multiple ways:

### 1. Environment Variable (Recommended)

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export SONICJS_TELEMETRY=false
```

### 2. DO_NOT_TRACK Standard

```bash
# SonicJS respects the DO_NOT_TRACK standard
export DO_NOT_TRACK=1
```

### 3. CLI Flag (Future)

```bash
# During installation
npx create-sonicjs my-app --no-telemetry
```

### 4. Configuration File (Future)

```javascript
// sonicjs.config.js
export default {
  telemetry: false
}
```

### Verify Telemetry Status

```bash
# Check if telemetry is enabled
echo $SONICJS_TELEMETRY

# Remove telemetry ID
rm ~/.sonicjs/telemetry.json
```

## Why Telemetry?

Telemetry helps us:

1. **Improve Reliability**: Identify and fix installation failures
2. **Guide Development**: Understand which features are most used
3. **Support Users Better**: See common error patterns
4. **Measure Adoption**: Track SonicJS growth and engagement
5. **Optimize Performance**: Identify bottlenecks in workflows

## Privacy Policy

### Data Usage
- Data is used **only** for product improvement
- Data is **never** sold or shared with third parties
- Data is **never** used for marketing or advertising
- Data is aggregated and anonymized for analysis

### Data Access
- Only core SonicJS maintainers have access
- Access is logged and audited
- Data is never exported to external systems

### Data Deletion
- You can request data deletion at any time
- Email us at privacy@sonicjs.com
- We will delete your installation ID's data within 30 days

## Technical Details

### PostHog Integration
- **SDK**: `posthog-node` v4+
- **Endpoint**: `https://us.i.posthog.com` (PostHog Cloud US)
- **Project**: SonicJS Production
- **Batch Size**: 20 events (runtime), 1 event (CLI)
- **Flush Interval**: 10 seconds (runtime), 1 second (CLI)
- **Timeout**: 5 seconds

### Event Schema

```typescript
{
  event: 'installation_started',
  properties: {
    timestamp: '2025-11-14T10:00:00.000Z',
    version: '2.0.0',
    os: 'darwin',
    nodeVersion: '18.0',
    packageManager: 'npm',
    template: 'starter'
  },
  distinctId: 'uuid-v4-installation-id'
}
```

### Sanitization

All data passes through sanitization functions:

```typescript
// Route sanitization
'/admin/users/123' → '/admin/users/:id'
'/admin/users/550e8400-...' → '/admin/users/:id'

// Error sanitization
'TypeError: Cannot read property X' → 'TypeError'
'/Users/john/project/file.js' → '/Users/***/project/file.js'
'user@example.com' → '***@***.***'
```

## Implementation Status

### Phase 1: Foundation ✅ (Current)
- [x] Telemetry service module
- [x] Anonymous installation ID generation
- [x] Opt-out mechanism
- [x] Installation event tracking
- [x] CLI integration with notice

### Phase 2: Runtime Telemetry 🚧 (Future)
- [ ] Dev server events
- [ ] Plugin activation tracking
- [ ] Collection/content creation events

### Phase 3: Admin UI Analytics 📋 (Future)
- [ ] Page view tracking
- [ ] Feature usage tracking
- [ ] Error tracking

### Phase 4: Advanced Features 📋 (Future)
- [ ] Feature flags integration
- [ ] A/B testing framework
- [ ] Progressive rollouts

## Cost & Scaling

### PostHog Free Tier
- 1M events/month - **FREE**
- Unlimited users
- 1 year retention
- 100% features

### Estimated Usage
- Small (1K installs/month): ~6K events/month
- Medium (10K installs/month): ~60K events/month
- Large (100K installs/month): ~600K events/month

### Mitigation if Exceeding Free Tier
1. **Sampling**: Track 50% of events
2. **Self-hosting**: Use PostHog open source
3. **Custom solution**: Build lightweight alternative

## FAQ

### Is telemetry enabled by default?
Yes, but you can easily opt out using environment variables.

### Can I see what data is being sent?
Yes, set `DEBUG=true` to see all telemetry events in the console.

### What if I don't trust PostHog?
We respect that. You can disable telemetry or wait for self-hosting support.

### Does telemetry slow down my app?
No. Events are batched, sent asynchronously, and never block execution.

### Can I opt back in after opting out?
Yes, simply remove the `SONICJS_TELEMETRY=false` environment variable.

### How do I delete my data?
Email privacy@sonicjs.com with your installation ID (found in `~/.sonicjs/telemetry.json`).

## Open Source Commitment

The telemetry implementation is **100% open source**:
- Code: `packages/core/src/services/telemetry-service.ts`
- Tests: `packages/core/src/services/telemetry-service.test.ts`
- Documentation: This file

You can inspect, audit, and contribute to the telemetry code at any time.

## Feedback

We welcome feedback on our telemetry implementation:
- GitHub Issues: https://github.com/lane711/sonicjs/issues
- Email: privacy@sonicjs.com
- Discord: [Join our community](https://discord.gg/sonicjs)

## Updates

This document will be updated as we roll out new telemetry features. Check the [changelog](./CHANGELOG.md) for updates.

---

**Last Updated**: November 14, 2025
**Version**: 2.0.0
