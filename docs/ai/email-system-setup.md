# Email System Setup Guide

This guide will help you set up and configure the SonicJS AI email templating system.

## Overview

The email system provides:
- **Reusable email themes** with customizable CSS and layouts
- **Markdown-based email templates** with variable substitution
- **Email preview and testing** with dummy data generation
- **Queue-based email delivery** with retry logic
- **Delivery tracking and analytics**
- **Admin interface** for managing themes and templates

## Prerequisites

1. **Database Migration**: Ensure the email system tables have been created
2. **SendGrid Account**: Sign up for a SendGrid account and get an API key
3. **Cloudflare Queue**: Set up a Cloudflare Queue for email processing

## Setup Steps

### 1. Database Migration

The email system tables should already be created if you've run the latest migrations:

```bash
npm run db:migrate
```

This creates the following tables:
- `email_themes` - Reusable email layouts and styling
- `email_templates` - Specific email content and configuration
- `email_logs` - Email delivery tracking and analytics
- `email_variables` - System and custom template variables

### 2. Environment Variables

Add the following to your `wrangler.toml` file:

```toml
[vars]
SENDGRID_API_KEY = "your-sendgrid-api-key"
DEFAULT_FROM_EMAIL = "noreply@yourdomain.com"

[[queues]]
binding = "EMAIL_QUEUE"
queue_name = "email-queue"
```

### 3. Create Cloudflare Queue

```bash
wrangler queues create email-queue
```

### 4. Initialize Default Data

Visit `/admin/email` and click the "Initialize" button, or make a POST request to:

```
POST /admin/email/initialize
```

This will create:
- Default SonicJS AI email theme
- Sample email templates (welcome, password reset, contact confirmation)
- System variables

## Using the Email System

### Sending Emails

```typescript
import { createEmailService } from './services/email';

const emailService = createEmailService(env);

// Send templated email
const result = await emailService.sendTemplatedEmail({
  to: 'user@example.com',
  templateSlug: 'welcome',
  variables: {
    user: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'user@example.com'
    }
  }
});

// Send direct email
const result = await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Custom Email',
  html: '<h1>Hello World</h1>',
  text: 'Hello World'
});
```

### Using the Queue System

```typescript
import { createEmailQueueService } from './services/email-queue';

const queueService = createEmailQueueService(env);

// Queue templated email
const jobId = await queueService.enqueueTemplatedEmail({
  to: 'user@example.com',
  templateSlug: 'welcome',
  variables: { user: { firstName: 'John' } },
  priority: 'high',
  scheduledAt: new Date(Date.now() + 3600000) // Send in 1 hour
});
```

## Admin Interface

Access the email management interface at `/admin/email`:

### Email Themes (`/admin/email/themes`)
- Create and edit email themes
- Customize CSS styles and HTML layouts
- Set default theme
- Preview themes with sample content

### Email Templates (`/admin/email/templates`)
- Create and edit email templates
- Write content in Markdown
- Configure template variables
- Preview templates with dummy data
- Send test emails

### Template Variables

Templates support variable substitution using `{{variable}}` syntax:

**System Variables (always available):**
- `{{user.firstName}}` - Recipient's first name
- `{{user.lastName}}` - Recipient's last name
- `{{user.email}}` - Recipient's email
- `{{site.name}}` - Site name (SonicJS AI)
- `{{site.url}}` - Site URL
- `{{date.now}}` - Current date
- `{{date.year}}` - Current year

**Template-Specific Variables:**
- Password Reset: `{{resetLink}}`, `{{expiryTime}}`
- Welcome: `{{activationLink}}`, `{{gettingStartedUrl}}`
- Contact Form: `{{formData}}`, `{{submissionId}}`

## Email Templates

### Creating a New Template

1. Go to `/admin/email/templates`
2. Click "Create New Template"
3. Fill in the form:
   - **Name**: Human-readable name
   - **Slug**: URL-friendly identifier (used in code)
   - **Theme**: Select an email theme
   - **Subject**: Email subject line (supports variables)
   - **Content**: Markdown content (supports variables)

### Markdown Features

The email system supports GitHub Flavored Markdown with email-optimized rendering:

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text** and *italic text*

