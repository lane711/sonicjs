// @ts-nocheck
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { SendGridEmailService, createEmailService, EMAIL_STATUS } from '../services/email'

// Mock EmailTemplateRenderer using vi.hoisted
const mockRenderTemplate = vi.hoisted(() => vi.fn())

vi.mock('../services/email-renderer', () => {
  return {
    EmailTemplateRenderer: class {
      renderTemplate = mockRenderTemplate
    }
  }
})

// Mock crypto.randomUUID
const mockRandomUUID = vi.fn()
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: mockRandomUUID
  },
  writable: true
})

// Mock fetch globally
global.fetch = vi.fn()

describe('Email Service', () => {
  let emailService: SendGridEmailService
  let mockDb: any

  beforeEach(() => {
    // Create mock database
    mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(null),
        run: vi.fn().mockResolvedValue(undefined)
      })
    }

    // Mock UUID generation
    mockRandomUUID.mockReturnValue('test-uuid-123')

    // Clear the renderTemplate mock calls (but keep the mock functions)
    mockRenderTemplate.mockClear()
    vi.mocked(fetch).mockClear()

    // Create email service instance
    emailService = new SendGridEmailService(
      'test-api-key',
      'noreply@example.com',
      mockDb
    )
  })

  afterEach(() => {
    // Don't restore all mocks - this breaks the email renderer mock
    // vi.restoreAllMocks()
  })

  describe('SendGridEmailService', () => {
    describe('sendEmail', () => {
      it('should send email successfully', async () => {
        // Mock successful SendGrid response
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          status: 202,
          headers: {
            get: vi.fn().mockReturnValue('msg-12345')
          }
        } as any)

        const result = await emailService.sendEmail({
          to: 'test@example.com',
          subject: 'Test Email',
          html: '<h1>Test</h1>',
          text: 'Test',
          metadata: { source: 'test' }
        })

        expect(result.success).toBe(true)
        expect(result.messageId).toBe('msg-12345')
        expect(result.emailLogId).toBe('test-uuid-123')
        expect(result.error).toBeUndefined()

        // Verify SendGrid API call
        expect(fetch).toHaveBeenCalledWith(
          'https://api.sendgrid.com/v3/mail/send',
          {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer test-api-key',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              personalizations: [{
                to: [{ email: 'test@example.com' }],
                subject: 'Test Email'
              }],
              from: { email: 'noreply@example.com' },
              content: [
                { type: 'text/plain', value: 'Test' },
                { type: 'text/html', value: '<h1>Test</h1>' }
              ]
            })
          }
        )

        // Verify database logging
        expect(mockDb.prepare).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO email_logs')
        )
      })

      it('should handle SendGrid API errors', async () => {
        // Mock failed SendGrid response
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: vi.fn().mockResolvedValue('Bad Request: Invalid email')
        } as any)

        const result = await emailService.sendEmail({
          to: 'invalid-email',
          subject: 'Test Email',
          html: '<h1>Test</h1>'
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('SendGrid API error: 400 - Bad Request: Invalid email')
        expect(result.emailLogId).toBe('test-uuid-123')

        // Verify error was logged to database
        expect(mockDb.prepare).toHaveBeenCalledWith(
          expect.stringContaining('UPDATE email_logs')
        )
      })

      it('should handle network errors', async () => {
        // Mock network error
        vi.mocked(fetch).mockRejectedValueOnce(new Error('Network timeout'))

        const result = await emailService.sendEmail({
          to: 'test@example.com',
          subject: 'Test Email',
          html: '<h1>Test</h1>'
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('Network error: Network timeout')
        expect(result.emailLogId).toBe('test-uuid-123')
      })

      it('should include custom from and reply-to addresses', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          status: 202,
          headers: { get: vi.fn().mockReturnValue('msg-12345') }
        } as any)

        await emailService.sendEmail({
          to: 'test@example.com',
          subject: 'Test Email',
          html: '<h1>Test</h1>',
          from: 'custom@example.com',
          replyTo: 'support@example.com'
        })

        const callArgs = vi.mocked(fetch).mock.calls[0]
        const requestBody = JSON.parse(callArgs[1].body as string)

        expect(requestBody.from.email).toBe('custom@example.com')
        expect(requestBody.reply_to.email).toBe('support@example.com')
      })

      it('should handle database logging errors gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        
        // Mock database error
        mockDb.prepare.mockImplementationOnce(() => {
          throw new Error('Database connection failed')
        })

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          status: 202,
          headers: { get: vi.fn().mockReturnValue('msg-12345') }
        } as any)

        const result = await emailService.sendEmail({
          to: 'test@example.com',
          subject: 'Test Email',
          html: '<h1>Test</h1>'
        })

        expect(result.success).toBe(true) // Email should still succeed
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to create email log:',
          expect.any(Error)
        )
      })
    })

    describe('sendTemplatedEmail', () => {
      it('should send templated email successfully', async () => {
        // Mock template rendering
        mockRenderTemplate.mockResolvedValue({
          subject: 'Welcome to SonicJS',
          html: '<h1>Welcome John!</h1>',
          text: 'Welcome John!'
        })

        // Mock template lookup
        mockDb.prepare().first.mockResolvedValue({ id: 'template-123' })

        // Mock successful SendGrid response
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          status: 202,
          headers: { get: vi.fn().mockReturnValue('msg-67890') }
        } as any)

        const result = await emailService.sendTemplatedEmail({
          to: 'john@example.com',
          templateSlug: 'welcome-email',
          variables: { name: 'John', company: 'SonicJS' },
          metadata: { campaign: 'welcome-series' }
        })

        expect(result.success).toBe(true)
        expect(result.messageId).toBe('msg-67890')
        expect(result.emailLogId).toBe('test-uuid-123')

        // Verify template was rendered with correct variables
        expect(mockRenderTemplate).toHaveBeenCalledWith(
          'welcome-email',
          { name: 'John', company: 'SonicJS' }
        )

        // Verify email was sent with rendered content
        const callArgs = vi.mocked(fetch).mock.calls[0]
        const requestBody = JSON.parse(callArgs[1].body as string)
        expect(requestBody.personalizations[0].subject).toBe('Welcome to SonicJS')
        expect(requestBody.content[1].value).toBe('<h1>Welcome John!</h1>')
      })

      it('should handle template rendering errors', async () => {
        // Mock template rendering error
        mockRenderTemplate.mockRejectedValue(new Error('Template not found'))

        const result = await emailService.sendTemplatedEmail({
          to: 'test@example.com',
          templateSlug: 'non-existent-template',
          variables: {}
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe('Template not found')
        expect(result.emailLogId).toBe('test-uuid-123')

        // Verify SendGrid was not called
        expect(fetch).not.toHaveBeenCalled()
      })

      it('should handle missing template gracefully', async () => {
        // Mock template lookup returning null
        mockDb.prepare().first.mockResolvedValue(null)

        // Mock template rendering success (template could exist in file system)
        mockRenderTemplate.mockResolvedValue({
          subject: 'Test Subject',
          html: '<h1>Test</h1>',
          text: 'Test'
        })

        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          status: 202,
          headers: { get: vi.fn().mockReturnValue('msg-12345') }
        } as any)

        const result = await emailService.sendTemplatedEmail({
          to: 'test@example.com',
          templateSlug: 'file-based-template',
          variables: {}
        })

        expect(result.success).toBe(true)
        
        // Should log with null template ID
        expect(mockDb.prepare).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO email_logs')
        )
      })
    })

    describe('private methods via integration', () => {
      it('should create comprehensive email logs', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          status: 202,
          headers: { get: vi.fn().mockReturnValue('msg-12345') }
        } as any)

        await emailService.sendEmail({
          to: 'test@example.com',
          subject: 'Test Email',
          html: '<h1>Test</h1>',
          metadata: { campaign: 'newsletter', segment: 'premium' }
        })

        // Verify comprehensive logging
        const insertCall = mockDb.prepare.mock.calls.find(call => 
          call[0].includes('INSERT INTO email_logs')
        )
        expect(insertCall).toBeDefined()

        const bindCall = mockDb.prepare().bind
        expect(bindCall).toHaveBeenCalledWith(
          'test-uuid-123', // id
          null, // template_id
          'test@example.com', // recipient_email
          'Test Email', // subject
          'pending', // status
          null, // provider_id (initially null)
          null, // error_message
          null, // sent_at (initially null)
          null, // delivered_at
          null, // opened_at
          null, // clicked_at
          JSON.stringify({ campaign: 'newsletter', segment: 'premium' }), // metadata
          expect.any(Number) // created_at timestamp
        )
      })

      it('should update email logs with send results', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
          ok: true,
          status: 202,
          headers: { get: vi.fn().mockReturnValue('msg-success-123') }
        } as any)

        await emailService.sendEmail({
          to: 'test@example.com',
          subject: 'Test Email',
          html: '<h1>Test</h1>'
        })

        // Verify status update
        const updateCall = mockDb.prepare.mock.calls.find(call => 
          call[0].includes('UPDATE email_logs')
        )
        expect(updateCall).toBeDefined()
        expect(updateCall[0]).toContain('status = ?')
        expect(updateCall[0]).toContain('provider_id = ?')
        expect(updateCall[0]).toContain('sent_at = ?')
      })
    })
  })

  describe('createEmailService factory', () => {
    it('should create email service with valid environment', () => {
      const env = {
        SENDGRID_API_KEY: 'sg-test-key',
        DEFAULT_FROM_EMAIL: 'noreply@test.com',
        DB: mockDb
      }

      const service = createEmailService(env)
      expect(service).toBeInstanceOf(SendGridEmailService)
    })

    it('should throw error for missing SendGrid API key', () => {
      const env = {
        DEFAULT_FROM_EMAIL: 'noreply@test.com',
        DB: mockDb
      }

      expect(() => createEmailService(env)).toThrow(
        'SENDGRID_API_KEY environment variable is required'
      )
    })

    it('should throw error for missing default from email', () => {
      const env = {
        SENDGRID_API_KEY: 'sg-test-key',
        DB: mockDb
      }

      expect(() => createEmailService(env)).toThrow(
        'DEFAULT_FROM_EMAIL environment variable is required'
      )
    })
  })

  describe('EMAIL_STATUS constants', () => {
    it('should provide correct email status values', () => {
      expect(EMAIL_STATUS.PENDING).toBe('pending')
      expect(EMAIL_STATUS.SENT).toBe('sent')
      expect(EMAIL_STATUS.DELIVERED).toBe('delivered')
      expect(EMAIL_STATUS.FAILED).toBe('failed')
    })
  })

  describe('error handling and edge cases', () => {
    it('should handle empty subject gracefully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 202,
        headers: { get: vi.fn().mockReturnValue('msg-12345') }
      } as any)

      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: '',
        html: '<h1>Test</h1>'
      })

      expect(result.success).toBe(true)
      
      const callArgs = vi.mocked(fetch).mock.calls[0]
      const requestBody = JSON.parse(callArgs[1].body as string)
      expect(requestBody.personalizations[0].subject).toBe('')
    })

    it('should handle HTML-only emails (no text version)', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 202,
        headers: { get: vi.fn().mockReturnValue('msg-12345') }
      } as any)

      await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'HTML Only',
        html: '<h1>HTML Only Email</h1>'
        // No text version provided
      })

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const requestBody = JSON.parse(callArgs[1].body as string)
      
      // Should only have HTML content
      expect(requestBody.content).toHaveLength(1)
      expect(requestBody.content[0].type).toBe('text/html')
    })

    it('should generate fallback message ID when SendGrid does not provide one', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 202,
        headers: { get: vi.fn().mockReturnValue(null) } // No X-Message-Id header
      } as any)

      // Mock second UUID for fallback message ID
      mockRandomUUID
        .mockReturnValueOnce('test-uuid-123') // For email log ID
        .mockReturnValueOnce('fallback-message-id') // For message ID

      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<h1>Test</h1>'
      })

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('fallback-message-id')
    })

    it('should handle malformed fetch response gracefully', async () => {
      // Mock fetch throwing during response processing
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: vi.fn().mockRejectedValue(new Error('Response parsing failed'))
      } as any)

      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<h1>Test</h1>'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error: Response parsing failed')
    })
  })
})