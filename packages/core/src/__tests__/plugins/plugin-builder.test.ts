import { describe, it, expect } from 'vitest'
import { PluginHelpers } from '../../plugins/sdk/plugin-builder'

describe('PluginHelpers.createSchema', () => {
  describe('basic field types', () => {
    it('creates schema for string field', () => {
      const schema = PluginHelpers.createSchema([
        { name: 'title', type: 'string' }
      ])

      expect(schema.parse({ title: 'Hello' })).toEqual({ title: 'Hello' })
      expect(() => schema.parse({ title: 123 })).toThrow()
    })

    it('creates schema for number field', () => {
      const schema = PluginHelpers.createSchema([
        { name: 'count', type: 'number' }
      ])

      expect(schema.parse({ count: 42 })).toEqual({ count: 42 })
      expect(() => schema.parse({ count: 'not a number' })).toThrow()
    })

    it('creates schema for boolean field', () => {
      const schema = PluginHelpers.createSchema([
        { name: 'active', type: 'boolean' }
      ])

      expect(schema.parse({ active: true })).toEqual({ active: true })
      expect(schema.parse({ active: false })).toEqual({ active: false })
      expect(() => schema.parse({ active: 'yes' })).toThrow()
    })

    it('creates schema for optional field', () => {
      const schema = PluginHelpers.createSchema([
        { name: 'title', type: 'string' },
        { name: 'subtitle', type: 'string', optional: true }
      ])

      expect(schema.parse({ title: 'Hello' })).toEqual({ title: 'Hello' })
      expect(schema.parse({ title: 'Hello', subtitle: 'World' })).toEqual({
        title: 'Hello',
        subtitle: 'World'
      })
    })

    it('marks field as optional when required is false', () => {
      const schema = PluginHelpers.createSchema([
        { name: 'title', type: 'string' },
        { name: 'subtitle', type: 'string', required: false }
      ])

      expect(schema.parse({ title: 'Hello' })).toEqual({ title: 'Hello' })
    })
  })

  describe('string validation', () => {
    it('applies min length validation', () => {
      const schema = PluginHelpers.createSchema([
        { name: 'title', type: 'string', validation: { min: 3 } }
      ])

      expect(schema.parse({ title: 'Hello' })).toEqual({ title: 'Hello' })
      expect(() => schema.parse({ title: 'Hi' })).toThrow()
    })

    it('applies max length validation', () => {
      const schema = PluginHelpers.createSchema([
        { name: 'title', type: 'string', validation: { max: 5 } }
      ])

      expect(schema.parse({ title: 'Hello' })).toEqual({ title: 'Hello' })
      expect(() => schema.parse({ title: 'Hello World' })).toThrow()
    })

    it('applies email validation', () => {
      const schema = PluginHelpers.createSchema([
        { name: 'email', type: 'string', validation: { email: true } }
      ])

      expect(schema.parse({ email: 'test@example.com' })).toEqual({ email: 'test@example.com' })
      expect(() => schema.parse({ email: 'not-an-email' })).toThrow()
    })

    it('applies url validation', () => {
      const schema = PluginHelpers.createSchema([
        { name: 'website', type: 'string', validation: { url: true } }
      ])

      expect(schema.parse({ website: 'https://example.com' })).toEqual({ website: 'https://example.com' })
      expect(() => schema.parse({ website: 'not-a-url' })).toThrow()
    })
  })

  describe('array fields', () => {
    it('creates schema for basic array field', () => {
      const schema = PluginHelpers.createSchema([
        { name: 'tags', type: 'array' }
      ])

      expect(schema.parse({ tags: ['a', 'b', 'c'] })).toEqual({ tags: ['a', 'b', 'c'] })
      expect(schema.parse({ tags: [1, 2, 3] })).toEqual({ tags: [1, 2, 3] })
    })

    it('creates schema for array with typed items', () => {
      const schema = PluginHelpers.createSchema([
        {
          name: 'numbers',
          type: 'array',
          items: { type: 'number' }
        }
      ])

      expect(schema.parse({ numbers: [1, 2, 3] })).toEqual({ numbers: [1, 2, 3] })
      expect(() => schema.parse({ numbers: ['a', 'b'] })).toThrow()
    })

    it('creates schema for array with object items', () => {
      const schema = PluginHelpers.createSchema([
        {
          name: 'team',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              role: { type: 'string', required: false }
            }
          }
        }
      ])

      const validData = {
        team: [
          { name: 'Alice', role: 'Developer' },
          { name: 'Bob' }
        ]
      }
      expect(schema.parse(validData)).toEqual(validData)
    })
  })

  describe('blocks fields', () => {
    it('creates schema for array with blocks', () => {
      const schema = PluginHelpers.createSchema([
        {
          name: 'body',
          type: 'array',
          items: {
            blocks: {
              text: {
                properties: {
                  heading: { type: 'string' },
                  body: { type: 'string' }
                }
              },
              image: {
                properties: {
                  src: { type: 'string' },
                  alt: { type: 'string', required: false }
                }
              }
            }
          }
        }
      ])

      const validData = {
        body: [
          { blockType: 'text', heading: 'Hello', body: 'World' },
          { blockType: 'image', src: '/photo.jpg' }
        ]
      }
      expect(schema.parse(validData)).toEqual(validData)
    })

    it('uses custom discriminator for blocks', () => {
      const schema = PluginHelpers.createSchema([
        {
          name: 'content',
          type: 'array',
          items: {
            discriminator: 'type',
            blocks: {
              paragraph: {
                properties: {
                  text: { type: 'string' }
                }
              }
            }
          }
        }
      ])

      const validData = {
        content: [
          { type: 'paragraph', text: 'Hello world' }
        ]
      }
      expect(schema.parse(validData)).toEqual(validData)
    })

    it('validates block properties', () => {
      const schema = PluginHelpers.createSchema([
        {
          name: 'body',
          type: 'array',
          items: {
            blocks: {
              text: {
                properties: {
                  heading: { type: 'string' }
                }
              }
            }
          }
        }
      ])

      // Valid block
      expect(schema.parse({ body: [{ blockType: 'text', heading: 'Hi' }] }))
        .toEqual({ body: [{ blockType: 'text', heading: 'Hi' }] })

      // Invalid: heading should be string
      expect(() => schema.parse({ body: [{ blockType: 'text', heading: 123 }] })).toThrow()
    })
  })

  describe('object fields', () => {
    it('creates schema for basic object field', () => {
      const schema = PluginHelpers.createSchema([
        { name: 'meta', type: 'object' }
      ])

      expect(schema.parse({ meta: {} })).toEqual({ meta: {} })
    })

    it('creates schema for object with properties', () => {
      const schema = PluginHelpers.createSchema([
        {
          name: 'seo',
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string', required: false }
          }
        }
      ])

      expect(schema.parse({ seo: { title: 'My Page' } })).toEqual({ seo: { title: 'My Page' } })
      expect(schema.parse({ seo: { title: 'My Page', description: 'Hello' } }))
        .toEqual({ seo: { title: 'My Page', description: 'Hello' } })
    })

    it('creates schema for nested object properties', () => {
      const schema = PluginHelpers.createSchema([
        {
          name: 'config',
          type: 'object',
          properties: {
            settings: {
              type: 'object',
              properties: {
                enabled: { type: 'boolean' }
              }
            }
          }
        }
      ])

      const validData = {
        config: {
          settings: {
            enabled: true
          }
        }
      }
      expect(schema.parse(validData)).toEqual(validData)
    })
  })
})
