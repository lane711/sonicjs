/**
 * Collection Loader for Monolith Application
 *
 * Loads collection configurations from the monolith's collections directory.
 * This overrides the core package's collection loader to load from the correct path.
 */

import { CollectionConfig } from '@sonicjs-cms/core'

// Direct imports of all collection config files
import blogPostsCollection from '../collections/blog-posts.collection'
import pagesCollection from '../collections/pages.collection'
import productsCollection from '../collections/products.collection'
import testItemsCollection from '../collections/test-items.collection'

/**
 * Load all collection configurations from the monolith's collections directory
 */
export async function loadCollectionConfigs(): Promise<CollectionConfig[]> {
  const collections: CollectionConfig[] = []

  // Array of all imported collections
  const importedCollections = [
    blogPostsCollection,
    pagesCollection,
    productsCollection,
    testItemsCollection
  ]

  try {
    for (const config of importedCollections) {
      try {
        // Validate required fields
        if (!config.name || !config.displayName || !config.schema) {
          console.error(`Invalid collection config: missing required fields`)
          continue
        }

        // Set defaults
        const normalizedConfig: CollectionConfig = {
          ...config,
          managed: config.managed !== undefined ? config.managed : true,
          isActive: config.isActive !== undefined ? config.isActive : true
        }

        collections.push(normalizedConfig)
        console.log(`✓ Loaded collection config: ${config.name}`)
      } catch (error) {
        console.error(`Error processing collection:`, error)
      }
    }

    console.log(`Loaded ${collections.length} collection configuration(s)`)
    return collections
  } catch (error) {
    console.error('Error loading collection configurations:', error)
    return []
  }
}
