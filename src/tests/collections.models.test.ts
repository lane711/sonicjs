import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the content models since we want to test the logic, not file imports
const FieldType = {
  TEXT: 'text',
  RICH_TEXT: 'rich_text',
  TEXTAREA: 'textarea',
  NUMBER: 'number',
  EMAIL: 'email',
  URL: 'url',
  BOOLEAN: 'boolean',
  DATE: 'date',
  DATETIME: 'datetime',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  IMAGE: 'image',
  FILE: 'file',
  JSON: 'json',
  RELATION: 'relation'
} as const

interface FieldConfig {
  type: keyof typeof FieldType
  title: string
  description?: string
  required?: boolean
  defaultValue?: any
  validation?: {
    min?: number
    max?: number
    pattern?: string
    options?: string[]
  }
  ui?: {
    placeholder?: string
    helpText?: string
    group?: string
    order?: number
    widget?: string
  }
}

interface ContentModel {
  name: string
  displayName: string
  description?: string
  fields: Record<string, FieldConfig>
  settings?: {
    timestamps?: boolean
    versioning?: boolean
    workflow?: string[]
    permissions?: Record<string, string[]>
  }
  hooks?: {
    beforeCreate?: string
    afterCreate?: string
    beforeUpdate?: string
    afterUpdate?: string
    beforeDelete?: string
    afterDelete?: string
  }
}

// Mock content model manager
class ContentModelManager {
  private models: Map<string, ContentModel> = new Map()
  private db: any

  constructor(db: any) {
    this.db = db
  }

  register(model: ContentModel): void {
    this.validateModel(model)
    this.models.set(model.name, model)
  }

  get(name: string): ContentModel | undefined {
    return this.models.get(name)
  }

  getAll(): ContentModel[] {
    return Array.from(this.models.values())
  }

  exists(name: string): boolean {
    return this.models.has(name)
  }

  validateModel(model: ContentModel): void {
    if (!model.name) {
      throw new Error('Model name is required')
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(model.name)) {
      throw new Error('Model name must be alphanumeric with underscores')
    }

    if (!model.displayName) {
      throw new Error('Model display name is required')
    }

    if (!model.fields || Object.keys(model.fields).length === 0) {
      throw new Error('Model must have at least one field')
    }

    // Validate each field
    for (const [fieldName, field] of Object.entries(model.fields)) {
      this.validateField(fieldName, field)
    }
  }

  validateField(name: string, field: FieldConfig): void {
    if (!name) {
      throw new Error('Field name is required')
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
      throw new Error('Field name must be alphanumeric with underscores')
    }

    if (!field.type) {
      throw new Error(`Field ${name} must have a type`)
    }

    if (!Object.values(FieldType).includes(field.type as any)) {
      throw new Error(`Field ${name} has invalid type: ${field.type}`)
    }

    if (!field.title) {
      throw new Error(`Field ${name} must have a title`)
    }

    // Validate field-specific constraints
    this.validateFieldConstraints(name, field)
  }

  validateFieldConstraints(name: string, field: FieldConfig): void {
    const { type, validation } = field

    if (validation) {
      // Number field validations
      if (type === FieldType.NUMBER) {
        if (validation.min !== undefined && validation.max !== undefined) {
          if (validation.min >= validation.max) {
            throw new Error(`Field ${name}: min value must be less than max value`)
          }
        }
      }

      // Text field validations
      if (type === FieldType.TEXT || type === FieldType.TEXTAREA) {
        if (validation.pattern && typeof validation.pattern !== 'string') {
          throw new Error(`Field ${name}: pattern must be a string`)
        }
      }

      // Select field validations
      if (type === FieldType.SELECT || type === FieldType.MULTISELECT) {
        if (!validation.options || !Array.isArray(validation.options)) {
          throw new Error(`Field ${name}: select fields must have options array`)
        }
        if (validation.options.length === 0) {
          throw new Error(`Field ${name}: select fields must have at least one option`)
        }
      }
    }

    // Required field with default value validation
    if (field.required && field.defaultValue === undefined && type !== FieldType.BOOLEAN) {
      // This is a warning, not an error - required fields without defaults need user input
    }
  }

