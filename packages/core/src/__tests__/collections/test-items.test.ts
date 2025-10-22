import { describe, it, expect } from 'vitest'
import testItemsConfig from '../../collections/test-items.collection'
import { validateCollectionConfig } from '../../services/collection-loader'

describe('Test Items Collection', () => {
  describe('Collection Configuration', () => {
    it('should have valid collection name', () => {
      expect(testItemsConfig.name).toBe('test_items')
      expect(testItemsConfig.name).toMatch(/^[a-z0-9_]+$/)
    })

    it('should have display name', () => {
      expect(testItemsConfig.displayName).toBe('Test Items')
      expect(testItemsConfig.displayName.length).toBeGreaterThan(0)
    })

    it('should have description', () => {
      expect(testItemsConfig.description).toBeDefined()
      expect(testItemsConfig.description).toBe('Simple test collection for development and testing')
    })

    it('should have icon and color', () => {
      expect(testItemsConfig.icon).toBe('🧪')
      expect(testItemsConfig.color).toBe('#8B5CF6')
    })

    it('should be marked as managed', () => {
      expect(testItemsConfig.managed).toBe(true)
    })

    it('should be marked as active', () => {
      expect(testItemsConfig.isActive).toBe(true)
    })
  })

  describe('Schema Configuration', () => {
    it('should have object type schema', () => {
      expect(testItemsConfig.schema.type).toBe('object')
    })

    it('should have properties defined', () => {
      expect(testItemsConfig.schema.properties).toBeDefined()
      expect(Object.keys(testItemsConfig.schema.properties).length).toBeGreaterThan(0)
    })

    it('should have required fields', () => {
      expect(testItemsConfig.schema.required).toContain('title')
      expect(testItemsConfig.schema.required).toContain('status')
    })

    describe('Title Field', () => {
      const titleField = testItemsConfig.schema.properties.title

      it('should be a string type', () => {
        expect(titleField.type).toBe('string')
      })

      it('should be required', () => {
        expect(titleField.required).toBe(true)
      })

      it('should have max length constraint', () => {
        expect(titleField.maxLength).toBe(100)
      })

      it('should have title and helpText', () => {
        expect(titleField.title).toBe('Title')
        expect(titleField.helpText).toBeDefined()
      })
    })

    describe('Description Field', () => {
      const descField = testItemsConfig.schema.properties.description

      it('should be a textarea type', () => {
        expect(descField.type).toBe('textarea')
      })

      it('should have max length constraint', () => {
        expect(descField.maxLength).toBe(500)
      })

      it('should have placeholder and helpText', () => {
        expect(descField.placeholder).toBeDefined()
        expect(descField.helpText).toBeDefined()
      })
    })

    describe('Status Field', () => {
      const statusField = testItemsConfig.schema.properties.status

      it('should be a select type', () => {
        expect(statusField.type).toBe('select')
      })

      it('should have enum options', () => {
        expect(statusField.enum).toBeDefined()
        expect(statusField.enum).toHaveLength(3)
        expect(statusField.enum).toContain('active')
        expect(statusField.enum).toContain('inactive')
        expect(statusField.enum).toContain('archived')
      })

      it('should have enum labels', () => {
        expect(statusField.enumLabels).toBeDefined()
        expect(statusField.enumLabels).toHaveLength(3)
      })

      it('should have default value', () => {
        expect(statusField.default).toBe('active')
      })

      it('should be required', () => {
        expect(statusField.required).toBe(true)
      })
    })

    describe('Priority Field', () => {
      const priorityField = testItemsConfig.schema.properties.priority

      it('should be a number type', () => {
        expect(priorityField.type).toBe('number')
      })

      it('should have min and max constraints', () => {
        expect(priorityField.min).toBe(1)
        expect(priorityField.max).toBe(10)
      })

      it('should have default value', () => {
        expect(priorityField.default).toBe(5)
      })
    })

    describe('IsPublic Field', () => {
      const isPublicField = testItemsConfig.schema.properties.isPublic

      it('should be a checkbox type', () => {
        expect(isPublicField.type).toBe('checkbox')
      })

      it('should have default value', () => {
        expect(isPublicField.default).toBe(false)
      })
    })

    describe('Tags Field', () => {
      const tagsField = testItemsConfig.schema.properties.tags

      it('should be a string type', () => {
        expect(tagsField.type).toBe('string')
      })

      it('should have placeholder', () => {
        expect(tagsField.placeholder).toBeDefined()
        expect(tagsField.placeholder).toContain('tag')
      })
    })
  })

  describe('List View Configuration', () => {
    it('should have list fields defined', () => {
      expect(testItemsConfig.listFields).toBeDefined()
      expect(testItemsConfig.listFields).toContain('title')
      expect(testItemsConfig.listFields).toContain('status')
      expect(testItemsConfig.listFields).toContain('priority')
    })

    it('should have search fields defined', () => {
      expect(testItemsConfig.searchFields).toBeDefined()
      expect(testItemsConfig.searchFields).toContain('title')
      expect(testItemsConfig.searchFields).toContain('description')
      expect(testItemsConfig.searchFields).toContain('tags')
    })

    it('should have default sort configuration', () => {
      expect(testItemsConfig.defaultSort).toBe('createdAt')
      expect(testItemsConfig.defaultSortOrder).toBe('desc')
    })
  })

  describe('Metadata', () => {
    it('should have metadata defined', () => {
      expect(testItemsConfig.metadata).toBeDefined()
    })

    it('should have purpose in metadata', () => {
      expect(testItemsConfig.metadata?.purpose).toBe('testing')
    })

    it('should have version in metadata', () => {
      expect(testItemsConfig.metadata?.version).toBe('1.0.0')
    })
  })

  describe('Validation', () => {
    it('should pass validation', () => {
      const result = validateCollectionConfig(testItemsConfig)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should have valid field types', () => {
      const validTypes = [
        'string', 'number', 'boolean', 'date', 'datetime', 'email', 'url',
        'richtext', 'markdown', 'json', 'array', 'object', 'reference',
        'media', 'select', 'multiselect', 'checkbox', 'radio', 'textarea',
        'slug', 'color', 'file'
      ]

      Object.entries(testItemsConfig.schema.properties).forEach(([fieldName, fieldConfig]) => {
        expect(validTypes).toContain(fieldConfig.type)
      })
    })

    it('should have all required fields in schema', () => {
      const requiredFields = testItemsConfig.schema.required || []
      const schemaProperties = Object.keys(testItemsConfig.schema.properties)

      requiredFields.forEach(field => {
        expect(schemaProperties).toContain(field)
      })
    })
  })

  describe('Type Consistency', () => {
    it('should have consistent enum and enumLabels length', () => {
      const statusField = testItemsConfig.schema.properties.status

      if (statusField.enum && statusField.enumLabels) {
        expect(statusField.enum.length).toBe(statusField.enumLabels.length)
      }
    })

    it('should have valid default values matching field types', () => {
      const statusField = testItemsConfig.schema.properties.status
      expect(statusField.enum).toContain(statusField.default)

      const priorityField = testItemsConfig.schema.properties.priority
      expect(typeof priorityField.default).toBe('number')

      const isPublicField = testItemsConfig.schema.properties.isPublic
      expect(typeof isPublicField.default).toBe('boolean')
    })
  })

  describe('Integration with Collection System', () => {
    it('should be importable as a module', () => {
      expect(testItemsConfig).toBeDefined()
      expect(typeof testItemsConfig).toBe('object')
    })

    it('should satisfy CollectionConfig type', () => {
      // TypeScript compilation will catch type errors
      // This test verifies runtime structure
      expect(testItemsConfig.name).toBeDefined()
      expect(testItemsConfig.displayName).toBeDefined()
      expect(testItemsConfig.schema).toBeDefined()
      expect(testItemsConfig.schema.type).toBe('object')
      expect(testItemsConfig.schema.properties).toBeDefined()
    })
  })
})
