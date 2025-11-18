/**
 * Telemetry Middleware
 *
 * Initializes and tracks runtime telemetry events
 */

import type { Context } from 'hono'
import { createInstallationIdentity, getTelemetryService } from '../services/telemetry-service'
import type { TelemetryService } from '../services/telemetry-service'

let telemetryService: TelemetryService | null = null
let isInitialized = false

/**
 * Initialize telemetry on first request
 */
async function initializeTelemetry(): Promise<void> {
  if (isInitialized) return

  try {
    // Create installation identity
    const identity = createInstallationIdentity()

    // Initialize telemetry service
    telemetryService = getTelemetryService()
    await telemetryService.initialize(identity)

    // Track dev server started (only once)
    await telemetryService.trackDevServerStarted({
      timestamp: new Date().toISOString()
    })

    isInitialized = true
  } catch (error) {
    // Silent fail - telemetry should never break the app
    console.error('[Telemetry] Initialization failed:', error)
  }
}

/**
 * Telemetry middleware
 *
 * Initializes telemetry on first request and tracks events
 */
export async function telemetryMiddleware(c: Context, next: () => Promise<void>) {
  // Initialize on first request
  if (!isInitialized) {
    await initializeTelemetry()
  }

  await next()
}

/**
 * Get the telemetry service instance
 */
export function getTelemetry(): TelemetryService | null {
  return telemetryService
}
