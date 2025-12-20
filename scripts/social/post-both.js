#!/usr/bin/env node

/**
 * Cross-Platform Social Post Script
 *
 * Posts the same message to both Discord and Twitter/X.
 *
 * Usage:
 *   node scripts/social/post-both.js "Your announcement here"
 *   node scripts/social/post-both.js --title "Title" --message "Message"
 *   node scripts/social/post-both.js --dry-run "Test message"
 *   node scripts/social/post-both.js --discord-only "Discord only message"
 *   node scripts/social/post-both.js --twitter-only "Twitter only message"
 *
 * Environment (loaded from ~/Dropbox/Data/.env):
 *   DISCORD_WEBHOOK_URL - Discord webhook URL
 *   TWITTER_API_KEY, TWITTER_API_SECRET, etc. - Twitter credentials
 */

import { spawn } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { homedir } from 'os'

// Load environment variables from shared .env file
const envPath = `${homedir()}/Dropbox/Data/.env`
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        process.env[key] = valueParts.join('=')
      }
    }
  }
}
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    dryRun: false,
    title: null,
    message: null,
    discordOnly: false,
    twitterOnly: false,
    hashtags: null,
    url: null
  }

  let i = 0
  while (i < args.length) {
    const arg = args[i]

    if (arg === '--dry-run') {
      options.dryRun = true
    } else if (arg === '--title' && args[i + 1]) {
      options.title = args[++i]
    } else if (arg === '--message' && args[i + 1]) {
      options.message = args[++i]
    } else if (arg === '--discord-only') {
      options.discordOnly = true
    } else if (arg === '--twitter-only') {
      options.twitterOnly = true
    } else if (arg === '--hashtags' && args[i + 1]) {
      options.hashtags = args[++i]
    } else if (arg === '--url' && args[i + 1]) {
      options.url = args[++i]
    } else if (!arg.startsWith('--')) {
      // Positional argument is the message
      options.message = arg
    }
    i++
  }

  return options
}

/**
 * Run a script with arguments
 */
function runScript(scriptPath, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [scriptPath, ...args], {
      stdio: 'inherit',
      env: process.env
    })

    proc.on('close', code => {
      if (code === 0) {
        resolve({ success: true })
      } else {
        resolve({ error: true, code })
      }
    })

    proc.on('error', err => {
      reject(err)
    })
  })
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs()

  if (!options.message) {
    console.error('❌ Error: No message provided')
    console.error('Usage: node scripts/social/post-both.js "Your message here"')
    process.exit(1)
  }

  console.log('📢 Social Media Post\n')

  if (options.dryRun) {
    console.log('🔵 DRY RUN MODE - No actual posts will be made\n')
  }

  const results = {
    discord: null,
    twitter: null
  }

  // Post to Discord
  if (!options.twitterOnly) {
    console.log('💬 Discord:')
    const discordArgs = []
    if (options.dryRun) discordArgs.push('--dry-run')
    if (options.title) discordArgs.push('--title', options.title)
    discordArgs.push('--message', options.message)

    results.discord = await runScript(path.join(__dirname, 'post-discord.js'), discordArgs)
    console.log('')
  }

  // Post to Twitter
  if (!options.discordOnly) {
    console.log('🐦 Twitter:')
    const twitterArgs = []
    if (options.dryRun) twitterArgs.push('--dry-run')
    if (options.hashtags) twitterArgs.push('--hashtags', options.hashtags)
    if (options.url) twitterArgs.push('--url', options.url)
    twitterArgs.push('--text', options.message)

    results.twitter = await runScript(path.join(__dirname, 'post-twitter.js'), twitterArgs)
    console.log('')
  }

  // Summary
  console.log('📊 Summary')
  console.log('─'.repeat(40))

  if (!options.twitterOnly) {
    const discordStatus = results.discord?.success ? '✅ Posted' : results.discord?.error ? '❌ Failed' : '⏭️ Skipped'
    console.log(`Discord: ${discordStatus}`)
  }

  if (!options.discordOnly) {
    const twitterStatus = results.twitter?.success ? '✅ Posted' : results.twitter?.error ? '❌ Failed' : '⏭️ Skipped'
    console.log(`Twitter: ${twitterStatus}`)
  }

  // Check for errors
  const hasError = results.discord?.error || results.twitter?.error
  if (hasError) {
    process.exit(1)
  }

  console.log('\n✨ Done!')
}

main().catch(err => {
  console.error('❌ Fatal error:', err)
  process.exit(1)
})
