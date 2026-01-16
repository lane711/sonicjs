import { describe, it, expect } from 'vitest'
import { getBlocksFieldConfig, parseBlocksValue } from '../../utils/blocks'

describe('blocks utils', () => {
  it('returns null when no blocks config is present', () => {
    expect(getBlocksFieldConfig(undefined)).toBeNull()
    expect(getBlocksFieldConfig({})).toBeNull()
    expect(getBlocksFieldConfig({ items: {} })).toBeNull()
  })

  it('returns blocks config with default discriminator', () => {
    const config = getBlocksFieldConfig({
      items: {
        blocks: {
          text: { properties: { heading: { type: 'string' } } }
        }
      }
    })

    expect(config).toEqual({
      blocks: {
        text: { properties: { heading: { type: 'string' } } }
      },
      discriminator: 'blockType'
    })
  })

  it('parses blocks JSON with discriminator key', () => {
    const config = {
      blocks: {
        text: { properties: { heading: { type: 'string' } } }
      },
      discriminator: 'blockType'
    }
    const input = JSON.stringify([
      { blockType: 'text', heading: 'Hello' }
    ])

    const parsed = parseBlocksValue(input, config)

    expect(parsed.errors).toEqual([])
    expect(parsed.value).toEqual([{ blockType: 'text', heading: 'Hello' }])
  })

  it('converts legacy blockType/data shape', () => {
    const config = {
      blocks: {
        text: { properties: { heading: { type: 'string' } } }
      },
      discriminator: 'blockType'
    }
    const input = JSON.stringify([
      { blockType: 'text', data: { heading: 'Hello' } }
    ])

    const parsed = parseBlocksValue(input, config)

    expect(parsed.errors).toEqual([])
    expect(parsed.value).toEqual([{ blockType: 'text', heading: 'Hello' }])
  })

  it('reports errors for invalid JSON and missing discriminator', () => {
    const config = {
      blocks: {
        text: { properties: { heading: { type: 'string' } } }
      },
      discriminator: 'blockType'
    }

    const invalidJson = parseBlocksValue('{invalid}', config)
    expect(invalidJson.errors).toEqual(['Blocks value must be valid JSON'])

    const missingDiscriminator = parseBlocksValue([{ heading: 'Hello' }], config)
    expect(missingDiscriminator.errors).toEqual(['Block #1 is missing \"blockType\"'])
  })
})
