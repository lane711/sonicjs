import { NewEmailTheme } from '../schema';

export const DEFAULT_EMAIL_THEME: Omit<NewEmailTheme, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'> = {
  name: 'SonicJS AI Default',
  description: 'Professional email theme matching SonicJS AI branding',
  isDefault: true,
  isActive: true,
  
  htmlTemplate: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{subject}}</title>
    <style>
        {{theme_styles}}
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #f9fafb;">
    <!-- Email Container -->
    <div class="email-container" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <header class="email-header" style="background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); padding: 30px 40px; text-align: center;">
            {{#if site.logo}}
            <img src="{{site.logo}}" alt="{{site.name}}" class="logo" style="width: 48px; height: 48px; margin-bottom: 16px; border-radius: 8px;">
            {{/if}}
            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.2;">{{site.name}}</h1>
        </header>
        
        <!-- Main Content -->
        <main class="email-content" style="padding: 40px;">
            {{{email_content}}}
        </main>
        
        <!-- Footer -->
        <footer class="email-footer" style="background-color: #f8fafc; padding: 30px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
            <div style="margin-bottom: 20px;">
                <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                    {{site.name}} - Building the future of web development
                </p>
                <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 12px;">
                    {{site.url}}
                </p>
            </div>
            
            <div class="footer-links" style="margin-bottom: 20px;">
                <a href="{{email.preferencesUrl}}" style="color: #8b5cf6; text-decoration: none; font-size: 12px; margin: 0 8px;">Email Preferences</a>
                <span style="color: #cbd5e1; font-size: 12px;">|</span>
                <a href="{{email.unsubscribeUrl}}" style="color: #8b5cf6; text-decoration: none; font-size: 12px; margin: 0 8px;">Unsubscribe</a>
            </div>
            
            <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 1.4;">
                © {{date.year}} {{site.name}}. All rights reserved.
            </p>
        </footer>
    </div>
</body>
</html>`,

  cssStyles: `
/* Reset and base styles */
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: #1f2937;
    background-color: #f9fafb;
}

/* Email container */
.email-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
    margin: 0 0 20px 0;
    font-weight: 600;
    line-height: 1.3;
    color: #111827;
}