  validateData(modelName: string, data: Record<string, any>): { isValid: boolean; errors: string[] } {
    const model = this.get(modelName)
    if (!model) {
      return { isValid: false, errors: [`Model ${modelName} not found`] }
    }

    const errors: string[] = []

    // Check required fields
    for (const [fieldName, field] of Object.entries(model.fields)) {
      if (field.required && (data[fieldName] === undefined || data[fieldName] === null || data[fieldName] === '')) {
        errors.push(`Field ${fieldName} is required`)
      }
    }

    // Validate field data types and constraints
    for (const [fieldName, value] of Object.entries(data)) {
      const field = model.fields[fieldName]
      if (field && value !== undefined && value !== null) {
        const fieldErrors = this.validateFieldValue(fieldName, field, value)
        errors.push(...fieldErrors)
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  validateFieldValue(fieldName: string, field: FieldConfig, value: any): string[] {
    const errors: string[] = []

    switch (field.type) {
      case FieldType.TEXT:
      case FieldType.TEXTAREA:
        if (typeof value !== 'string') {
          errors.push(`Field ${fieldName} must be a string`)
        } else {
          if (field.validation?.min && value.length < field.validation.min) {
            errors.push(`Field ${fieldName} must be at least ${field.validation.min} characters`)
          }
          if (field.validation?.max && value.length > field.validation.max) {
            errors.push(`Field ${fieldName} must be no more than ${field.validation.max} characters`)
          }
          if (field.validation?.pattern && !new RegExp(field.validation.pattern).test(value)) {
            errors.push(`Field ${fieldName} does not match required pattern`)
          }
        }
        break

      case FieldType.NUMBER:
        if (typeof value !== 'number' && !(!isNaN(Number(value)))) {
          errors.push(`Field ${fieldName} must be a number`)
        } else {
          const numValue = typeof value === 'number' ? value : Number(value)
          if (field.validation?.min !== undefined && numValue < field.validation.min) {
            errors.push(`Field ${fieldName} must be at least ${field.validation.min}`)
          }
          if (field.validation?.max !== undefined && numValue > field.validation.max) {
            errors.push(`Field ${fieldName} must be no more than ${field.validation.max}`)
          }
        }
        break

      case FieldType.EMAIL:
        if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(`Field ${fieldName} must be a valid email address`)
        }
        break

      case FieldType.URL:
        if (typeof value !== 'string') {
          errors.push(`Field ${fieldName} must be a string`)
        } else {
          try {
            new URL(value)
          } catch {
            errors.push(`Field ${fieldName} must be a valid URL`)
          }
        }
        break

      case FieldType.BOOLEAN:
        if (typeof value !== 'boolean') {
          errors.push(`Field ${fieldName} must be a boolean`)
        }
        break

      case FieldType.DATE:
      case FieldType.DATETIME:
        if (typeof value !== 'string' || isNaN(Date.parse(value))) {
          errors.push(`Field ${fieldName} must be a valid date`)
        }
        break

      case FieldType.SELECT:
        if (field.validation?.options && !field.validation.options.includes(value)) {
          errors.push(`Field ${fieldName} must be one of: ${field.validation.options.join(', ')}`)
        }
        break

      case FieldType.MULTISELECT:
        if (!Array.isArray(value)) {
          errors.push(`Field ${fieldName} must be an array`)
        } else if (field.validation?.options) {
          const invalidOptions = value.filter(v => !field.validation!.options!.includes(v))
          if (invalidOptions.length > 0) {
            errors.push(`Field ${fieldName} contains invalid options: ${invalidOptions.join(', ')}`)
          }
        }
        break

      case FieldType.JSON:
        if (typeof value === 'string') {
          try {
            JSON.parse(value)
          } catch {
            errors.push(`Field ${fieldName} must be valid JSON`)
          }
        } else if (typeof value !== 'object') {
          errors.push(`Field ${fieldName} must be a valid JSON object or string`)
        }
        break
    }

    return errors
  }

  generateSchema(model: ContentModel): any {
    const schema: any = {
      type: 'object',
      properties: {},
      required: []
    }

    for (const [fieldName, field] of Object.entries(model.fields)) {
      schema.properties[fieldName] = this.generateFieldSchema(field)
      if (field.required) {
        schema.required.push(fieldName)
      }
    }

    return schema
  }

  generateFieldSchema(field: FieldConfig): any {
    const fieldSchema: any = {
      title: field.title,
      description: field.description
    }

    switch (field.type) {
      case FieldType.TEXT:
      case FieldType.TEXTAREA:
      case FieldType.EMAIL:
      case FieldType.URL:
        fieldSchema.type = 'string'
        if (field.validation?.min) fieldSchema.minLength = field.validation.min
        if (field.validation?.max) fieldSchema.maxLength = field.validation.max
        if (field.validation?.pattern) fieldSchema.pattern = field.validation.pattern
        break

      case FieldType.RICH_TEXT:
        fieldSchema.type = 'string'
        fieldSchema.format = 'richtext'
        break

      case FieldType.NUMBER:
        fieldSchema.type = 'number'
        if (field.validation?.min !== undefined) fieldSchema.minimum = field.validation.min
        if (field.validation?.max !== undefined) fieldSchema.maximum = field.validation.max
        break

      case FieldType.BOOLEAN:
        fieldSchema.type = 'boolean'
        break

      case FieldType.DATE:
        fieldSchema.type = 'string'
        fieldSchema.format = 'date'
        break

      case FieldType.DATETIME:
        fieldSchema.type = 'string'
        fieldSchema.format = 'date-time'
        break

      case FieldType.SELECT:
        fieldSchema.type = 'string'
        if (field.validation?.options) fieldSchema.enum = field.validation.options
        break

      case FieldType.MULTISELECT:
        fieldSchema.type = 'array'
        fieldSchema.items = { type: 'string' }
        if (field.validation?.options) fieldSchema.items.enum = field.validation.options
        break

      case FieldType.IMAGE:
      case FieldType.FILE:
        fieldSchema.type = 'string'
        fieldSchema.format = field.type
        break

      case FieldType.JSON:
        fieldSchema.type = 'object'
        break

      case FieldType.RELATION:
        fieldSchema.type = 'string'
        fieldSchema.format = 'relation'
        break
    }

    if (field.defaultValue !== undefined) {
      fieldSchema.default = field.defaultValue
    }

    return fieldSchema
  }
}

describe('Content Models', () => {
  let modelManager: ContentModelManager
  let mockDb: any

  beforeEach(() => {
    mockDb = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
    modelManager = new ContentModelManager(mockDb)
  })

  describe('Model Registration', () => {
    it('should register a valid model', () => {
      const model: ContentModel = {
        name: 'blog_post',
        displayName: 'Blog Post',
        description: 'Blog post content model',
        fields: {
          title: {
            type: FieldType.TEXT,
            title: 'Title',
            required: true
          },
          content: {
            type: FieldType.RICH_TEXT,
            title: 'Content'
          }
        }
      }

      expect(() => modelManager.register(model)).not.toThrow()
      expect(modelManager.exists('blog_post')).toBe(true)
      expect(modelManager.get('blog_post')).toEqual(model)
    })

    it('should reject model without name', () => {
      const model = {
        displayName: 'Invalid Model',
        fields: {
          title: { type: FieldType.TEXT, title: 'Title' }
        }
      } as ContentModel

      expect(() => modelManager.register(model)).toThrow('Model name is required')
    })

    it('should reject model with invalid name format', () => {
      const invalidNames = ['123invalid', 'invalid-name', 'invalid name', 'invalid@name']

      invalidNames.forEach(name => {
        const model: ContentModel = {
          name,
          displayName: 'Invalid Model',
          fields: {
            title: { type: FieldType.TEXT, title: 'Title' }
          }
        }

        expect(() => modelManager.register(model)).toThrow('Model name must be alphanumeric with underscores')
      })
    })

    it('should reject model without display name', () => {
      const model = {
        name: 'valid_model',
        fields: {
          title: { type: FieldType.TEXT, title: 'Title' }
        }
      } as ContentModel

      expect(() => modelManager.register(model)).toThrow('Model display name is required')
    })

    it('should reject model without fields', () => {
      const model: ContentModel = {
        name: 'empty_model',
        displayName: 'Empty Model',
        fields: {}
      }

      expect(() => modelManager.register(model)).toThrow('Model must have at least one field')
    })
  })

  describe('Field Validation', () => {
    it('should validate field names', () => {
      const invalidFieldNames = ['123field', 'field-name', 'field name', '@field']

      invalidFieldNames.forEach(fieldName => {
        const model: ContentModel = {
          name: 'test_model',
          displayName: 'Test Model',
          fields: {
            [fieldName]: {
              type: FieldType.TEXT,
              title: 'Invalid Field'
            }
          }
        }

        expect(() => modelManager.register(model)).toThrow('Field name must be alphanumeric with underscores')
      })
    })

    it('should require field type', () => {
      const model = {
        name: 'test_model',
        displayName: 'Test Model',
        fields: {
          invalid_field: {
            title: 'Invalid Field'
            // missing type
          }
        }
      } as ContentModel

      expect(() => modelManager.register(model)).toThrow('Field invalid_field must have a type')
    })

    it('should validate field types', () => {
      const model = {
        name: 'test_model',
        displayName: 'Test Model',
        fields: {
          invalid_field: {
            type: 'invalid_type' as any,
            title: 'Invalid Field'
          }
        }
      } as ContentModel

      expect(() => modelManager.register(model)).toThrow('Field invalid_field has invalid type: invalid_type')
    })

    it('should require field title', () => {
      const model = {
        name: 'test_model',
        displayName: 'Test Model',
        fields: {
          invalid_field: {
            type: FieldType.TEXT
            // missing title
          }
        }
      } as ContentModel

      expect(() => modelManager.register(model)).toThrow('Field invalid_field must have a title')
    })

    it('should validate number field constraints', () => {
      const model: ContentModel = {
        name: 'test_model',
        displayName: 'Test Model',
        fields: {
          invalid_number: {
            type: FieldType.NUMBER,
            title: 'Invalid Number',
            validation: {
              min: 10,
              max: 5  // max < min
            }
          }
        }
      }

      expect(() => modelManager.register(model)).toThrow('Field invalid_number: min value must be less than max value')
    })

    it('should validate select field options', () => {
      const model: ContentModel = {
        name: 'test_model',
        displayName: 'Test Model',
        fields: {
          invalid_select: {
            type: FieldType.SELECT,
            title: 'Invalid Select',
            validation: {
              options: []  // empty options
            }
          }
        }
      }

      expect(() => modelManager.register(model)).toThrow('Field invalid_select: select fields must have at least one option')
    })
  })

  describe('Data Validation', () => {
    beforeEach(() => {
      const model: ContentModel = {
        name: 'test_model',
        displayName: 'Test Model',
        fields: {
          title: {
            type: FieldType.TEXT,
            title: 'Title',
            required: true,
            validation: { min: 3, max: 100 }
          },
          content: {
            type: FieldType.RICH_TEXT,
            title: 'Content'
          },
          published: {
            type: FieldType.BOOLEAN,
            title: 'Published',
            defaultValue: false
          },
          category: {
            type: FieldType.SELECT,
            title: 'Category',
            validation: {
              options: ['tech', 'business', 'lifestyle']
            }
          },
          tags: {
            type: FieldType.MULTISELECT,
            title: 'Tags',
            validation: {
              options: ['javascript', 'typescript', 'react', 'vue']
            }
          },
          email: {
            type: FieldType.EMAIL,
            title: 'Contact Email'
          },
          website: {
            type: FieldType.URL,
            title: 'Website'
          },
          rating: {
            type: FieldType.NUMBER,
            title: 'Rating',
            validation: { min: 1, max: 5 }
          },
          publish_date: {
            type: FieldType.DATE,
            title: 'Publish Date'
          }
        }
      }

      modelManager.register(model)
    })

    it('should validate valid data', () => {
      const validData = {
        title: 'Valid Title',
        content: '<p>Some content</p>',
        published: true,
        category: 'tech',
        tags: ['javascript', 'typescript'],
        email: 'test@example.com',
        website: 'https://example.com',
        rating: 4,
        publish_date: '2023-01-01'
      }

      const result = modelManager.validateData('test_model', validData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should require required fields', () => {
      const invalidData = {
        content: 'Some content'
        // missing required title
      }

      const result = modelManager.validateData('test_model', invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Field title is required')
    })

    it('should validate text field constraints', () => {
      const invalidData = {
        title: 'Hi', // too short (min: 3)
        content: 'Some content'
      }

      const result = modelManager.validateData('test_model', invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Field title must be at least 3 characters')
    })

    it('should validate email format', () => {
      const invalidData = {
        title: 'Valid Title',
        email: 'invalid-email'
      }

      const result = modelManager.validateData('test_model', invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Field email must be a valid email address')
    })

    it('should validate URL format', () => {
      const invalidData = {
        title: 'Valid Title',
        website: 'not-a-url'
      }

      const result = modelManager.validateData('test_model', invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Field website must be a valid URL')
    })

    it('should validate number constraints', () => {
      const invalidData = {
        title: 'Valid Title',
        rating: 10 // max: 5
      }

      const result = modelManager.validateData('test_model', invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Field rating must be no more than 5')
    })

    it('should validate select options', () => {
      const invalidData = {
        title: 'Valid Title',
        category: 'invalid_category'
      }

      const result = modelManager.validateData('test_model', invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Field category must be one of: tech, business, lifestyle')
    })

    it('should validate multiselect options', () => {
      const invalidData = {
        title: 'Valid Title',
        tags: ['javascript', 'invalid_tag']
      }

      const result = modelManager.validateData('test_model', invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Field tags contains invalid options: invalid_tag')
    })

    it('should validate date format', () => {
      const invalidData = {
        title: 'Valid Title',
        publish_date: 'not-a-date'
      }

      const result = modelManager.validateData('test_model', invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Field publish_date must be a valid date')
    })
  })

  describe('Schema Generation', () => {
    it('should generate JSON schema from model', () => {
      const model: ContentModel = {
        name: 'blog_post',
        displayName: 'Blog Post',
        fields: {
          title: {
            type: FieldType.TEXT,
            title: 'Title',
            required: true,
            validation: { min: 3, max: 100 }
          },
          content: {
            type: FieldType.RICH_TEXT,
            title: 'Content',
            description: 'Main content of the blog post'
          },
          published: {
            type: FieldType.BOOLEAN,
            title: 'Published',
            defaultValue: false
          },
          category: {
            type: FieldType.SELECT,
            title: 'Category',
            validation: {
              options: ['tech', 'business']
            }
          }
        }
      }

      modelManager.register(model)
      const schema = modelManager.generateSchema(model)

      expect(schema.type).toBe('object')
      expect(schema.required).toEqual(['title'])
      
      expect(schema.properties.title).toEqual({
        title: 'Title',
        type: 'string',
        minLength: 3,
        maxLength: 100
      })

      expect(schema.properties.content).toEqual({
        title: 'Content',
        description: 'Main content of the blog post',
        type: 'string',
        format: 'richtext'
      })

      expect(schema.properties.published).toEqual({
        title: 'Published',
        type: 'boolean',
        default: false
      })

      expect(schema.properties.category).toEqual({
        title: 'Category',
        type: 'string',
        enum: ['tech', 'business']
      })
    })

    it('should generate schema for different field types', () => {
      const model: ContentModel = {
        name: 'complex_model',
        displayName: 'Complex Model',
        fields: {
          number_field: {
            type: FieldType.NUMBER,
            title: 'Number Field',
            validation: { min: 0, max: 100 }
          },
          date_field: {
            type: FieldType.DATE,
            title: 'Date Field'
          },
          datetime_field: {
            type: FieldType.DATETIME,
            title: 'DateTime Field'
          },
          multiselect_field: {
            type: FieldType.MULTISELECT,
            title: 'Multiselect Field',
            validation: { options: ['a', 'b', 'c'] }
          },
          json_field: {
            type: FieldType.JSON,
            title: 'JSON Field'
          }
        }
      }

      modelManager.register(model)
      const schema = modelManager.generateSchema(model)

      expect(schema.properties.number_field).toEqual({
        title: 'Number Field',
        type: 'number',
        minimum: 0,
        maximum: 100
      })

      expect(schema.properties.date_field).toEqual({
        title: 'Date Field',
        type: 'string',
        format: 'date'
      })

      expect(schema.properties.datetime_field).toEqual({
        title: 'DateTime Field',
        type: 'string',
        format: 'date-time'
      })

      expect(schema.properties.multiselect_field).toEqual({
        title: 'Multiselect Field',
        type: 'array',
        items: {
          type: 'string',
          enum: ['a', 'b', 'c']
        }
      })

      expect(schema.properties.json_field).toEqual({
        title: 'JSON Field',
        type: 'object'
      })
    })
  })

  describe('Model Management', () => {
    it('should retrieve all registered models', () => {
      const model1: ContentModel = {
        name: 'model1',
        displayName: 'Model 1',
        fields: { title: { type: FieldType.TEXT, title: 'Title' } }
      }

      const model2: ContentModel = {
        name: 'model2',
        displayName: 'Model 2',
        fields: { name: { type: FieldType.TEXT, title: 'Name' } }
      }

      modelManager.register(model1)
      modelManager.register(model2)

      const allModels = modelManager.getAll()
      expect(allModels).toHaveLength(2)
      expect(allModels).toContainEqual(model1)
      expect(allModels).toContainEqual(model2)
    })

    it('should check model existence', () => {
      const model: ContentModel = {
        name: 'test_model',
        displayName: 'Test Model',
        fields: { title: { type: FieldType.TEXT, title: 'Title' } }
      }

      expect(modelManager.exists('test_model')).toBe(false)
      
      modelManager.register(model)
      
      expect(modelManager.exists('test_model')).toBe(true)
      expect(modelManager.exists('nonexistent_model')).toBe(false)
    })

    it('should handle model not found in validation', () => {
      const result = modelManager.validateData('nonexistent_model', { title: 'Test' })
      
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Model nonexistent_model not found')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty data validation', () => {
      const model: ContentModel = {
        name: 'test_model',
        displayName: 'Test Model',
        fields: {
          optional_field: {
            type: FieldType.TEXT,
            title: 'Optional Field'
          }
        }
      }

      modelManager.register(model)
      const result = modelManager.validateData('test_model', {})
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should handle null and undefined values', () => {
      const model: ContentModel = {
        name: 'test_model',
        displayName: 'Test Model',
        fields: {
          nullable_field: {
            type: FieldType.TEXT,
            title: 'Nullable Field'
          }
        }
      }

      modelManager.register(model)
      
      let result = modelManager.validateData('test_model', { nullable_field: null })
      expect(result.isValid).toBe(true)
      
      result = modelManager.validateData('test_model', { nullable_field: undefined })
      expect(result.isValid).toBe(true)
    })

    it('should handle complex nested validation scenarios', () => {
      const model: ContentModel = {
        name: 'complex_model',
        displayName: 'Complex Model',
        fields: {
          title: {
            type: FieldType.TEXT,
            title: 'Title',
            required: true,
            validation: { min: 1, max: 50, pattern: '^[A-Za-z].*' }
          },
          tags: {
            type: FieldType.MULTISELECT,
            title: 'Tags',
            validation: { options: ['a', 'b', 'c'] }
          }
        }
      }

      modelManager.register(model)
      
      const invalidData = {
        title: '123 Invalid Title', // doesn't match pattern
        tags: ['a', 'invalid'] // contains invalid option
      }

      const result = modelManager.validateData('complex_model', invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Field title does not match required pattern')
      expect(result.errors).toContain('Field tags contains invalid options: invalid')
    })
  })
})