import { z } from 'zod'

// Field types for content models
export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  RICH_TEXT = 'rich_text',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  EMAIL = 'email',
  URL = 'url',
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  IMAGE = 'image',
  FILE = 'file',
  REFERENCE = 'reference',
  JSON = 'json'
}

// Field configuration interface
export interface FieldConfig {
  type: FieldType
  label: string
  description?: string
  required?: boolean
  defaultValue?: any
  validation?: {
    min?: number
    max?: number
    pattern?: string
    options?: string[]
  }
  reference?: {
    collection: string
    displayField?: string
  }
  ui?: {
    placeholder?: string
    helpText?: string
    position?: number
    hidden?: boolean
    readonly?: boolean
  }
}

// Content model definition
export interface ContentModel {
  id: string
  name: string
  displayName: string
  description?: string
  fields: Record<string, FieldConfig>
  settings: {
    slug?: {
      source: string
      editable?: boolean
    }
    timestamps?: boolean
    versioning?: boolean
    publishing?: boolean
    seo?: boolean
  }
  permissions?: {
    create?: string[]
    read?: string[]
    update?: string[]
    delete?: string[]
  }
}

// Predefined content models
export const defaultContentModels: ContentModel[] = [
  {
    id: 'page',
    name: 'page',
    displayName: 'Page',
    description: 'Static pages like About, Contact, etc.',
    fields: {
      title: {
        type: FieldType.TEXT,
        label: 'Title',
        required: true,
        ui: { position: 1 }
      },
      slug: {
        type: FieldType.TEXT,
        label: 'URL Slug',
        required: true,
        ui: { position: 2, helpText: 'URL-friendly version of the title' }
      },
      content: {
        type: FieldType.RICH_TEXT,
        label: 'Content',
        required: true,
        ui: { position: 3 }
      },
      excerpt: {
        type: FieldType.TEXTAREA,
        label: 'Excerpt',
        description: 'Short description for previews',
        ui: { position: 4 }
      },
      featuredImage: {
        type: FieldType.IMAGE,
        label: 'Featured Image',
        ui: { position: 5 }
      },
      seoTitle: {
        type: FieldType.TEXT,
        label: 'SEO Title',
        ui: { position: 6 }
      },
      seoDescription: {
        type: FieldType.TEXTAREA,
        label: 'SEO Description',
        validation: { max: 160 },
        ui: { position: 7 }
      }
    },
    settings: {
      slug: { source: 'title', editable: true },
      timestamps: true,
      versioning: true,
      publishing: true,
      seo: true
    }
  },
  {
    id: 'blog-post',
    name: 'blog_post',
    displayName: 'Blog Post',
    description: 'Blog articles and news posts',
    fields: {
      title: {
        type: FieldType.TEXT,
        label: 'Title',
        required: true,
        ui: { position: 1 }
      },
      slug: {
        type: FieldType.TEXT,
        label: 'URL Slug',
        required: true,
        ui: { position: 2 }
      },
      excerpt: {
        type: FieldType.TEXTAREA,
        label: 'Excerpt',
        required: true,
        description: 'Brief summary of the post',
        ui: { position: 3 }
      },
      content: {
        type: FieldType.RICH_TEXT,
        label: 'Content',
        required: true,
        ui: { position: 4 }
      },
      featuredImage: {
        type: FieldType.IMAGE,
        label: 'Featured Image',
        ui: { position: 5 }
      },
      category: {
        type: FieldType.SELECT,
        label: 'Category',
        validation: {
          options: ['Technology', 'Business', 'Lifestyle', 'News']
        },
        ui: { position: 6 }
      },
      tags: {
        type: FieldType.MULTI_SELECT,
        label: 'Tags',
        validation: {
          options: ['AI', 'Web Development', 'JavaScript', 'Cloudflare', 'Tutorial']
        },
        ui: { position: 7 }
      },
      publishDate: {
        type: FieldType.DATE,
        label: 'Publish Date',
        defaultValue: new Date().toISOString(),
        ui: { position: 8 }
      },
      author: {
        type: FieldType.REFERENCE,
        label: 'Author',
        reference: {
          collection: 'users',
          displayField: 'firstName'
        },
        ui: { position: 9 }
      }
    },
    settings: {
      slug: { source: 'title', editable: true },
      timestamps: true,
      versioning: true,
      publishing: true,
      seo: true
    }
  },
  {
    id: 'product',
    name: 'product',
    displayName: 'Product',
    description: 'E-commerce product listings',
    fields: {
      name: {
        type: FieldType.TEXT,
        label: 'Product Name',
        required: true,
        ui: { position: 1 }
      },
      slug: {
        type: FieldType.TEXT,
        label: 'URL Slug',
        required: true,
        ui: { position: 2 }
      },
      description: {
        type: FieldType.RICH_TEXT,
        label: 'Description',
        required: true,
        ui: { position: 3 }
      },
      price: {
        type: FieldType.NUMBER,
        label: 'Price',
        required: true,
        validation: { min: 0 },
        ui: { position: 4 }
      },
      comparePrice: {
        type: FieldType.NUMBER,
        label: 'Compare at Price',
        validation: { min: 0 },
        ui: { position: 5 }
      },
      images: {
        type: FieldType.JSON,
        label: 'Product Images',
        description: 'Array of image URLs',
        ui: { position: 6 }
      },
      inventory: {
        type: FieldType.NUMBER,
        label: 'Inventory Count',
        defaultValue: 0,
        validation: { min: 0 },
        ui: { position: 7 }
      },
      available: {
        type: FieldType.BOOLEAN,
        label: 'Available for Sale',
        defaultValue: true,
        ui: { position: 8 }
      },
      weight: {
        type: FieldType.NUMBER,
        label: 'Weight (grams)',
        validation: { min: 0 },
        ui: { position: 9 }
      }
    },
    settings: {
      slug: { source: 'name', editable: true },
      timestamps: true,
      versioning: true,
      publishing: true,
      seo: true
    }
  }
]

