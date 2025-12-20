#!/usr/bin/env node

/**
 * Discord Post Script
 *
 * Posts a custom message to the SonicJS Discord server.
 *
 * Usage:
 *   node scripts/social/post-discord.js "Your message here"
 *   node scripts/social/post-discord.js --title "Title" --message "Message"
 *   node scripts/social/post-discord.js --dry-run "Test message"
 *
 * Environment (loaded from ~/Dropbox/Data/.env):
 *   DISCORD_WEBHOOK_URL - Discord webhook URL
 */

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

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    dryRun: false,
    title: null,
    message: null,
    color: 0x5865f2 // Discord blurple
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
    } else if (arg === '--color' && args[i + 1]) {
      options.color = parseInt(args[++i], 16)
    } else if (!arg.startsWith('--')) {
      // Positional argument is the message
      options.message = arg
    }
    i++
  }

  return options
}

/**
 * Post message to Discord
 */
async function postToDiscord(options) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.error('❌ Error: DISCORD_WEBHOOK_URL not configured')
    console.error('Set DISCORD_WEBHOOK_URL in ~/Dropbox/Data/.env')
    process.exit(1)
  }

  if (!options.message) {
    console.error('❌ Error: No message provided')
    console.error('Usage: node scripts/social/post-discord.js "Your message here"')
    process.exit(1)
  }

  const embed = {
    embeds: [{
      title: options.title || '📢 SonicJS Announcement',
      description: options.message,
      color: options.color,
      timestamp: new Date().toISOString(),
      footer: { text: 'SonicJS CMS' }
    }]
  }

  if (options.dryRun) {
    console.log('🔵 [DRY RUN] Would post to Discord:')
    console.log('---')
    console.log(`Title: ${embed.embeds[0].title}`)
    console.log(`Message: ${embed.embeds[0].description}`)
    console.log('---')
    return { dryRun: true }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(embed)
    })

    if (response.ok) {
      console.log('✅ Posted to Discord successfully!')
      return { success: true }
    } else {
      const errorText = await response.text()
      console.error(`❌ Failed to post: ${response.status} - ${errorText}`)
      return { error: true, status: response.status, message: errorText }
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    return { error: true, message: error.message }
  }
}

// Run if called directly
const options = parseArgs()
postToDiscord(options)
