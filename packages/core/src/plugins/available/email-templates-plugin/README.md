# Email Templates Plugin

This plugin provides comprehensive email template management with themes, Markdown content, variable substitution, and delivery tracking via SendGrid.

## Status: DISABLED BY DEFAULT

This plugin is **disabled by default** and must be manually activated to use email functionality.

## Features

- Email theme management with CSS customization
- Markdown-based email templates  
- Variable substitution system
- Email preview functionality
- SendGrid integration for delivery
- Email delivery tracking and logging
- Queue-based email processing

## Requirements

- SendGrid API key for email delivery
- Cloudflare Queues for email processing (optional)

## How to Enable

1. **Database Setup**: Run the plugin migrations to create email tables
2. **Configuration**: Set up SendGrid API key and other environment variables
3. **Activation**: Enable the plugin through the admin interface
4. **Initialization**: Run the email system initialization script

## Database Tables

When activated, this plugin creates the following tables:

- `email_themes` - Reusable email layouts and CSS styles
- `email_templates` - Specific email content with Markdown
- `email_logs` - Email delivery tracking and analytics  
- `email_variables` - System and custom template variables

## Environment Variables

```bash
SENDGRID_API_KEY=your_sendgrid_api_key
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
EMAIL_QUEUE=your_cloudflare_queue_name (optional)
```

## Warning

⚠️ **Data Loss Warning**: Disabling this plugin will remove all email templates, themes, and logs. Make sure to backup your email data before deactivating.

## Files Included

- `admin-routes.ts` - Admin interface routes
- `services/` - Email management, rendering, and delivery services
- `schema.ts` - Database schema definitions
- `migrations.ts` - Database migrations
- `data/` - Default email theme and templates
- `tests/` - Unit tests for email services

## Usage

Once enabled, the email system will be accessible via the "Email Templates" menu item in the admin interface at `/admin/email`.