h1 { font-size: 32px; }
h2 { font-size: 24px; color: #374151; }
h3 { font-size: 20px; color: #374151; }
h4 { font-size: 18px; color: #4b5563; }

p {
    margin: 0 0 16px 0;
    font-size: 16px;
    line-height: 1.6;
    color: #374151;
}

/* Links */
a {
    color: #8b5cf6;
    text-decoration: none;
}

a:hover {
    color: #7c3aed;
    text-decoration: underline;
}

/* Buttons */
.btn {
    display: inline-block;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.2s ease;
    text-align: center;
    margin: 8px 0;
}

.btn-primary {
    background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
    color: #ffffff;
    border: none;
}

.btn-primary:hover {
    background: linear-gradient(135deg, #7c3aed 0%, #0891b2 100%);
    color: #ffffff;
    text-decoration: none;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.btn-secondary {
    background-color: #f8fafc;
    color: #374151;
    border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
    background-color: #f1f5f9;
    color: #1f2937;
    border-color: #cbd5e1;
    text-decoration: none;
}

/* Content sections */
.section {
    margin: 32px 0;
}

.section:first-child {
    margin-top: 0;
}

.section:last-child {
    margin-bottom: 0;
}

/* Callout boxes */
.callout {
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
    border-left: 4px solid #8b5cf6;
}

.callout-info {
    background-color: #eff6ff;
    border-left-color: #3b82f6;
}

.callout-success {
    background-color: #f0fdf4;
    border-left-color: #10b981;
}

.callout-warning {
    background-color: #fffbeb;
    border-left-color: #f59e0b;
}

.callout-error {
    background-color: #fef2f2;
    border-left-color: #ef4444;
}

/* Lists */
ul, ol {
    margin: 0 0 16px 0;
    padding-left: 24px;
}

li {
    margin-bottom: 8px;
    color: #374151;
}

/* Code */
code {
    background-color: #f1f5f9;
    color: #8b5cf6;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
}

pre {
    background-color: #1e293b;
    color: #e2e8f0;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 20px 0;
}

pre code {
    background: none;
    color: inherit;
    padding: 0;
}

/* Tables */
table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}

th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e2e8f0;
}

th {
    background-color: #f8fafc;
    font-weight: 600;
    color: #374151;
}

/* Responsive design */
@media only screen and (max-width: 600px) {
    .email-container {
        width: 100% !important;
        margin: 0 !important;
    }
    
    .email-header,
    .email-content,
    .email-footer {
        padding: 20px !important;
    }
    
    h1 { font-size: 24px !important; }
    h2 { font-size: 20px !important; }
    h3 { font-size: 18px !important; }
    
    .btn {
        display: block !important;
        width: 100% !important;
        margin: 12px 0 !important;
    }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .email-container {
        background-color: #1f2937 !important;
    }
    
    .email-content {
        color: #e5e7eb !important;
    }
    
    h1, h2, h3, h4, h5, h6 {
        color: #f9fafb !important;
    }
    
    p, li {
        color: #d1d5db !important;
    }
    
    .email-footer {
        background-color: #111827 !important;
        border-top-color: #374151 !important;
    }
}
`,

  variables: JSON.stringify({
    colors: {
      primary: '#8b5cf6',
      secondary: '#06b6d4',
      background: '#ffffff',
      text: '#1f2937',
      border: '#e2e8f0',
      muted: '#64748b'
    },
    fonts: {
      heading: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      body: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      mono: 'Monaco, Menlo, Ubuntu Mono, monospace'
    },
    spacing: {
      containerWidth: '600px',
      padding: '40px',
      mobilePadding: '20px'
    },
    branding: {
      logoWidth: '48px',
      logoHeight: '48px'
    }
  })
};

// Sample email templates to create with the default theme
export const SAMPLE_EMAIL_TEMPLATES = [
  {
    name: 'Welcome Email',
    slug: 'welcome',
    subject: 'Welcome to {{site.name}}, {{user.firstName}}!',
    markdownContent: `# Welcome to {{site.name}}!

Hi **{{user.firstName}}**,

Welcome to {{site.name}}! We're excited to have you on board.

## Getting Started

Here are a few things you can do to get started:

- ✅ **Complete your profile** - Add your personal information
- 🚀 **Explore the dashboard** - Familiarize yourself with the interface  
- 📚 **Read our documentation** - Learn about all the features
- 💬 **Join our community** - Connect with other users

[Get Started]({{gettingStartedUrl}})

## Need Help?

If you have any questions, don't hesitate to reach out to our support team. We're here to help!

Best regards,  
The {{site.name}} Team`,
    variables: JSON.stringify({
      gettingStartedUrl: 'string',
      user: {
        firstName: 'string',
        email: 'string'
      }
    })
  },
  
  {
    name: 'Password Reset',
    slug: 'password-reset',
    subject: 'Reset your {{site.name}} password',
    markdownContent: `# Password Reset Request

Hi **{{user.firstName}}**,

We received a request to reset your password for your {{site.name}} account.

## Reset Your Password

Click the button below to create a new password. This link will expire in **{{expiryTime}}**.

[Reset Password]({{resetLink}})

If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.

## Security Tip

For your security, never share your password with anyone. {{site.name}} will never ask for your password via email.

Best regards,  
The {{site.name}} Team`,
    variables: JSON.stringify({
      resetLink: 'string',
      expiryTime: 'string',
      user: {
        firstName: 'string',
        email: 'string'
      }
    })
  },

  {
    name: 'Contact Form Confirmation',
    slug: 'contact-confirmation',
    subject: 'We received your message - {{site.name}}',
    markdownContent: `# Thank you for contacting us!

Hi **{{formData.name}}**,

Thank you for reaching out to us. We've received your message and will get back to you as soon as possible.

## Your Message

**Submission ID:** {{submissionId}}  
**Submitted:** {{formData.submittedAt}}

> {{formData.message}}

## What's Next?

Our team typically responds within 24 hours during business days. You'll receive a response at **{{formData.email}}**.

If you have any urgent questions, you can also reach us at [{{replyToEmail}}](mailto:{{replyToEmail}}).

Best regards,  
The {{site.name}} Team`,
    variables: JSON.stringify({
      submissionId: 'string',
      replyToEmail: 'string',
      formData: {
        name: 'string',
        email: 'string',
        message: 'string',
        submittedAt: 'string'
      }
    })
  }
];