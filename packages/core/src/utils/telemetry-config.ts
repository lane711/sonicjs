/**
 * Telemetry Configuration Utilities
 *
 * Manages telemetry settings and opt-out mechanisms
 */

import type { TelemetryConfig } from '../types/telemetry'

/**
 * Safely get an environment variable
 * Works in both Node.js and Cloudflare Workers environments
 */
function safeGetEnv(key: string): string | undefined {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key]
    }
  } catch {
    // process is not defined in this runtime (e.g., Cloudflare Workers)
  }
  return undefined
}

/**
 * Get default telemetry configuration
 * Uses lazy evaluation to avoid accessing process.env at module load time
 */
export function getDefaultTelemetryConfig(): TelemetryConfig {
  return {
    enabled: true,
    apiKey: safeGetEnv('POSTHOG_API_KEY') || 'phc_VuhFUIJLXzwyGjlgQ67dbNeSh5x4cp9F8i15hZFIDhs',
    host: safeGetEnv('POSTHOG_HOST') || 'https://us.i.posthog.com',
    debug: safeGetEnv('NODE_ENV') === 'development'
  }
}

/**
 * Check if telemetry is enabled via environment variables
 */
export function isTelemetryEnabled(): boolean {
  // Check for explicit opt-out
  const telemetryEnv = safeGetEnv('SONICJS_TELEMETRY')
  if (telemetryEnv === 'false' || telemetryEnv === '0' || telemetryEnv === 'disabled') {
    return false
  }

  // Check for DO_NOT_TRACK environment variable (common standard)
  const doNotTrack = safeGetEnv('DO_NOT_TRACK')
  if (doNotTrack === '1' || doNotTrack === 'true') {
    return false
  }

  // Default to enabled (opt-out model)
  return true
}

/**
 * Get telemetry configuration from environment
 */
export function getTelemetryConfig(): TelemetryConfig {
  return {
    ...getDefaultTelemetryConfig(),
    enabled: isTelemetryEnabled()
  }
}

/**
 * Check if telemetry should be skipped for this event
 * Used to implement sampling or rate limiting if needed
 */
export function shouldSkipEvent(eventName: string, sampleRate: number = 1.0): boolean {
  if (sampleRate >= 1.0) return false
  if (sampleRate <= 0) return true

  // Use a consistent hash of the event name for deterministic sampling
  let hash = 0
  for (let i = 0; i < eventName.length; i++) {
    hash = ((hash << 5) - hash) + eventName.charCodeAt(i)
    hash = hash & hash
  }

  return Math.abs(hash % 100) / 100 > sampleRate
}
