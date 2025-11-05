# Email Plugin Implementation Plan

## Overview
Email plugin for SonicJS to handle transactional emails including registration, verification, password reset, one-time codes, and other user-triggered communications.

**Simplified MVP Approach:**
- Use **Resend only** (no provider abstraction in v1)
- **Built-in templates** with minimal customization
- Developers can only customize:
  - Email text/copy
  - Logo/branding image
- No HTML template editing in v1
- Focus on getting emails working quickly

## Core Components

### 1. Email Service Integration

**Provider: Resend (Only)**
- Simple REST API compatible with Workers
- Free tier: 100 emails/day, 3,000/month
- Good developer experience
- Works natively with edge runtime
- Use Resend's built-in React Email templates

**Configuration:**
- Store API key in environment variables/Cloudflare secrets
- No provider abstraction needed for MVP

### 2. Simplified Plugin Structure

```
packages/core/src/plugins/available/email-plugin/
├── index.ts                 # Plugin registration & manifest
├── routes.ts               # Admin UI routes (minimal)
├── services/
│   └── resend-service.ts   # Direct Resend integration
├── templates/
│   └── email-config.ts     # Text content & logo URL config
├── migrations/
│   └── 001_email_settings.sql  # Just settings table
└── admin/
    ├── settings.template.ts    # Simple settings page
    └── logs.template.ts        # Basic email logs view
```

