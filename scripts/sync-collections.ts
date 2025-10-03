/**
 * Sync Collections CLI Script
 *
 * Manually syncs collection configurations to the database.
 * Usage: npm run sync-collections [--env production|staging]
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Parse command line arguments
const args = process.argv.slice(2)
const envArg = args.find(arg => arg.startsWith('--env='))
const environment = envArg ? envArg.split('=')[1] : 'local'

const validEnvs = ['local', 'staging', 'production']
if (!validEnvs.includes(environment)) {
  console.error(`Invalid environment: ${environment}`)
  console.error(`Valid options: ${validEnvs.join(', ')}`)
  process.exit(1)
}

async function syncCollections() {
  console.log('🔄 Syncing Collections to Database')
  console.log(`Environment: ${environment}`)
  console.log('─'.repeat(50))

  try {
    // Import the sync service dynamically
    const { fullCollectionSync } = await import('../src/services/collection-sync.ts')
    const { loadCollectionConfigs } = await import('../src/services/collection-loader.ts')

    // Load configs to show what will be synced
    const configs = await loadCollectionConfigs()
    console.log(`\nFound ${configs.length} collection configuration(s):\n`)

    configs.forEach((config, index) => {
      console.log(`  ${index + 1}. ${config.displayName} (${config.name})`)
      console.log(`     Managed: ${config.managed ? 'Yes' : 'No'}`)
      console.log(`     Active: ${config.isActive ? 'Yes' : 'No'}`)
      console.log('')
    })

    console.log('─'.repeat(50))
    console.log('\n⚠️  This will sync collections to the database.')
    console.log('Config-managed collections will be created/updated and locked.')
    console.log('\nNote: For remote databases, use wrangler CLI instead.')
    console.log('Example: wrangler d1 execute sonicjs-ai --env production --command "..."')

    if (environment === 'local') {
      console.log('\n✅ For local development, collections will auto-sync on app startup.')
      console.log('Just run: npm run dev')
    }

    console.log('\n' + '─'.repeat(50))
    console.log('\n💡 Tip: Add new collections by creating .collection.ts files in src/collections/')
    console.log('📖 See src/collections/README.md for documentation\n')

  } catch (error) {
    console.error('\n❌ Error:', error)
    process.exit(1)
  }
}

syncCollections()
