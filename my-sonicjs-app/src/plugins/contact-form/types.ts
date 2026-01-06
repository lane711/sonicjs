/**
 * Contact Form Plugin Types
 * 
 * Type definitions for the contact form plugin
 */

/**
 * Contact form settings interface
 */
export interface ContactSettings {
  /** Company or organization name */
  companyName: string
  /** Contact phone number */
  phoneNumber: string
  /** Brief description or tagline */
  description?: string
  /** Street address */
  address: string
  /** City name */
  city?: string
  /** State, province, or region */
  state?: string
  /** Whether to show Google Map embed */
  showMap: boolean | number | string
  /** Google Maps API key */
  mapApiKey?: string
  /** Whether to enable Turnstile bot protection (optional, requires Turnstile plugin) */
  useTurnstile?: boolean | number | string
}

/**
 * Contact message interface
 */
export interface ContactMessage {
  /** Sender's name */
  name: string
  /** Sender's email address */
  email: string
  /** Message content */
  msg: string
  /** Timestamp (optional, set by server) */
  timestamp?: number
  /** Message ID (optional, set by server) */
  id?: string
}

/**
 * Contact service response interface
 */
export interface ContactServiceResponse<T = any> {
  /** Whether the operation was successful */
  success: boolean
  /** Response data */
  data?: T
  /** Error message if unsuccessful */
  error?: string
  /** Optional message */
  message?: string
}