// Content model manager
export class ContentModelManager {
  private models: Map<string, ContentModel> = new Map()

  constructor() {
    // Load default models
    defaultContentModels.forEach(model => {
      this.models.set(model.name, model)
    })
  }

  getModel(name: string): ContentModel | undefined {
    return this.models.get(name)
  }

  getAllModels(): ContentModel[] {
    return Array.from(this.models.values())
  }

  registerModel(model: ContentModel): void {
    this.models.set(model.name, model)
  }

  validateField(fieldConfig: FieldConfig, value: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Required field validation
    if (fieldConfig.required && (value === undefined || value === null || value === '')) {
      errors.push(`${fieldConfig.label} is required`)
    }
    
    // Type-specific validation
    if (value !== undefined && value !== null && value !== '') {
      switch (fieldConfig.type) {
        case FieldType.EMAIL:
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(`${fieldConfig.label} must be a valid email`)
          }
          break
        case FieldType.URL:
          try {
            new URL(value)
          } catch {
            errors.push(`${fieldConfig.label} must be a valid URL`)
          }
          break
        case FieldType.NUMBER:
          if (isNaN(Number(value))) {
            errors.push(`${fieldConfig.label} must be a number`)
          } else {
            const num = Number(value)
            if (fieldConfig.validation?.min !== undefined && num < fieldConfig.validation.min) {
              errors.push(`${fieldConfig.label} must be at least ${fieldConfig.validation.min}`)
            }
            if (fieldConfig.validation?.max !== undefined && num > fieldConfig.validation.max) {
              errors.push(`${fieldConfig.label} must be at most ${fieldConfig.validation.max}`)
            }
          }
          break
        case FieldType.TEXT:
        case FieldType.TEXTAREA:
          if (fieldConfig.validation?.min && value.length < fieldConfig.validation.min) {
            errors.push(`${fieldConfig.label} must be at least ${fieldConfig.validation.min} characters`)
          }
          if (fieldConfig.validation?.max && value.length > fieldConfig.validation.max) {
            errors.push(`${fieldConfig.label} must be at most ${fieldConfig.validation.max} characters`)
          }
          if (fieldConfig.validation?.pattern && !new RegExp(fieldConfig.validation.pattern).test(value)) {
            errors.push(`${fieldConfig.label} format is invalid`)
          }
          break
        case FieldType.SELECT:
          if (fieldConfig.validation?.options && !fieldConfig.validation.options.includes(value)) {
            errors.push(`${fieldConfig.label} must be one of: ${fieldConfig.validation.options.join(', ')}`)
          }
          break
        case FieldType.MULTI_SELECT:
          if (Array.isArray(value) && fieldConfig.validation?.options) {
            const invalidOptions = value.filter(v => !fieldConfig.validation!.options!.includes(v))
            if (invalidOptions.length > 0) {
              errors.push(`${fieldConfig.label} contains invalid options: ${invalidOptions.join(', ')}`)
            }
          }
          break
      }
    }
    
