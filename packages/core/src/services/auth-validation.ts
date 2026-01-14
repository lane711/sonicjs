/**
 * Auth Validation Service
 *
 * Provides validation schemas for authentication operations
 */

import { z } from 'zod'
import type { D1Database } from '@cloudflare/workers-types'

export interface AuthSettings {
  enablePasswordLogin?: boolean
  enableOAuthLogin?: boolean
  requireEmailVerification?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

/**
 * Check if user registration is enabled in the auth plugin settings
 * @param db - D1 database instance
 * @returns true if registration is enabled, false if disabled
 */
export async function isRegistrationEnabled(db: D1Database): Promise<boolean> {
  try {
    const plugin = await db.prepare('SELECT settings FROM plugins WHERE id = ?')
      .bind('core-auth')
      .first() as { settings: string } | null

    if (plugin?.settings) {
      // Parse settings and check registration.enabled
      // SQLite stores booleans as 0/1, so check for both false and 0
      const settings = JSON.parse(plugin.settings)
      const enabled = settings?.registration?.enabled
      return enabled !== false && enabled !== 0
    }
    return true // Default to enabled if no settings
  } catch {
    return true // Default to enabled on error
  }
}

/**
 * Check if this would be the first user registration (bootstrap scenario)
 * The first user should always be allowed to register even if registration is disabled
 * @param db - D1 database instance
 * @returns true if no users exist in the database
 */
export async function isFirstUserRegistration(db: D1Database): Promise<boolean> {
  try {
    const result = await db.prepare('SELECT COUNT(*) as count FROM users').first() as { count: number } | null
    return result?.count === 0
  } catch {
    return false // Default to not first user on error
  }
}

/**
 * Auth Validation Service
 * Provides dynamic validation schemas for registration based on database settings
 */
const baseRegistrationSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional()
})

export type RegistrationSchema = typeof baseRegistrationSchema
export type RegistrationData = z.infer<RegistrationSchema>

export const authValidationService = {
  /**
   * Build registration schema dynamically based on auth settings
   * For now, returns a static schema with standard fields
   */
  async buildRegistrationSchema(_db: D1Database): Promise<RegistrationSchema> {
    // TODO: Load settings from database to make fields optional/required dynamically
    // For now, use a static schema with common registration fields
    return baseRegistrationSchema
  },

  /**
   * Generate default values for optional fields
   */
  generateDefaultValue(field: string, data: any): string {
    switch (field) {
      case 'username':
        // Generate username from email (part before @)
        return data.email ? data.email.split('@')[0] : `user${Date.now()}`
      case 'firstName':
        return 'User'
      case 'lastName':
        return data.email ? data.email.split('@')[0] : 'Account'
      default:
        return ''
    }
  }
}
