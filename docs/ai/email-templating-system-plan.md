# Email Templating System - Implementation Plan

## Overview
This document outlines the comprehensive plan for implementing an email templating system in SonicJS AI, allowing administrators to create reusable email themes and templates with markdown content management and preview capabilities.

## Current State Analysis

### Existing Infrastructure
- ✅ Handlebars-like template engine with variable substitution
- ✅ Component-based template system for web UI
- ✅ Dark theme admin interface with TailAdmin styling
- ✅ User management with normalized email handling
- ✅ Role-based authentication system
- ✅ D1 database with Drizzle ORM
- ✅ Cloudflare Workers environment

### Missing Components
- ❌ Email service integration (SMTP/API)
- ❌ Email-specific templates and components
- ❌ Email queue and delivery system
- ❌ Email template management UI
- ❌ Email preview and testing functionality

## System Architecture

### 1. Email Service Layer
```
┌─────────────────────────────────────────────────────────────┐
│                    Email Service Layer                      │
├─────────────────────────────────────────────────────────────┤
│ • Email Provider Integration (SendGrid/Mailgun/CF Email)    │
│ • Email Queue Management (Cloudflare Queues)               │
│ • Delivery Status Tracking                                 │
│ • Rate Limiting & Retry Logic                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Template Engine Layer
```
┌─────────────────────────────────────────────────────────────┐
│                   Template Engine Layer                     │
├─────────────────────────────────────────────────────────────┤
│ • Email Theme Engine (CSS/HTML layout)                     │
│ • Template Renderer (extends existing template system)     │
│ • Markdown-to-HTML Processor                               │
│ • Variable Substitution & Conditional Logic                │
│ • Email-specific Components (header, footer, buttons)      │
└─────────────────────────────────────────────────────────────┘
```

### 3. Data Layer
```
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                           │
├─────────────────────────────────────────────────────────────┤
│ • Email Themes (layouts, styles, branding)                 │
│ • Email Templates (content, variables, metadata)           │
│ • Email Logs (delivery tracking, analytics)                │
│ • User Preferences (notification settings)                 │
└─────────────────────────────────────────────────────────────┘
```

### 4. Admin Interface Layer
```
┌─────────────────────────────────────────────────────────────┐
│                  Admin Interface Layer                     │
├─────────────────────────────────────────────────────────────┤
│ • Theme Designer (visual editor, CSS customization)        │
│ • Template Manager (CRUD, markdown editor)                 │
│ • Preview System (dummy data generation, browser preview)  │
│ • Testing Tools (send test emails, delivery monitoring)    │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema Design

