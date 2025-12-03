#!/usr/bin/env node

/**
 * WWW Website Update Script for Release Announcements
 *
 * Updates the SonicJS website (in www/ folder) with:
 * 1. Home page changelog section (Recent Updates)
 * 2. Full changelog page
 *
 * Works with the local www/ folder in the monorepo.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.join(__dirname, '../..')
const WWW_DIR = path.join(ROOT_DIR, 'www')

/**
 * @typedef {Object} WwwContent
 * @property {string} homeChangelog - Summary for home page
 * @property {string} fullChangelog - Full changelog entry markdown
 */

/**
 * @typedef {Object} ReleaseInfo
 * @property {string} version - Release version
 * @property {string} tagName - Git tag name
 * @property {string} url - GitHub release URL
 * @property {string} publishedAt - ISO date string
 */

// File paths in the WWW folder
const HOME_PAGE_PATH = path.join(WWW_DIR, 'src/app/page.mdx')
const CHANGELOG_PAGE_PATH = path.join(WWW_DIR, 'src/app/changelog/page.mdx')

/**
 * Update the home page with new release info in the "Recent Updates" section
 * @param {string} version - Version number
 * @param {string} summary - Changelog summary
 * @param {string[]} highlights - Key highlights
 * @returns {boolean} Success
 */
function updateHomePage(version, summary, highlights) {
  const content = fs.readFileSync(HOME_PAGE_PATH, 'utf8')

  const date = new Date().toISOString().split('T')[0]

  // Find the "Recent Updates" section and the first version entry
  // Look for the pattern: <div className="border-l-4 border-emerald-500
  const firstVersionPattern = /<div className="border-l-4 border-emerald-500[^>]*>[\s\S]*?<\/div>\s*<\/div>/
  const match = content.match(firstVersionPattern)

  if (!match) {
    console.warn('⚠️  Could not find Recent Updates section in home page')
    return false
  }

  // Create new version entry (emerald for latest)
  const highlightsHtml = highlights.map(h =>
    `        <div className="flex items-start gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>
          <span className="text-gray-700 dark:text-gray-300">${h}</span>
        </div>`
  ).join('\n')

  const newEntry = `<div className="border-l-4 border-emerald-500 dark:border-emerald-400 pl-4 py-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">v${version}</span>
        <span className="text-xs px-2 py-1 rounded bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300 font-bold">LATEST</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">${date}</span>
      </div>
      <div className="text-sm space-y-1">
${highlightsHtml}
      </div>
    </div>`

  // Replace the old "LATEST" badge with just the version
  let updatedContent = content.replace(
    /<span className="text-xs px-2 py-1 rounded bg-gradient-to-r from-orange-100 to-red-100[^>]*>LATEST<\/span>/g,
    ''
  )

  // Change the first emerald entry to blue (demote it)
  updatedContent = updatedContent.replace(
    /<div className="border-l-4 border-emerald-500 dark:border-emerald-400/,
    '<div className="border-l-4 border-blue-500 dark:border-blue-400'
  )
  updatedContent = updatedContent.replace(
    /bg-emerald-100 dark:bg-emerald-900\/30 text-emerald-700 dark:text-emerald-300/,
    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
  )
  updatedContent = updatedContent.replace(
    /text-emerald-600 dark:text-emerald-400/g,
    'text-blue-600 dark:text-blue-400'
  )

  // Insert new entry before the (now blue) first entry
  const insertPoint = updatedContent.indexOf('<div className="border-l-4 border-blue-500')
  if (insertPoint === -1) {
    console.warn('⚠️  Could not find insertion point in home page')
    return false
  }

  updatedContent = updatedContent.slice(0, insertPoint) + newEntry + '\n\n    ' + updatedContent.slice(insertPoint)

  fs.writeFileSync(HOME_PAGE_PATH, updatedContent)
  return true
}

/**
 * Update the changelog page with new release entry
 * @param {string} version - Version number
 * @param {string} fullChangelog - Full changelog markdown
 * @param {string[]} highlights - Key highlights for the card
 * @returns {boolean} Success
 */
