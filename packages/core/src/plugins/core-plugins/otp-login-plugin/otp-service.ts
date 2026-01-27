/**
 * OTP Service
 * Handles OTP code generation, verification, and management
 */

import type { D1Database } from '@cloudflare/workers-types'

export interface OTPSettings {
  codeLength: number
  codeExpiryMinutes: number
  maxAttempts: number
  rateLimitPerHour: number
  allowNewUserRegistration: boolean
}

export interface OTPCode {
  id: string
  user_email: string
  code: string
  expires_at: number
  used: number
  used_at: number | null
  ip_address: string | null
  user_agent: string | null
  attempts: number
  created_at: number
}

export class OTPService {
  constructor(private db: D1Database) {}

  /**
   * Generate a secure random OTP code
   */
  generateCode(length: number = 6): string {
    const digits = '0123456789'
    let code = ''

    for (let i = 0; i < length; i++) {
      const randomValues = new Uint8Array(1)
      crypto.getRandomValues(randomValues)
      const randomValue = randomValues[0] ?? 0
      code += digits[randomValue % digits.length]
    }

    return code
  }

  /**
   * Create and store a new OTP code
   */
  async createOTPCode(
    email: string,
    settings: OTPSettings,
    ipAddress?: string,
    userAgent?: string
  ): Promise<OTPCode> {
    const code = this.generateCode(settings.codeLength)
    const id = crypto.randomUUID()
    const now = Date.now()
    const expiresAt = now + (settings.codeExpiryMinutes * 60 * 1000)

    const otpCode: OTPCode = {
      id,
      user_email: email.toLowerCase(),
      code,
      expires_at: expiresAt,
      used: 0,
      used_at: null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      attempts: 0,
      created_at: now
    }

    await this.db.prepare(`
      INSERT INTO otp_codes (
        id, user_email, code, expires_at, used, used_at,
        ip_address, user_agent, attempts, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      otpCode.id,
      otpCode.user_email,
      otpCode.code,
      otpCode.expires_at,
      otpCode.used,
      otpCode.used_at,
      otpCode.ip_address,
      otpCode.user_agent,
      otpCode.attempts,
      otpCode.created_at
    ).run()

    return otpCode
  }

  /**
   * Verify an OTP code
   */
  async verifyCode(
    email: string,
    code: string,
    settings: OTPSettings
  ): Promise<{ valid: boolean; attemptsRemaining?: number; error?: string }> {
    const normalizedEmail = email.toLowerCase()
    const now = Date.now()

    // Find the most recent unused code for this email
    const otpCode = await this.db.prepare(`
      SELECT * FROM otp_codes
      WHERE user_email = ? AND code = ? AND used = 0
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(normalizedEmail, code).first() as OTPCode | null

    if (!otpCode) {
      return { valid: false, error: 'Invalid or expired code' }
    }

    // Check if expired
    if (now > otpCode.expires_at) {
      return { valid: false, error: 'Code has expired' }
    }

    // Check attempts
    if (otpCode.attempts >= settings.maxAttempts) {
      return { valid: false, error: 'Maximum attempts exceeded' }
    }

    // Code is valid - mark as used
    await this.db.prepare(`
      UPDATE otp_codes
      SET used = 1, used_at = ?, attempts = attempts + 1
      WHERE id = ?
    `).bind(now, otpCode.id).run()

    return { valid: true }
  }

  /**
   * Increment failed attempt count
   */
  async incrementAttempts(email: string, code: string): Promise<number> {
    const normalizedEmail = email.toLowerCase()

    const result = await this.db.prepare(`
      UPDATE otp_codes
      SET attempts = attempts + 1
      WHERE user_email = ? AND code = ? AND used = 0
      RETURNING attempts
    `).bind(normalizedEmail, code).first() as { attempts: number } | null

    return result?.attempts || 0
  }

  /**
   * Check rate limiting
   */
  async checkRateLimit(email: string, settings: OTPSettings): Promise<boolean> {
    const normalizedEmail = email.toLowerCase()
    const oneHourAgo = Date.now() - (60 * 60 * 1000)

    const result = await this.db.prepare(`
      SELECT COUNT(*) as count
      FROM otp_codes
      WHERE user_email = ? AND created_at > ?
    `).bind(normalizedEmail, oneHourAgo).first() as { count: number } | null

    const count = result?.count || 0
    return count < settings.rateLimitPerHour
  }

  /**
   * Get recent OTP requests for activity log
   */
  async getRecentRequests(limit: number = 50): Promise<OTPCode[]> {
    const result = await this.db.prepare(`
      SELECT * FROM otp_codes
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(limit).all()

    const rows = (result.results || []) as Record<string, unknown>[]
    return rows.map(row => this.mapRowToOTP(row))
  }

  /**
   * Clean up expired codes (for maintenance)
   */
  async cleanupExpiredCodes(): Promise<number> {
    const now = Date.now()

    const result = await this.db.prepare(`
      DELETE FROM otp_codes
      WHERE expires_at < ? OR (used = 1 AND used_at < ?)
    `).bind(now, now - (30 * 24 * 60 * 60 * 1000)).run() // Keep used codes for 30 days

    return result.meta.changes || 0
  }

  private mapRowToOTP(row: Record<string, unknown>): OTPCode {
    return {
      id: String(row.id),
      user_email: String(row.user_email),
      code: String(row.code),
      expires_at: Number(row.expires_at ?? Date.now()),
      used: Number(row.used ?? 0),
      used_at: row.used_at === null || row.used_at === undefined ? null : Number(row.used_at),
      ip_address: typeof row.ip_address === 'string' ? row.ip_address : null,
      user_agent: typeof row.user_agent === 'string' ? row.user_agent : null,
      attempts: Number(row.attempts ?? 0),
      created_at: Number(row.created_at ?? Date.now())
    }
  }

  /**
   * Get OTP statistics
   */
  async getStats(days: number = 7): Promise<{
    total: number
    successful: number
    failed: number
    expired: number
  }> {
    const since = Date.now() - (days * 24 * 60 * 60 * 1000)

    const stats = await this.db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN used = 1 THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN attempts >= 3 AND used = 0 THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN expires_at < ? AND used = 0 THEN 1 ELSE 0 END) as expired
      FROM otp_codes
      WHERE created_at > ?
    `).bind(Date.now(), since).first() as any

    return {
      total: stats?.total || 0,
      successful: stats?.successful || 0,
      failed: stats?.failed || 0,
      expired: stats?.expired || 0
    }
  }
}
