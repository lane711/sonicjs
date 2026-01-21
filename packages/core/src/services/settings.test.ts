/**
 * Settings Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SettingsService, type Setting, type GeneralSettings } from './settings'

// Mock D1Database
function createMockDb() {
  const mockPrepare = vi.fn()
  const mockBind = vi.fn()
  const mockFirst = vi.fn()
  const mockAll = vi.fn()
  const mockRun = vi.fn()

  const chainable = {
    bind: mockBind.mockReturnThis(),
    first: mockFirst,
    all: mockAll,
    run: mockRun
  }

  mockPrepare.mockReturnValue(chainable)

  return {
    prepare: mockPrepare,
    _mocks: {
      prepare: mockPrepare,
      bind: mockBind,
      first: mockFirst,
      all: mockAll,
      run: mockRun
    }
  }
}

describe('SettingsService', () => {
  let settingsService: SettingsService
  let mockDb: ReturnType<typeof createMockDb>

  beforeEach(() => {
    mockDb = createMockDb()
    settingsService = new SettingsService(mockDb as any)
    vi.clearAllMocks()
  })

  describe('getSetting', () => {
    it('should return null when setting does not exist', async () => {
      mockDb._mocks.first.mockResolvedValue(null)

      const result = await settingsService.getSetting('general', 'nonexistent')

      expect(result).toBeNull()
      expect(mockDb._mocks.prepare).toHaveBeenCalledWith(
        'SELECT value FROM settings WHERE category = ? AND key = ?'
      )
      expect(mockDb._mocks.bind).toHaveBeenCalledWith('general', 'nonexistent')
    })

    it('should return parsed JSON value when setting exists', async () => {
      mockDb._mocks.first.mockResolvedValue({ value: '{"name":"Test Site"}' })

      const result = await settingsService.getSetting('general', 'siteName')

      expect(result).toEqual({ name: 'Test Site' })
    })

    it('should return string value when stored as JSON string', async () => {
      mockDb._mocks.first.mockResolvedValue({ value: '"hello world"' })

      const result = await settingsService.getSetting('general', 'greeting')

      expect(result).toBe('hello world')
    })

    it('should return number value when stored as JSON number', async () => {
      mockDb._mocks.first.mockResolvedValue({ value: '42' })

      const result = await settingsService.getSetting('general', 'count')

      expect(result).toBe(42)
    })

    it('should return boolean value when stored as JSON boolean', async () => {
      mockDb._mocks.first.mockResolvedValue({ value: 'true' })

      const result = await settingsService.getSetting('general', 'enabled')

      expect(result).toBe(true)
    })

    it('should return null and log error on database error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockDb._mocks.first.mockRejectedValue(new Error('DB error'))

      const result = await settingsService.getSetting('general', 'test')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error getting setting general.test:',
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })

    it('should return null and log error on JSON parse error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockDb._mocks.first.mockResolvedValue({ value: 'invalid json' })

      const result = await settingsService.getSetting('general', 'test')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('getCategorySettings', () => {
    it('should return empty object when no settings exist', async () => {
      mockDb._mocks.all.mockResolvedValue({ results: [] })

      const result = await settingsService.getCategorySettings('general')

      expect(result).toEqual({})
      expect(mockDb._mocks.prepare).toHaveBeenCalledWith(
        'SELECT key, value FROM settings WHERE category = ?'
      )
      expect(mockDb._mocks.bind).toHaveBeenCalledWith('general')
    })

    it('should return all settings for a category', async () => {
      mockDb._mocks.all.mockResolvedValue({
        results: [
          { key: 'siteName', value: '"My Site"' },
          { key: 'language', value: '"en"' },
          { key: 'maintenanceMode', value: 'false' }
        ]
      })

      const result = await settingsService.getCategorySettings('general')

      expect(result).toEqual({
        siteName: 'My Site',
        language: 'en',
        maintenanceMode: false
      })
    })

    it('should handle null results gracefully', async () => {
      mockDb._mocks.all.mockResolvedValue({ results: null })

      const result = await settingsService.getCategorySettings('general')

      expect(result).toEqual({})
    })

    it('should return empty object and log error on database error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockDb._mocks.all.mockRejectedValue(new Error('DB error'))

      const result = await settingsService.getCategorySettings('general')

      expect(result).toEqual({})
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error getting category settings for general:',
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })
  })

  describe('setSetting', () => {
    it('should insert or update a setting', async () => {
      mockDb._mocks.run.mockResolvedValue({ success: true })

      const result = await settingsService.setSetting('general', 'siteName', 'Test Site')

      expect(result).toBe(true)
      expect(mockDb._mocks.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO settings'))
      expect(mockDb._mocks.prepare).toHaveBeenCalledWith(expect.stringContaining('ON CONFLICT'))
      expect(mockDb._mocks.bind).toHaveBeenCalledWith(
        expect.any(String), // UUID
        'general',
        'siteName',
        '"Test Site"',
        expect.any(Number),
        expect.any(Number)
      )
    })

    it('should serialize object values as JSON', async () => {
      mockDb._mocks.run.mockResolvedValue({ success: true })

      await settingsService.setSetting('general', 'config', { foo: 'bar' })

      expect(mockDb._mocks.bind).toHaveBeenCalledWith(
        expect.any(String),
        'general',
        'config',
        '{"foo":"bar"}',
        expect.any(Number),
        expect.any(Number)
      )
    })

    it('should serialize array values as JSON', async () => {
      mockDb._mocks.run.mockResolvedValue({ success: true })

      await settingsService.setSetting('general', 'items', [1, 2, 3])

      expect(mockDb._mocks.bind).toHaveBeenCalledWith(
        expect.any(String),
        'general',
        'items',
        '[1,2,3]',
        expect.any(Number),
        expect.any(Number)
      )
    })

    it('should return false and log error on database error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockDb._mocks.run.mockRejectedValue(new Error('DB error'))

      const result = await settingsService.setSetting('general', 'test', 'value')

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error setting general.test:',
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })
  })

  describe('setMultipleSettings', () => {
    it('should set multiple settings at once', async () => {
      mockDb._mocks.run.mockResolvedValue({ success: true })

      const result = await settingsService.setMultipleSettings('general', {
        siteName: 'My Site',
        language: 'en',
        maintenanceMode: false
      })

      expect(result).toBe(true)
      expect(mockDb._mocks.run).toHaveBeenCalledTimes(3)
    })

    it('should handle empty settings object', async () => {
      const result = await settingsService.setMultipleSettings('general', {})

      expect(result).toBe(true)
      expect(mockDb._mocks.run).not.toHaveBeenCalled()
    })

    it('should return false and log error if any setting fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockDb._mocks.run
        .mockResolvedValueOnce({ success: true })
        .mockRejectedValueOnce(new Error('DB error'))

      const result = await settingsService.setMultipleSettings('general', {
        setting1: 'value1',
        setting2: 'value2'
      })

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('getGeneralSettings', () => {
    it('should return default settings when none exist', async () => {
      mockDb._mocks.all.mockResolvedValue({ results: [] })

      const result = await settingsService.getGeneralSettings()

      expect(result).toEqual({
        siteName: 'SonicJS AI',
        siteDescription: 'A modern headless CMS powered by AI',
        adminEmail: 'admin@example.com',
        timezone: 'UTC',
        language: 'en',
        maintenanceMode: false
      })
    })

    it('should return stored settings merged with defaults', async () => {
      mockDb._mocks.all.mockResolvedValue({
        results: [
          { key: 'siteName', value: '"Custom Site"' },
          { key: 'language', value: '"fr"' }
        ]
      })

      const result = await settingsService.getGeneralSettings()

      expect(result).toEqual({
        siteName: 'Custom Site',
        siteDescription: 'A modern headless CMS powered by AI',
        adminEmail: 'admin@example.com',
        timezone: 'UTC',
        language: 'fr',
        maintenanceMode: false
      })
    })

    it('should use provided userEmail as default adminEmail', async () => {
      mockDb._mocks.all.mockResolvedValue({ results: [] })

      const result = await settingsService.getGeneralSettings('user@example.com')

      expect(result.adminEmail).toBe('user@example.com')
    })

    it('should prefer stored adminEmail over userEmail', async () => {
      mockDb._mocks.all.mockResolvedValue({
        results: [
          { key: 'adminEmail', value: '"stored@example.com"' }
        ]
      })

      const result = await settingsService.getGeneralSettings('user@example.com')

      expect(result.adminEmail).toBe('stored@example.com')
    })

    it('should handle all general settings fields', async () => {
      mockDb._mocks.all.mockResolvedValue({
        results: [
          { key: 'siteName', value: '"Test"' },
          { key: 'siteDescription', value: '"Description"' },
          { key: 'adminEmail', value: '"admin@test.com"' },
          { key: 'timezone', value: '"America/New_York"' },
          { key: 'language', value: '"de"' },
          { key: 'maintenanceMode', value: 'true' }
        ]
      })

      const result = await settingsService.getGeneralSettings()

      expect(result).toEqual({
        siteName: 'Test',
        siteDescription: 'Description',
        adminEmail: 'admin@test.com',
        timezone: 'America/New_York',
        language: 'de',
        maintenanceMode: true
      })
    })
  })

  describe('saveGeneralSettings', () => {
    it('should save only provided settings', async () => {
      mockDb._mocks.run.mockResolvedValue({ success: true })

      const result = await settingsService.saveGeneralSettings({
        siteName: 'New Name',
        language: 'es'
      })

      expect(result).toBe(true)
      expect(mockDb._mocks.run).toHaveBeenCalledTimes(2)
    })

    it('should not save undefined values', async () => {
      mockDb._mocks.run.mockResolvedValue({ success: true })

      const result = await settingsService.saveGeneralSettings({
        siteName: 'New Name',
        siteDescription: undefined
      } as any)

      expect(result).toBe(true)
      expect(mockDb._mocks.run).toHaveBeenCalledTimes(1)
    })

    it('should save all general settings fields when provided', async () => {
      mockDb._mocks.run.mockResolvedValue({ success: true })

      const result = await settingsService.saveGeneralSettings({
        siteName: 'Test',
        siteDescription: 'Desc',
        adminEmail: 'admin@test.com',
        timezone: 'UTC',
        language: 'en',
        maintenanceMode: true
      })

      expect(result).toBe(true)
      expect(mockDb._mocks.run).toHaveBeenCalledTimes(6)
    })

    it('should handle boolean maintenanceMode correctly', async () => {
      mockDb._mocks.run.mockResolvedValue({ success: true })

      await settingsService.saveGeneralSettings({
        maintenanceMode: false
      })

      expect(mockDb._mocks.bind).toHaveBeenCalledWith(
        expect.any(String),
        'general',
        'maintenanceMode',
        'false',
        expect.any(Number),
        expect.any(Number)
      )
    })

    it('should return false on error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockDb._mocks.run.mockRejectedValue(new Error('DB error'))

      const result = await settingsService.saveGeneralSettings({
        siteName: 'Test'
      })

      expect(result).toBe(false)
      consoleSpy.mockRestore()
    })
  })
})
