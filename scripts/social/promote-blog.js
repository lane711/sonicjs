#!/usr/bin/env node

/**
 * Blog Promotion Script
 *
 * Finds the next unpromoted blog post and posts it to Discord and Twitter.
 * Tracks promotion status in blog-promotion-tracker.json
 *
 * Usage:
 *   node scripts/social/promote-blog.js           # Promote next post
 *   node scripts/social/promote-blog.js --dry-run # Preview without posting
 *   node scripts/social/promote-blog.js --list    # List all posts and status
 *   node scripts/social/promote-blog.js --reset   # Reset tracker (mark all unpromoted)
 *
 * Environment (loaded from ~/Dropbox/Data/.env):
 *   DISCORD_BLOG_WEBHOOK_URL - Webhook for #blog channel (required)
 *   TWITTER_API_KEY, etc.    - Twitter credentials
 */

import { spawn } from 'child_process'
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { homedir } from 'os'
import { fileURLToPath } from 'url'
import path from 'path'

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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.join(__dirname, '../..')
const BLOG_DIR = path.join(ROOT_DIR, 'www/content/blog')
const TRACKER_PATH = path.join(__dirname, 'blog-promotion-tracker.json')
const SITE_URL = 'https://sonicjs.com'

/**
 * Post directly to Discord blog channel
 * Uses DISCORD_BLOG_WEBHOOK_URL (falls back to DISCORD_WEBHOOK_URL)
 */
async function postToDiscordBlog(title, message, dryRun = false) {
  const webhookUrl = process.env.DISCORD_BLOG_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.error('❌ Error: DISCORD_BLOG_WEBHOOK_URL not configured')
    console.error('Add DISCORD_BLOG_WEBHOOK_URL to ~/Dropbox/Data/.env')
    return { error: true }
  }

  const embed = {
    embeds: [{
      title: title,
      description: message,
      color: 0x3b82f6, // Blue for blog posts
      timestamp: new Date().toISOString(),
      footer: { text: 'SonicJS Blog' }
    }]
  }

  if (dryRun) {
    console.log('🔵 [DRY RUN] Would post to Discord #blog:')
    console.log('---')
    console.log(`Title: ${title}`)
    console.log(`Message: ${message}`)
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
      console.log('✅ Posted to Discord #blog successfully!')
      return { success: true }
    } else {
      const errorText = await response.text()
      console.error(`❌ Failed to post: ${response.status} - ${errorText}`)
      return { error: true }
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    return { error: true }
  }
}

/**
 * Parse frontmatter from MDX file
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}

  const frontmatter = {}
  const lines = match[1].split('\n')
  let currentKey = null
  let inArray = false

  for (const line of lines) {
    // Handle array items
    if (line.match(/^\s+-\s+/)) {
      if (currentKey && inArray) {
        const value = line.replace(/^\s+-\s+["']?(.+?)["']?$/, '$1')
        frontmatter[currentKey] = frontmatter[currentKey] || []
        frontmatter[currentKey].push(value)
      }
      continue
    }

    // Handle key: value pairs
    const kvMatch = line.match(/^(\w+):\s*(.*)$/)
    if (kvMatch) {
      currentKey = kvMatch[1]
      const value = kvMatch[2].replace(/^["']|["']$/g, '')

      if (value === '') {
        inArray = true
        frontmatter[currentKey] = []
      } else {
        inArray = false
        frontmatter[currentKey] = value
      }
    }
  }

  return frontmatter
}

/**
 * Get all blog posts from the content directory
 */
function getAllBlogPosts() {
  const posts = []

  function scanDirectory(dir) {
    const entries = readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        scanDirectory(fullPath)
      } else if (entry.name.endsWith('.mdx')) {
        const content = readFileSync(fullPath, 'utf8')
        const frontmatter = parseFrontmatter(content)
        const slug = entry.name.replace('.mdx', '')
        const category = path.basename(dir)

        // Skip drafts
        if (frontmatter.draft === 'true') continue

        posts.push({
          slug,
          category,
          title: frontmatter.title || slug,
          description: frontmatter.description || '',
          publishedAt: frontmatter.publishedAt || '1970-01-01',
          url: `${SITE_URL}/blog/${slug}`
        })
      }
    }
  }

  if (existsSync(BLOG_DIR)) {
    scanDirectory(BLOG_DIR)
  }

  // Sort by publish date (oldest first for promotion queue)
  return posts.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt))
}

/**
 * Load the promotion tracker
 */
function loadTracker() {
  if (existsSync(TRACKER_PATH)) {
    return JSON.parse(readFileSync(TRACKER_PATH, 'utf8'))
  }
  return { promoted: [], lastUpdated: null }
}

/**
 * Save the promotion tracker
 */
function saveTracker(tracker) {
  tracker.lastUpdated = new Date().toISOString()
  writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2) + '\n')
}

/**
 * Generate social media content for a blog post
 */
function generateSocialContent(post) {
  // Category-specific hooks
  const hooks = {
    comparisons: [
      `Choosing between CMS options? Our comparison of ${extractCompetitors(post.title)} breaks it down.`,
      `${extractCompetitors(post.title)} - which is right for you? We compare the key differences.`,
      `CMS showdown: ${extractCompetitors(post.title)}. Read our detailed comparison.`
    ],
    tutorials: [
      `New tutorial: ${post.title}`,
      `Learn how to ${extractAction(post.title)} with this step-by-step guide.`,
      `Getting started guide: ${post.title}`
    ],
    guides: [
      `${post.title}`,
      `Deep dive: ${extractTopic(post.title)}`,
      `Check out our guide on ${extractTopic(post.title).toLowerCase()}`
    ],
    'deep-dives': [
      `${post.title}`,
      `Why edge-first architecture matters: ${extractTopic(post.title)}`,
      `Exploring ${extractTopic(post.title).toLowerCase()}`
    ]
  }

  const categoryHooks = hooks[post.category] || hooks.guides
  const hook = categoryHooks[Math.floor(Math.random() * categoryHooks.length)]

  return {
    twitter: hook,
    discord: `${hook}\n\n${post.description}`,
    url: post.url
  }
}

