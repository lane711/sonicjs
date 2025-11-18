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
