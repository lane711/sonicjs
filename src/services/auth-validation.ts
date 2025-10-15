import { z } from 'zod'
import type { D1Database } from '@cloudflare/workers-types'

export interface FieldConfig {
  required: boolean
  minLength: number
  label: string
  type: string
}

export interface AuthSettings {
  requiredFields: {
    email: FieldConfig
    password: FieldConfig
    username: FieldConfig
    firstName: FieldConfig
    lastName: FieldConfig
  }
  validation: {
    emailFormat: boolean
    allowDuplicateUsernames: boolean
    passwordRequirements: {
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
    }
  }
  registration: {
    enabled: boolean
    requireEmailVerification: boolean
    defaultRole: string
  }
}

export class AuthValidationService {
  private static instance: AuthValidationService
  private cachedSettings: AuthSettings | null = null
  private cacheExpiry: number = 0
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): AuthValidationService {
    if (!AuthValidationService.instance) {
      AuthValidationService.instance = new AuthValidationService()
    }
    return AuthValidationService.instance
  }

  /**
   * Get authentication settings from core-auth plugin
   */
  async getAuthSettings(db: D1Database): Promise<AuthSettings> {
    // Return cached settings if still valid
    if (this.cachedSettings && Date.now() < this.cacheExpiry) {
      return this.cachedSettings
    }

    try {
      const plugin = await db
        .prepare('SELECT settings FROM plugins WHERE id = ? AND status = ?')
        .bind('core-auth', 'active')
        .first() as any

      if (!plugin || !plugin.settings) {
        console.warn('[AuthValidation] Core-auth plugin not found or not active, using defaults')
        return this.getDefaultSettings()
      }

      const settings = typeof plugin.settings === 'string'
        ? JSON.parse(plugin.settings)
        : plugin.settings

      // Cache the settings
      this.cachedSettings = settings
      this.cacheExpiry = Date.now() + this.CACHE_TTL

      return settings
    } catch (error) {
      console.error('[AuthValidation] Error loading auth settings:', error)
      return this.getDefaultSettings()
    }
  }

  /**
   * Get default authentication settings
   */
  private getDefaultSettings(): AuthSettings {
    return {
      requiredFields: {
        email: { required: true, minLength: 5, label: 'Email', type: 'email' },
        password: { required: true, minLength: 8, label: 'Password', type: 'password' },
        username: { required: true, minLength: 3, label: 'Username', type: 'text' },
        firstName: { required: true, minLength: 1, label: 'First Name', type: 'text' },
        lastName: { required: true, minLength: 1, label: 'Last Name', type: 'text' },
      },
      validation: {
        emailFormat: true,
        allowDuplicateUsernames: false,
        passwordRequirements: {
          requireUppercase: false,
          requireLowercase: false,
          requireNumbers: false,
          requireSpecialChars: false,
        },
      },
      registration: {
        enabled: true,
        requireEmailVerification: false,
        defaultRole: 'viewer',
      },
    }
  }

  /**
   * Build dynamic Zod schema based on settings
   */
  async buildRegistrationSchema(db: D1Database): Promise<z.ZodObject<any>> {
    const settings = await this.getAuthSettings(db)
    const fields = settings.requiredFields
    const validation = settings.validation

    const schemaFields: Record<string, z.ZodTypeAny> = {}

    // Email field
    if (fields.email.required) {
      let emailSchema = z.string()

      if (validation.emailFormat) {
        emailSchema = emailSchema.email('Valid email is required')
      }

      if (fields.email.minLength > 0) {
        emailSchema = emailSchema.min(
          fields.email.minLength,
          `Email must be at least ${fields.email.minLength} characters`
        )
      }

      schemaFields.email = emailSchema
    } else {
      schemaFields.email = z.string().email().optional()
    }

    // Password field
    if (fields.password.required) {
      let passwordSchema = z.string().min(
        fields.password.minLength,
        `Password must be at least ${fields.password.minLength} characters`
      )

      // Add password requirements validation
      if (validation.passwordRequirements.requireUppercase) {
        passwordSchema = passwordSchema.regex(
          /[A-Z]/,
          'Password must contain at least one uppercase letter'
        )
      }

      if (validation.passwordRequirements.requireLowercase) {
        passwordSchema = passwordSchema.regex(
          /[a-z]/,
          'Password must contain at least one lowercase letter'
        )
      }

      if (validation.passwordRequirements.requireNumbers) {
        passwordSchema = passwordSchema.regex(
          /[0-9]/,
          'Password must contain at least one number'
        )
      }

      if (validation.passwordRequirements.requireSpecialChars) {
        passwordSchema = passwordSchema.regex(
          /[!@#$%^&*(),.?":{}|<>]/,
          'Password must contain at least one special character'
        )
      }

      schemaFields.password = passwordSchema
    } else {
      schemaFields.password = z.string().min(fields.password.minLength).optional()
    }

    // Username field
    if (fields.username.required) {
      schemaFields.username = z.string().min(
        fields.username.minLength,
        `Username must be at least ${fields.username.minLength} characters`
      )
    } else {
      schemaFields.username = z.string().min(fields.username.minLength).optional()
    }

    // First name field
    if (fields.firstName.required) {
      schemaFields.firstName = z.string().min(
        fields.firstName.minLength,
        `First name must be at least ${fields.firstName.minLength} characters`
      )
    } else {
      schemaFields.firstName = z.string().optional()
    }

    // Last name field
    if (fields.lastName.required) {
      schemaFields.lastName = z.string().min(
        fields.lastName.minLength,
        `Last name must be at least ${fields.lastName.minLength} characters`
      )
    } else {
      schemaFields.lastName = z.string().optional()
    }

    return z.object(schemaFields)
  }

  /**
   * Validate registration data against settings
   */
  async validateRegistration(db: D1Database, data: any): Promise<{ valid: boolean; errors: string[] }> {
    try {
      const schema = await this.buildRegistrationSchema(db)
      await schema.parseAsync(data)
      return { valid: true, errors: [] }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(e => e.message),
        }
      }
      return {
        valid: false,
        errors: ['Validation failed'],
      }
    }
  }

  /**
   * Clear cached settings (call after updating plugin settings)
   */
  clearCache(): void {
    this.cachedSettings = null
    this.cacheExpiry = 0
  }

  /**
   * Get required field names for database insertion
   */
  async getRequiredFieldNames(db: D1Database): Promise<string[]> {
    const settings = await this.getAuthSettings(db)
    const requiredFields: string[] = []

    Object.entries(settings.requiredFields).forEach(([key, config]) => {
      if (config.required) {
        requiredFields.push(key)
      }
    })

    return requiredFields
  }

  /**
   * Generate auto-fill values for optional fields
   */
  generateDefaultValue(fieldName: string, data: any): string {
    switch (fieldName) {
      case 'username':
        // Generate username from email if not provided
        return data.email ? data.email.split('@')[0] : `user_${Date.now()}`
      case 'firstName':
        return data.firstName || 'User'
      case 'lastName':
        return data.lastName || ''
      default:
        return ''
    }
  }
}

// Export singleton instance
export const authValidationService = AuthValidationService.getInstance()
