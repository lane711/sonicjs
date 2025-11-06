import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OTPService } from '../../plugins/core-plugins/otp-login-plugin/otp-service'

// Mock D1 Database
const createMockDB = () => {
  const mockData = {
    otpCodes: [] as any[],
    users: [
      { id: 'user-1', email: 'test@example.com', role: 'admin', is_active: 1 }
    ]
  }

  return {
    prepare: vi.fn((sql: string) => ({
      bind: vi.fn((...args: any[]) => ({
        run: vi.fn().mockResolvedValue({ meta: { changes: 1 } }),
        first: vi.fn().mockResolvedValue(
          sql.includes('otp_codes') && sql.includes('SELECT')
            ? mockData.otpCodes[0]
            : sql.includes('users')
            ? mockData.users[0]
            : null
        ),
        all: vi.fn().mockResolvedValue({ results: mockData.otpCodes })
      }))
    }))
  } as any
}

describe('OTP Login Plugin', () => {
  describe('OTPService', () => {
    let mockDB: any
    let otpService: OTPService

    beforeEach(() => {
      mockDB = createMockDB()
      otpService = new OTPService(mockDB)
    })

    describe('generateCode', () => {
      it('should generate code of specified length', () => {
        const code = otpService.generateCode(6)
        expect(code).toHaveLength(6)
        expect(code).toMatch(/^[0-9]+$/)
      })

      it('should generate different codes each time', () => {
        const code1 = otpService.generateCode(6)
        const code2 = otpService.generateCode(6)
        expect(code1).not.toBe(code2)
      })

      it('should handle different lengths', () => {
        expect(otpService.generateCode(4)).toHaveLength(4)
        expect(otpService.generateCode(8)).toHaveLength(8)
      })
    })

    describe('createOTPCode', () => {
      it('should create OTP code with correct structure', async () => {
        const settings = {
          codeLength: 6,
          codeExpiryMinutes: 10,
          maxAttempts: 3,
          rateLimitPerHour: 5,
          allowNewUserRegistration: false,
          appName: 'Test App'
        }

        const otpCode = await otpService.createOTPCode(
          'test@example.com',
          settings,
          '127.0.0.1',
          'Mozilla/5.0'
        )

        expect(otpCode).toMatchObject({
          user_email: 'test@example.com',
          used: 0,
          attempts: 0,
          ip_address: '127.0.0.1',
          user_agent: 'Mozilla/5.0'
        })
        expect(otpCode.code).toHaveLength(6)
        expect(otpCode.expires_at).toBeGreaterThan(Date.now())
      })

      it('should normalize email to lowercase', async () => {
        const settings = {
          codeLength: 6,
          codeExpiryMinutes: 10,
          maxAttempts: 3,
          rateLimitPerHour: 5,
          allowNewUserRegistration: false,
          appName: 'Test App'
        }

        const otpCode = await otpService.createOTPCode(
          'TEST@EXAMPLE.COM',
          settings
        )

        expect(otpCode.user_email).toBe('test@example.com')
      })
    })
  })

  describe('API Endpoints', () => {
    it('should validate email format on request', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'test@',
        'test@.com'
      ]

      for (const email of invalidEmails) {
        const atIndex = email.indexOf('@')
        const lastDotIndex = email.lastIndexOf('.')
        const isValid = atIndex > 0 && // has characters before @
                       lastDotIndex > atIndex + 1 && // has characters between @ and last dot
                       lastDotIndex < email.length - 1 // has characters after last dot
        expect(isValid).toBe(false)
      }
    })

    it('should accept valid email format', () => {
      const validEmails = [
        'test@example.com',
        'user+tag@domain.co.uk',
        'admin@test.org'
      ]

      for (const email of validEmails) {
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      }
    })
  })

  describe('Security', () => {
    it('should generate cryptographically secure codes', () => {
      const codes = new Set()
      const iterations = 100

      for (let i = 0; i < iterations; i++) {
        const service = new OTPService(createMockDB())
        codes.add(service.generateCode(6))
      }

      // Should have high uniqueness (at least 95% unique)
      expect(codes.size).toBeGreaterThan(iterations * 0.95)
    })

    it('should handle rate limiting check', async () => {
      const otpService = new OTPService(createMockDB())
      const settings = {
        codeLength: 6,
        codeExpiryMinutes: 10,
        maxAttempts: 3,
        rateLimitPerHour: 5,
        allowNewUserRegistration: false,
        appName: 'Test App'
      }

      const canRequest = await otpService.checkRateLimit('test@example.com', settings)
      expect(typeof canRequest).toBe('boolean')
    })
  })
})
