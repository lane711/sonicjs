// Email Templates Plugin
// Provides comprehensive email template management with themes, variables, and delivery tracking
// This plugin is disabled by default and must be manually enabled

export const emailTemplatesPlugin = {
  name: 'email-templates',
  displayName: 'Email Templates',  
  description: 'Comprehensive email template management with themes, Markdown content, variable substitution, and delivery tracking via SendGrid',
  version: '1.0.0',
  author: 'SonicJS Team',
  isCore: false,
  isActive: false, // Disabled by default - requires manual activation
  status: 'inactive', // Plugin starts as inactive
  
  // Plugin capabilities
  features: [
    'Email theme management with CSS customization',
    'Markdown-based email templates',
    'Variable substitution system',
    'Email preview functionality',
    'SendGrid integration for delivery',
    'Email delivery tracking and logging',
    'Queue-based email processing'
  ],
  
  // Admin menu configuration
  adminMenu: {
    label: 'Email Templates',
    path: '/admin/email',
    icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.703a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>`
  },
  
  // Database requirements
  database: {
    tables: ['email_themes', 'email_templates', 'email_logs', 'email_variables']
  },
  
  // External dependencies
  dependencies: {
    sendgrid: '@sendgrid/mail',
    cloudflareQueues: 'Required for email queue processing'
  },
  
  // Database migrations
  migrations: {
    // Migration files for database schema
    files: ['./migrations.ts'],
    // Tables created by this plugin
    tables: ['email_themes', 'email_templates', 'email_logs', 'email_variables']
  },
  
  // Plugin lifecycle hooks
  hooks: {
    onActivate: 'Run database migrations and initialize default data',
    onDeactivate: 'Optionally remove email tables and data',
    onInstall: 'Install email system dependencies',
    onUninstall: 'Clean up all email-related data and tables'
  },
  
  // Warning about data loss
  warnings: [
    'Disabling this plugin will remove all email templates, themes, and logs',
    'Make sure to backup your email data before deactivating this plugin',
    'SendGrid API key configuration will be lost when plugin is disabled'
  ]
}

export default emailTemplatesPlugin