    return { valid: errors.length === 0, errors }
  }

  validateContent(modelName: string, data: Record<string, any>): { valid: boolean; errors: Record<string, string[]> } {
    const model = this.getModel(modelName)
    if (!model) {
      return { valid: false, errors: { _model: ['Unknown content model'] } }
    }

    const fieldErrors: Record<string, string[]> = {}
    let isValid = true

    // Validate each field
    Object.entries(model.fields).forEach(([fieldName, fieldConfig]) => {
      const validation = this.validateField(fieldConfig, data[fieldName])
      if (!validation.valid) {
        fieldErrors[fieldName] = validation.errors
        isValid = false
      }
    })

    return { valid: isValid, errors: fieldErrors }
  }

  generateZodSchema(modelName: string): z.ZodSchema | null {
    const model = this.getModel(modelName)
    if (!model) return null

    const schemaFields: Record<string, z.ZodTypeAny> = {}

    Object.entries(model.fields).forEach(([fieldName, fieldConfig]) => {
      let fieldSchema: z.ZodTypeAny

      switch (fieldConfig.type) {
        case FieldType.TEXT:
        case FieldType.TEXTAREA:
        case FieldType.RICH_TEXT:
        case FieldType.EMAIL:
        case FieldType.URL:
          fieldSchema = z.string()
          if (fieldConfig.validation?.min) {
            fieldSchema = fieldSchema.min(fieldConfig.validation.min)
          }
          if (fieldConfig.validation?.max) {
            fieldSchema = fieldSchema.max(fieldConfig.validation.max)
          }
          if (fieldConfig.type === FieldType.EMAIL) {
            fieldSchema = fieldSchema.email()
          }
          if (fieldConfig.type === FieldType.URL) {
            fieldSchema = fieldSchema.url()
          }
          break
        case FieldType.NUMBER:
          fieldSchema = z.number()
          if (fieldConfig.validation?.min !== undefined) {
            fieldSchema = fieldSchema.min(fieldConfig.validation.min)
          }
          if (fieldConfig.validation?.max !== undefined) {
            fieldSchema = fieldSchema.max(fieldConfig.validation.max)
          }
          break
        case FieldType.BOOLEAN:
          fieldSchema = z.boolean()
          break
        case FieldType.DATE:
          fieldSchema = z.string().datetime()
          break
        case FieldType.SELECT:
          if (fieldConfig.validation?.options) {
            fieldSchema = z.enum(fieldConfig.validation.options as [string, ...string[]])
          } else {
            fieldSchema = z.string()
          }
          break
        case FieldType.MULTI_SELECT:
          fieldSchema = z.array(z.string())
          break
        case FieldType.JSON:
          fieldSchema = z.record(z.any())
          break
        default:
          fieldSchema = z.string()
      }

      if (!fieldConfig.required) {
        fieldSchema = fieldSchema.optional()
      }

      if (fieldConfig.defaultValue !== undefined) {
        fieldSchema = fieldSchema.default(fieldConfig.defaultValue)
      }

      schemaFields[fieldName] = fieldSchema
    })

    return z.object(schemaFields)
  }
}