### Email Themes Table
```sql
CREATE TABLE email_themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  html_template TEXT NOT NULL,        -- HTML layout with placeholders
  css_styles TEXT NOT NULL,           -- Custom CSS styles
  variables JSON,                     -- Available template variables
  is_default INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### Email Templates Table
```sql
CREATE TABLE email_templates (
  id TEXT PRIMARY KEY,
  theme_id TEXT REFERENCES email_themes(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,          -- e.g., 'forgot-password', 'welcome'
  subject TEXT NOT NULL,
  markdown_content TEXT NOT NULL,     -- Markdown content for email body
  variables JSON,                     -- Template-specific variables
  metadata JSON,                      -- Additional configuration
  is_active INTEGER DEFAULT 1,
  version INTEGER DEFAULT 1,
  created_by TEXT REFERENCES users(id),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
```

### Email Logs Table
```sql
CREATE TABLE email_logs (
  id TEXT PRIMARY KEY,
  template_id TEXT REFERENCES email_templates(id),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL,               -- 'pending', 'sent', 'delivered', 'failed'
  provider_id TEXT,                   -- External service message ID
  error_message TEXT,
  sent_at INTEGER,
  delivered_at INTEGER,
  opened_at INTEGER,
  clicked_at INTEGER,
  metadata JSON,                      -- Additional tracking data
  created_at INTEGER NOT NULL
);
```

### Email Variables Table
```sql
CREATE TABLE email_variables (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  data_type TEXT NOT NULL,            -- 'string', 'number', 'date', 'boolean'
  default_value TEXT,
  is_system INTEGER DEFAULT 0,       -- System vs custom variables
  created_at INTEGER NOT NULL
);
```

## Email Template Types

### 1. Authentication Templates
- **Welcome Email** - New user registration
- **Email Verification** - Email address confirmation
- **Password Reset** - Forgot password flow
- **Login Alert** - Security notifications
- **Account Locked** - Security alerts

### 2. Content Management Templates
- **Content Published** - Author notifications
- **Content Approval** - Editorial workflow
- **Comment Notification** - User engagement
- **Content Expiry** - Content management alerts

### 3. System Templates
- **System Maintenance** - Downtime notifications
- **Security Alert** - System security notifications
- **Backup Completed** - System status updates
- **Error Notifications** - System error alerts

### 4. Contact/Form Templates
- **Contact Form Confirmation** - Auto-reply for contact forms
- **Newsletter Subscription** - Email list management
- **Unsubscribe Confirmation** - List management
- **Form Submission Receipt** - General form confirmations

## Theme System Design

### Default Theme Structure
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        {{theme_styles}}
    </style>
</head>
<body>
    <div class="email-container">
        <header class="email-header">
            {{#if logo_url}}
            <img src="{{logo_url}}" alt="{{company_name}}" class="logo">
            {{/if}}
            <h1>{{company_name}}</h1>
        </header>
        
        <main class="email-content">
            {{{email_content}}}
        </main>
        
        <footer class="email-footer">
            <p>{{company_name}} | {{company_address}}</p>
            <p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>
        </footer>
    </div>
</body>
</html>
```

### Theme Variables
```json
{
  "colors": {
    "primary": "#8b5cf6",
    "secondary": "#06b6d4",
    "background": "#ffffff",
    "text": "#1f2937",
    "border": "#e5e7eb"
  },
  "fonts": {
    "heading": "Inter, sans-serif",
    "body": "Inter, sans-serif"
  },
  "spacing": {
    "container_width": "600px",
    "padding": "20px"
  },
  "branding": {
    "logo_url": "{{logo_url}}",
    "company_name": "{{company_name}}",
    "company_address": "{{company_address}}"
  }
}
```

## Admin Interface Design

### 1. Email Themes Management
```
/admin/email/themes
├── List all themes (with preview thumbnails)
├── Create new theme
├── Edit theme (visual editor + code editor)
├── Preview theme (with sample data)
├── Duplicate theme
├── Delete theme
└── Set default theme
```

### 2. Email Templates Management
```
/admin/email/templates
├── List all templates (grouped by type)
├── Create new template
│   ├── Select theme
│   ├── Choose template type
│   ├── Define subject line
│   └── Write markdown content
├── Edit template
│   ├── Markdown editor with preview
│   ├── Variable management
│   ├── Subject line with variable support
│   └── Template settings
├── Preview template (HTML + plain text)
├── Test template (send to email address)
├── Duplicate template
├── Version history
└── Delete template
```

### 3. Email Testing & Preview
```
/admin/email/testing
├── Template selector
├── Dummy data generator
├── Variable customization
├── Preview modes (HTML, plain text, mobile)
├── Send test email
├── Delivery tracking
└── Analytics dashboard
```

### 4. Email Analytics
```
/admin/email/analytics
├── Email delivery statistics
├── Open and click rates
├── Template performance metrics
├── Error logs and troubleshooting
├── Recipient engagement analytics
└── Export reports
```

## Variable System

### System Variables (Always Available)
```json
{
  "user": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "username": "johndoe"
  },
  "site": {
    "name": "SonicJS AI",
    "url": "https://sonicjs-ai.com",
    "logo": "https://sonicjs-ai.com/logo.png"
  },
  "email": {
    "unsubscribeUrl": "{{unsubscribe_url}}",
    "preferencesUrl": "{{preferences_url}}"
  },
  "date": {
    "now": "2024-12-25",
    "year": "2024"
  }
}
```

### Template-Specific Variables
- **Password Reset**: `resetLink`, `expiryTime`
- **Welcome**: `activationLink`, `gettingStartedUrl`
- **Content Published**: `contentTitle`, `publishUrl`, `authorName`
- **Contact Form**: `formData`, `submissionId`, `replyToEmail`

## Email Service Integration

### Provider Options
1. **SendGrid** (Recommended)
   - Robust API
   - Template management
   - Analytics and tracking
   - High deliverability

2. **Mailgun**
   - Developer-friendly
   - Detailed logs
   - European data centers

3. **Cloudflare Email Workers** (Future)
   - Native Cloudflare integration
   - Serverless email sending

### Queue System (Cloudflare Queues)
```typescript
interface EmailJob {
  templateSlug: string;
  recipientEmail: string;
  variables: Record<string, any>;
  priority: 'low' | 'normal' | 'high';
  scheduledAt?: number;
  maxRetries: number;
}
```

## Preview & Testing System

### Dummy Data Generation
```typescript
const dummyData = {
  user: {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    username: "janesmith"
  },
  resetLink: "https://example.com/reset/abc123",
  expiryTime: "2 hours",
  content: {
    title: "Getting Started with SonicJS AI",
    url: "https://example.com/content/123"
  }
};
```

### Preview Modes
- **Desktop HTML** - Full HTML preview
- **Mobile HTML** - Responsive mobile view
- **Plain Text** - Text-only version
- **Dark Mode** - Dark theme preview
- **Print Preview** - Print-friendly version

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema creation and migration
- [ ] Basic email service integration (SendGrid)
- [ ] Email queue system setup
- [ ] Core template engine extensions

### Phase 2: Theme System (Week 3-4)
- [ ] Email theme management backend
- [ ] Default email theme creation
- [ ] Theme variables system
- [ ] Basic theme editor UI

### Phase 3: Template Management (Week 5-6)
- [ ] Email template CRUD operations
- [ ] Markdown editor integration
- [ ] Variable substitution system
- [ ] Template type definitions

### Phase 4: Admin Interface (Week 7-8)
- [ ] Theme management UI
- [ ] Template management UI
- [ ] Preview system implementation
- [ ] Testing and debugging tools

### Phase 5: Advanced Features (Week 9-10)
- [ ] Email analytics and tracking
- [ ] Delivery optimization
- [ ] A/B testing capabilities
- [ ] Advanced template features

### Phase 6: Testing & Polish (Week 11-12)
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Documentation completion
- [ ] Production deployment

## Success Metrics

### Functionality Metrics
- ✅ Admins can create reusable email themes
- ✅ Email templates support markdown content
- ✅ Preview system with dummy data works
- ✅ Email delivery success rate > 95%
- ✅ Template rendering time < 100ms

### User Experience Metrics
- ✅ Theme creation takes < 5 minutes
- ✅ Template editing is intuitive and fast
- ✅ Preview accuracy matches sent emails
- ✅ Admin interface is responsive and accessible

### Technical Metrics
- ✅ System handles 1000+ emails/hour
- ✅ Database queries optimized (< 50ms)
- ✅ Email queue processing reliable
- ✅ Error handling and logging comprehensive

## Risk Mitigation

### Technical Risks
- **Email Deliverability**: Use established providers, proper authentication
- **Performance**: Implement caching, optimize database queries
- **Data Loss**: Regular backups, version control for templates
- **Security**: Input sanitization, XSS prevention, access controls

### Business Risks
- **User Adoption**: Intuitive UI, comprehensive documentation
- **Maintenance**: Automated testing, monitoring, alerts
- **Scalability**: Queue system, horizontal scaling capability
- **Compliance**: GDPR/CAN-SPAM compliance, unsubscribe handling

This comprehensive plan provides a roadmap for implementing a sophisticated email templating system that integrates seamlessly with the existing SonicJS AI architecture while providing powerful, user-friendly tools for email management.