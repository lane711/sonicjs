import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock database operations since we don't want to test actual DB in unit tests
const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  prepare: vi.fn()
}

// Mock the database module
vi.mock('../db/schema', () => ({
  collections: {
    id: 'id',
    name: 'name',
    displayName: 'display_name',
    description: 'description',
    schema: 'schema',
    isActive: 'is_active',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  content: {
    id: 'id',
    collectionId: 'collection_id'
  }
}))

// Mock collection operations similar to what would be in a service layer
class CollectionsService {
  constructor(private db: any) {}

  async create(data: {
    id: string
    name: string
    displayName: string
    description?: string
    schema: any
  }) {
    // Validate unique name
    const existing = await this.findByName(data.name)
    if (existing) {
      throw new Error('Collection with this name already exists')
    }

    const now = new Date()
    const collection = {
      ...data,
      isActive: true,
      createdAt: now,
      updatedAt: now
    }

    await this.db.insert(collection)
    return collection
  }

  async findById(id: string) {
    const result = await this.db.select({ where: { id } })
    return result?.[0] || null
  }

  async findByName(name: string) {
    const result = await this.db.select({ where: { name, isActive: true } })
    return result?.[0] || null
  }

  async findAll(options: { includeInactive?: boolean } = {}) {
    const where = options.includeInactive ? {} : { isActive: true }
    return await this.db.select({ where, orderBy: 'createdAt' })
  }

  async update(id: string, data: {
    displayName?: string
    description?: string
    schema?: any
  }) {
    const existing = await this.findById(id)
    if (!existing) {
      throw new Error('Collection not found')
    }

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date()
    }

    await this.db.update({ where: { id }, data: updated })
    return updated
  }

  async delete(id: string) {
    const existing = await this.findById(id)
    if (!existing) {
      throw new Error('Collection not found')
    }

    // Check if collection has content
    const contentCount = await this.getContentCount(id)
    if (contentCount > 0) {
      throw new Error('Cannot delete collection that contains content')
    }

    await this.db.delete({ where: { id } })
    return true
  }

  async softDelete(id: string) {
    return await this.update(id, { isActive: false })
  }

  private async getContentCount(collectionId: string): Promise<number> {
    const result = await this.db.select({ 
      table: 'content', 
      where: { collectionId },
      count: true 
    })
    return result?.count || 0
  }

  async validateSchema(schema: any): Promise<boolean> {
    // Basic schema validation
    if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
      return false
    }

    // Check for required properties structure
    if (schema.type && schema.type !== 'object') {
      return false
    }

    return true
  }

  generateId(): string {
    return `collection_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }
}

describe('Collections CRUD Operations', () => {
  let collectionsService: CollectionsService
  let mockDatabase: any

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    mockDatabase = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
    
    collectionsService = new CollectionsService(mockDatabase)
  })

  describe('Create Collection', () => {
    it('should create a new collection with valid data', async () => {
      const collectionData = {
        id: 'test-collection-1',
        name: 'test_collection',
        displayName: 'Test Collection',
        description: 'A test collection',
        schema: { type: 'object', properties: {} }
      }

      // Mock that no existing collection with this name exists
      mockDatabase.select.mockResolvedValueOnce([])
      mockDatabase.insert.mockResolvedValueOnce(undefined)

      const result = await collectionsService.create(collectionData)

      expect(result).toMatchObject({
        ...collectionData,
        isActive: true
      })
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.updatedAt).toBeInstanceOf(Date)
      expect(mockDatabase.insert).toHaveBeenCalledOnce()
    })

    it('should throw error when creating collection with duplicate name', async () => {
      const collectionData = {
        id: 'test-collection-1',
        name: 'duplicate_name',
        displayName: 'Duplicate Collection',
        schema: { type: 'object' }
      }

      // Mock that a collection with this name already exists
      mockDatabase.select.mockResolvedValueOnce([{ id: 'existing-id', name: 'duplicate_name' }])

      await expect(collectionsService.create(collectionData))
        .rejects
        .toThrow('Collection with this name already exists')

      expect(mockDatabase.insert).not.toHaveBeenCalled()
    })

    it('should generate unique IDs for collections', () => {
      const id1 = collectionsService.generateId()
      const id2 = collectionsService.generateId()

      expect(id1).toMatch(/^collection_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^collection_\d+_[a-z0-9]+$/)
      expect(id1).not.toBe(id2)
    })

    it('should set default values correctly', async () => {
      const minimalData = {
        id: 'test-collection-1',
        name: 'minimal_collection',
        displayName: 'Minimal Collection',
        schema: { type: 'object' }
      }

      mockDatabase.select.mockResolvedValueOnce([])
      mockDatabase.insert.mockResolvedValueOnce(undefined)

      const result = await collectionsService.create(minimalData)

      expect(result.isActive).toBe(true)
      expect(result.description).toBeUndefined()
    })
  })

  describe('Read Collection', () => {
    it('should find collection by ID', async () => {
      const mockCollection = {
        id: 'test-collection-1',
        name: 'test_collection',
        displayName: 'Test Collection',
        isActive: true
      }

      mockDatabase.select.mockResolvedValueOnce([mockCollection])

      const result = await collectionsService.findById('test-collection-1')

      expect(result).toEqual(mockCollection)
      expect(mockDatabase.select).toHaveBeenCalledWith({ where: { id: 'test-collection-1' } })
    })

    it('should return null when collection not found by ID', async () => {
      mockDatabase.select.mockResolvedValueOnce([])

      const result = await collectionsService.findById('non-existent-id')

      expect(result).toBeNull()
    })

    it('should find collection by name', async () => {
      const mockCollection = {
        id: 'test-collection-1',
        name: 'test_collection',
        displayName: 'Test Collection',
        isActive: true
      }

      mockDatabase.select.mockResolvedValueOnce([mockCollection])

      const result = await collectionsService.findByName('test_collection')

      expect(result).toEqual(mockCollection)
      expect(mockDatabase.select).toHaveBeenCalledWith({ 
        where: { name: 'test_collection', isActive: true } 
      })
    })

    it('should return null when collection not found by name', async () => {
      mockDatabase.select.mockResolvedValueOnce([])

      const result = await collectionsService.findByName('non_existent_collection')

      expect(result).toBeNull()
    })

    it('should find all active collections by default', async () => {
      const mockCollections = [
        { id: '1', name: 'collection1', isActive: true },
        { id: '2', name: 'collection2', isActive: true }
      ]

      mockDatabase.select.mockResolvedValueOnce(mockCollections)

      const result = await collectionsService.findAll()

      expect(result).toEqual(mockCollections)
      expect(mockDatabase.select).toHaveBeenCalledWith({ 
        where: { isActive: true }, 
        orderBy: 'createdAt' 
      })
    })

    it('should find all collections including inactive when specified', async () => {
      const mockCollections = [
        { id: '1', name: 'collection1', isActive: true },
        { id: '2', name: 'collection2', isActive: false }
      ]

      mockDatabase.select.mockResolvedValueOnce(mockCollections)

      const result = await collectionsService.findAll({ includeInactive: true })

      expect(result).toEqual(mockCollections)
      expect(mockDatabase.select).toHaveBeenCalledWith({ 
        where: {}, 
        orderBy: 'createdAt' 
      })
    })
  })

  describe('Update Collection', () => {
    it('should update collection with valid data', async () => {
      const existingCollection = {
        id: 'test-collection-1',
        name: 'test_collection',
        displayName: 'Old Display Name',
        description: 'Old description',
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      }

      const updateData = {
        displayName: 'New Display Name',
        description: 'New description'
      }

      mockDatabase.select.mockResolvedValueOnce([existingCollection])
      mockDatabase.update.mockResolvedValueOnce(undefined)

      const result = await collectionsService.update('test-collection-1', updateData)

      expect(result.displayName).toBe(updateData.displayName)
      expect(result.description).toBe(updateData.description)
      expect(result.updatedAt).toBeInstanceOf(Date)
      expect(result.updatedAt.getTime()).toBeGreaterThan(existingCollection.updatedAt.getTime())
      expect(mockDatabase.update).toHaveBeenCalledOnce()
    })

    it('should throw error when updating non-existent collection', async () => {
      mockDatabase.select.mockResolvedValueOnce([])

      await expect(collectionsService.update('non-existent-id', { displayName: 'New Name' }))
        .rejects
        .toThrow('Collection not found')

      expect(mockDatabase.update).not.toHaveBeenCalled()
    })

    it('should update schema', async () => {
      const existingCollection = {
        id: 'test-collection-1',
        name: 'test_collection',
        schema: { type: 'object', properties: {} }
      }

      const newSchema = {
        type: 'object',
        properties: {
          title: { type: 'string', required: true }
        }
      }

      mockDatabase.select.mockResolvedValueOnce([existingCollection])
      mockDatabase.update.mockResolvedValueOnce(undefined)

      const result = await collectionsService.update('test-collection-1', { schema: newSchema })

      expect(result.schema).toEqual(newSchema)
    })

    it('should preserve unchanged fields during update', async () => {
      const existingCollection = {
        id: 'test-collection-1',
        name: 'test_collection',
        displayName: 'Original Name',
        description: 'Original description',
        schema: { type: 'object' },
        isActive: true
      }

      mockDatabase.select.mockResolvedValueOnce([existingCollection])
      mockDatabase.update.mockResolvedValueOnce(undefined)

      const result = await collectionsService.update('test-collection-1', { 
        displayName: 'Updated Name' 
      })

      expect(result.description).toBe('Original description')
      expect(result.schema).toEqual({ type: 'object' })
      expect(result.isActive).toBe(true)
    })
  })

  describe('Delete Collection', () => {
    it('should delete empty collection', async () => {
      const existingCollection = {
        id: 'test-collection-1',
        name: 'test_collection'
      }

      mockDatabase.select
        .mockResolvedValueOnce([existingCollection]) // findById
        .mockResolvedValueOnce({ count: 0 }) // content count

      mockDatabase.delete.mockResolvedValueOnce(undefined)

      const result = await collectionsService.delete('test-collection-1')

      expect(result).toBe(true)
      expect(mockDatabase.delete).toHaveBeenCalledWith({ where: { id: 'test-collection-1' } })
    })

    it('should throw error when deleting collection with content', async () => {
      const existingCollection = {
        id: 'test-collection-1',
        name: 'test_collection'
      }

      mockDatabase.select
        .mockResolvedValueOnce([existingCollection]) // findById
        .mockResolvedValueOnce({ count: 5 }) // content count

      await expect(collectionsService.delete('test-collection-1'))
        .rejects
        .toThrow('Cannot delete collection that contains content')

      expect(mockDatabase.delete).not.toHaveBeenCalled()
    })

    it('should throw error when deleting non-existent collection', async () => {
      mockDatabase.select.mockResolvedValueOnce([]) // findById returns empty

      await expect(collectionsService.delete('non-existent-id'))
        .rejects
        .toThrow('Collection not found')

      expect(mockDatabase.delete).not.toHaveBeenCalled()
    })

    it('should soft delete collection', async () => {
      const existingCollection = {
        id: 'test-collection-1',
        name: 'test_collection',
        isActive: true
      }

      mockDatabase.select.mockResolvedValueOnce([existingCollection])
      mockDatabase.update.mockResolvedValueOnce(undefined)

      const result = await collectionsService.softDelete('test-collection-1')

      expect(result.isActive).toBe(false)
      expect(mockDatabase.update).toHaveBeenCalledOnce()
    })
  })

  describe('Schema Validation', () => {
    it('should validate valid schema', async () => {
      const validSchema = {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' }
        }
      }

      const result = await collectionsService.validateSchema(validSchema)
      expect(result).toBe(true)
    })

    it('should reject invalid schema types', async () => {
      const invalidSchemas = [
        null,
        undefined,
        'string',
        123,
        [],
        { type: 'string' }, // not object type
        { type: 'array' }    // not object type
      ]

      for (const schema of invalidSchemas) {
        const result = await collectionsService.validateSchema(schema)
        expect(result).toBe(false)
      }
    })

    it('should accept minimal valid schema', async () => {
      const minimalSchema = { type: 'object' }

      const result = await collectionsService.validateSchema(minimalSchema)
      expect(result).toBe(true)
    })

    it('should accept empty object as valid schema', async () => {
      const emptySchema = {}

      const result = await collectionsService.validateSchema(emptySchema)
      expect(result).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const collectionData = {
        id: 'test-collection-1',
        name: 'test_collection',
        displayName: 'Test Collection',
        schema: { type: 'object' }
      }

      mockDatabase.select.mockRejectedValueOnce(new Error('Database connection failed'))

      await expect(collectionsService.create(collectionData))
        .rejects
        .toThrow('Database connection failed')
    })

    it('should handle concurrent access issues', async () => {
      const collectionData = {
        id: 'test-collection-1',
        name: 'test_collection',
        displayName: 'Test Collection',
        schema: { type: 'object' }
      }

      // Simulate race condition - collection doesn't exist during check but fails on insert
      mockDatabase.select.mockResolvedValueOnce([]) // No existing collection
      mockDatabase.insert.mockRejectedValueOnce(new Error('UNIQUE constraint failed'))

      await expect(collectionsService.create(collectionData))
        .rejects
        .toThrow('UNIQUE constraint failed')
    })
  })
})