[Links](https://example.com) are styled for email

- Bulleted lists
- With multiple items

1. Numbered lists
2. Are also supported

> Blockquotes are styled with purple accent

`Inline code` and code blocks:

```
function example() {
  return "Code blocks work too";
}
```

**Button-like text** (e.g., "Get Started", "Reset Password") gets automatic button styling.
```

### Preview and Testing

- **Preview**: View rendered email in browser with dummy data
- **Test Email**: Send actual test email to specified address
- **Mobile Preview**: See how email looks on mobile devices
- **Plain Text**: View auto-generated plain text version

## Email Themes

### Default Theme

The system includes a professional default theme matching SonicJS AI branding:
- Purple and cyan gradient header
- Clean, readable typography
- Mobile-responsive design
- Dark mode support
- Professional footer with unsubscribe links

### Creating Custom Themes

1. Go to `/admin/email/themes`
2. Click "Create New Theme"
3. Define:
   - **HTML Template**: Layout with `{{{email_content}}}` placeholder
   - **CSS Styles**: Custom styling for email clients
   - **Variables**: Theme-specific configuration (colors, fonts, etc.)

### Theme Variables

Themes can define variables for customization:

```json
{
  "colors": {
    "primary": "#8b5cf6",
    "secondary": "#06b6d4",
    "background": "#ffffff",
    "text": "#1f2937"
  },
  "fonts": {
    "heading": "Inter, sans-serif",
    "body": "Inter, sans-serif"
  },
  "spacing": {
    "containerWidth": "600px",
    "padding": "40px"
  }
}
```

## Queue Processing

### Setting Up Queue Consumer

Add to your `wrangler.toml`:

```toml
[[queues.consumers]]
queue = "email-queue"
type = "http"
max_batch_size = 10
max_batch_timeout = 5
max_retries = 3
dead_letter_queue = "email-dlq"
```

### Queue Consumer Function

```typescript
import { handleEmailQueueMessage } from './services/email-queue';

export default {
  async queue(batch: MessageBatch<EmailJob>, env: CloudflareBindings): Promise<void> {
    await handleEmailQueueMessage(batch, env);
  }
};
```

## Monitoring and Analytics

### Email Logs

All emails are logged in the `email_logs` table with:
- Delivery status (pending, sent, delivered, failed)
- Timestamps for sent, delivered, opened, clicked
- Error messages for debugging
- Provider message IDs for tracking

### Viewing Analytics

Access email analytics through:
- Database queries on `email_logs` table
- Future admin dashboard at `/admin/email/analytics`

## Troubleshooting

### Common Issues

**Templates not rendering:**
- Check theme exists and is active
- Verify template variables are valid JSON
- Ensure markdown content is properly formatted

**Emails not sending:**
- Verify SendGrid API key is correct
- Check DEFAULT_FROM_EMAIL is set
- Review email logs for error messages

**Queue not processing:**
- Ensure EMAIL_QUEUE binding is configured
- Check queue consumer is deployed
- Verify queue permissions

**Preview errors:**
- Check template slug exists
- Verify theme is associated with template
- Review browser console for JavaScript errors

### Debug Mode

Enable debug logging by setting:

```toml
[vars]
EMAIL_DEBUG = "true"
```

This will log additional information about email rendering and sending.

## Security Considerations

- **Input Sanitization**: All user input is sanitized before rendering
- **Template Security**: Only admins can create/edit themes and templates
- **Email Validation**: All email addresses are validated before sending
- **Rate Limiting**: Consider implementing rate limiting for email sending
- **Unsubscribe**: All emails include unsubscribe links (implementation pending)

## Performance Optimization

- **Template Caching**: Templates are cached after first render
- **Queue Batching**: Multiple emails processed in batches
- **Retry Logic**: Failed emails automatically retried with backoff
- **Database Indexing**: Email logs indexed by recipient and status

## API Reference

### Email Service

```typescript
interface EmailService {
  sendEmail(options: SendEmailOptions): Promise<EmailResult>;
  sendTemplatedEmail(options: SendTemplatedEmailOptions): Promise<EmailResult>;
}
```

### Queue Service

```typescript
interface EmailQueueService {
  enqueueTemplatedEmail(options: SendTemplatedEmailOptions & QueueOptions): Promise<string>;
  enqueueDirectEmail(options: SendEmailOptions & QueueOptions): Promise<string>;
}
```

### Management Service

```typescript
interface EmailManagementService {
  createTheme(theme: NewEmailTheme): Promise<string>;
  createTemplate(template: NewEmailTemplate): Promise<string>;
  getTemplates(): Promise<EmailTemplate[]>;
  initializeDefaultData(): Promise<void>;
}
```

## Future Enhancements

- **A/B Testing**: Template variation testing
- **Advanced Analytics**: Open/click tracking with images and links
- **Unsubscribe Management**: Complete unsubscribe workflow
- **Template Versioning**: Version control for templates
- **Bulk Email**: Mass email sending capabilities
- **Email Builder**: Visual drag-and-drop email editor
- **Attachment Support**: File attachment handling
- **Localization**: Multi-language email templates

## Support

For help with the email system:
1. Check this documentation first
2. Review the code in `/src/services/email*`
3. Check the database schema in `/src/db/schema.ts`
4. Look at example usage in `/src/routes/admin/email.ts`