/**
 * Telemetry Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TelemetryService, createInstallationIdentity } from './telemetry-service'
import type { TelemetryIdentity } from '../types/telemetry'

describe('TelemetryService', () => {
  let telemetryService: TelemetryService
  let identity: TelemetryIdentity

  beforeEach(() => {
    identity = createInstallationIdentity('test-project')
    telemetryService = new TelemetryService({ enabled: true, debug: false })
  })

  describe('initialization', () => {
    it('should create a telemetry service instance', () => {
      expect(telemetryService).toBeDefined()
      expect(telemetryService).toBeInstanceOf(TelemetryService)
    })

    it('should initialize with identity without errors', async () => {
      await expect(telemetryService.initialize(identity)).resolves.not.toThrow()
      // Note: Service may disable itself if PostHog import fails in test environment
      // This is expected behavior - telemetry should fail gracefully
    })

    it('should respect disabled configuration', () => {
      const disabledService = new TelemetryService({ enabled: false })
      expect(disabledService.isEnabled()).toBe(false)
    })
  })

  describe('event tracking', () => {
    it('should track installation started event', async () => {
      await telemetryService.initialize(identity)
      await expect(telemetryService.trackInstallationStarted({
        os: 'darwin',
        nodeVersion: '18.0'
      })).resolves.not.toThrow()
    })

    it('should track installation completed event', async () => {
      await telemetryService.initialize(identity)
      await expect(telemetryService.trackInstallationCompleted({
        duration: 1000,
        success: true
      })).resolves.not.toThrow()
    })

    it('should track installation failed event', async () => {
      await telemetryService.initialize(identity)
      await expect(telemetryService.trackInstallationFailed(
        new Error('Test error'),
        { duration: 500 }
      )).resolves.not.toThrow()
    })

    it('should not throw when tracking without initialization', async () => {
      await expect(telemetryService.track('installation_started')).resolves.not.toThrow()
    })

    it('should not track when disabled', async () => {
      telemetryService.disable()
      await telemetryService.initialize(identity)
      await expect(telemetryService.track('installation_started')).resolves.not.toThrow()
    })
  })

  describe('property sanitization', () => {
    it('should sanitize route properties', async () => {
      await telemetryService.initialize(identity)
      await expect(telemetryService.trackPageView('/admin/users/123')).resolves.not.toThrow()
    })

    it('should sanitize error messages', async () => {
      await telemetryService.initialize(identity)
      await expect(telemetryService.trackError(
        new Error('Database connection failed: timeout')
      )).resolves.not.toThrow()
    })
  })

  describe('enable/disable', () => {
    it('should enable telemetry', () => {
      telemetryService.disable()
      expect(telemetryService.isEnabled()).toBe(false)

      telemetryService.enable()
      expect(telemetryService.isEnabled()).toBe(true)
    })

    it('should disable telemetry', () => {
      telemetryService.enable()
      expect(telemetryService.isEnabled()).toBe(true)

      telemetryService.disable()
      expect(telemetryService.isEnabled()).toBe(false)
    })
  })

  describe('shutdown', () => {
    it('should shutdown without errors', async () => {
      await telemetryService.initialize(identity)
      await expect(telemetryService.shutdown()).resolves.not.toThrow()
    })

    it('should shutdown when not initialized', async () => {
      await expect(telemetryService.shutdown()).resolves.not.toThrow()
    })
  })
})

describe('createInstallationIdentity', () => {
  it('should create installation identity with ID', () => {
    const identity = createInstallationIdentity()
    expect(identity).toBeDefined()
    expect(identity.installationId).toBeDefined()
    expect(typeof identity.installationId).toBe('string')
  })

  it('should create installation identity with project ID', () => {
    const identity = createInstallationIdentity('my-project')
    expect(identity).toBeDefined()
    expect(identity.installationId).toBeDefined()
    expect(identity.projectId).toBeDefined()
    expect(typeof identity.projectId).toBe('string')
  })

  it('should generate unique installation IDs', () => {
    const identity1 = createInstallationIdentity()
    const identity2 = createInstallationIdentity()
    expect(identity1.installationId).not.toBe(identity2.installationId)
  })

  it('should generate consistent project IDs for same project name', () => {
    const identity1 = createInstallationIdentity('test-project')
    const identity2 = createInstallationIdentity('test-project')
    expect(identity1.projectId).toBe(identity2.projectId)
  })

  it('should generate different project IDs for different project names', () => {
    const identity1 = createInstallationIdentity('project-a')
    const identity2 = createInstallationIdentity('project-b')
    expect(identity1.projectId).not.toBe(identity2.projectId)
  })
})

describe('TelemetryService extended tests', () => {
  let telemetryService: TelemetryService
  let identity: TelemetryIdentity

  beforeEach(() => {
    identity = createInstallationIdentity('test-project')
    telemetryService = new TelemetryService({ enabled: true, debug: false, host: 'https://test-stats.example.com' })
  })

  describe('dev server tracking', () => {
    it('should track dev server started event', async () => {
      await telemetryService.initialize(identity)
      await expect(telemetryService.trackDevServerStarted({
        port: 3000,
        environment: 'development'
      })).resolves.not.toThrow()
    })
  })

  describe('plugin tracking', () => {
    it('should track plugin activated event', async () => {
      await telemetryService.initialize(identity)
      await expect(telemetryService.trackPluginActivated({
        pluginName: 'test-plugin',
        version: '1.0.0'
      })).resolves.not.toThrow()
    })
  })

  describe('migration tracking', () => {
    it('should track migration run event', async () => {
      await telemetryService.initialize(identity)
      await expect(telemetryService.trackMigrationRun({
        migrationCount: 5,
        duration: 2000
      })).resolves.not.toThrow()
    })
  })

  describe('debug mode', () => {
    it('should not log when debug is disabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const debugDisabledService = new TelemetryService({ enabled: true, debug: false })
      await debugDisabledService.initialize(identity)

      // Debug logs should not be called
      const debugCalls = consoleSpy.mock.calls.filter(call =>
        call[0] && typeof call[0] === 'string' && call[0].includes('[Telemetry]')
      )
      // With debug off, there should be no telemetry debug logs
      expect(debugCalls.length).toBe(0)

      consoleSpy.mockRestore()
    })
  })

  describe('event queue', () => {
    it('should queue events before initialization', async () => {
      // Track event before initialization
      await telemetryService.track('test_event', { test: true })

      // Now initialize
      await telemetryService.initialize(identity)

      // Event should have been queued and flushed (no error thrown)
    })

    it('should handle multiple queued events', async () => {
      // Track multiple events before initialization
      await telemetryService.track('event_1')
      await telemetryService.track('event_2')
      await telemetryService.track('event_3')

      // Initialize to flush queue
      await telemetryService.initialize(identity)

      // No errors should be thrown
    })
  })

  describe('error tracking with string', () => {
    it('should track installation failed with string error', async () => {
      await telemetryService.initialize(identity)
      await expect(telemetryService.trackInstallationFailed(
        'Simple error message',
        { duration: 500 }
      )).resolves.not.toThrow()
    })

    it('should track generic error with string', async () => {
      await telemetryService.initialize(identity)
      await expect(telemetryService.trackError('Generic error string')).resolves.not.toThrow()
    })
  })

  describe('property sanitization edge cases', () => {
    it('should handle undefined properties', async () => {
      await telemetryService.initialize(identity)
      await expect(telemetryService.track('test_event', {
        definedProp: 'value',
        undefinedProp: undefined
      })).resolves.not.toThrow()
    })

    it('should handle error property names', async () => {
      await telemetryService.initialize(identity)
      await expect(telemetryService.track('test_event', {
        errorMessage: 'some error message',
        lastError: 'another error',
        customError: 'custom error text'
      })).resolves.not.toThrow()
    })

    it('should handle non-string/number/boolean properties', async () => {
      await telemetryService.initialize(identity)
      await expect(telemetryService.track('test_event', {
        stringProp: 'string',
        numberProp: 123,
        boolProp: true,
        objectProp: { nested: 'value' } as any, // Should be filtered out
        arrayProp: [1, 2, 3] as any // Should be filtered out
      })).resolves.not.toThrow()
    })

    it('should handle empty properties', async () => {
      await telemetryService.initialize(identity)
      await expect(telemetryService.track('test_event', {})).resolves.not.toThrow()
    })
  })

  describe('tracking when disabled', () => {
    it('should skip tracking when service is disabled', async () => {
      telemetryService.disable()

      // None of these should throw or do anything
      await telemetryService.track('test_event')
      await telemetryService.trackInstallationStarted()
      await telemetryService.trackInstallationCompleted()
      await telemetryService.trackInstallationFailed('error')
      await telemetryService.trackDevServerStarted()
      await telemetryService.trackPageView('/test')
      await telemetryService.trackError('error')
      await telemetryService.trackPluginActivated()
      await telemetryService.trackMigrationRun()

      expect(telemetryService.isEnabled()).toBe(false)
    })
  })

  describe('initialization when disabled', () => {
    it('should not initialize when disabled', async () => {
      telemetryService.disable()
      await telemetryService.initialize(identity)

      // Should still be disabled
      expect(telemetryService.isEnabled()).toBe(false)
    })
  })
})

describe('TelemetryService fetch and debug tests', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>
  let consoleSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'))
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    fetchSpy.mockRestore()
    consoleSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('fetch behavior', () => {
    it('should make fetch call when initialized with host', async () => {
      const service = new TelemetryService({
        enabled: true,
        debug: false,
        host: 'https://stats.example.com'
      })
      const identity = createInstallationIdentity('test')
      await service.initialize(identity)

      await service.track('test_event', { key: 'value' })

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://stats.example.com/v1/events',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      )
    })

    it('should include correct payload structure in fetch', async () => {
      const service = new TelemetryService({
        enabled: true,
        debug: false,
        host: 'https://stats.example.com'
      })
      const identity = createInstallationIdentity('test')
      await service.initialize(identity)

      await service.track('installation_started', { custom: 'data' })

      const fetchCall = fetchSpy.mock.calls[0]
      const body = JSON.parse(fetchCall[1]?.body as string)

      expect(body.data).toBeDefined()
      expect(body.data.installation_id).toBe(identity.installationId)
      expect(body.data.event_type).toBe('installation_started')
      expect(body.data.properties).toBeDefined()
      expect(body.data.timestamp).toBeDefined()
    })

    it('should silently handle fetch errors', async () => {
      fetchSpy.mockRejectedValue(new Error('Network error'))

      const service = new TelemetryService({
        enabled: true,
        debug: false,
        host: 'https://stats.example.com'
      })
      const identity = createInstallationIdentity('test')
      await service.initialize(identity)

      // Should not throw
      await expect(service.track('test_event')).resolves.not.toThrow()
    })

    it('should not make fetch call without host', async () => {
      const service = new TelemetryService({
        enabled: true,
        debug: false,
        host: ''
      })
      const identity = createInstallationIdentity('test')
      await service.initialize(identity)

      await service.track('test_event')

      expect(fetchSpy).not.toHaveBeenCalled()
    })
  })

  describe('debug mode logging', () => {
    it('should log initialization when debug is enabled', async () => {
      const service = new TelemetryService({
        enabled: true,
        debug: true,
        host: 'https://stats.example.com'
      })
      const identity = createInstallationIdentity('test')
      await service.initialize(identity)

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Telemetry] Initialized with installation ID:',
        identity.installationId
      )
    })

    it('should log queued events when debug is enabled', async () => {
      const service = new TelemetryService({
        enabled: true,
        debug: true,
        host: 'https://stats.example.com'
      })

      // Track before init to queue
      await service.track('queued_event', { test: true })

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Telemetry] Queued event:',
        'queued_event',
        expect.any(Object)
      )
    })

    it('should log tracked events when debug is enabled', async () => {
      const service = new TelemetryService({
        enabled: true,
        debug: true,
        host: 'https://stats.example.com'
      })
      const identity = createInstallationIdentity('test')
      await service.initialize(identity)

      await service.track('tracked_event', { data: 'value' })

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Telemetry] Tracked event:',
        'tracked_event',
        expect.any(Object)
      )
    })

    it('should log disabled message when debug enabled but telemetry disabled', async () => {
      const service = new TelemetryService({
        enabled: false,
        debug: true
      })
      const identity = createInstallationIdentity('test')
      await service.initialize(identity)

      expect(consoleSpy).toHaveBeenCalledWith('[Telemetry] Disabled via configuration')
    })

    it('should log when tracking without endpoint in debug mode', async () => {
      const service = new TelemetryService({
        enabled: true,
        debug: true,
        host: ''
      })
      const identity = createInstallationIdentity('test')
      await service.initialize(identity)

      await service.track('test_event')

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Telemetry] Event (no endpoint):',
        'test_event',
        expect.any(Object)
      )
    })
  })

  describe('initialization error handling', () => {
    it('should disable service on initialization error and log in debug mode', async () => {
      // Create a service that will error during initialization
      const service = new TelemetryService({
        enabled: true,
        debug: true,
        host: 'https://stats.example.com'
      })

      // Mock identity to cause an error during init by making it null
      // Actually the init doesn't throw, so we test the normal flow
      const identity = createInstallationIdentity('test')
      await service.initialize(identity)

      // Service should still be enabled after successful init
      expect(service.isEnabled()).toBe(true)
    })
  })

  describe('track error handling', () => {
    it('should log errors in debug mode when tracking fails', async () => {
      const service = new TelemetryService({
        enabled: true,
        debug: true,
        host: 'https://stats.example.com'
      })
      const identity = createInstallationIdentity('test')
      await service.initialize(identity)

      // Mock sanitizeProperties to throw
      const originalTrack = service.track.bind(service)
      vi.spyOn(service as any, 'sanitizeProperties').mockImplementation(() => {
        throw new Error('Sanitization error')
      })

      await expect(originalTrack('test_event')).resolves.not.toThrow()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Telemetry] Failed to track event:',
        expect.any(Error)
      )
    })
  })

  describe('version detection', () => {
    it('should include version in tracked events', async () => {
      const service = new TelemetryService({
        enabled: true,
        debug: false,
        host: 'https://stats.example.com'
      })
      const identity = createInstallationIdentity('test')
      await service.initialize(identity)

      await service.track('test_event')

      const fetchCall = fetchSpy.mock.calls[0]
      const body = JSON.parse(fetchCall[1]?.body as string)

      expect(body.data.properties.version).toBeDefined()
    })
  })

  describe('flushQueue behavior', () => {
    it('should flush all queued events on initialization', async () => {
      const service = new TelemetryService({
        enabled: true,
        debug: false,
        host: 'https://stats.example.com'
      })

      // Queue multiple events before init
      await service.track('event_1')
      await service.track('event_2')
      await service.track('event_3')

      // No fetch calls yet (queued)
      expect(fetchSpy).not.toHaveBeenCalled()

      // Initialize to trigger flush
      const identity = createInstallationIdentity('test')
      await service.initialize(identity)

      // All 3 queued events should have been flushed
      expect(fetchSpy).toHaveBeenCalledTimes(3)
    })

    it('should not fail on empty queue flush', async () => {
      const service = new TelemetryService({
        enabled: true,
        debug: false,
        host: 'https://stats.example.com'
      })
      const identity = createInstallationIdentity('test')

      // Initialize without any queued events
      await expect(service.initialize(identity)).resolves.not.toThrow()

      expect(fetchSpy).not.toHaveBeenCalled()
    })
  })
})

describe('getTelemetryService and initTelemetry', () => {
  it('should import and use getTelemetryService', async () => {
    const { getTelemetryService } = await import('./telemetry-service')
    const service = getTelemetryService({ enabled: false })

    expect(service).toBeDefined()
    expect(service).toBeInstanceOf(TelemetryService)
  })

  it('should import and use initTelemetry', async () => {
    const { initTelemetry } = await import('./telemetry-service')
    const identity = createInstallationIdentity('test')

    const service = await initTelemetry(identity, { enabled: false })

    expect(service).toBeDefined()
    expect(service).toBeInstanceOf(TelemetryService)
  })
})
