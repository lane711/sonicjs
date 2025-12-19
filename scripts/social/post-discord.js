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
 * Environment:
 *   DISCORD_WEBHOOK_URL - Discord webhook URL (optional, uses default if not set)
 */

const DEFAULT_WEBHOOK = 'https://discord.com/api/webhooks/1443339433318285442/lnxdw64Wze72PjY8EhxPYF6bLGjqBwOi8EqwOnZxUFPo82E37o6myjQ1aO-8dzvsaStN'

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
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || DEFAULT_WEBHOOK

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
