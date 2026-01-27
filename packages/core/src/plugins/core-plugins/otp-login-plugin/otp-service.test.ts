/**
 * OTP Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OTPService, type OTPSettings, type OTPCode } from './otp-service'

// Mock D1Database
function createMockDb() {
  const mockPrepare = vi.fn()
  const mockBind = vi.fn()
  const mockFirst = vi.fn()
  const mockAll = vi.fn()
  const mockRun = vi.fn()

  const chainable = {
    bind: mockBind.mockReturnThis(),
    first: mockFirst,
    all: mockAll,
    run: mockRun
  }

  mockPrepare.mockReturnValue(chainable)

  return {
    prepare: mockPrepare,
    _mocks: {
      prepare: mockPrepare,
      bind: mockBind,
      first: mockFirst,
      all: mockAll,
      run: mockRun
    }
  }
}

// Default OTP settings for tests
function createTestSettings(overrides: Partial<OTPSettings> = {}): OTPSettings {
  return {
    codeLength: 6,
    codeExpiryMinutes: 10,
    maxAttempts: 3,
    rateLimitPerHour: 5,
    allowNewUserRegistration: true,
    ...overrides
  }
}

describe('OTPService', () => {
  let otpService: OTPService
  let mockDb: ReturnType<typeof createMockDb>

  beforeEach(() => {
    mockDb = createMockDb()
    otpService = new OTPService(mockDb as any)
    vi.clearAllMocks()
  })

  describe('generateCode', () => {
    it('should generate a code of specified length', () => {
      const code = otpService.generateCode(6)

      expect(code).toHaveLength(6)
      expect(/^\d+$/.test(code)).toBe(true)
    })

    it('should generate 6 digit code by default', () => {
      const code = otpService.generateCode()

      expect(code).toHaveLength(6)
    })

    it('should generate different length codes', () => {
      const code4 = otpService.generateCode(4)
      const code8 = otpService.generateCode(8)

      expect(code4).toHaveLength(4)
      expect(code8).toHaveLength(8)
    })

    it('should generate only numeric codes', () => {
      // Generate multiple codes to ensure randomness produces valid output
      for (let i = 0; i < 10; i++) {
        const code = otpService.generateCode(6)
        expect(/^[0-9]+$/.test(code)).toBe(true)
      }
    })

    it('should generate different codes on subsequent calls', () => {
      const codes = new Set<string>()
      for (let i = 0; i < 100; i++) {
        codes.add(otpService.generateCode(6))
      }
      // With 6 digit codes and 100 attempts, we should have many unique codes
      expect(codes.size).toBeGreaterThan(90)
    })
  })

  describe('createOTPCode', () => {
    it('should create and store an OTP code', async () => {
      mockDb._mocks.run.mockResolvedValue({ success: true })
      const settings = createTestSettings()

      const result = await otpService.createOTPCode('test@example.com', settings)

      expect(result).toBeDefined()
      expect(result.user_email).toBe('test@example.com')
      expect(result.code).toHaveLength(6)
      expect(result.used).toBe(0)
      expect(result.attempts).toBe(0)
      expect(mockDb._mocks.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO otp_codes'))
    })

    it('should normalize email to lowercase', async () => {
      mockDb._mocks.run.mockResolvedValue({ success: true })
      const settings = createTestSettings()

      const result = await otpService.createOTPCode('TEST@EXAMPLE.COM', settings)

      expect(result.user_email).toBe('test@example.com')
    })

    it('should set expiry based on settings', async () => {
      mockDb._mocks.run.mockResolvedValue({ success: true })
      const settings = createTestSettings({ codeExpiryMinutes: 15 })
      const beforeCreate = Date.now()

      const result = await otpService.createOTPCode('test@example.com', settings)

      const expectedExpiry = beforeCreate + (15 * 60 * 1000)
      // Allow some tolerance for execution time
      expect(result.expires_at).toBeGreaterThanOrEqual(expectedExpiry - 1000)
      expect(result.expires_at).toBeLessThanOrEqual(expectedExpiry + 1000)
    })

    it('should store IP address when provided', async () => {
      mockDb._mocks.run.mockResolvedValue({ success: true })
      const settings = createTestSettings()

      const result = await otpService.createOTPCode(
        'test@example.com',
        settings,
        '192.168.1.1'
      )

      expect(result.ip_address).toBe('192.168.1.1')
    })

    it('should store user agent when provided', async () => {
      mockDb._mocks.run.mockResolvedValue({ success: true })
      const settings = createTestSettings()

      const result = await otpService.createOTPCode(
        'test@example.com',
        settings,
        undefined,
        'Mozilla/5.0'
      )

      expect(result.user_agent).toBe('Mozilla/5.0')
    })

    it('should use custom code length from settings', async () => {
      mockDb._mocks.run.mockResolvedValue({ success: true })
      const settings = createTestSettings({ codeLength: 8 })

      const result = await otpService.createOTPCode('test@example.com', settings)

      expect(result.code).toHaveLength(8)
    })

    it('should set null for optional fields when not provided', async () => {
      mockDb._mocks.run.mockResolvedValue({ success: true })
      const settings = createTestSettings()

      const result = await otpService.createOTPCode('test@example.com', settings)

      expect(result.ip_address).toBeNull()
      expect(result.user_agent).toBeNull()
      expect(result.used_at).toBeNull()
    })
  })

  describe('verifyCode', () => {
    it('should return valid: true for correct code', async () => {
      const settings = createTestSettings()
      mockDb._mocks.first.mockResolvedValue({
        id: 'otp-123',
        user_email: 'test@example.com',
        code: '123456',
        expires_at: Date.now() + 60000, // Not expired
        used: 0,
        attempts: 0
      })
      mockDb._mocks.run.mockResolvedValue({ success: true })

      const result = await otpService.verifyCode('test@example.com', '123456', settings)

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return invalid for non-existent code', async () => {
      const settings = createTestSettings()
      mockDb._mocks.first.mockResolvedValue(null)

      const result = await otpService.verifyCode('test@example.com', '000000', settings)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Invalid or expired code')
    })

    it('should return invalid for expired code', async () => {
      const settings = createTestSettings()
      mockDb._mocks.first.mockResolvedValue({
        id: 'otp-123',
        user_email: 'test@example.com',
        code: '123456',
        expires_at: Date.now() - 60000, // Expired
        used: 0,
        attempts: 0
      })

      const result = await otpService.verifyCode('test@example.com', '123456', settings)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Code has expired')
    })

    it('should return invalid when max attempts exceeded', async () => {
      const settings = createTestSettings({ maxAttempts: 3 })
      mockDb._mocks.first.mockResolvedValue({
        id: 'otp-123',
        user_email: 'test@example.com',
        code: '123456',
        expires_at: Date.now() + 60000,
        used: 0,
        attempts: 3 // Max attempts reached
      })

      const result = await otpService.verifyCode('test@example.com', '123456', settings)

      expect(result.valid).toBe(false)
      expect(result.error).toBe('Maximum attempts exceeded')
    })

    it('should mark code as used after successful verification', async () => {
      const settings = createTestSettings()
      mockDb._mocks.first.mockResolvedValue({
        id: 'otp-123',
        user_email: 'test@example.com',
        code: '123456',
        expires_at: Date.now() + 60000,
        used: 0,
        attempts: 0
      })
      mockDb._mocks.run.mockResolvedValue({ success: true })

      await otpService.verifyCode('test@example.com', '123456', settings)

      expect(mockDb._mocks.prepare).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE otp_codes')
      )
      expect(mockDb._mocks.prepare).toHaveBeenCalledWith(
        expect.stringContaining('used = 1')
      )
    })

    it('should normalize email to lowercase', async () => {
      const settings = createTestSettings()
      mockDb._mocks.first.mockResolvedValue(null)

      await otpService.verifyCode('TEST@EXAMPLE.COM', '123456', settings)

      expect(mockDb._mocks.bind).toHaveBeenCalledWith('test@example.com', '123456')
    })
  })

  describe('incrementAttempts', () => {
    it('should increment attempts and return new count', async () => {
      mockDb._mocks.first.mockResolvedValue({ attempts: 2 })

      const result = await otpService.incrementAttempts('test@example.com', '123456')

      expect(result).toBe(2)
      expect(mockDb._mocks.prepare).toHaveBeenCalledWith(
        expect.stringContaining('attempts = attempts + 1')
      )
    })

    it('should return 0 when no matching code found', async () => {
      mockDb._mocks.first.mockResolvedValue(null)

      const result = await otpService.incrementAttempts('test@example.com', '123456')

      expect(result).toBe(0)
    })

    it('should normalize email to lowercase', async () => {
      mockDb._mocks.first.mockResolvedValue({ attempts: 1 })

      await otpService.incrementAttempts('TEST@EXAMPLE.COM', '123456')

      expect(mockDb._mocks.bind).toHaveBeenCalledWith('test@example.com', '123456')
    })
  })

  describe('checkRateLimit', () => {
    it('should return true when under rate limit', async () => {
      const settings = createTestSettings({ rateLimitPerHour: 5 })
      mockDb._mocks.first.mockResolvedValue({ count: 3 })

      const result = await otpService.checkRateLimit('test@example.com', settings)

      expect(result).toBe(true)
    })

    it('should return false when at rate limit', async () => {
      const settings = createTestSettings({ rateLimitPerHour: 5 })
      mockDb._mocks.first.mockResolvedValue({ count: 5 })

      const result = await otpService.checkRateLimit('test@example.com', settings)

      expect(result).toBe(false)
    })

    it('should return false when over rate limit', async () => {
      const settings = createTestSettings({ rateLimitPerHour: 5 })
      mockDb._mocks.first.mockResolvedValue({ count: 10 })

      const result = await otpService.checkRateLimit('test@example.com', settings)

      expect(result).toBe(false)
    })

    it('should return true when count is 0', async () => {
      const settings = createTestSettings({ rateLimitPerHour: 5 })
      mockDb._mocks.first.mockResolvedValue({ count: 0 })

      const result = await otpService.checkRateLimit('test@example.com', settings)

      expect(result).toBe(true)
    })

    it('should return true when count is null', async () => {
      const settings = createTestSettings({ rateLimitPerHour: 5 })
      mockDb._mocks.first.mockResolvedValue(null)

      const result = await otpService.checkRateLimit('test@example.com', settings)

      expect(result).toBe(true)
    })

    it('should normalize email to lowercase', async () => {
      const settings = createTestSettings()
      mockDb._mocks.first.mockResolvedValue({ count: 0 })

      await otpService.checkRateLimit('TEST@EXAMPLE.COM', settings)

      expect(mockDb._mocks.bind).toHaveBeenCalledWith('test@example.com', expect.any(Number))
    })
  })

  describe('getRecentRequests', () => {
    it('should return recent OTP requests', async () => {
      mockDb._mocks.all.mockResolvedValue({
        results: [
          {
            id: 'otp-1',
            user_email: 'user1@example.com',
            code: '123456',
            expires_at: Date.now() + 60000,
            used: 0,
            used_at: null,
            ip_address: '192.168.1.1',
            user_agent: 'Mozilla',
            attempts: 0,
            created_at: Date.now()
          },
          {
            id: 'otp-2',
            user_email: 'user2@example.com',
            code: '654321',
            expires_at: Date.now() + 60000,
            used: 1,
            used_at: Date.now(),
            ip_address: null,
            user_agent: null,
            attempts: 1,
            created_at: Date.now() - 1000
          }
        ]
      })

      const result = await otpService.getRecentRequests()

      expect(result).toHaveLength(2)
      expect(result[0].user_email).toBe('user1@example.com')
      expect(result[1].user_email).toBe('user2@example.com')
    })

    it('should use default limit of 50', async () => {
      mockDb._mocks.all.mockResolvedValue({ results: [] })

      await otpService.getRecentRequests()

      expect(mockDb._mocks.bind).toHaveBeenCalledWith(50)
    })

    it('should use custom limit when provided', async () => {
      mockDb._mocks.all.mockResolvedValue({ results: [] })

      await otpService.getRecentRequests(10)

      expect(mockDb._mocks.bind).toHaveBeenCalledWith(10)
    })

    it('should return empty array when no results', async () => {
      mockDb._mocks.all.mockResolvedValue({ results: null })

      const result = await otpService.getRecentRequests()

      expect(result).toEqual([])
    })

    it('should handle missing optional fields', async () => {
      mockDb._mocks.all.mockResolvedValue({
        results: [{
          id: 'otp-1',
          user_email: 'user@example.com',
          code: '123456',
          // Missing optional fields
        }]
      })

      const result = await otpService.getRecentRequests()

      expect(result[0].ip_address).toBeNull()
      expect(result[0].user_agent).toBeNull()
      expect(result[0].used_at).toBeNull()
    })
  })

  describe('cleanupExpiredCodes', () => {
    it('should delete expired codes and return count', async () => {
      mockDb._mocks.run.mockResolvedValue({ meta: { changes: 5 } })

      const result = await otpService.cleanupExpiredCodes()

      expect(result).toBe(5)
      expect(mockDb._mocks.prepare).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM otp_codes')
      )
    })

    it('should return 0 when no codes deleted', async () => {
      mockDb._mocks.run.mockResolvedValue({ meta: { changes: 0 } })

      const result = await otpService.cleanupExpiredCodes()

      expect(result).toBe(0)
    })

    it('should return 0 when meta.changes is undefined', async () => {
      mockDb._mocks.run.mockResolvedValue({ meta: {} })

      const result = await otpService.cleanupExpiredCodes()

      expect(result).toBe(0)
    })
  })

  describe('getStats', () => {
    it('should return OTP statistics', async () => {
      mockDb._mocks.first.mockResolvedValue({
        total: 100,
        successful: 80,
        failed: 10,
        expired: 10
      })

      const result = await otpService.getStats()

      expect(result).toEqual({
        total: 100,
        successful: 80,
        failed: 10,
        expired: 10
      })
    })

    it('should use default 7 days when not specified', async () => {
      mockDb._mocks.first.mockResolvedValue({
        total: 0,
        successful: 0,
        failed: 0,
        expired: 0
      })

      const beforeCall = Date.now()
      await otpService.getStats()

      // Second bind argument should be approximately 7 days ago
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
      const expectedSince = beforeCall - sevenDaysMs

      expect(mockDb._mocks.bind).toHaveBeenCalled()
      const bindArgs = mockDb._mocks.bind.mock.calls[0]
      expect(bindArgs[1]).toBeGreaterThanOrEqual(expectedSince - 1000)
      expect(bindArgs[1]).toBeLessThanOrEqual(expectedSince + 1000)
    })

    it('should use custom days parameter', async () => {
      mockDb._mocks.first.mockResolvedValue({
        total: 0,
        successful: 0,
        failed: 0,
        expired: 0
      })

      const beforeCall = Date.now()
      await otpService.getStats(30)

      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
      const expectedSince = beforeCall - thirtyDaysMs

      expect(mockDb._mocks.bind).toHaveBeenCalled()
      const bindArgs = mockDb._mocks.bind.mock.calls[0]
      expect(bindArgs[1]).toBeGreaterThanOrEqual(expectedSince - 1000)
      expect(bindArgs[1]).toBeLessThanOrEqual(expectedSince + 1000)
    })

    it('should return zeros when no results', async () => {
      mockDb._mocks.first.mockResolvedValue(null)

      const result = await otpService.getStats()

      expect(result).toEqual({
        total: 0,
        successful: 0,
        failed: 0,
        expired: 0
      })
    })

    it('should handle partial results', async () => {
      mockDb._mocks.first.mockResolvedValue({
        total: 50,
        // Missing other fields
      })

      const result = await otpService.getStats()

      expect(result.total).toBe(50)
      expect(result.successful).toBe(0)
      expect(result.failed).toBe(0)
      expect(result.expired).toBe(0)
    })
  })
})
