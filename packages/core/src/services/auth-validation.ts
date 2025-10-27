/**
 * Auth Validation Service
 *
 * Provides validation schemas for authentication operations
 */

import { z } from 'zod'

export interface AuthSettings {
  enablePasswordLogin?: boolean
  enableOAuthLogin?: boolean
  requireEmailVerification?: boolean
  [key: string]: any
}

/**
 * Auth Validation Service
 * Provides dynamic validation schemas for registration based on database settings
 */
export const authValidationService = {
  /**
   * Build registration schema dynamically based on auth settings
   * For now, returns a static schema with standard fields
   */
  async buildRegistrationSchema(_db: D1Database): Promise<z.ZodSchema> {
    // TODO: Load settings from database to make fields optional/required dynamically
    // For now, use a static schema with common registration fields
    return z.object({
      email: z.string().email('Valid email is required'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      username: z.string().min(3, 'Username must be at least 3 characters').optional(),
      firstName: z.string().min(1, 'First name is required').optional(),
      lastName: z.string().min(1, 'Last name is required').optional()
    })
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
