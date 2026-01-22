import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getDefaultTelemetryConfig,
  isTelemetryEnabled,
  getTelemetryConfig,
  shouldSkipEvent
} from './telemetry-config'

describe('telemetry-config', () => {
  // Store original process.env
  const originalEnv = { ...process.env }

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv }
    // Clear any cached values
    vi.resetModules()
  })

  afterEach(() => {
    // Restore original process.env after each test
    process.env = originalEnv
  })

  describe('getDefaultTelemetryConfig', () => {
    it('should return default configuration with telemetry enabled', () => {
      delete process.env.SONICJS_TELEMETRY_ENDPOINT
      delete process.env.NODE_ENV

      const config = getDefaultTelemetryConfig()

      expect(config.enabled).toBe(true)
      expect(config.host).toBe('https://stats.sonicjs.com')
      expect(config.debug).toBe(false)
    })

    it('should use custom endpoint from environment variable', () => {
      process.env.SONICJS_TELEMETRY_ENDPOINT = 'https://custom.endpoint.com'

      const config = getDefaultTelemetryConfig()

      expect(config.host).toBe('https://custom.endpoint.com')
    })

    it('should enable debug mode in development environment', () => {
      process.env.NODE_ENV = 'development'

      const config = getDefaultTelemetryConfig()

      expect(config.debug).toBe(true)
    })

    it('should disable debug mode in production environment', () => {
      process.env.NODE_ENV = 'production'

      const config = getDefaultTelemetryConfig()

      expect(config.debug).toBe(false)
    })
  })

  describe('isTelemetryEnabled', () => {
    it('should return true by default (opt-out model)', () => {
      delete process.env.SONICJS_TELEMETRY
      delete process.env.DO_NOT_TRACK

      const enabled = isTelemetryEnabled()

      expect(enabled).toBe(true)
    })

    it('should return false when SONICJS_TELEMETRY is "false"', () => {
      process.env.SONICJS_TELEMETRY = 'false'

      const enabled = isTelemetryEnabled()

      expect(enabled).toBe(false)
    })

    it('should return false when SONICJS_TELEMETRY is "0"', () => {
      process.env.SONICJS_TELEMETRY = '0'

      const enabled = isTelemetryEnabled()

      expect(enabled).toBe(false)
    })

    it('should return false when SONICJS_TELEMETRY is "disabled"', () => {
      process.env.SONICJS_TELEMETRY = 'disabled'

      const enabled = isTelemetryEnabled()

      expect(enabled).toBe(false)
    })

    it('should return false when DO_NOT_TRACK is "1"', () => {
      process.env.DO_NOT_TRACK = '1'

      const enabled = isTelemetryEnabled()

      expect(enabled).toBe(false)
    })

    it('should return false when DO_NOT_TRACK is "true"', () => {
      process.env.DO_NOT_TRACK = 'true'

      const enabled = isTelemetryEnabled()

      expect(enabled).toBe(false)
    })

    it('should return true when DO_NOT_TRACK has other values', () => {
      process.env.DO_NOT_TRACK = '0'
      delete process.env.SONICJS_TELEMETRY

      const enabled = isTelemetryEnabled()

      expect(enabled).toBe(true)
    })

    it('should return true when SONICJS_TELEMETRY has other values like "true"', () => {
      process.env.SONICJS_TELEMETRY = 'true'
      delete process.env.DO_NOT_TRACK

      const enabled = isTelemetryEnabled()

      expect(enabled).toBe(true)
    })
  })

  describe('getTelemetryConfig', () => {
    it('should merge default config with enabled state', () => {
      delete process.env.SONICJS_TELEMETRY
      delete process.env.DO_NOT_TRACK

      const config = getTelemetryConfig()

      expect(config.enabled).toBe(true)
      expect(config.host).toBe('https://stats.sonicjs.com')
    })

    it('should reflect disabled telemetry in config', () => {
      process.env.SONICJS_TELEMETRY = 'false'

      const config = getTelemetryConfig()

      expect(config.enabled).toBe(false)
    })
  })

  describe('shouldSkipEvent', () => {
    it('should not skip event when sample rate is 1.0 (100%)', () => {
      const shouldSkip = shouldSkipEvent('test_event', 1.0)

      expect(shouldSkip).toBe(false)
    })

    it('should not skip event when sample rate is greater than 1.0', () => {
      const shouldSkip = shouldSkipEvent('test_event', 1.5)

      expect(shouldSkip).toBe(false)
    })

    it('should skip event when sample rate is 0', () => {
      const shouldSkip = shouldSkipEvent('test_event', 0)

      expect(shouldSkip).toBe(true)
    })

    it('should skip event when sample rate is negative', () => {
      const shouldSkip = shouldSkipEvent('test_event', -0.5)

      expect(shouldSkip).toBe(true)
    })

    it('should use default sample rate of 1.0 when not provided', () => {
      const shouldSkip = shouldSkipEvent('test_event')

      expect(shouldSkip).toBe(false)
    })

    it('should be deterministic for the same event name', () => {
      // Same event name should always produce the same result
      const results = new Set<boolean>()

      for (let i = 0; i < 10; i++) {
        results.add(shouldSkipEvent('consistent_event', 0.5))
      }

      // All results should be the same (deterministic)
      expect(results.size).toBe(1)
    })

    it('should produce different results for different event names at partial sample rate', () => {
      // With 50% sample rate, some events should skip and some shouldn't
      // We test with many different event names to verify the hash-based sampling
      const eventNames = [
        'event_a', 'event_b', 'event_c', 'event_d', 'event_e',
        'event_f', 'event_g', 'event_h', 'event_i', 'event_j',
        'event_k', 'event_l', 'event_m', 'event_n', 'event_o'
      ]

      const results = eventNames.map(name => shouldSkipEvent(name, 0.5))
      const skipped = results.filter(r => r === true).length
      const notSkipped = results.filter(r => r === false).length

      // With 50% sample rate, we should see some of each (not all same)
      // This test may occasionally fail with very unlucky event names, but is statistically unlikely
      expect(skipped).toBeGreaterThan(0)
      expect(notSkipped).toBeGreaterThan(0)
    })

    it('should handle empty event name', () => {
      // Empty string should still produce a deterministic result
      const result1 = shouldSkipEvent('', 0.5)
      const result2 = shouldSkipEvent('', 0.5)

      expect(result1).toBe(result2)
    })

    it('should handle special characters in event name', () => {
      const shouldSkip = shouldSkipEvent('test_event_!@#$%^&*()', 1.0)

      expect(shouldSkip).toBe(false)
    })

    it('should handle unicode characters in event name', () => {
      const shouldSkip = shouldSkipEvent('test_event_\u{1F600}\u{1F680}', 1.0)

      expect(shouldSkip).toBe(false)
    })
  })
})
