import type { CollectionConfig } from '@sonicjs-cms/core'

const pageBlocksCollection: CollectionConfig = {
  name: 'page_blocks',
  displayName: 'Page Blocks',
  description: 'Pages with flexible content blocks',
  managed: true,
  schema: {
    type: 'object',
    required: ['title', 'slug'],
    properties: {
      title: {
        type: 'string',
        title: 'Title',
        required: true,
        minLength: 3
      },
      slug: {
        type: 'slug',
        title: 'Slug',
        required: true
      },
      body: {
        type: 'array',
        title: 'Content Blocks',
        items: {
          type: 'object',
          discriminator: 'blockType',
          blocks: {
            text: {
              label: 'Text',
              properties: {
                heading: { type: 'string', required: true },
                body: { type: 'textarea', required: true }
              }
            },
            callToAction: {
              label: 'Call To Action',
              properties: {
                title: { type: 'string', required: true },
                buttonLabel: { type: 'string', required: true },
                buttonUrl: { type: 'url', required: true }
              }
            }
          }
        }
      }
    }
  }
}

export default pageBlocksCollection
