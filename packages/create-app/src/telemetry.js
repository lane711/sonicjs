/**
 * Telemetry for create-sonicjs CLI
 *
 * Privacy-first telemetry to track installation metrics
 * - Anonymous installation IDs
 * - No PII collection
 * - Opt-out via environment variable
 */

import { randomUUID } from 'crypto'
import os from 'os'
import fs from 'fs-extra'
import path from 'path'

const TELEMETRY_ENABLED = process.env.SONICJS_TELEMETRY !== 'false' && process.env.DO_NOT_TRACK !== '1'
const TELEMETRY_API_KEY = process.env.POSTHOG_API_KEY || 'phc_VuhFUIJLXzwyGjlgQ67dbNeSh5x4cp9F8i15hZFIDhs'
const TELEMETRY_HOST = process.env.POSTHOG_HOST || 'https://us.i.posthog.com'
const DEBUG = process.env.DEBUG === 'true'

/**
 * Get or create installation ID
 */
function getInstallationId() {
  const telemetryDir = path.join(os.homedir(), '.sonicjs')
  const telemetryFile = path.join(telemetryDir, 'telemetry.json')

  try {
    // Try to read existing ID
    if (fs.existsSync(telemetryFile)) {
      const data = fs.readJsonSync(telemetryFile)
      if (data.installationId) {
        return data.installationId
      }
    }

    // Create new ID
    const installationId = randomUUID()
    fs.ensureDirSync(telemetryDir)
    fs.writeJsonSync(telemetryFile, { installationId, createdAt: new Date().toISOString() })

    return installationId
  } catch (error) {
    // If we can't read/write the file, generate a temporary ID
    if (DEBUG) {
      console.error('[Telemetry] Failed to get/create installation ID:', error)
    }
    return randomUUID()
  }
}

/**
 * Initialize telemetry
 */
let telemetryClient = null
let installationId = null

async function initTelemetry() {
  if (!TELEMETRY_ENABLED) {
    if (DEBUG) {
      console.log('[Telemetry] Disabled via environment variable')
    }
    return null
  }

  try {
    installationId = getInstallationId()

    // Initialize PostHog
    if (TELEMETRY_API_KEY) {
      const { PostHog } = await import('posthog-node')
      telemetryClient = new PostHog(TELEMETRY_API_KEY, {
        host: TELEMETRY_HOST,
        flushAt: 1,  // Flush immediately for CLI
        flushInterval: 1000
      })

      if (DEBUG) {
        console.log('[Telemetry] Initialized with ID:', installationId)
      }
    } else if (DEBUG) {
      console.log('[Telemetry] No API key, tracking will be logged only')
    }

    return { client: telemetryClient, installationId }
  } catch (error) {
    if (DEBUG) {
      console.error('[Telemetry] Initialization failed:', error)
    }
    return null
  }
}

/**
 * Track an event
 */
async function track(event, properties = {}) {
  if (!TELEMETRY_ENABLED) return

  try {
    if (!installationId) {
      await initTelemetry()
    }

    const enrichedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      os: os.platform(),
      nodeVersion: process.version.split('.').slice(0, 2).join('.'), // e.g., "v18.0"
    }

    if (telemetryClient && installationId) {
      telemetryClient.capture({
        distinctId: installationId,
        event,
        properties: enrichedProperties
      })

      if (DEBUG) {
        console.log('[Telemetry] Tracked:', event, enrichedProperties)
      }
    } else if (DEBUG) {
      console.log('[Telemetry] Event (no client):', event, enrichedProperties)
    }
  } catch (error) {
    // Silent fail - telemetry should never break the CLI
    if (DEBUG) {
      console.error('[Telemetry] Failed to track event:', error)
    }
  }
}

/**
 * Shutdown telemetry (flush pending events)
 */
async function shutdown() {
  if (telemetryClient) {
    try {
      await telemetryClient.shutdown()
    } catch (error) {
      if (DEBUG) {
        console.error('[Telemetry] Shutdown failed:', error)
      }
    }
  }
}

/**
 * Check if telemetry is enabled
 */
function isEnabled() {
  return TELEMETRY_ENABLED
}

export {
  initTelemetry,
  track,
  shutdown,
  isEnabled,
  getInstallationId
}
