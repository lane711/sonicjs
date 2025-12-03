#!/usr/bin/env node

/**
 * Release Announcement Orchestrator
 *
 * Coordinates the release announcement process:
 * 1. Generate AI content for all platforms
 * 2. Post to Discord
 * 3. Post to Twitter/X
 * 4. Update WWW repository (version badge, changelogs)
 *
 * Usage:
 *   node scripts/release/index.js [options]
 *
 * Options:
 *   --dry-run    Don't post anything, just show what would happen
 *   --skip-discord    Skip Discord posting
 *   --skip-twitter    Skip Twitter posting
 *   --skip-www        Skip WWW repository update
 *   --version <ver>   Override version number
 *   --notes <text>    Override release notes
 */

import { generateContent, getReleaseInfo } from './generate-content.js'
import { postToTwitter } from './post-twitter.js'
import { updateWww } from './update-www.js'

/**
 * Post to Discord with AI-generated content
 * @param {Object} content - Generated Discord content
 * @param {Object} releaseInfo - Release information
 * @param {Object} options - Options
 * @returns {Promise<Object>}
 */
async function postToDiscord(content, releaseInfo, options = {}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (options.dryRun) {
    console.log('🔵 [DRY RUN] Would post to Discord:')
    console.log('---')
    console.log(`Title: ${content.title}`)
    console.log(`Description: ${content.description}`)
    console.log(`Highlights: ${content.highlights.join(', ')}`)
    console.log('---')
    return { dryRun: true }
  }

  if (!webhookUrl) {
    console.warn('⚠️  DISCORD_WEBHOOK_URL not set, skipping Discord notification')
    return { skipped: true, reason: 'webhook_missing' }
  }

  const message = {
    embeds: [
      {
        title: content.title,
        description: content.description,
        color: 0x5865f2, // Discord blurple
        fields: [
          {
            name: '✨ Highlights',
            value: content.highlights.map(h => `• ${h}`).join('\n'),
            inline: false
          },
          {
            name: '📦 Install',
            value: '```bash\nnpm create sonicjs@latest\n```',
            inline: false
          },
          {
            name: '📚 Links',
            value: [
              `[Release Notes](${releaseInfo.url})`,
              '[npm](https://www.npmjs.com/package/@sonicjs-cms/core)',
              '[GitHub](https://github.com/lane711/sonicjs)',
              '[Docs](https://sonicjs.com)'
            ].join(' • '),
            inline: false
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'SonicJS CMS'
        }
      }
    ]
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    })

    if (response.ok) {
      console.log(`✅ Discord notification sent for v${releaseInfo.version}`)
      return { success: true }
    } else {
      const errorText = await response.text()
      console.error(`❌ Discord notification failed: ${response.status} ${errorText}`)
      return { error: true, status: response.status, message: errorText }
    }
  } catch (error) {
    console.error('❌ Error sending Discord notification:', error.message)
    return { error: true, message: error.message }
  }
}

/**
 * Parse command line arguments
 * @returns {Object}
 */
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    dryRun: process.env.DRY_RUN === 'true' || args.includes('--dry-run'),
    skipDiscord: args.includes('--skip-discord'),
    skipTwitter: args.includes('--skip-twitter'),
    skipWww: args.includes('--skip-www'),
    version: null,
    notes: null
  }

  // Parse --version <ver>
  const versionIndex = args.indexOf('--version')
  if (versionIndex !== -1 && args[versionIndex + 1]) {
    options.version = args[versionIndex + 1]
  }

  // Parse --notes <text>
  const notesIndex = args.indexOf('--notes')
  if (notesIndex !== -1 && args[notesIndex + 1]) {
    options.notes = args[notesIndex + 1]
  }

  return options
}

/**
 * Main orchestrator function
 */
async function main() {
  console.log('🚀 SonicJS Release Announcement\n')

  const options = parseArgs()

  if (options.dryRun) {
    console.log('🔵 DRY RUN MODE - No actual posts will be made\n')
  }

  // Step 1: Get release information
  console.log('📋 Getting release information...')
  let releaseInfo = await getReleaseInfo()

  // Override with command line options if provided
  if (options.version) {
    releaseInfo.version = options.version
    releaseInfo.tagName = `v${options.version}`
  }
  if (options.notes) {
    releaseInfo.body = options.notes
  }

  console.log(`   Version: ${releaseInfo.version}`)
  console.log(`   Tag: ${releaseInfo.tagName}`)
  console.log(`   URL: ${releaseInfo.url}\n`)

  // Step 2: Generate AI content
  console.log('🤖 Generating AI content...')
  const content = await generateContent(releaseInfo, { dryRun: options.dryRun })
  console.log('')

  // Track results
  const results = {
    discord: null,
    twitter: null,
    www: null
  }

  // Step 3: Post to Discord
  if (!options.skipDiscord) {
    console.log('💬 Posting to Discord...')
    results.discord = await postToDiscord(content.discord, releaseInfo, { dryRun: options.dryRun })
    console.log('')
  } else {
    console.log('⏭️  Skipping Discord (--skip-discord)\n')
    results.discord = { skipped: true, reason: 'user_skip' }
  }

  // Step 4: Post to Twitter
  if (!options.skipTwitter) {
    console.log('🐦 Posting to Twitter/X...')
    results.twitter = await postToTwitter(content.twitter, releaseInfo.url, { dryRun: options.dryRun })
    console.log('')
  } else {
    console.log('⏭️  Skipping Twitter (--skip-twitter)\n')
    results.twitter = { skipped: true, reason: 'user_skip' }
  }

  // Step 5: Update WWW repository
  if (!options.skipWww) {
    console.log('🌐 Updating WWW repository...')
    results.www = await updateWww(content.www, releaseInfo, { dryRun: options.dryRun })
    console.log('')
  } else {
    console.log('⏭️  Skipping WWW update (--skip-www)\n')
    results.www = { skipped: true, reason: 'user_skip' }
  }

  // Summary
  console.log('📊 Summary')
  console.log('─'.repeat(40))

  const statusIcon = (result) => {
    if (!result) return '⚪'
    if (result.dryRun) return '🔵'
    if (result.success) return '✅'
    if (result.skipped) return '⏭️'
    if (result.error) return '❌'
    return '⚪'
  }

  console.log(`${statusIcon(results.discord)} Discord: ${results.discord?.success ? 'Posted' : results.discord?.skipped ? 'Skipped' : results.discord?.dryRun ? 'Dry run' : 'Failed'}`)
  console.log(`${statusIcon(results.twitter)} Twitter: ${results.twitter?.success ? `Posted (${results.twitter.url})` : results.twitter?.skipped ? 'Skipped' : results.twitter?.dryRun ? 'Dry run' : 'Failed'}`)
  console.log(`${statusIcon(results.www)} WWW: ${results.www?.success ? `PR created (#${results.www.prNumber})` : results.www?.skipped ? 'Skipped' : results.www?.dryRun ? 'Dry run' : 'Failed'}`)

  // Exit with error if any platform failed
  const hasError = Object.values(results).some(r => r?.error)
  if (hasError) {
    console.log('\n⚠️  Some announcements failed. Check the logs above.')
    process.exit(1)
  }

  console.log('\n✨ Release announcement complete!')
}

// Run the main function
main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
