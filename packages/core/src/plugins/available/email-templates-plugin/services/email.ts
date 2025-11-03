// import { EmailTemplate, EmailTheme } from '../schema';
import { EmailLog, NewEmailLog } from '../schema';
import { EmailTemplateRenderer } from './email-renderer';

export interface EmailService {
  sendEmail(options: SendEmailOptions): Promise<EmailResult>;
  sendTemplatedEmail(options: SendTemplatedEmailOptions): Promise<EmailResult>;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  metadata?: Record<string, any>;
}

export interface SendTemplatedEmailOptions {
  to: string;
  templateSlug: string;
  variables: Record<string, any>;
  from?: string;
  replyTo?: string;
  metadata?: Record<string, any>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  emailLogId: string;
}

export class SendGridEmailService implements EmailService {
  private renderer: EmailTemplateRenderer;

  constructor(
    private apiKey: string,
    private defaultFromEmail: string,
    private db: any // D1 database binding
  ) {
    this.renderer = new EmailTemplateRenderer(db);
  }

  async sendEmail(options: SendEmailOptions): Promise<EmailResult> {
    const emailLogId = crypto.randomUUID();
    
    try {
      // Create email log entry
      const logEntry: NewEmailLog = {
        id: emailLogId,
        templateId: null,
        recipientEmail: options.to,
        subject: options.subject,
        status: 'pending',
        metadata: options.metadata || {},
        createdAt: new Date(),
      };

      await this.createEmailLog(logEntry);

      // Send email via SendGrid
      const response = await this.sendViaSendGrid({
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        from: options.from || this.defaultFromEmail,
        replyTo: options.replyTo,
      });

      // Update log with result
      await this.updateEmailLog(emailLogId, {
        status: response.success ? 'sent' : 'failed',
        providerId: response.messageId,
        errorMessage: response.error,
        sentAt: response.success ? new Date() : undefined,
      });

      return {
        success: response.success,
        messageId: response.messageId,
        error: response.error,
        emailLogId,
      };
    } catch (error) {
      // Update log with error
      await this.updateEmailLog(emailLogId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        emailLogId,
      };
    }
  }

  async sendTemplatedEmail(options: SendTemplatedEmailOptions): Promise<EmailResult> {
    const emailLogId = crypto.randomUUID();

    try {
      // Render the email template
      const rendered = await this.renderer.renderTemplate(options.templateSlug, options.variables);

      // Get template info for logging
      const template = await this.getTemplateBySlug(options.templateSlug);

      // Create email log entry
      const logEntry: NewEmailLog = {
        id: emailLogId,
        templateId: template?.id || null,
        recipientEmail: options.to,
        subject: rendered.subject,
        status: 'pending',
        metadata: options.metadata || {},
        createdAt: new Date(),
      };

      await this.createEmailLog(logEntry);

      // Send the rendered email
      const response = await this.sendViaSendGrid({
        to: options.to,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        from: options.from || this.defaultFromEmail,
        replyTo: options.replyTo,
      });

      // Update log with result
      await this.updateEmailLog(emailLogId, {
        status: response.success ? 'sent' : 'failed',
        providerId: response.messageId,
        errorMessage: response.error,
        sentAt: response.success ? new Date() : undefined,
      });

      return {
        success: response.success,
        messageId: response.messageId,
        error: response.error,
        emailLogId,
      };
    } catch (error) {
      // Update log with error
      await this.updateEmailLog(emailLogId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        emailLogId,
      };
    }
  }

  private async getTemplateBySlug(slug: string): Promise<{ id: string } | null> {
    try {
      const stmt = this.db.prepare('SELECT id FROM email_templates WHERE slug = ? AND is_active = 1');
      const result = await stmt.bind(slug).first();
      return result || null;
    } catch (error) {
      console.error('Failed to get template by slug:', error);
      return null;
    }
  }

