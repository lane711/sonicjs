# PostHog Telemetry Implementation Plan for SonicJS

**Status**: Planning
**Created**: 2025-11-06
**Goal**: Track SonicJS installations, usage, and adoption metrics using PostHog Free Tier

---

## Table of Contents

1. [Overview](#overview)
2. [Why PostHog?](#why-posthog)
3. [Privacy & Ethics](#privacy--ethics)
4. [Implementation Phases](#implementation-phases)
5. [Data Collection Points](#data-collection-points)
6. [Technical Architecture](#technical-architecture)
7. [PostHog Setup](#posthog-setup)
8. [Implementation Details](#implementation-details)
9. [Testing Strategy](#testing-strategy)
10. [Rollout Plan](#rollout-plan)
11. [Metrics & KPIs](#metrics--kpis)

---

## Overview

Implement privacy-respecting telemetry to track:
- Installation success/failure rates
- Usage patterns and feature adoption
- Error rates and crash reports
- Active installations (monthly/weekly)
- Geographic distribution
- Technology stack preferences

### Success Criteria
- ✅ Track 100% of installations (opt-out)
- ✅ < 100ms telemetry overhead
- ✅ Zero PII collection
- ✅ Clear opt-out mechanism
- ✅ Stay within PostHog free tier (1M events/month)

---

## Why PostHog?

### Comparison Matrix

| Feature | PostHog | Google Analytics | Mixpanel | Custom |
|---------|---------|-----------------|----------|--------|
| Free Tier | 1M events/month | Yes | 20M events/month | Free |
| Self-hosted | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| Privacy-friendly | ✅ Yes | ⚠️ Moderate | ⚠️ Moderate | ✅ Yes |
| CLI tracking | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| Session replay | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Feature flags | ✅ Yes | ❌ No | ❌ No | ❌ No |
| Open source | ✅ Yes | ❌ No | ❌ No | N/A |
| Setup complexity | Low | Low | Low | High |
| Developer-focused | ✅ Yes | ❌ No | ⚠️ Moderate | N/A |

### PostHog Advantages
1. **Open source** - Can self-host if needed
2. **Developer-friendly** - Built for developer tools
3. **Privacy-first** - EU/GDPR compliant
4. **Generous free tier** - 1M events/month
5. **Feature flags** - Can progressively roll out features
6. **Session replay** - Debug issues in admin UI
7. **Active community** - Good documentation

### PostHog Free Tier Limits
- **1,000,000 events/month** - More than sufficient
- **Unlimited tracked users**
- **1 year data retention**
- **Core analytics features**
- **Feature flags included**

**Estimated Usage:**
- Installations: ~1,000/month = 1,000 events
- Dev server starts: ~10,000/month = 10,000 events
- Admin UI interactions: ~50,000/month = 50,000 events
- **Total: ~61,000 events/month** (6% of free tier)

---

## Privacy & Ethics

### Privacy-First Principles

1. **No PII Collection**
   - ❌ No email addresses
   - ❌ No usernames
   - ❌ No IP addresses (anonymized)
   - ❌ No file paths
   - ❌ No API keys or secrets
   - ✅ Anonymous installation IDs only

2. **Transparent Communication**
   - Show telemetry notice during installation
   - Clear documentation on what's collected
   - Easy opt-out mechanism
   - Link to privacy policy

3. **User Control**
   - `--no-telemetry` flag for installation
   - Environment variable: `SONICJS_TELEMETRY=false`
   - Config file option: `telemetry: false`
   - Can disable at any time

4. **Data Minimization**
   - Only collect what's necessary
   - Anonymize all data
   - No cross-site tracking
   - No selling data

### Telemetry Notice

Display during `npx create-sonicjs`:

```
┌─────────────────────────────────────────────────────┐
│ 📊 Anonymous Telemetry                              │
├─────────────────────────────────────────────────────┤
│ SonicJS collects anonymous usage data to improve   │
│ the product. We collect:                            │
│                                                      │
│ ✓ Installation success/failure                      │
│ ✓ Environment info (OS, Node version)              │
│ ✓ Feature usage (anonymous)                        │
│                                                      │
│ We DO NOT collect:                                  │
│ ✗ Personal information                              │
│ ✗ Project names or file paths                      │
│ ✗ API keys or secrets                              │
│                                                      │
│ Learn more: https://sonicjs.com/telemetry          │
│ Opt-out: Set SONICJS_TELEMETRY=false               │
└─────────────────────────────────────────────────────┘
```

### Legal Compliance
- ✅ GDPR compliant (no PII)
- ✅ CCPA compliant (opt-out available)
- ✅ ePrivacy Directive compliant
- ✅ Transparent data collection

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Basic telemetry infrastructure

- [ ] Set up PostHog account (cloud)
- [ ] Create telemetry service module
- [ ] Add anonymous installation ID generation
- [ ] Implement opt-out mechanism
- [ ] Add telemetry notice to create-sonicjs
- [ ] Track installation events only

**Deliverables:**
- `packages/core/src/services/telemetry-service.ts`
- `packages/create-sonicjs/src/telemetry.ts`
- Environment variable support
- Documentation

### Phase 2: Installation Tracking (Week 2)
**Goal**: Track create-sonicjs usage

**Events to track:**
- `installation_started`
- `installation_completed`
- `installation_failed`
- `setup_wizard_started`
- `setup_wizard_completed`
- `first_dev_server_start`

**Properties:**
- OS (darwin/linux/win32)
- Node version (major.minor)
- Package manager (npm/yarn/pnpm/bun)
- Installation duration
- Success/failure reason

### Phase 3: Runtime Telemetry (Week 3)
**Goal**: Track development usage

**Events:**
- `dev_server_started`
- `dev_server_stopped`
- `admin_login` (anonymous)
- `plugin_activated`
- `plugin_deactivated`
- `collection_created`
- `content_created`

**Properties:**
- Session duration
- Active plugins (count only, not names)
- Collections count
- Content items count

### Phase 4: Admin UI Analytics (Week 4)
**Goal**: Track admin interface usage

**Events:**
- `page_viewed` (route only)
- `feature_used` (generic tracking)
- `error_occurred` (sanitized)
- `migration_run`
- `deployment_triggered`

### Phase 5: Advanced Analytics (Future)
**Goal**: Feature flags and experiments

- [ ] Feature flag integration
- [ ] A/B testing framework
- [ ] Progressive rollout support
- [ ] User cohort analysis

---

## Data Collection Points

### 1. Create-SonicJS Package

**File**: `packages/create-sonicjs/src/telemetry.ts`

```typescript
// Events to track
- installation_started
  - timestamp
  - os: string
  - node_version: string
  - package_manager: 'npm' | 'yarn' | 'pnpm' | 'bun'

- installation_completed
  - duration_ms: number
  - template: 'default' | 'minimal' | 'blog'
  - success: boolean

- installation_failed
  - error_type: string
  - stage: 'download' | 'setup' | 'dependencies' | 'database'

- setup_wizard_completed
  - database: 'd1' | 'turso' | 'local'
  - authentication: boolean
  - plugins_installed: number
```

### 2. Core Package - Development

**File**: `packages/core/src/services/telemetry-service.ts`

```typescript
// Events to track
- dev_server_started
  - session_id: string (anonymous)
  - environment: 'development' | 'production'

- dev_server_stopped
  - session_duration_minutes: number

- first_time_user
  - days_since_install: number
```

### 3. Core Package - Admin UI

**File**: `packages/core/src/middleware/telemetry-middleware.ts`

```typescript
// Events to track
- page_viewed
  - route: string (e.g., '/admin/dashboard')
  - referrer: string (internal only)

- plugin_activated
  - plugin_category: string
  - is_core: boolean

- collection_created
  - field_count: number
  - has_custom_fields: boolean

- error_occurred
  - error_type: string
  - route: string
  - is_fatal: boolean
```

### 4. Core Package - Production

**File**: `packages/core/src/middleware/telemetry-middleware.ts`

```typescript
// Events to track (minimal in production)
- deployment_detected
  - platform: 'cloudflare' | 'vercel' | 'netlify' | 'other'

- health_check_ping (weekly)
  - uptime_days: number
  - request_count: number (approximate)

- error_rate_report (daily)
  - error_count: number
  - error_types: string[]
```

---

## Technical Architecture

### Installation ID Generation

```typescript
// Generate anonymous installation ID
// Stored in: ~/.sonicjs/telemetry.json or project/.sonicjs/telemetry.json

interface TelemetryConfig {
  installationId: string      // UUID v4
  createdAt: number            // Unix timestamp
  telemetryEnabled: boolean    // Default: true
  lastSeen: number            // Unix timestamp
}

// Installation ID is:
// - Anonymous (UUID, no correlation to user)
// - Persistent across sessions
// - Unique per project
// - Can be deleted by user
```

### Service Architecture

```
┌─────────────────────────────────────────────┐
│           create-sonicjs CLI                │
│  (Installation & Setup Tracking)            │
└──────────────────┬──────────────────────────┘
                   │
                   │ HTTP POST
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         Telemetry Service                   │
│  (packages/core/src/services/telemetry)    │
│                                              │
│  • Event batching                           │
│  • Retry logic                              │
│  • Offline queue                            │
│  • Rate limiting                            │
└──────────────────┬──────────────────────────┘
                   │
                   │ HTTPS
                   │
                   ▼
┌─────────────────────────────────────────────┐
│            PostHog Cloud                    │
│         (us.posthog.com)                    │
│                                              │
│  • Event storage                            │
│  • Analytics dashboard                      │
│  • Feature flags                            │
└─────────────────────────────────────────────┘
```

### Error Handling

```typescript
// Telemetry should NEVER block or crash the app
try {
  await telemetry.track('event', properties)
} catch (error) {
  // Silent fail - log to console in dev mode only
  if (process.env.NODE_ENV === 'development') {
    console.debug('Telemetry failed:', error)
  }
}
```

### Offline Support

```typescript
// Queue events when offline, send when online
class TelemetryService {
  private eventQueue: Event[] = []

  async track(event: string, properties: object) {
    if (!navigator.onLine) {
      this.eventQueue.push({ event, properties })
      return
    }

    // Flush queue
    await this.flushQueue()

    // Send current event
    await this.send(event, properties)
  }
}
```

---

## PostHog Setup

### 1. Create PostHog Account

1. Go to https://posthog.com/
2. Sign up for free account
3. Choose US or EU cloud (recommend US for better latency)
4. Create project: "SonicJS"

### 2. Get API Keys

```bash
# PostHog provides:
PROJECT_API_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxx  # Public key (safe for client-side)
PERSONAL_API_KEY=phx_xxxxxxxxxxxxxxxxxxxxxxxxxx # Private key (server-side only)
```

### 3. Configure Project Settings

**In PostHog Dashboard:**
- Project Name: `SonicJS`
- Time zone: `UTC`
- Data retention: `1 year` (free tier)
- Session recording: `Disabled` (for CLI, enabled for admin UI opt-in)
- IP anonymization: `Enabled`

### 4. Set Up Events

**Custom Events to Create:**
```typescript
// Installation Events
- installation_started
- installation_completed
- installation_failed
- setup_wizard_completed

// Development Events
- dev_server_started
- dev_server_stopped
- first_time_user
- admin_login

// Usage Events
- plugin_activated
- plugin_deactivated
- collection_created
- content_created
- page_viewed

// Error Events
- error_occurred
- migration_failed
- deployment_failed
```

### 5. Create Dashboards

**Dashboard 1: Installation Metrics**
- Total installations (last 30 days)
- Installation success rate
- Popular package managers
- OS distribution
- Node version distribution

**Dashboard 2: Active Usage**
- Daily active installations (DAI)
- Weekly active installations (WAI)
- Monthly active installations (MAI)
- Average session duration
- Retention (Day 1, Day 7, Day 30)

**Dashboard 3: Feature Adoption**
- Plugin activation rates
- Most used admin pages
- Collection creation trends
- Content creation trends

**Dashboard 4: Error Tracking**
- Error rate trends
- Most common errors
- Failed installations by reason
- Migration failure rates

---

## Implementation Details

### Package Structure

```
packages/
├── core/
│   └── src/
│       ├── services/
│       │   ├── telemetry-service.ts          # Core telemetry service
│       │   └── telemetry-service.test.ts
│       ├── middleware/
│       │   └── telemetry-middleware.ts        # Admin UI tracking
│       ├── utils/
│       │   ├── telemetry-id.ts               # Installation ID management
│       │   └── telemetry-config.ts           # Config management
│       └── types/
│           └── telemetry.ts                   # TypeScript types
│
├── create-sonicjs/
│   └── src/
│       ├── telemetry.ts                       # CLI telemetry
│       └── telemetry-notice.ts               # User notification
│
└── docs/
    └── telemetry.md                           # Public documentation
```

### Core Service Implementation

**File**: `packages/core/src/services/telemetry-service.ts`

```typescript
import { PostHog } from 'posthog-node'

interface TelemetryEvent {
  event: string
  properties?: Record<string, any>
  timestamp?: Date
}

interface TelemetryConfig {
  enabled: boolean
  installationId: string
  apiKey: string
  apiHost: string
}

export class TelemetryService {
  private client: PostHog | null = null
  private config: TelemetryConfig
  private eventQueue: TelemetryEvent[] = []
  private isOnline: boolean = true

  constructor(config: TelemetryConfig) {
    this.config = config

    if (this.config.enabled) {
      this.initializeClient()
    }
  }

  private initializeClient() {
    try {
      this.client = new PostHog(this.config.apiKey, {
        host: this.config.apiHost,
        flushAt: 20,           // Batch size
        flushInterval: 10000,  // 10 seconds
      })
    } catch (error) {
      // Silent fail
      console.debug('Failed to initialize telemetry:', error)
    }
  }

  async track(event: string, properties?: Record<string, any>): Promise<void> {
    // Skip if telemetry disabled
    if (!this.config.enabled || !this.client) {
      return
    }

    try {
      // Add default properties
      const eventProperties = {
        ...properties,
        $lib: 'sonicjs',
        $lib_version: this.getVersion(),
        environment: process.env.NODE_ENV || 'production',
        timestamp: new Date().toISOString(),
      }

      // Track event
      this.client.capture({
        distinctId: this.config.installationId,
        event,
        properties: eventProperties,
      })

      // Flush immediately for critical events
      if (this.isCriticalEvent(event)) {
        await this.client.flush()
      }
    } catch (error) {
      // Queue for retry if failed
      this.eventQueue.push({ event, properties, timestamp: new Date() })

      if (process.env.NODE_ENV === 'development') {
        console.debug('Telemetry event queued:', event)
      }
    }
  }

  async identify(properties?: Record<string, any>): Promise<void> {
    if (!this.config.enabled || !this.client) {
      return
    }

    try {
      this.client.identify({
        distinctId: this.config.installationId,
        properties: {
          ...properties,
          first_seen: new Date().toISOString(),
        },
      })
    } catch (error) {
      // Silent fail
    }
  }

  async shutdown(): Promise<void> {
    if (!this.client) {
      return
    }

    try {
      // Flush remaining events
      await this.flushQueue()
      await this.client.shutdown()
    } catch (error) {
      // Silent fail
    }
  }

  private async flushQueue(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return
    }

    const events = [...this.eventQueue]
    this.eventQueue = []

    for (const event of events) {
      await this.track(event.event, event.properties)
    }
  }

  private isCriticalEvent(event: string): boolean {
    return [
      'installation_completed',
      'installation_failed',
      'error_occurred',
    ].includes(event)
  }

  private getVersion(): string {
    // Get from package.json
    return process.env.SONICJS_VERSION || '2.0.0'
  }
}

// Singleton instance
let telemetryInstance: TelemetryService | null = null

export function initializeTelemetry(config: TelemetryConfig): TelemetryService {
  if (!telemetryInstance) {
    telemetryInstance = new TelemetryService(config)
  }
  return telemetryInstance
}

export function getTelemetry(): TelemetryService | null {
  return telemetryInstance
}
```

### Installation ID Management

**File**: `packages/core/src/utils/telemetry-id.ts`

```typescript
import { randomUUID } from 'crypto'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import os from 'os'

interface TelemetryIdConfig {
  installationId: string
  createdAt: number
  telemetryEnabled: boolean
  lastSeen: number
}

const CONFIG_DIR = join(os.homedir(), '.sonicjs')
const CONFIG_FILE = join(CONFIG_DIR, 'telemetry.json')

export function getOrCreateInstallationId(): string {
  try {
    // Check if config exists
    if (existsSync(CONFIG_FILE)) {
      const config = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')) as TelemetryIdConfig

      // Update last seen
      config.lastSeen = Date.now()
      writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))

      return config.installationId
    }

    // Create new installation ID
    const installationId = randomUUID()
    const config: TelemetryIdConfig = {
      installationId,
      createdAt: Date.now(),
      telemetryEnabled: true,
      lastSeen: Date.now(),
    }

    // Ensure directory exists
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true })
    }

    // Save config
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))

    return installationId
  } catch (error) {
    // Fallback to random ID (not persistent)
    return randomUUID()
  }
}

export function isTelemetryEnabled(): boolean {
  // Check environment variable first
  if (process.env.SONICJS_TELEMETRY === 'false') {
    return false
  }

  // Check config file
  try {
    if (existsSync(CONFIG_FILE)) {
      const config = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')) as TelemetryIdConfig
      return config.telemetryEnabled
    }
  } catch (error) {
    // Ignore errors
  }

  // Default: enabled
  return true
}

export function disableTelemetry(): void {
  try {
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true })
    }

    let config: TelemetryIdConfig

    if (existsSync(CONFIG_FILE)) {
      config = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'))
    } else {
      config = {
        installationId: randomUUID(),
        createdAt: Date.now(),
        telemetryEnabled: false,
        lastSeen: Date.now(),
      }
    }

    config.telemetryEnabled = false
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))

    console.log('✅ Telemetry disabled successfully')
  } catch (error) {
    console.error('Failed to disable telemetry:', error)
  }
}
```

### Create-SonicJS Integration

**File**: `packages/create-sonicjs/src/telemetry.ts`

```typescript
import { TelemetryService } from './telemetry-service'
import { getOrCreateInstallationId, isTelemetryEnabled } from './telemetry-id'

const POSTHOG_API_KEY = 'phc_YOUR_API_KEY_HERE'
const POSTHOG_HOST = 'https://us.posthog.com'

let telemetry: TelemetryService | null = null

export function initTelemetry() {
  if (!isTelemetryEnabled()) {
    return
  }

  const installationId = getOrCreateInstallationId()

  telemetry = new TelemetryService({
    enabled: true,
    installationId,
    apiKey: POSTHOG_API_KEY,
    apiHost: POSTHOG_HOST,
  })
}

export async function trackInstallationStart() {
  if (!telemetry) return

  await telemetry.track('installation_started', {
    os: process.platform,
    node_version: process.version,
    package_manager: detectPackageManager(),
  })
}

export async function trackInstallationComplete(durationMs: number, template: string) {
  if (!telemetry) return

  await telemetry.track('installation_completed', {
    duration_ms: durationMs,
    template,
    success: true,
  })
}

export async function trackInstallationFailed(error: Error, stage: string) {
  if (!telemetry) return

  await telemetry.track('installation_failed', {
    error_type: error.name,
    error_message: sanitizeError(error.message),
    stage,
  })
}

function detectPackageManager(): string {
  if (process.env.npm_config_user_agent?.includes('yarn')) return 'yarn'
  if (process.env.npm_config_user_agent?.includes('pnpm')) return 'pnpm'
  if (process.env.npm_config_user_agent?.includes('bun')) return 'bun'
  return 'npm'
}

function sanitizeError(message: string): string {
  // Remove file paths and sensitive info
  return message
    .replace(/\/[^\s]+/g, '[PATH]')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
    .substring(0, 200) // Limit length
}
```

### CLI Telemetry Notice

**File**: `packages/create-sonicjs/src/telemetry-notice.ts`

```typescript
import chalk from 'chalk'

export function showTelemetryNotice() {
  console.log('')
  console.log(chalk.cyan('┌─────────────────────────────────────────────────────┐'))
  console.log(chalk.cyan('│') + chalk.bold(' 📊 Anonymous Telemetry                              ') + chalk.cyan('│'))
  console.log(chalk.cyan('├─────────────────────────────────────────────────────┤'))
  console.log(chalk.cyan('│') + ' SonicJS collects anonymous usage data to improve   ' + chalk.cyan('│'))
  console.log(chalk.cyan('│') + ' the product. We collect:                            ' + chalk.cyan('│'))
  console.log(chalk.cyan('│') + '                                                      ' + chalk.cyan('│'))
  console.log(chalk.cyan('│') + chalk.green(' ✓ Installation success/failure                      ') + chalk.cyan('│'))
  console.log(chalk.cyan('│') + chalk.green(' ✓ Environment info (OS, Node version)              ') + chalk.cyan('│'))
  console.log(chalk.cyan('│') + chalk.green(' ✓ Feature usage (anonymous)                        ') + chalk.cyan('│'))
  console.log(chalk.cyan('│') + '                                                      ' + chalk.cyan('│'))
  console.log(chalk.cyan('│') + ' We DO NOT collect:                                  ' + chalk.cyan('│'))
  console.log(chalk.cyan('│') + chalk.red(' ✗ Personal information                              ') + chalk.cyan('│'))
  console.log(chalk.cyan('│') + chalk.red(' ✗ Project names or file paths                      ') + chalk.cyan('│'))
  console.log(chalk.cyan('│') + chalk.red(' ✗ API keys or secrets                              ') + chalk.cyan('│'))
  console.log(chalk.cyan('│') + '                                                      ' + chalk.cyan('│'))
  console.log(chalk.cyan('│') + ' Learn more: ' + chalk.underline('https://sonicjs.com/telemetry') + '          ' + chalk.cyan('│'))
  console.log(chalk.cyan('│') + ' Opt-out: Set ' + chalk.bold('SONICJS_TELEMETRY=false') + '               ' + chalk.cyan('│'))
  console.log(chalk.cyan('└─────────────────────────────────────────────────────┘'))
  console.log('')
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// packages/core/src/services/telemetry-service.test.ts

describe('TelemetryService', () => {
  it('should not track when disabled', async () => {
    const service = new TelemetryService({
      enabled: false,
      installationId: 'test-id',
      apiKey: 'test-key',
      apiHost: 'https://test.com',
    })

    await service.track('test_event')

    // Assert no network calls made
  })

  it('should queue events when offline', async () => {
    const service = new TelemetryService({ enabled: true, ... })

    // Simulate offline
    global.navigator = { onLine: false }

    await service.track('test_event')

    // Assert event queued
  })

  it('should flush queue when online', async () => {
    // Test implementation
  })

  it('should sanitize error messages', () => {
    const error = new Error('/Users/john/project/file.ts: Error occurred')
    const sanitized = sanitizeError(error.message)

    expect(sanitized).not.toContain('/Users')
    expect(sanitized).toContain('[PATH]')
  })
})
```

### Integration Tests

```typescript
// packages/create-sonicjs/src/telemetry.integration.test.ts

describe('Create-SonicJS Telemetry', () => {
  it('should track installation start', async () => {
    const mockPostHog = jest.fn()

    await trackInstallationStart()

    expect(mockPostHog).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'installation_started',
        properties: expect.objectContaining({
          os: expect.any(String),
          node_version: expect.any(String),
        }),
      })
    )
  })
})
```

### E2E Tests

```typescript
// tests/telemetry.e2e.test.ts

describe('Telemetry E2E', () => {
  it('should complete installation with telemetry', async () => {
    // Run create-sonicjs with telemetry enabled
    const { stdout } = await exec('npx create-sonicjs test-app')

    // Check telemetry notice shown
    expect(stdout).toContain('Anonymous Telemetry')

    // Verify events sent to PostHog (use test project)
  })

  it('should respect opt-out flag', async () => {
    // Run with SONICJS_TELEMETRY=false
    const { stdout } = await exec('SONICJS_TELEMETRY=false npx create-sonicjs test-app')

    // Verify no events sent
  })
})
```

---

## Rollout Plan

### Phase 1: Alpha Testing (Week 1)
**Audience**: Internal team only

- [ ] Deploy telemetry to development branch
- [ ] Test with 5-10 internal installations
- [ ] Verify events appearing in PostHog
- [ ] Test opt-out mechanism
- [ ] Validate no PII collected

**Success Criteria:**
- 100% of test installations tracked
- Zero PII in collected data
- Opt-out works correctly
- No performance impact

### Phase 2: Beta Testing (Week 2)
**Audience**: Discord community (~50 users)

- [ ] Announce beta program in Discord
- [ ] Deploy to beta branch
- [ ] Collect feedback on telemetry notice
- [ ] Monitor PostHog for anomalies
- [ ] Iterate on messaging

**Success Criteria:**
- < 10% opt-out rate
- Positive feedback on transparency
- No privacy concerns raised
- Stable telemetry collection

### Phase 3: Public Launch (Week 3)
**Audience**: All users

- [ ] Merge to main branch
- [ ] Publish to npm
- [ ] Announce in documentation
- [ ] Update website with telemetry policy
- [ ] Monitor PostHog dashboards

**Success Criteria:**
- Successful tracking of installations
- < 20% opt-out rate
- No major issues reported

### Phase 4: Optimization (Week 4+)
**Ongoing improvements**

- [ ] Analyze collected data
- [ ] Create insights dashboards
- [ ] Identify improvement opportunities
- [ ] Add feature flags for experiments

---

## Metrics & KPIs

### Installation Metrics
- **Total Installations**: Count per day/week/month
- **Installation Success Rate**: % successful / total attempts
- **Installation Duration**: Average time to complete
- **Platform Distribution**: macOS vs Linux vs Windows
- **Node Version Distribution**: Which versions are most common
- **Package Manager Usage**: npm vs yarn vs pnpm vs bun

### Adoption Metrics
- **DAI** (Daily Active Installations): Unique installations per day
- **WAI** (Weekly Active Installations): Unique installations per week
- **MAI** (Monthly Active Installations): Unique installations per month
- **Retention Rate**: % users active after 1/7/30 days
- **Churn Rate**: % users who stop using

### Feature Usage
- **Plugin Activation Rate**: % installations with plugins activated
- **Popular Plugins**: Which plugins are activated most
- **Admin UI Usage**: Most visited pages
- **Collection Creation**: Average collections per installation
- **Content Creation**: Average content items per installation

### Error Tracking
- **Installation Failure Rate**: % failed installations
- **Error Categories**: Types of errors encountered
- **Most Common Errors**: Top 10 error messages
- **Migration Failures**: % failed database migrations

### Geographic Distribution
- **Country**: Top countries using SonicJS
- **Region**: Geographic distribution
- **Timezone**: When are people using SonicJS

### Performance Metrics
- **Telemetry Overhead**: < 100ms per event
- **Event Delivery Rate**: % events successfully delivered
- **PostHog API Latency**: Average response time

---

## Cost Analysis

### PostHog Free Tier
- **1M events/month** - Free
- **Unlimited users** - Free
- **1 year retention** - Free

### Estimated Costs (If Exceeding Free Tier)

**Scenario 1: Small Growth (10K installations/month)**
- Events: ~100K/month
- Cost: $0 (well within free tier)

**Scenario 2: Medium Growth (50K installations/month)**
- Events: ~500K/month
- Cost: $0 (still within free tier)

**Scenario 3: Large Growth (200K installations/month)**
- Events: ~2M/month
- Cost: ~$150/month (beyond free tier)

**Mitigation Strategies:**
1. Sample events if approaching limit (e.g., track 50% of sessions)
2. Self-host PostHog (open source, $0 cost)
3. Reduce tracked events (e.g., only track critical events)
4. Switch to custom lightweight solution

---

## Documentation

### Public Documentation

**File**: `docs/telemetry.md`

```markdown
# Telemetry

SonicJS collects anonymous usage data to help improve the product.

## What We Collect

We collect anonymous, aggregated data about how SonicJS is used:

- ✅ Installation success/failure rates
- ✅ Operating system and Node.js version
- ✅ Package manager used (npm/yarn/pnpm/bun)
- ✅ Feature usage (which admin pages are visited)
- ✅ Error rates and types
- ✅ Plugin activation rates

## What We DON'T Collect

We do **NOT** collect any personally identifiable information:

- ❌ Email addresses or usernames
- ❌ Project names or code
- ❌ File paths or directory structures
- ❌ API keys or secrets
- ❌ Database contents
- ❌ IP addresses (anonymized)

## How to Opt Out

### Method 1: Environment Variable
Set the environment variable:
```bash
export SONICJS_TELEMETRY=false
```

### Method 2: During Installation
Use the `--no-telemetry` flag:
```bash
npx create-sonicjs my-app --no-telemetry
```

### Method 3: After Installation
Run the disable command:
```bash
npx sonicjs telemetry disable
```

## Privacy Policy

Read our full privacy policy at: https://sonicjs.com/privacy

## Open Source

SonicJS telemetry implementation is open source. You can review the code at:
https://github.com/lane711/sonicjs/tree/main/packages/core/src/services/telemetry
```

---

## Next Steps

### Immediate Actions

1. **Week 1: Setup**
   - [ ] Create PostHog account
   - [ ] Set up project and get API keys
   - [ ] Create initial dashboards
   - [ ] Review and approve this plan

2. **Week 2: Implementation**
   - [ ] Implement telemetry service
   - [ ] Add to create-sonicjs
   - [ ] Write tests
   - [ ] Internal testing

3. **Week 3: Beta Launch**
   - [ ] Deploy to beta branch
   - [ ] Announce to Discord community
   - [ ] Collect feedback
   - [ ] Iterate based on feedback

4. **Week 4: Production Launch**
   - [ ] Merge to main
   - [ ] Publish to npm
   - [ ] Monitor dashboards
   - [ ] Document learnings

### Future Enhancements

- [ ] Feature flags for gradual rollouts
- [ ] A/B testing framework
- [ ] User cohort analysis
- [ ] Funnel analysis (installation → first content)
- [ ] Session replay for admin UI debugging
- [ ] Performance monitoring
- [ ] Custom event tracking API for plugins

---

## Questions & Answers

### Q: Why not just use npm download stats?
**A**: NPM stats only show downloads, not actual usage or success rates. We need to know:
- Did the installation succeed?
- Are people actually using SonicJS?
- Which features are popular?
- What errors are users encountering?

### Q: Can users opt out?
**A**: Yes! Three ways:
1. Environment variable: `SONICJS_TELEMETRY=false`
2. CLI flag: `--no-telemetry`
3. Command: `npx sonicjs telemetry disable`

### Q: What if users are concerned about privacy?
**A**: We're transparent:
- Show notice during installation
- Link to full documentation
- Open source implementation
- No PII collection
- Easy opt-out

### Q: What happens if PostHog goes down?
**A**: Telemetry fails gracefully:
- Events are queued
- App continues working normally
- No error messages shown to users
- Queued events sent when service recovers

### Q: Will this slow down installations?
**A**: No:
- Telemetry runs asynchronously
- Events are batched
- Timeout of 5 seconds
- Won't block installation

### Q: What if we exceed the free tier?
**A**: We have options:
1. Sample events (track 50% instead of 100%)
2. Self-host PostHog (open source, free)
3. Reduce tracked events
4. Build custom lightweight solution

---

## Appendix

### A. PostHog API Reference

```typescript
// Capture event
posthog.capture({
  distinctId: 'installation-id',
  event: 'event_name',
  properties: {
    key: 'value',
  },
})

// Identify user
posthog.identify({
  distinctId: 'installation-id',
  properties: {
    os: 'darwin',
    node_version: '20.0.0',
  },
})

// Feature flags
const isEnabled = await posthog.isFeatureEnabled('new-feature', 'installation-id')

// Flush events
await posthog.flush()

// Shutdown
await posthog.shutdown()
```

### B. Event Schema

```typescript
interface TelemetryEvent {
  // PostHog standard fields
  distinctId: string          // Installation ID
  event: string               // Event name
  properties: {
    // Default properties (all events)
    $lib: 'sonicjs'
    $lib_version: string
    timestamp: string
    environment: string

    // Custom properties (event-specific)
    [key: string]: any
  }
  timestamp?: string
  $set?: Record<string, any>   // Set user properties
  $set_once?: Record<string, any>
}
```

### C. Useful Links

- PostHog Documentation: https://posthog.com/docs
- PostHog Node SDK: https://posthog.com/docs/libraries/node
- PostHog Feature Flags: https://posthog.com/docs/feature-flags
- PostHog Session Replay: https://posthog.com/docs/session-replay
- GDPR Compliance: https://posthog.com/docs/privacy/gdpr-compliance

---

**End of Plan**

Last Updated: 2025-11-06
