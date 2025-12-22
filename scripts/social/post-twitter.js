#!/usr/bin/env node

/**
 * Twitter/X Post Script
 *
 * Posts a custom tweet to the SonicJS Twitter account.
 *
 * Usage:
 *   node scripts/social/post-twitter.js "Your tweet here"
 *   node scripts/social/post-twitter.js --text "Tweet" --hashtags "SonicJS,CMS"
 *   node scripts/social/post-twitter.js --dry-run "Test tweet"
 *
 * Environment (loaded from ~/Dropbox/Data/.env):
 *   TWITTER_API_KEY - Twitter API Key (Consumer Key)
 *   TWITTER_API_SECRET - Twitter API Secret (Consumer Secret)
 *   TWITTER_ACCESS_TOKEN - User Access Token
 *   TWITTER_ACCESS_TOKEN_SECRET - User Access Token Secret
 */

import crypto from 'crypto'
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

const TWITTER_API_URL = 'https://api.twitter.com/2/tweets'
const DEFAULT_HASHTAGS = ['SonicJS', 'CloudflareCMS', 'OpenSource', 'Webdev']

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    dryRun: false,
    text: null,
    hashtags: DEFAULT_HASHTAGS,
    url: null
  }

  let i = 0
  while (i < args.length) {
    const arg = args[i]

    if (arg === '--dry-run') {
      options.dryRun = true
    } else if (arg === '--text' && args[i + 1]) {
      options.text = args[++i]
    } else if (arg === '--hashtags' && args[i + 1]) {
      options.hashtags = args[++i].split(',').map(h => h.trim())
    } else if (arg === '--url' && args[i + 1]) {
      options.url = args[++i]
    } else if (arg === '--no-hashtags') {
      options.hashtags = []
    } else if (!arg.startsWith('--')) {
      // Positional argument is the text
      options.text = arg
    }
    i++
  }

  return options
}

/**
 * Get Twitter credentials from environment
 */
function getCredentials() {
  const apiKey = process.env.TWITTER_API_KEY
  const apiSecret = process.env.TWITTER_API_SECRET
  const accessToken = process.env.TWITTER_ACCESS_TOKEN
  const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return null
  }

  return { apiKey, apiSecret, accessToken, accessSecret }
}

/**
 * Generate OAuth 1.0a signature
 */
function generateOAuthSignature(method, url, params, credentials) {
  const signatureBaseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(
      Object.keys(params)
        .sort()
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
    )
  ].join('&')

  const signingKey = `${encodeURIComponent(credentials.apiSecret)}&${encodeURIComponent(credentials.accessSecret)}`

  return crypto
    .createHmac('sha1', signingKey)
    .update(signatureBaseString)
    .digest('base64')
}

/**
 * Generate OAuth Authorization header
 */
function generateOAuthHeader(method, url, credentials) {
  const oauthParams = {
    oauth_consumer_key: credentials.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: credentials.accessToken,
    oauth_version: '1.0'
  }

  const signature = generateOAuthSignature(method, url, oauthParams, credentials)
  oauthParams.oauth_signature = signature

  const headerString = Object.keys(oauthParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ')

  return `OAuth ${headerString}`
}

/**
 * Format tweet with hashtags and URL
 */
function formatTweet(text, hashtags, url) {
  let tweet = text

  if (url) {
    tweet += `\n\n${url}`
  }

  if (hashtags.length > 0) {
    const hashtagStr = hashtags.map(h => `#${h.replace(/^#/, '')}`).join(' ')
    tweet += `\n\n${hashtagStr}`
  }

  return tweet
}

/**
 * Post tweet to Twitter
 */
async function postToTwitter(options) {
  if (!options.text) {
    console.error('❌ Error: No text provided')
    console.error('Usage: node scripts/social/post-twitter.js "Your tweet here"')
    process.exit(1)
  }

  const tweetText = formatTweet(options.text, options.hashtags, options.url)

  // Check length
  if (tweetText.length > 280) {
    console.error(`❌ Error: Tweet too long (${tweetText.length}/280 characters)`)
    console.error('Tweet preview:')
    console.error(tweetText)
    process.exit(1)
  }

  if (options.dryRun) {
    console.log('🔵 [DRY RUN] Would post to Twitter:')
    console.log('---')
    console.log(`Tweet (${tweetText.length}/280 chars):`)
    console.log(tweetText)
    console.log('---')
    return { dryRun: true }
  }

  const credentials = getCredentials()
  if (!credentials) {
    console.error('❌ Twitter credentials not configured')
    console.error('Required environment variables:')
    console.error('  TWITTER_API_KEY')
    console.error('  TWITTER_API_SECRET')
    console.error('  TWITTER_ACCESS_TOKEN')
    console.error('  TWITTER_ACCESS_TOKEN_SECRET')
    process.exit(1)
  }

  try {
    const authHeader = generateOAuthHeader('POST', TWITTER_API_URL, credentials)

    const response = await fetch(TWITTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: tweetText })
    })

    const data = await response.json()

    if (response.ok) {
      const tweetUrl = `https://twitter.com/i/status/${data.data.id}`
      console.log('✅ Posted to Twitter successfully!')
      console.log(`   Tweet URL: ${tweetUrl}`)
      return { success: true, id: data.data.id, url: tweetUrl }
    } else {
      console.error(`❌ Failed to post: ${JSON.stringify(data)}`)
      return { error: true, data }
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    return { error: true, message: error.message }
  }
}

// Run if called directly
const options = parseArgs()
postToTwitter(options)
