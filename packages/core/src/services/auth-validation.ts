/**
 * Auth Validation Service
 *
 * Placeholder - actual implementation is in the monolith
 */

export interface AuthSettings {
  enablePasswordLogin?: boolean
  enableOAuthLogin?: boolean
  requireEmailVerification?: boolean
  [key: string]: any
}

export const authValidationService: any = {}