function updateChangelogPage(version, fullChangelog, highlights) {
  const content = fs.readFileSync(CHANGELOG_PAGE_PATH, 'utf8')

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Create new changelog entry in the same style as existing entries
  const highlightsHtml = highlights.map(h =>
    `          <li className="flex items-start gap-2"><span className="text-emerald-500">▸</span>${h}</li>`
  ).join('\n')

  const newEntry = `{/* Version ${version} */}
<div className="relative pl-8 pb-8 border-l-2 border-emerald-200 dark:border-emerald-800">
  <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white dark:border-gray-900 shadow-lg"></div>

  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800 shadow-md hover:shadow-xl transition-shadow">
    <div className="flex items-center gap-3 mb-4">
      <span className="px-3 py-1 bg-emerald-500 text-white text-sm font-bold rounded-lg">v${version}</span>
      <span className="text-sm text-gray-600 dark:text-gray-400">${date}</span>
      <span className="px-2 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 border border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300 text-xs font-bold rounded uppercase">Latest</span>
    </div>

    <div className="space-y-3">
      <div>
        <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-2">
          <span>✨</span> Highlights
        </h4>
        <ul className="space-y-1.5 ml-6 text-sm text-gray-700 dark:text-gray-300">
${highlightsHtml}
        </ul>
      </div>
    </div>
  </div>
</div>

`

  // Find the "Version 2.x" section and insert after the opening div
  const version2xPattern = /## Version 2\.x\s*\n\s*<div className="not-prose space-y-6 my-8">\s*\n/
  const match = content.match(version2xPattern)

  if (!match) {
    console.warn('⚠️  Could not find Version 2.x section in changelog page')
    return false
  }

  // Remove "Latest" badge from the previous latest entry
  let updatedContent = content.replace(
    /<span className="px-2 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900\/30 dark:to-red-900\/30 border border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-300 text-xs font-bold rounded uppercase">Latest<\/span>/g,
    ''
  )

  // Insert new entry after the Version 2.x section header
  const insertIndex = updatedContent.indexOf(match[0]) + match[0].length
  updatedContent = updatedContent.slice(0, insertIndex) + '\n' + newEntry + updatedContent.slice(insertIndex)

  fs.writeFileSync(CHANGELOG_PAGE_PATH, updatedContent)
  return true
}

/**
 * Update WWW folder with release information
 * @param {WwwContent} content - Generated content
 * @param {ReleaseInfo} releaseInfo - Release information
 * @param {Object} options - Options
 * @param {boolean} options.dryRun - If true, don't make actual changes
 * @returns {Promise<Object>}
 */
export async function updateWww(content, releaseInfo, options = {}) {
  const { version } = releaseInfo

  // Parse highlights from the content
  const highlights = content.fullChangelog
    .split('\n')
    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
    .slice(0, 4)
    .map(line => line.replace(/^[-*]\s*/, '').replace(/\*\*/g, '<strong>').replace(/\*\*/g, '</strong>').trim())

  // Use discord highlights if available (they're better formatted)
  const discordHighlights = Array.isArray(content.highlights) ? content.highlights : highlights

  if (options.dryRun) {
    console.log('🔵 [DRY RUN] Would update WWW folder:')
    console.log(`   Home page: ${HOME_PAGE_PATH}`)
    console.log(`   Changelog: ${CHANGELOG_PAGE_PATH}`)
    console.log(`   Version: ${version}`)
    console.log(`   Highlights: ${discordHighlights.join(', ')}`)
    return { dryRun: true }
  }

  // Check if WWW folder exists
  if (!fs.existsSync(WWW_DIR)) {
    console.warn('⚠️  WWW folder not found at:', WWW_DIR)
    return { skipped: true, reason: 'www_folder_missing' }
  }

  try {
    console.log(`📝 Updating home page: ${HOME_PAGE_PATH}`)
    const homeSuccess = updateHomePage(version, content.homeChangelog, discordHighlights)

    console.log(`📝 Updating changelog page: ${CHANGELOG_PAGE_PATH}`)
    const changelogSuccess = updateChangelogPage(version, content.fullChangelog, discordHighlights)

    if (homeSuccess && changelogSuccess) {
      console.log('✅ WWW folder updated successfully')
      console.log('   Note: Changes are local. Commit and push to deploy.')
      return { success: true, local: true }
    } else {
      console.warn('⚠️  Some updates may have failed')
      return {
        success: false,
        homeUpdated: homeSuccess,
        changelogUpdated: changelogSuccess
      }
    }
  } catch (error) {
    console.error('❌ Error updating WWW folder:', error.message)
    return { error: true, message: error.message }
  }
}

/**
 * Check if WWW folder is accessible
 * @returns {Promise<boolean>}
 */
export async function verifyWwwAccess() {
  return fs.existsSync(WWW_DIR) &&
         fs.existsSync(HOME_PAGE_PATH) &&
         fs.existsSync(CHANGELOG_PAGE_PATH)
}
