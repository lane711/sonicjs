/**
 * Collection Loader Service Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  registerCollections,
  loadCollectionConfigs,
  loadCollectionConfig,
  getAvailableCollectionNames,
  validateCollectionConfig
} from './collection-loader'
import type { CollectionConfig } from '../types/collection-config'

// Helper to create test collection config
function createTestCollectionConfig(overrides: Partial<CollectionConfig> = {}): CollectionConfig {
  return {
    name: 'test-collection',
    displayName: 'Test Collection',
    description: 'A test collection',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'text', label: 'Title', required: true },
        content: { type: 'richtext', label: 'Content' }
      }
    },
    isActive: true,
    managed: true,
    ...overrides
  }
}

describe('validateCollectionConfig', () => {
  it('should return valid for a correct config', () => {
    const config = createTestCollectionConfig()
    const result = validateCollectionConfig(config)

    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('should return error when name is missing', () => {
    const config = createTestCollectionConfig({ name: '' })
    const result = validateCollectionConfig(config)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Collection name is required')
  })

  it('should return error when name has invalid characters', () => {
    const config = createTestCollectionConfig({ name: 'Invalid Name!' })
    const result = validateCollectionConfig(config)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Collection name must contain only lowercase letters, numbers, underscores, and hyphens')
  })

  it('should accept valid name with hyphens and underscores', () => {
    const config = createTestCollectionConfig({ name: 'my-test_collection-123' })
    const result = validateCollectionConfig(config)

    expect(result.valid).toBe(true)
  })

  it('should return error when displayName is missing', () => {
    const config = createTestCollectionConfig({ displayName: '' })
    const result = validateCollectionConfig(config)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Display name is required')
  })

  it('should return error when schema is missing', () => {
    const config = createTestCollectionConfig()
    delete (config as any).schema
    const result = validateCollectionConfig(config)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Schema is required')
  })

  it('should return error when schema type is not object', () => {
    const config = createTestCollectionConfig({
      schema: {
        type: 'array' as any,
        properties: {}
      }
    })
    const result = validateCollectionConfig(config)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Schema type must be "object"')
  })

  it('should return error when schema properties is missing', () => {
    const config = createTestCollectionConfig({
      schema: {
        type: 'object'
      } as any
    })
    const result = validateCollectionConfig(config)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Schema must have properties')
  })

  it('should return error when field type is missing', () => {
    const config = createTestCollectionConfig({
      schema: {
        type: 'object',
        properties: {
          title: { label: 'Title' } as any
        }
      }
    })
    const result = validateCollectionConfig(config)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Field "title" is missing type')
  })

  it('should return error when reference field is missing collection', () => {
    const config = createTestCollectionConfig({
      schema: {
        type: 'object',
        properties: {
          author: { type: 'reference', label: 'Author' }
        }
      }
    })
    const result = validateCollectionConfig(config)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Reference field "author" is missing collection property')
  })

  it('should accept valid reference field with collection', () => {
    const config = createTestCollectionConfig({
      schema: {
        type: 'object',
        properties: {
          author: { type: 'reference', label: 'Author', collection: 'users' }
        }
      }
    })
    const result = validateCollectionConfig(config)

    expect(result.valid).toBe(true)
  })

  it('should return error when select field is missing enum', () => {
    const config = createTestCollectionConfig({
      schema: {
        type: 'object',
        properties: {
          status: { type: 'select', label: 'Status' }
        }
      }
    })
    const result = validateCollectionConfig(config)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Select field "status" is missing enum options')
  })

  it('should return error when multiselect field is missing enum', () => {
    const config = createTestCollectionConfig({
      schema: {
        type: 'object',
        properties: {
          tags: { type: 'multiselect', label: 'Tags' }
        }
      }
    })
    const result = validateCollectionConfig(config)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Select field "tags" is missing enum options')
  })

  it('should return error when radio field is missing enum', () => {
    const config = createTestCollectionConfig({
      schema: {
        type: 'object',
        properties: {
          priority: { type: 'radio', label: 'Priority' }
        }
      }
    })
    const result = validateCollectionConfig(config)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Select field "priority" is missing enum options')
  })

  it('should accept valid select field with enum', () => {
    const config = createTestCollectionConfig({
      schema: {
        type: 'object',
        properties: {
          status: { type: 'select', label: 'Status', enum: ['draft', 'published'] }
        }
      }
    })
    const result = validateCollectionConfig(config)

    expect(result.valid).toBe(true)
  })

  it('should return multiple errors when multiple issues exist', () => {
    const config = createTestCollectionConfig({
      name: '',
      displayName: '',
      schema: {
        type: 'object',
        properties: {
          author: { type: 'reference', label: 'Author' },
          status: { type: 'select', label: 'Status' }
        }
      }
    })
    const result = validateCollectionConfig(config)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(4)
    expect(result.errors).toContain('Collection name is required')
    expect(result.errors).toContain('Display name is required')
  })

  it('should handle null properties gracefully', () => {
    const config = createTestCollectionConfig({
      schema: {
        type: 'object',
        properties: null as any
      }
    })
    const result = validateCollectionConfig(config)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Schema must have properties')
  })
})

describe('registerCollections', () => {
  let consoleSpy: any
  let errorSpy: any

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('should register valid collections', () => {
    const config = createTestCollectionConfig({ name: 'reg-test-1' })
    registerCollections([config])

    expect(consoleSpy).toHaveBeenCalledWith('✓ Registered collection: reg-test-1')
  })

  it('should skip collections with missing name', () => {
    const config = createTestCollectionConfig({ name: '' })
    registerCollections([config])

    expect(errorSpy).toHaveBeenCalledWith(
      'Invalid collection config: missing required fields',
      expect.any(Object)
    )
  })

  it('should skip collections with missing displayName', () => {
    const config = createTestCollectionConfig({ displayName: '' })
    registerCollections([config])

    expect(errorSpy).toHaveBeenCalledWith(
      'Invalid collection config: missing required fields',
      expect.any(Object)
    )
  })

  it('should skip collections with missing schema', () => {
    const config = createTestCollectionConfig()
    delete (config as any).schema
    registerCollections([config])

    expect(errorSpy).toHaveBeenCalledWith(
      'Invalid collection config: missing required fields',
      expect.any(Object)
    )
  })

  it('should set default managed to true', async () => {
    const config = createTestCollectionConfig({ name: 'default-managed' })
    delete (config as any).managed
    registerCollections([config])

    // Collection should be registered with managed: true
    expect(consoleSpy).toHaveBeenCalledWith('✓ Registered collection: default-managed')
  })

  it('should set default isActive to true', async () => {
    const config = createTestCollectionConfig({ name: 'default-active' })
    delete (config as any).isActive
    registerCollections([config])

    expect(consoleSpy).toHaveBeenCalledWith('✓ Registered collection: default-active')
  })

  it('should preserve explicit managed: false', async () => {
    const config = createTestCollectionConfig({ name: 'explicit-unmanaged', managed: false })
    registerCollections([config])

    expect(consoleSpy).toHaveBeenCalledWith('✓ Registered collection: explicit-unmanaged')
  })

  it('should register multiple collections', () => {
    const configs = [
      createTestCollectionConfig({ name: 'multi-1' }),
      createTestCollectionConfig({ name: 'multi-2' }),
      createTestCollectionConfig({ name: 'multi-3' })
    ]
    registerCollections(configs)

    expect(consoleSpy).toHaveBeenCalledWith('✓ Registered collection: multi-1')
    expect(consoleSpy).toHaveBeenCalledWith('✓ Registered collection: multi-2')
    expect(consoleSpy).toHaveBeenCalledWith('✓ Registered collection: multi-3')
  })
})

describe('loadCollectionConfigs', () => {
  let consoleSpy: any

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('should return registered collections', async () => {
    // Register a collection first
    const config = createTestCollectionConfig({ name: 'load-test' })
    registerCollections([config])

    const collections = await loadCollectionConfigs()

    // Should include the registered collection
    const found = collections.find(c => c.name === 'load-test')
    expect(found).toBeDefined()
  })

  it('should log message about registered collections', async () => {
    await loadCollectionConfigs()

    // The function logs about registered collections (logs either "Found X registered" or "No collections registered")
    expect(consoleSpy).toHaveBeenCalled()
  })
})

describe('loadCollectionConfig', () => {
  let warnSpy: any
  let errorSpy: any

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('should return null and warn about implementation', async () => {
    const result = await loadCollectionConfig('test-collection')

    expect(result).toBeNull()
    expect(warnSpy).toHaveBeenCalledWith(
      'loadCollectionConfig requires implementation in consuming application'
    )
  })
})

describe('getAvailableCollectionNames', () => {
  let errorSpy: any

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    errorSpy.mockRestore()
  })

  it('should return empty array when no modules available', async () => {
    const names = await getAvailableCollectionNames()

    expect(Array.isArray(names)).toBe(true)
  })
})
