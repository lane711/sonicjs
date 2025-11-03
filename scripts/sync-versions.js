#!/usr/bin/env node

/**
 * Sync versions script
 *
 * This script syncs the @sonicjs-cms/core version across the monorepo:
 * 1. Reads the version from packages/core/package.json
 * 2. Updates the version in packages/create-app/src/cli.js
 * 3. Syncs the create-sonicjs package version to match core version
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rootDir = path.join(__dirname, '..')
const corePackageJsonPath = path.join(rootDir, 'packages/core/package.json')
const createAppCliPath = path.join(rootDir, 'packages/create-app/src/cli.js')
const createAppPackageJsonPath = path.join(rootDir, 'packages/create-app/package.json')

async function syncVersions() {
  try {
    // Read core version
    const corePackageJson = JSON.parse(fs.readFileSync(corePackageJsonPath, 'utf8'))
    const coreVersion = corePackageJson.version

    console.log(`📦 Core version: ${coreVersion}`)

    // Update create-app CLI to use the new core version
    let cliContent = fs.readFileSync(createAppCliPath, 'utf8')
    const versionRegex = /'@sonicjs-cms\/core': '\^[\d.]+(-[\w.]+)?'/
    const newVersionString = `'@sonicjs-cms/core': '^${coreVersion}'`

    if (versionRegex.test(cliContent)) {
      cliContent = cliContent.replace(versionRegex, newVersionString)
      fs.writeFileSync(createAppCliPath, cliContent, 'utf8')
      console.log(`✓ Updated create-app CLI to use @sonicjs-cms/core@^${coreVersion}`)
    } else {
      console.warn('⚠ Could not find version string in CLI file to update')
    }

    // Sync create-sonicjs version to match core version
    const createAppPackageJson = JSON.parse(fs.readFileSync(createAppPackageJsonPath, 'utf8'))
    const oldCreateAppVersion = createAppPackageJson.version

    createAppPackageJson.version = coreVersion
    fs.writeFileSync(createAppPackageJsonPath, JSON.stringify(createAppPackageJson, null, 2) + '\n', 'utf8')

    console.log(`✓ Synced create-sonicjs from ${oldCreateAppVersion} to ${coreVersion}`)

    console.log('\n✅ Version sync complete!')
    console.log('\nNext steps:')
    console.log('  1. Review the changes: git diff')
    console.log('  2. Commit the version changes: git add . && git commit -m "chore: bump versions"')
    console.log('  3. Publish packages: npm run publish:all')
    console.log('  4. Create git tag: git tag v' + coreVersion)
    console.log('  5. Push changes: git push && git push --tags')

  } catch (error) {
    console.error('❌ Error syncing versions:', error)
    process.exit(1)
  }
}

syncVersions()
