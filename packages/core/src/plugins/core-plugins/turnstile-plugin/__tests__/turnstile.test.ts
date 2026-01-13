import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TurnstileService } from '../services/turnstile'
import type { D1Database } from '@cloudflare/workers-types'

// Mock D1 Database
const createMockDb = () => {
  return {
    prepare: vi.fn((query: string) => ({
      bind: vi.fn((...args: any[]) => ({
        first: vi.fn(),
        run: vi.fn(),
      })),
    })),
  } as unknown as D1Database
}

// Mock fetch globally
global.fetch = vi.fn()

describe('TurnstileService', () => {
  let db: D1Database
  let turnstileService: TurnstileService

  beforeEach(() => {
    db = createMockDb()
    turnstileService = new TurnstileService(db)
    vi.clearAllMocks()
  })

  describe('getSettings', () => {
    it('should return null when plugin has no settings', async () => {
      const prepare = db.prepare as ReturnType<typeof vi.fn>
      prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      })

      const settings = await turnstileService.getSettings()
      expect(settings).toBeNull()
    })

    it('should return parsed settings when they exist', async () => {
      const mockSettings = {
        siteKey: 'test-site-key',
        secretKey: 'test-secret-key',
        theme: 'auto' as const,
        size: 'normal' as const,
        enabled: true,
      }

      const prepare = db.prepare as ReturnType<typeof vi.fn>
      prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({
            settings: JSON.stringify(mockSettings),
          }),
        }),
      })

      const settings = await turnstileService.getSettings()
      expect(settings).toEqual(mockSettings)
    })

    it('should handle JSON parse errors gracefully', async () => {
      const prepare = db.prepare as ReturnType<typeof vi.fn>
      prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({
            settings: 'invalid-json',
          }),
        }),
      })

      const settings = await turnstileService.getSettings()
      expect(settings).toBeNull()
    })
  })

  describe('verifyToken', () => {
    it('should return error when Turnstile is not configured', async () => {
      const prepare = db.prepare as ReturnType<typeof vi.fn>
      prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      })

      const result = await turnstileService.verifyToken('test-token')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Turnstile not configured')
    })

    it('should allow through when Turnstile is disabled', async () => {
      const prepare = db.prepare as ReturnType<typeof vi.fn>
      prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({
            settings: JSON.stringify({
              siteKey: 'test-key',
              secretKey: 'test-secret',
              enabled: false,
            }),
          }),
        }),
      })

      const result = await turnstileService.verifyToken('test-token')
      expect(result.success).toBe(true)
    })

    it('should verify token successfully with Cloudflare API', async () => {
      const mockSettings = {
        siteKey: 'test-site-key',
        secretKey: 'test-secret-key',
        enabled: true,
      }

      const prepare = db.prepare as ReturnType<typeof vi.fn>
      prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({
            settings: JSON.stringify(mockSettings),
          }),
        }),
      })

      // Mock successful Cloudflare API response
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          challenge_ts: '2024-01-01T00:00:00Z',
          hostname: 'example.com',
        }),
      })

      const result = await turnstileService.verifyToken('valid-token')
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should handle verification failure with error codes', async () => {
      const mockSettings = {
        siteKey: 'test-site-key',
        secretKey: 'test-secret-key',
        enabled: true,
      }

      const prepare = db.prepare as ReturnType<typeof vi.fn>
      prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({
            settings: JSON.stringify(mockSettings),
          }),
        }),
      })

      // Mock failed Cloudflare API response
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          'error-codes': ['invalid-input-response'],
        }),
      })

      const result = await turnstileService.verifyToken('invalid-token')
      expect(result.success).toBe(false)
      expect(result.error).toContain('invalid-input-response')
    })

    it('should include remoteip when provided', async () => {
      const mockSettings = {
        siteKey: 'test-site-key',
        secretKey: 'test-secret-key',
        enabled: true,
      }

      const prepare = db.prepare as ReturnType<typeof vi.fn>
      prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({
            settings: JSON.stringify(mockSettings),
          }),
        }),
      })

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      const remoteIp = '192.168.1.1'
      await turnstileService.verifyToken('test-token', remoteIp)

      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
      const formData = fetchCall[1].body as FormData
      expect(formData.get('remoteip')).toBe(remoteIp)
    })

    it('should use correct Cloudflare API endpoint', async () => {
      const mockSettings = {
        siteKey: 'test-site-key',
        secretKey: 'test-secret-key',
        enabled: true,
      }

      const prepare = db.prepare as ReturnType<typeof vi.fn>
      prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({
            settings: JSON.stringify(mockSettings),
          }),
        }),
      })

      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      await turnstileService.verifyToken('test-token')

      const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
      expect(fetchCall[0]).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify')
      expect(fetchCall[1].method).toBe('POST')
    })

    it('should handle network errors gracefully', async () => {
      const mockSettings = {
        siteKey: 'test-site-key',
        secretKey: 'test-secret-key',
        enabled: true,
      }

      const prepare = db.prepare as ReturnType<typeof vi.fn>
      prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({
            settings: JSON.stringify(mockSettings),
          }),
        }),
      })

      ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error')
      )

      const result = await turnstileService.verifyToken('test-token')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Turnstile verification error')
    })
  })

  describe('saveSettings', () => {
    it('should save settings to database', async () => {
      const mockSettings = {
        siteKey: 'new-site-key',
        secretKey: 'new-secret-key',
        theme: 'dark' as const,
        size: 'compact' as const,
        enabled: true,
      }

      const runMock = vi.fn()
      const prepare = db.prepare as ReturnType<typeof vi.fn>
      prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnValue({
          run: runMock,
        }),
      })

      await turnstileService.saveSettings(mockSettings)

      expect(prepare).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE plugins')
      )
      expect(runMock).toHaveBeenCalled()
    })

    it('should handle save errors', async () => {
      const mockSettings = {
        siteKey: 'new-site-key',
        secretKey: 'new-secret-key',
        theme: 'auto' as const,
        size: 'normal' as const,
        enabled: true,
      }

      const prepare = db.prepare as ReturnType<typeof vi.fn>
      prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      })

      await expect(turnstileService.saveSettings(mockSettings)).rejects.toThrow(
        'Failed to save Turnstile settings'
      )
    })
  })

  describe('isEnabled', () => {
    it('should return false when settings are null', async () => {
      const prepare = db.prepare as ReturnType<typeof vi.fn>
      prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
        }),
      })

      const result = await turnstileService.isEnabled()
      expect(result).toBe(false)
    })

    it('should return false when enabled is false', async () => {
      const prepare = db.prepare as ReturnType<typeof vi.fn>
      prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({
            settings: JSON.stringify({
              siteKey: 'test-key',
              secretKey: 'test-secret',
              enabled: false,
            }),
          }),
        }),
      })

      const result = await turnstileService.isEnabled()
      expect(result).toBe(false)
    })

    it('should return false when keys are missing', async () => {
      const prepare = db.prepare as ReturnType<typeof vi.fn>
      prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({
            settings: JSON.stringify({
              siteKey: '',
              secretKey: '',
              enabled: true,
            }),
          }),
        }),
      })

      const result = await turnstileService.isEnabled()
      expect(result).toBe(false)
    })

    it('should return true when properly configured and enabled', async () => {
      const prepare = db.prepare as ReturnType<typeof vi.fn>
      prepare.mockReturnValueOnce({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue({
            settings: JSON.stringify({
              siteKey: 'test-key',
              secretKey: 'test-secret',
              enabled: true,
            }),
          }),
        }),
      })

      const result = await turnstileService.isEnabled()
      expect(result).toBe(true)
    })
  })
})