**Removed for MVP:**
- ❌ No template editor (uses Resend's built-in templates)
- ❌ No queue system (direct send, simple retry)
- ❌ No complex template rendering
- ❌ No provider abstraction

### 3. Database Schema (Simplified for MVP)

#### email_settings
```sql
CREATE TABLE email_settings (
  id TEXT PRIMARY KEY,
  api_key TEXT NOT NULL, -- Encrypted Resend API key
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL,
  reply_to TEXT,
  logo_url TEXT, -- URL to branding logo
  is_active INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

#### email_logs
```sql
CREATE TABLE email_logs (
  id TEXT PRIMARY KEY,
  to_email TEXT NOT NULL,
  from_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_name TEXT NOT NULL, -- registration, password-reset, etc.
  status TEXT NOT NULL, -- sent, failed
  provider_response TEXT, -- JSON response from Resend
  error_message TEXT,
  sent_at INTEGER,
  created_at INTEGER NOT NULL
);
```

**Removed for MVP:**
- ❌ email_templates table (using code-based templates)
- ❌ email_queue table (direct send, no queue)

## 4. Key Features (Simplified for MVP)

### Template Customization
- **Text/Copy Customization**: Simple config-based text strings
- **Logo Customization**: URL to branding logo
- **Built-in Templates**: Use Resend's React Email templates
- **Variable Substitution**: Basic variable replacement for dynamic content

### Sending Logic

```typescript
interface SendEmailOptions {
  to: string
  template: 'registration' | 'password-reset' | 'verification' | 'one-time-code'
  data: Record<string, any>
}

// Usage in auth flows
await emailService.send({
  to: user.email,
  template: 'registration',
  data: {
    name: user.name,
    verificationLink: `${baseUrl}/verify?token=${token}`,
    expiresIn: '24 hours'
  }
})
```

### Simple Retry Logic
- **Direct send** with Resend API
- **Basic retry** on failure (up to 3 attempts)
- **Error logging** for debugging

### Template Types

1. **Registration Confirmation**
   - Welcome message
   - Account activation link
   - Getting started info

2. **Email Verification**
   - Verification link or code
   - Expiration notice
   - Resend instructions

3. **Password Reset**
   - Reset link with token
   - Security notice
   - Expiration time

4. **One-Time Code**
   - 6-digit code for 2FA/login
   - Expiration time
   - Security warning

5. **Welcome Email**
   - Sent after verification
   - Product introduction
   - Quick start guide

6. **Generic Transactional**
   - Account updates
   - Security alerts
   - System notifications

## 5. Integration Points

### Auth Routes Integration

```typescript
// In packages/core/src/routes/auth.ts

// Registration
const token = crypto.randomUUID()
await emailService.send({
  to: email,
  template: 'registration',
  data: {
    name: username,
    verificationLink: `${baseUrl}/verify?token=${token}`,
    supportEmail: 'support@example.com'
  }
})

// Password Reset
await emailService.send({
  to: user.email,
  template: 'password-reset',
  data: {
    name: user.username,
    resetLink: `${baseUrl}/reset?token=${resetToken}`,
    expiresIn: '1 hour',
    ipAddress: c.req.header('cf-connecting-ip')
  }
})

// One-time code (2FA)
const code = generateSixDigitCode()
await emailService.send({
  to: user.email,
  template: 'one-time-code',
  data: {
    code: code,
    expiresIn: '10 minutes',
    device: userAgent
  }
})
```

### Plugin Hooks

```typescript
// Allow other plugins to send emails
export const emailPlugin = {
  hooks: {
    'user:registered': async (user) => {
      await emailService.send({
        to: user.email,
        template: 'registration',
        data: { name: user.name }
      })
    },
    'user:verified': async (user) => {
      await emailService.send({
        to: user.email,
        template: 'welcome',
        data: { name: user.name }
      })
    }
  }
}
```

## 6. Admin UI Pages (Simplified for MVP)

### Settings (`/admin/plugins/email/settings`)
- **Resend API Key** (encrypted storage)
- **From Email** configuration
- **From Name** configuration
- **Reply-to** address (optional)
- **Logo URL** for branding
- **Test Email** button to verify setup
- Simple form with save/reset buttons

### Email Logs (`/admin/plugins/email/logs`)
- **Simple table** of sent emails
- Columns: To, Template, Status, Date
- **Filter by status** (sent/failed)
- **View details** (error messages if failed)
- Basic pagination

**Removed for MVP:**
- ❌ Template editor (code-based only)
- ❌ Queue management (no queue system)
- ❌ Advanced filtering and exports

## 7. Security Considerations

### Data Security
- **Encrypt API keys** at rest using Cloudflare secrets
- **Sanitize variables** before sending (XSS prevention)
- **Validate email addresses** (basic RFC 5322)
- **Secure token generation** (crypto.randomUUID)
- **Token expiration** enforcement

### Email Authentication
- **Domain verification** with Resend
- **SPF/DKIM** setup guidance in docs
- Resend handles authentication automatically

## 8. Implementation Phases (Simplified)

### Phase 1: MVP (1 day)
- [ ] Basic plugin structure and manifest
- [ ] Resend service integration (direct API calls)
- [ ] Database migration (settings & logs tables)
- [ ] Code-based template definitions
- [ ] Registration email template
- [ ] Password reset email template
- [ ] Basic variable substitution
- [ ] Settings page (API key, from email, logo URL)

### Phase 2: Core Features (1 day)
- [ ] Email verification template
- [ ] One-time code template
- [ ] Simple retry logic (3 attempts)
- [ ] Email logs UI (table view)
- [ ] Test email functionality
- [ ] Error logging

### Phase 3: Polish & Production (1 day)
- [ ] Text customization config
- [ ] Logo integration
- [ ] Basic error handling
- [ ] Documentation
- [ ] Integration with auth routes
- [ ] E2E tests for email flows

### Future Enhancements (Post-MVP)
- [ ] Template HTML editing
- [ ] Queue system for batching
- [ ] Advanced analytics
- [ ] Multi-provider support
- [ ] Template versioning
- [ ] Webhook handling

## 9. Resend Integration

### Simple Direct Integration

```typescript
// packages/core/src/plugins/available/email-plugin/services/resend-service.ts

export class ResendService {
  constructor(private apiKey: string) {}

  async send(options: {
    to: string
    from: string
    subject: string
    html: string
  }): Promise<{ id: string; success: boolean; error?: string }> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: options.from,
          to: options.to,
          subject: options.subject,
          html: options.html
        })
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          id: '',
          success: false,
          error: result.message || 'Failed to send email'
        }
      }

      return {
        id: result.id,
        success: true
      }
    } catch (error) {
      return {
        id: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
```

## 10. Testing Strategy (Simplified)

### Unit Tests
- Variable substitution in templates
- Email address validation
- Retry logic
- Settings encryption

### E2E Tests
- Registration flow with email
- Password reset flow
- Email verification flow
- One-time code flow
- Settings page save/test

## 11. Configuration Example

```typescript
// wrangler.toml or .env
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Your App Name
EMAIL_REPLY_TO=support@yourdomain.com
EMAIL_LOGO_URL=https://yourdomain.com/logo.png
```

### Email Template Config Example

```typescript
// packages/core/src/plugins/available/email-plugin/templates/email-config.ts

export const emailTemplates = {
  registration: {
    subject: 'Welcome to {{appName}}!',
    text: {
      greeting: 'Welcome {{name}}!',
      body: 'Thanks for signing up. Click the link below to verify your email.',
      cta: 'Verify Email',
      footer: 'If you didn\'t sign up, please ignore this email.'
    }
  },
  passwordReset: {
    subject: 'Reset your password',
    text: {
      greeting: 'Hi {{name}},',
      body: 'We received a request to reset your password. Click the link below to continue.',
      cta: 'Reset Password',
      footer: 'This link expires in {{expiresIn}}. If you didn\'t request this, ignore this email.'
    }
  },
  verification: {
    subject: 'Verify your email',
    text: {
      greeting: 'Hi {{name}},',
      body: 'Please verify your email address by clicking the link below.',
      cta: 'Verify Email',
      footer: 'This link expires in {{expiresIn}}.'
    }
  },
  oneTimeCode: {
    subject: 'Your verification code',
    text: {
      greeting: 'Hi {{name}},',
      body: 'Your verification code is: {{code}}',
      footer: 'This code expires in {{expiresIn}}. Never share this code with anyone.'
    }
  }
}
```

## 12. Success Metrics

- Email delivery rate > 99%
- Average send time < 2 seconds
- Setup time < 5 minutes
- Zero configuration errors
- User satisfaction with default templates

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Cloudflare Workers Email](https://developers.cloudflare.com/email-routing/)
- [Email Best Practices](https://www.mailgun.com/blog/email/email-best-practices/)
- [DKIM/SPF Setup](https://www.cloudflare.com/learning/dns/dns-records/dns-dkim-record/)
