import type { D1Database } from '@cloudflare/workers-types'
import manifest from '../manifest.json'

export interface TurnstileSettings {
  siteKey: string
  secretKey: string
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
  mode?: 'managed' | 'non-interactive' | 'invisible'
  appearance?: 'always' | 'execute' | 'interaction-only'
  preClearance?: boolean
  preClearanceLevel?: 'interactive' | 'managed' | 'non-interactive'
  enabled: boolean
}

export interface TurnstileVerificationResponse {
  success: boolean
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'error-codes'?: string[] // Cloudflare API uses kebab-case for this field
  challenge_ts?: string
  hostname?: string
}

export class TurnstileService {
  private db: D1Database
  private readonly VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

  constructor(db: D1Database) {
    this.db = db
  }

  /**
   * Get Turnstile settings from database
   */
  async getSettings(): Promise<TurnstileSettings | null> {
    try {
      const plugin = await this.db
        .prepare(`SELECT settings FROM plugins WHERE id = ? LIMIT 1`)
        .bind(manifest.id)
        .first<{ settings: string }>()

      if (!plugin || !plugin.settings) {
        return null
      }

      return JSON.parse(plugin.settings) as TurnstileSettings
    } catch (error) {
      console.error('Error getting Turnstile settings:', error)
      return null
    }
  }

  /**
   * Verify a Turnstile token with Cloudflare
   */
  async verifyToken(token: string, remoteIp?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const settings = await this.getSettings()

      if (!settings) {
        return { success: false, error: 'Turnstile not configured' }
      }

      if (!settings.enabled) {
        // Turnstile disabled, allow through
        return { success: true }
      }

      if (!settings.secretKey) {
        return { success: false, error: 'Turnstile secret key not configured' }
      }

      const formData = new FormData()
      formData.append('secret', settings.secretKey)
      formData.append('response', token)
      if (remoteIp) {
        formData.append('remoteip', remoteIp)
      }

      const response = await fetch(this.VERIFY_URL, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        return { success: false, error: 'Turnstile verification request failed' }
      }

      const result: TurnstileVerificationResponse = await response.json()

      if (!result.success) {
        const errorCode = result['error-codes']?.[0] || 'unknown-error'
        return { success: false, error: `Turnstile verification failed: ${errorCode}` }
      }

      return { success: true }
    } catch (error) {
      console.error('Error verifying Turnstile token:', error)
      return { success: false, error: 'Turnstile verification error' }
    }
  }

  /**
   * Save Turnstile settings to database
   */
  async saveSettings(settings: TurnstileSettings): Promise<void> {
    try {
      await this.db
        .prepare(`UPDATE plugins SET settings = ?, updated_at = ? WHERE id = ?`)
        .bind(JSON.stringify(settings), Date.now(), manifest.id)
        .run()
      console.log('Turnstile settings saved successfully')
    } catch (error) {
      console.error('Error saving Turnstile settings:', error)
      throw new Error('Failed to save Turnstile settings')
    }
  }

  /**
   * Check if Turnstile is enabled
   */
  async isEnabled(): Promise<boolean> {
    const settings = await this.getSettings()
    return settings?.enabled === true && !!settings.siteKey && !!settings.secretKey
  }
}
