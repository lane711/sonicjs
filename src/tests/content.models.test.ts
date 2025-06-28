import { describe, it, expect, beforeEach } from 'vitest'
import { 
  FieldType, 
  ContentModelManager, 
  defaultContentModels,
  type FieldConfig,
  type ContentModel
} from '../content/models'
import { z } from 'zod'

describe('Content Models', () => {
  let modelManager: ContentModelManager

  beforeEach(() => {
    modelManager = new ContentModelManager()
  })

  describe('FieldType enum', () => {
    it('should have all expected field types', () => {
      expect(FieldType.TEXT).toBe('text')
      expect(FieldType.TEXTAREA).toBe('textarea')
      expect(FieldType.RICH_TEXT).toBe('rich_text')
      expect(FieldType.NUMBER).toBe('number')
      expect(FieldType.BOOLEAN).toBe('boolean')
      expect(FieldType.DATE).toBe('date')
      expect(FieldType.EMAIL).toBe('email')
      expect(FieldType.URL).toBe('url')
      expect(FieldType.SELECT).toBe('select')
      expect(FieldType.MULTI_SELECT).toBe('multi_select')
      expect(FieldType.IMAGE).toBe('image')
      expect(FieldType.FILE).toBe('file')
      expect(FieldType.REFERENCE).toBe('reference')
      expect(FieldType.JSON).toBe('json')
    })
  })

  describe('Default Content Models', () => {
    it('should load page model by default', () => {
      const pageModel = modelManager.getModel('page')
      
      expect(pageModel).toBeDefined()
      expect(pageModel?.displayName).toBe('Page')
      expect(pageModel?.fields.title.type).toBe(FieldType.TEXT)
      expect(pageModel?.fields.title.required).toBe(true)
      expect(pageModel?.fields.content.type).toBe(FieldType.RICH_TEXT)
      expect(pageModel?.settings.timestamps).toBe(true)
      expect(pageModel?.settings.versioning).toBe(true)
    })

    it('should load blog post model by default', () => {
      const blogModel = modelManager.getModel('blog_post')
      
      expect(blogModel).toBeDefined()
      expect(blogModel?.displayName).toBe('Blog Post')
      expect(blogModel?.fields.category.type).toBe(FieldType.SELECT)
      expect(blogModel?.fields.category.validation?.options).toEqual([
        'Technology', 'Business', 'Lifestyle', 'News'
      ])
      expect(blogModel?.fields.tags.type).toBe(FieldType.MULTI_SELECT)
      expect(blogModel?.fields.author.type).toBe(FieldType.REFERENCE)
      expect(blogModel?.fields.author.reference?.collection).toBe('users')
    })

    it('should load product model by default', () => {
      const productModel = modelManager.getModel('product')
      
      expect(productModel).toBeDefined()
      expect(productModel?.displayName).toBe('Product')
      expect(productModel?.fields.price.type).toBe(FieldType.NUMBER)
      expect(productModel?.fields.price.validation?.min).toBe(0)
      expect(productModel?.fields.available.type).toBe(FieldType.BOOLEAN)
      expect(productModel?.fields.available.defaultValue).toBe(true)
      expect(productModel?.fields.images.type).toBe(FieldType.JSON)
    })

    it('should have correct field positions for UI ordering', () => {
      const pageModel = modelManager.getModel('page')
      
      expect(pageModel?.fields.title.ui?.position).toBe(1)
      expect(pageModel?.fields.slug.ui?.position).toBe(2)
      expect(pageModel?.fields.content.ui?.position).toBe(3)
    })
  })

  describe('ContentModelManager', () => {
    describe('getModel', () => {
      it('should return existing model', () => {
        const model = modelManager.getModel('page')
        expect(model).toBeDefined()
        expect(model?.name).toBe('page')
      })

      it('should return undefined for non-existent model', () => {
        const model = modelManager.getModel('non_existent')
        expect(model).toBeUndefined()
      })
    })

    describe('getAllModels', () => {
      it('should return all default models', () => {
        const models = modelManager.getAllModels()
        expect(models).toHaveLength(3)
        
        const modelNames = models.map(m => m.name)
        expect(modelNames).toContain('page')
        expect(modelNames).toContain('blog_post')
        expect(modelNames).toContain('product')
      })
    })

    describe('registerModel', () => {
      it('should register new model', () => {
        const customModel: ContentModel = {
          id: 'custom',
          name: 'custom_model',
          displayName: 'Custom Model',
          fields: {
            title: {
              type: FieldType.TEXT,
              label: 'Title',
              required: true
            }
          },
          settings: {
            timestamps: true,
            versioning: false
          }
        }

        modelManager.registerModel(customModel)
        
        const retrieved = modelManager.getModel('custom_model')
        expect(retrieved).toEqual(customModel)
        expect(modelManager.getAllModels()).toHaveLength(4)
      })

      it('should override existing model with same name', () => {
        const overrideModel: ContentModel = {
          id: 'page-override',
          name: 'page',
          displayName: 'Custom Page',
          fields: {
            title: {
              type: FieldType.TEXT,
              label: 'Custom Title',
              required: false
            }
          },
          settings: {
            timestamps: false
          }
        }

        modelManager.registerModel(overrideModel)
        
        const retrieved = modelManager.getModel('page')
        expect(retrieved?.displayName).toBe('Custom Page')
        expect(retrieved?.fields.title.required).toBe(false)
        expect(modelManager.getAllModels()).toHaveLength(3) // Still 3 models
      })
    })
  })

  describe('Field Validation', () => {
    describe('validateField', () => {
      it('should validate required fields', () => {
        const requiredField: FieldConfig = {
          type: FieldType.TEXT,
          label: 'Required Field',
          required: true
        }

        const validResult = modelManager.validateField(requiredField, 'Valid value')
        expect(validResult.valid).toBe(true)
        expect(validResult.errors).toEqual([])

        const invalidResult = modelManager.validateField(requiredField, '')
        expect(invalidResult.valid).toBe(false)
        expect(invalidResult.errors).toContain('Required Field is required')

        const nullResult = modelManager.validateField(requiredField, null)
        expect(nullResult.valid).toBe(false)
        expect(nullResult.errors).toContain('Required Field is required')
      })

      it('should validate email fields', () => {
        const emailField: FieldConfig = {
          type: FieldType.EMAIL,
          label: 'Email Address'
        }

        const validResult = modelManager.validateField(emailField, 'test@example.com')
        expect(validResult.valid).toBe(true)

        const invalidResult = modelManager.validateField(emailField, 'invalid-email')
        expect(invalidResult.valid).toBe(false)
        expect(invalidResult.errors).toContain('Email Address must be a valid email')
      })

      it('should validate URL fields', () => {
        const urlField: FieldConfig = {
          type: FieldType.URL,
          label: 'Website URL'
        }

        const validResult = modelManager.validateField(urlField, 'https://example.com')
        expect(validResult.valid).toBe(true)

        const invalidResult = modelManager.validateField(urlField, 'not-a-url')
        expect(invalidResult.valid).toBe(false)
        expect(invalidResult.errors).toContain('Website URL must be a valid URL')
      })

      it('should validate number fields', () => {
        const numberField: FieldConfig = {
          type: FieldType.NUMBER,
          label: 'Price',
          validation: { min: 0, max: 1000 }
        }

        const validResult = modelManager.validateField(numberField, 50)
        expect(validResult.valid).toBe(true)

        const invalidTypeResult = modelManager.validateField(numberField, 'not-a-number')
        expect(invalidTypeResult.valid).toBe(false)
        expect(invalidTypeResult.errors).toContain('Price must be a number')

        const belowMinResult = modelManager.validateField(numberField, -10)
        expect(belowMinResult.valid).toBe(false)
        expect(belowMinResult.errors).toContain('Price must be at least 0')

        const aboveMaxResult = modelManager.validateField(numberField, 1500)
        expect(aboveMaxResult.valid).toBe(false)
        expect(aboveMaxResult.errors).toContain('Price must be at most 1000')
      })

      it('should validate text fields with length constraints', () => {
        const textField: FieldConfig = {
          type: FieldType.TEXT,
          label: 'Title',
          validation: { min: 3, max: 50 }
        }

        const validResult = modelManager.validateField(textField, 'Valid title')
        expect(validResult.valid).toBe(true)

        const tooShortResult = modelManager.validateField(textField, 'Hi')
        expect(tooShortResult.valid).toBe(false)
        expect(tooShortResult.errors).toContain('Title must be at least 3 characters')

        const tooLongResult = modelManager.validateField(textField, 'A'.repeat(60))
        expect(tooLongResult.valid).toBe(false)
        expect(tooLongResult.errors).toContain('Title must be at most 50 characters')
      })

      it('should validate text fields with pattern constraints', () => {
        const slugField: FieldConfig = {
          type: FieldType.TEXT,
          label: 'URL Slug',
          validation: { pattern: '^[a-z0-9-]+$' }
        }

        const validResult = modelManager.validateField(slugField, 'valid-slug-123')
        expect(validResult.valid).toBe(true)

        const invalidResult = modelManager.validateField(slugField, 'Invalid Slug!')
        expect(invalidResult.valid).toBe(false)
        expect(invalidResult.errors).toContain('URL Slug format is invalid')
      })

      it('should validate select fields', () => {
        const selectField: FieldConfig = {
          type: FieldType.SELECT,
          label: 'Category',
          validation: { options: ['tech', 'business', 'lifestyle'] }
        }

        const validResult = modelManager.validateField(selectField, 'tech')
        expect(validResult.valid).toBe(true)

        const invalidResult = modelManager.validateField(selectField, 'invalid-category')
        expect(invalidResult.valid).toBe(false)
        expect(invalidResult.errors).toContain('Category must be one of: tech, business, lifestyle')
      })

      it('should validate multi-select fields', () => {
        const multiSelectField: FieldConfig = {
          type: FieldType.MULTI_SELECT,
          label: 'Tags',
          validation: { options: ['javascript', 'typescript', 'react'] }
        }

        const validResult = modelManager.validateField(multiSelectField, ['javascript', 'react'])
        expect(validResult.valid).toBe(true)

        const invalidResult = modelManager.validateField(multiSelectField, ['javascript', 'invalid-tag'])
        expect(invalidResult.valid).toBe(false)
        expect(invalidResult.errors).toContain('Tags contains invalid options: invalid-tag')
      })

      it('should allow empty values for non-required fields', () => {
        const optionalField: FieldConfig = {
          type: FieldType.TEXT,
          label: 'Optional Field',
          required: false
        }

        const emptyStringResult = modelManager.validateField(optionalField, '')
        expect(emptyStringResult.valid).toBe(true)

        const nullResult = modelManager.validateField(optionalField, null)
        expect(nullResult.valid).toBe(true)

        const undefinedResult = modelManager.validateField(optionalField, undefined)
        expect(undefinedResult.valid).toBe(true)
      })
    })

    describe('validateContent', () => {
      it('should validate complete content against page model', () => {
        const validPageData = {
          title: 'About Us',
          slug: 'about-us',
          content: '<h1>About our company</h1><p>We are awesome!</p>',
          excerpt: 'Learn about our company',
          seoTitle: 'About Us - Company Name'
        }

        const result = modelManager.validateContent('page', validPageData)
        expect(result.valid).toBe(true)
        expect(Object.keys(result.errors)).toHaveLength(0)
      })

      it('should return errors for invalid content', () => {
        const invalidPageData = {
          // Missing required title and content
          slug: 'test',
          seoDescription: 'A'.repeat(200) // Too long (max 160)
        }

        const result = modelManager.validateContent('page', invalidPageData)
        expect(result.valid).toBe(false)
        expect(result.errors.title).toContain('Title is required')
        expect(result.errors.content).toContain('Content is required')
        expect(result.errors.seoDescription).toContain('SEO Description must be at most 160 characters')
      })

      it('should validate blog post with category and tags', () => {
        const validBlogData = {
          title: 'My First Blog Post',
          slug: 'my-first-blog-post',
          excerpt: 'This is my first blog post about technology',
          content: '<h1>Welcome</h1><p>This is my first blog post.</p>',
          category: 'Technology',
          tags: ['AI', 'Web Development'],
          publishDate: new Date().toISOString()
        }

        const result = modelManager.validateContent('blog_post', validBlogData)
        expect(result.valid).toBe(true)
      })

      it('should validate product with numeric fields', () => {
        const validProductData = {
          name: 'Awesome Product',
          slug: 'awesome-product',
          description: '<p>This product is amazing!</p>',
          price: 29.99,
          comparePrice: 39.99,
          inventory: 100,
          available: true,
          weight: 500
        }

        const result = modelManager.validateContent('product', validProductData)
        expect(result.valid).toBe(true)
      })

      it('should return error for unknown model', () => {
        const result = modelManager.validateContent('unknown_model', {})
        expect(result.valid).toBe(false)
        expect(result.errors._model).toContain('Unknown content model')
      })
    })
  })

  describe('Zod Schema Generation', () => {
    describe('generateZodSchema', () => {
      it('should generate schema for page model', () => {
        const schema = modelManager.generateZodSchema('page')
        expect(schema).toBeDefined()

        // Test with valid data
        const validData = {
          title: 'Test Page',
          slug: 'test-page',
          content: '<p>Test content</p>'
        }
        
        const result = schema!.safeParse(validData)
        expect(result.success).toBe(true)
      })

      it('should generate schema with proper string validation', () => {
        const schema = modelManager.generateZodSchema('page')
        
        // Test SEO description max length (160 characters)
        const dataWithLongSeoDescription = {
          title: 'Test',
          slug: 'test',
          content: 'content',
          seoDescription: 'A'.repeat(200)
        }
        
        const result = schema!.safeParse(dataWithLongSeoDescription)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.some(issue => 
            issue.path.includes('seoDescription') && issue.code === 'too_big'
          )).toBe(true)
        }
      })

      it('should generate schema with number validation', () => {
        const schema = modelManager.generateZodSchema('product')
        
        // Test negative price (min: 0)
        const dataWithNegativePrice = {
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test description',
          price: -10
        }
        
        const result = schema!.safeParse(dataWithNegativePrice)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.some(issue => 
            issue.path.includes('price') && issue.code === 'too_small'
          )).toBe(true)
        }
      })

      it('should generate schema with email validation', () => {
        // Create a custom model with email field for testing
        const emailModel: ContentModel = {
          id: 'contact',
          name: 'contact',
          displayName: 'Contact',
          fields: {
            name: { type: FieldType.TEXT, label: 'Name', required: true },
            email: { type: FieldType.EMAIL, label: 'Email', required: true }
          },
          settings: { timestamps: true }
        }
        
        modelManager.registerModel(emailModel)
        const schema = modelManager.generateZodSchema('contact')
        
        const invalidEmailData = {
          name: 'John Doe',
          email: 'invalid-email'
        }
        
        const result = schema!.safeParse(invalidEmailData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.some(issue => 
            issue.path.includes('email') && issue.code === 'invalid_string'
          )).toBe(true)
        }
      })

      it('should generate schema with enum validation', () => {
        const schema = modelManager.generateZodSchema('blog_post')
        
        const invalidCategoryData = {
          title: 'Test Post',
          slug: 'test-post',
          excerpt: 'Test excerpt',
          content: 'Test content',
          category: 'Invalid Category'
        }
        
        const result = schema!.safeParse(invalidCategoryData)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.some(issue => 
            issue.path.includes('category') && issue.code === 'invalid_enum_value'
          )).toBe(true)
        }
      })

      it('should handle optional fields with defaults', () => {
        const schema = modelManager.generateZodSchema('product')
        
        // available field has default value of true
        const dataWithoutAvailable = {
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test description',
          price: 10
        }
        
        const result = schema!.safeParse(dataWithoutAvailable)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.available).toBe(true) // Should use default
        }
      })

      it('should return null for unknown model', () => {
        const schema = modelManager.generateZodSchema('unknown_model')
        expect(schema).toBeNull()
      })

      it('should handle array fields (multi-select)', () => {
        const schema = modelManager.generateZodSchema('blog_post')
        
        const validArrayData = {
          title: 'Test Post',
          slug: 'test-post',
          excerpt: 'Test excerpt',
          content: 'Test content',
          tags: ['AI', 'JavaScript']
        }
        
        const result = schema!.safeParse(validArrayData)
        expect(result.success).toBe(true)
        
        // Test invalid array (not an array)
        const invalidArrayData = {
          ...validArrayData,
          tags: 'not-an-array'
        }
        
        const invalidResult = schema!.safeParse(invalidArrayData)
        expect(invalidResult.success).toBe(false)
      })

      it('should handle JSON fields', () => {
        const schema = modelManager.generateZodSchema('product')
        
        const validJsonData = {
          name: 'Test Product',
          slug: 'test-product',
          description: 'Test description',
          price: 10,
          images: { main: 'image1.jpg', gallery: ['image2.jpg', 'image3.jpg'] }
        }
        
        const result = schema!.safeParse(validJsonData)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.images).toEqual(validJsonData.images)
        }
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle fields with all validation types', () => {
      const complexField: FieldConfig = {
        type: FieldType.TEXT,
        label: 'Complex Field',
        required: true,
        validation: {
          min: 5,
          max: 20,
          pattern: '^[A-Z][a-zA-Z0-9]*$'
        }
      }

      // Valid value
      const validResult = modelManager.validateField(complexField, 'ValidValue123')
      expect(validResult.valid).toBe(true)

      // Multiple validation failures
      const invalidResult = modelManager.validateField(complexField, 'x')
      expect(invalidResult.valid).toBe(false)
      expect(invalidResult.errors).toHaveLength(2) // min length, pattern (not required since 'x' is not empty)
    })

    it('should handle zero values for number fields', () => {
      const numberField: FieldConfig = {
        type: FieldType.NUMBER,
        label: 'Count',
        validation: { min: 0 }
      }

      const result = modelManager.validateField(numberField, 0)
      expect(result.valid).toBe(true)
    })

    it('should handle empty arrays for multi-select', () => {
      const multiSelectField: FieldConfig = {
        type: FieldType.MULTI_SELECT,
        label: 'Tags',
        validation: { options: ['a', 'b', 'c'] }
      }

      const result = modelManager.validateField(multiSelectField, [])
      expect(result.valid).toBe(true)
    })
  })
})