/**
 * Extract competitor names from comparison title
 */
function extractCompetitors(title) {
  // Handle titles like "Strapi vs Directus vs SonicJS"
  const match = title.match(/(.+?)\s+vs\s+(.+?)\s+vs\s+(.+?)(?:\s*[-:]|$)/i)
  if (match) {
    return `${match[1].trim()}, ${match[2].trim()}, and ${match[3].trim()}`
  }

  // Handle titles like "SonicJS vs Strapi"
  const match2 = title.match(/(.+?)\s+vs\s+(.+?)(?:\s*[-:]|$)/i)
  if (match2) {
    return `${match2[1].trim()} and ${match2[2].trim()}`
  }

  return title.split(':')[0].trim()
}

/**
 * Extract action from tutorial title
 */
function extractAction(title) {
  const lower = title.toLowerCase()
  if (lower.includes('getting started')) return 'get started with SonicJS'
  if (lower.includes('building')) return 'build with SonicJS'
  if (lower.includes('custom')) return 'customize SonicJS'
  return 'use SonicJS effectively'
}

/**
 * Extract topic from title
 */
function extractTopic(title) {
  return title.split(':')[0].trim()
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
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2)
  return {
    dryRun: args.includes('--dry-run'),
    list: args.includes('--list'),
    reset: args.includes('--reset')
  }
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs()
  const posts = getAllBlogPosts()
  const tracker = loadTracker()

  console.log('📝 Blog Promotion Tool\n')

  // Handle --reset
  if (options.reset) {
    tracker.promoted = []
    saveTracker(tracker)
    console.log('✅ Tracker reset. All posts marked as unpromoted.')
    return
  }

  // Handle --list
  if (options.list) {
    console.log(`Found ${posts.length} blog posts:\n`)

    for (const post of posts) {
      const promoted = tracker.promoted.includes(post.slug)
      const status = promoted ? '✅' : '⏳'
      console.log(`${status} [${post.category}] ${post.title}`)
      console.log(`   ${post.url}`)
      console.log('')
    }

    const promotedCount = tracker.promoted.length
    console.log(`─`.repeat(50))
    console.log(`Promoted: ${promotedCount}/${posts.length}`)
    console.log(`Remaining: ${posts.length - promotedCount}`)

    if (tracker.lastUpdated) {
      console.log(`Last promotion: ${new Date(tracker.lastUpdated).toLocaleDateString()}`)
    }
    return
  }

  // Find next unpromoted post
  const nextPost = posts.find(post => !tracker.promoted.includes(post.slug))

  if (!nextPost) {
    console.log('🎉 All blog posts have been promoted!')
    console.log(`Total posts: ${posts.length}`)
    console.log('\nRun with --reset to start over.')
    return
  }

  const content = generateSocialContent(nextPost)
  const promotedCount = tracker.promoted.length
  const remaining = posts.length - promotedCount - 1

  console.log(`📊 Progress: ${promotedCount}/${posts.length} posts promoted`)
  console.log(`📰 Next post to promote:\n`)
  console.log(`   Title: ${nextPost.title}`)
  console.log(`   Category: ${nextPost.category}`)
  console.log(`   URL: ${nextPost.url}`)
  console.log(`   Published: ${nextPost.publishedAt}`)
  console.log('')
  console.log('📱 Twitter message:')
  console.log('─'.repeat(50))
  console.log(content.twitter)
  console.log('')
  console.log(`${content.url}`)
  console.log('─'.repeat(50))
  console.log('')
  console.log('💬 Discord message:')
  console.log('─'.repeat(50))
  console.log(content.discord)
  console.log('')
  console.log(`${content.url}`)
  console.log('─'.repeat(50))
  console.log('')

  if (options.dryRun) {
    console.log('🔵 DRY RUN - No posts will be made')
    console.log(`   Remaining after this: ${remaining} posts`)
    return
  }

  // Post to both platforms
  console.log('🚀 Posting to social media...\n')

  // Post to Discord #blog channel
  console.log('💬 Discord #blog:')
  const discordMessage = `${content.discord}\n\n${content.url}`
  await postToDiscordBlog(`📰 ${nextPost.title}`, discordMessage)
  console.log('')

  // Post to Twitter
  console.log('🐦 Twitter:')
  await runScript(path.join(__dirname, 'post-twitter.js'), [
    '--text', content.twitter,
    '--url', content.url
  ])
  console.log('')

  // Update tracker
  tracker.promoted.push(nextPost.slug)
  saveTracker(tracker)

  console.log('📊 Summary')
  console.log('─'.repeat(50))
  console.log(`✅ Promoted: ${nextPost.title}`)
  console.log(`📈 Progress: ${promotedCount + 1}/${posts.length}`)
  console.log(`⏳ Remaining: ${remaining}`)

  if (remaining > 0) {
    console.log(`\n💡 Run again next week to promote the next post!`)
  } else {
    console.log(`\n🎉 This was the last post! All content has been promoted.`)
  }
}

main().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})
