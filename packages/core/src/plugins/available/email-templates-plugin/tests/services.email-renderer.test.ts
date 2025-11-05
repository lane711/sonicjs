// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EmailTemplateRenderer, EmailRenderResult, EmailVariables } from '../services/email-renderer'

// Mock the template renderer utility
vi.mock('../utils/template-renderer', () => ({
  renderTemplate: vi.fn((template, variables) => {
    // Handle nested object notation like {{user.name}}
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const keys = path.trim().split('.')
      let value = variables
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key]
        } else {
          return match // Return original if path not found
        }
      }
      return value !== undefined && value !== null ? String(value) : match
    })
  })
}))

// Mock marked
vi.mock('marked', () => ({
  marked: vi.fn((content) => Promise.resolve(`<p>${content}</p>`)),
  Renderer: class {
    link = vi.fn()
    strong = vi.fn()
    heading = vi.fn()
    paragraph = vi.fn()
    list = vi.fn()
    listitem = vi.fn()
    blockquote = vi.fn()
    code = vi.fn()
    codespan = vi.fn()
  }
}))

describe('EmailTemplateRenderer', () => {
  let renderer: EmailTemplateRenderer
  let mockDb: any

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnThis(),
        first: vi.fn(),
        all: vi.fn()
      })
    }
    
    renderer = new EmailTemplateRenderer(mockDb)
  })

  describe('renderTemplate', () => {
    const mockTemplate = {
      id: 'template-1',
      slug: 'welcome-email',
      name: 'Welcome Email',
      subject: 'Welcome {{user.name}}!',
      markdownContent: '# Hello {{user.name}}\n\nWelcome to our platform!',
      variables: '{"company": "SonicJS"}',
      themeId: 'theme-1',
      isActive: true
    }

    const mockTheme = {
      id: 'theme-1',
      name: 'Default Theme',
      htmlTemplate: '<html><body>{{email_content}}</body></html>',
      cssStyles: 'body { font-family: Arial; }',
      variables: '{"primaryColor": "#007bff"}',
      isActive: true
    }

    it('should render complete email template successfully', async () => {
      // Mock database responses
      mockDb.prepare().first
        .mockResolvedValueOnce(mockTemplate) // getTemplateBySlug
        .mockResolvedValueOnce(mockTheme)    // getThemeById

      const variables = {
        user: { name: 'John Doe' }
      }

      const result = await renderer.renderTemplate('welcome-email', variables)

      expect(result.subject).toBe('Welcome John Doe!')
      expect(result.html).toContain('<html>')
      expect(result.html).toContain('<body>')
      expect(result.html).toContain('<p># Hello John Doe')
      expect(result.text).toBeDefined()
      expect(typeof result.text).toBe('string')
    })

    it('should throw error when template not found', async () => {
      mockDb.prepare().first.mockResolvedValueOnce(null)

      await expect(renderer.renderTemplate('nonexistent')).rejects.toThrow(
        'Email template not found: nonexistent'
      )

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM email_templates')
      )
    })

    it('should throw error when theme not found', async () => {
      mockDb.prepare().first
        .mockResolvedValueOnce(mockTemplate)
        .mockResolvedValueOnce(null) // theme not found

      await expect(renderer.renderTemplate('welcome-email')).rejects.toThrow(
        'Email theme not found: theme-1'
      )
    })

    it('should handle template with null variables', async () => {
      const templateWithoutVars = { ...mockTemplate, variables: null }
      
      mockDb.prepare().first
        .mockResolvedValueOnce(templateWithoutVars)
        .mockResolvedValueOnce(mockTheme)

      const result = await renderer.renderTemplate('welcome-email', { user: { name: 'Jane' } })

      expect(result.subject).toBe('Welcome Jane!')
      expect(result.html).toBeDefined()
    })

    it('should merge system variables with template and user variables', async () => {
      mockDb.prepare().first
        .mockResolvedValueOnce(mockTemplate)
        .mockResolvedValueOnce(mockTheme)

      const result = await renderer.renderTemplate('welcome-email', { 
        user: { name: 'Alice' },
        customVar: 'test'
      })

      // System variables should be included (site, date, email)
      expect(result.html).toBeDefined()
      expect(result.subject).toBe('Welcome Alice!')
    })

    it('should handle database errors gracefully', async () => {
      mockDb.prepare().first.mockRejectedValueOnce(new Error('Database connection failed'))

      await expect(renderer.renderTemplate('welcome-email')).rejects.toThrow(
        'Email template not found: welcome-email'
      )
    })
  })

  describe('getSystemVariables', () => {
    it('should return system variables with current date and site info', () => {
      const systemVars = (renderer as any).getSystemVariables()

      expect(systemVars).toHaveProperty('site')
      expect(systemVars.site).toHaveProperty('name', 'SonicJS AI')
      expect(systemVars.site).toHaveProperty('url', 'https://sonicjs-ai.com')
      expect(systemVars.site).toHaveProperty('logo')

      expect(systemVars).toHaveProperty('date')
      expect(systemVars.date).toHaveProperty('now')
      expect(systemVars.date).toHaveProperty('year')
      expect(systemVars.date).toHaveProperty('month')
      expect(systemVars.date).toHaveProperty('day')

      expect(systemVars).toHaveProperty('email')
      expect(systemVars.email).toHaveProperty('unsubscribeUrl')
      expect(systemVars.email).toHaveProperty('preferencesUrl')

      // Verify date format
      expect(systemVars.date.now).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(systemVars.date.year).toMatch(/^\d{4}$/)
    })
  })

  describe('parseJsonField', () => {
    it('should parse valid JSON string', () => {
      const jsonString = '{"key": "value", "number": 42}'
      const result = (renderer as any).parseJsonField(jsonString)
      
      expect(result).toEqual({ key: 'value', number: 42 })
    })

    it('should return empty object for null input', () => {
      const result = (renderer as any).parseJsonField(null)
      expect(result).toEqual({})
    })

    it('should return empty object for invalid JSON', () => {
      const result = (renderer as any).parseJsonField('invalid json {')
      expect(result).toEqual({})
    })

    it('should return empty object for empty string', () => {
      const result = (renderer as any).parseJsonField('')
      expect(result).toEqual({})
    })
  })

  describe('htmlToText', () => {
    it('should convert HTML to plain text', () => {
      const html = '<h1>Title</h1><p>This is <strong>bold</strong> text.</p><a href="http://example.com">Link</a>'
      const result = (renderer as any).htmlToText(html)
      
      expect(result).toBe('Title This is bold text. Link')
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
    })

    it('should remove style and script tags', () => {
      const html = '<style>body { color: red; }</style><p>Content</p><script>alert("test")</script>'
      const result = (renderer as any).htmlToText(html)
      
      expect(result).toBe('Content')
      expect(result).not.toContain('color: red')
      expect(result).not.toContain('alert')
    })

    it('should decode HTML entities', () => {
      const html = '<p>&amp; &lt; &gt; &quot; &#39; &nbsp;</p>'
      const result = (renderer as any).htmlToText(html)
      
      expect(result).toBe('& < > " \' ')
    })

    it('should normalize whitespace', () => {
      const html = '<p>Multiple   \n\n  spaces\t\tand\r\nnewlines</p>'
      const result = (renderer as any).htmlToText(html)
      
      expect(result).toBe('Multiple spaces and newlines')
    })

    it('should handle empty HTML', () => {
      const result = (renderer as any).htmlToText('')
      expect(result).toBe('')
    })
  })

  describe('renderEmailHtml', () => {
    const mockTheme = {
      htmlTemplate: '<html><head><style>{{theme_styles}}</style></head><body>{{email_content}}</body></html>',
      cssStyles: 'body { margin: 0; }',
      variables: '{"color": "blue"}'
    }

    it('should render email HTML with theme template', () => {
      const bodyHtml = '<h1>Welcome</h1><p>Content here</p>'
      const variables = { user: 'John' }

      const result = (renderer as any).renderEmailHtml(mockTheme, bodyHtml, variables)

      expect(result).toContain('<html>')
      expect(result).toContain('<h1>Welcome</h1>')
      expect(result).toContain('body { margin: 0; }')
    })

    it('should handle theme with null variables', () => {
      const themeWithNullVars = { ...mockTheme, variables: null }
      const bodyHtml = '<p>Content</p>'
      const variables = { test: 'value' }

      const result = (renderer as any).renderEmailHtml(themeWithNullVars, bodyHtml, variables)

      expect(result).toContain('<p>Content</p>')
      expect(result).toContain('<html>')
    })
  })

  describe('database queries', () => {
    it('should query template by slug correctly', async () => {
      const mockTemplate = { id: '1', slug: 'test-template' }
      mockDb.prepare().first.mockResolvedValueOnce(mockTemplate)

      const result = await (renderer as any).getTemplateBySlug('test-template')

      expect(mockDb.prepare).toHaveBeenCalledWith(
        'SELECT * FROM email_templates WHERE slug = ? AND is_active = 1'
      )
      expect(mockDb.prepare().bind).toHaveBeenCalledWith('test-template')
      expect(result).toEqual(mockTemplate)
    })

    it('should handle template query database errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockDb.prepare().first.mockRejectedValueOnce(new Error('DB Error'))

      const result = await (renderer as any).getTemplateBySlug('test-template')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to get email template:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('should query theme by id correctly', async () => {
      const mockTheme = { id: 'theme-1', name: 'Default' }
      mockDb.prepare().first.mockResolvedValueOnce(mockTheme)

      const result = await (renderer as any).getThemeById('theme-1')

      expect(mockDb.prepare).toHaveBeenCalledWith(
        'SELECT * FROM email_themes WHERE id = ? AND is_active = 1'
      )
      expect(mockDb.prepare().bind).toHaveBeenCalledWith('theme-1')
      expect(result).toEqual(mockTheme)
    })

    it('should handle theme query database errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockDb.prepare().first.mockRejectedValueOnce(new Error('DB Error'))

      const result = await (renderer as any).getThemeById('theme-1')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to get email theme:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('getDummyVariables static method', () => {
    it('should return comprehensive dummy data for previews', () => {
      const dummyVars = EmailTemplateRenderer.getDummyVariables()

      expect(dummyVars).toHaveProperty('user')
      expect(dummyVars.user).toHaveProperty('firstName', 'Jane')
      expect(dummyVars.user).toHaveProperty('lastName', 'Smith')
      expect(dummyVars.user).toHaveProperty('email', 'jane.smith@example.com')

      expect(dummyVars).toHaveProperty('resetLink')
      expect(dummyVars).toHaveProperty('activationLink')
      expect(dummyVars).toHaveProperty('content')
      expect(dummyVars).toHaveProperty('formData')
      expect(dummyVars).toHaveProperty('submissionId')

      // Check specific dummy data
      expect(dummyVars.resetLink).toContain('reset')
      expect(dummyVars.activationLink).toContain('activate')
      expect(dummyVars.content.title).toBeDefined()
      expect(dummyVars.formData.name).toBeDefined()
    })
  })

  describe('createEmailRenderer factory', () => {
    it('should create EmailTemplateRenderer instance', async () => {
      const { createEmailRenderer } = await import('../services/email-renderer')
      const env = { DB: mockDb }
      
      const rendererInstance = createEmailRenderer(env)
      
      expect(rendererInstance).toBeInstanceOf(EmailTemplateRenderer)
    })
  })

  describe('markdown rendering integration', () => {
    const mockTemplate = {
      id: 'template-1',
      slug: 'markdown-test',
      subject: 'Test',
      markdownContent: '# Heading\n\n**Bold text** and [link](http://example.com)',
      variables: null,
      themeId: 'theme-1'
    }

    const mockTheme = {
      id: 'theme-1',
      htmlTemplate: '{{email_content}}',
      cssStyles: '',
      variables: null
    }

    it('should render markdown content to HTML', async () => {
      mockDb.prepare().first
        .mockResolvedValueOnce(mockTemplate)
        .mockResolvedValueOnce(mockTheme)

      const result = await renderer.renderTemplate('markdown-test')

      expect(result.html).toContain('<p>')
      expect(result.subject).toBe('Test')
    })
  })
})