  private async sendViaSendGrid(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from: string;
    replyTo?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const emailData = {
      personalizations: [
        {
          to: [{ email: options.to }],
          subject: options.subject,
        },
      ],
      from: { email: options.from },
      content: [
        {
          type: 'text/html',
          value: options.html,
        },
      ],
    };

    // Add plain text version if provided
    if (options.text) {
      emailData.content.unshift({
        type: 'text/plain',
        value: options.text,
      });
    }

    // Add reply-to if provided
    if (options.replyTo) {
      (emailData as any).reply_to = { email: options.replyTo };
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        // SendGrid returns a 202 status code for successful requests
        const messageId = response.headers.get('X-Message-Id') || crypto.randomUUID();
        return { success: true, messageId };
      } else {
        const errorText = await response.text();
        return { success: false, error: `SendGrid API error: ${response.status} - ${errorText}` };
      }
    } catch (error) {
      return { 
        success: false, 
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  private async createEmailLog(logEntry: NewEmailLog): Promise<void> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO email_logs (
          id, template_id, recipient_email, subject, status, 
          provider_id, error_message, sent_at, delivered_at, 
          opened_at, clicked_at, metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      await stmt.bind(
        logEntry.id,
        logEntry.templateId,
        logEntry.recipientEmail,
        logEntry.subject,
        logEntry.status,
        logEntry.providerId || null,
        logEntry.errorMessage || null,
        logEntry.sentAt ? Math.floor(logEntry.sentAt.getTime() / 1000) : null,
        logEntry.deliveredAt ? Math.floor(logEntry.deliveredAt.getTime() / 1000) : null,
        logEntry.openedAt ? Math.floor(logEntry.openedAt.getTime() / 1000) : null,
        logEntry.clickedAt ? Math.floor(logEntry.clickedAt.getTime() / 1000) : null,
        JSON.stringify(logEntry.metadata || {}),
        Math.floor((logEntry.createdAt || new Date()).getTime() / 1000)
      ).run();
    } catch (error) {
      console.error('Failed to create email log:', error);
      // Don't throw here to avoid breaking email sending
    }
  }

  private async updateEmailLog(
    id: string, 
    updates: Partial<Pick<EmailLog, 'status' | 'providerId' | 'errorMessage' | 'sentAt' | 'deliveredAt' | 'openedAt' | 'clickedAt'>>
  ): Promise<void> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.status) {
        fields.push('status = ?');
        values.push(updates.status);
      }
      if (updates.providerId) {
        fields.push('provider_id = ?');
        values.push(updates.providerId);
      }
      if (updates.errorMessage) {
        fields.push('error_message = ?');
        values.push(updates.errorMessage);
      }
      if (updates.sentAt) {
        fields.push('sent_at = ?');
        values.push(Math.floor(updates.sentAt.getTime() / 1000));
      }
      if (updates.deliveredAt) {
        fields.push('delivered_at = ?');
        values.push(Math.floor(updates.deliveredAt.getTime() / 1000));
      }
      if (updates.openedAt) {
        fields.push('opened_at = ?');
        values.push(Math.floor(updates.openedAt.getTime() / 1000));
      }
      if (updates.clickedAt) {
        fields.push('clicked_at = ?');
        values.push(Math.floor(updates.clickedAt.getTime() / 1000));
      }

      if (fields.length === 0) return;

      values.push(id); // for WHERE clause

      const stmt = this.db.prepare(`
        UPDATE email_logs 
        SET ${fields.join(', ')} 
        WHERE id = ?
      `);

      await stmt.bind(...values).run();
    } catch (error) {
      console.error('Failed to update email log:', error);
      // Don't throw here to avoid breaking email sending
    }
  }
}

// Factory function to create email service instance
export function createEmailService(env: {
  SENDGRID_API_KEY?: string;
  DEFAULT_FROM_EMAIL?: string;
  DB: any;
}): EmailService {
  if (!env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY environment variable is required');
  }

  if (!env.DEFAULT_FROM_EMAIL) {
    throw new Error('DEFAULT_FROM_EMAIL environment variable is required');
  }

  return new SendGridEmailService(
    env.SENDGRID_API_KEY,
    env.DEFAULT_FROM_EMAIL,
    env.DB
  );
}

// Email status constants
export const EMAIL_STATUS = {
  PENDING: 'pending',
  SENT: 'sent', 
  DELIVERED: 'delivered',
  FAILED: 'failed',
} as const;

export type EmailStatus = typeof EMAIL_STATUS[keyof typeof EMAIL_STATUS];