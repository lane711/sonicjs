#!/usr/bin/env node

/**
 * Twitter/X Post Script for Release Announcements
 *
 * Uses Twitter API v2 to post release announcements.
 * Requires OAuth 1.0a User Context authentication.
 */

import crypto from 'crypto'

const TWITTER_API_URL = 'https://api.twitter.com/2/tweets'

/**
 * @typedef {Object} TwitterCredentials
 * @property {string} apiKey - Twitter API Key (Consumer Key)
 * @property {string} apiSecret - Twitter API Secret (Consumer Secret)
 * @property {string} accessToken - User Access Token
 * @property {string} accessSecret - User Access Token Secret
 */

/**
 * @typedef {Object} TwitterContent
 * @property {string} text - Tweet text
 * @property {string[]} hashtags - Hashtags to append
 */

/**
 * Generate OAuth 1.0a signature for Twitter API
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {Object} params - OAuth parameters
 * @param {TwitterCredentials} credentials - Twitter credentials
 * @returns {string} - OAuth signature
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
 * Generate OAuth 1.0a Authorization header
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {TwitterCredentials} credentials - Twitter credentials
 * @returns {string} - Authorization header value
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
 * Get Twitter credentials from environment variables
 * @returns {TwitterCredentials|null}
 */
function getCredentials() {
  const apiKey = process.env.TWITTER_API_KEY
  const apiSecret = process.env.TWITTER_API_SECRET
  const accessToken = process.env.TWITTER_ACCESS_TOKEN
  const accessSecret = process.env.TWITTER_ACCESS_SECRET

  if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
    return null
  }

  return { apiKey, apiSecret, accessToken, accessSecret }
}

/**
 * Format tweet text with hashtags
 * @param {TwitterContent} content - Twitter content
 * @param {string} releaseUrl - URL to the release
 * @returns {string} - Formatted tweet text
 */
function formatTweet(content, releaseUrl) {
  const hashtags = content.hashtags.map(tag => `#${tag.replace(/^#/, '')}`).join(' ')
  const maxTextLength = 280 - hashtags.length - releaseUrl.length - 4 // 4 for spaces and newlines

  let text = content.text
  if (text.length > maxTextLength) {
    text = text.substring(0, maxTextLength - 3) + '...'
  }

  return `${text}\n\n${releaseUrl}\n\n${hashtags}`
}

/**
 * Post a tweet to Twitter/X
 * @param {TwitterContent} content - Content to post
 * @param {string} releaseUrl - URL to the release
 * @param {Object} options - Options
 * @param {boolean} options.dryRun - If true, don't actually post
 * @returns {Promise<Object>} - Twitter API response
 */
export async function postToTwitter(content, releaseUrl, options = {}) {
  const credentials = getCredentials()

  if (options.dryRun) {
    const tweetText = formatTweet(content, releaseUrl)
    console.log('🔵 [DRY RUN] Would post to Twitter:')
    console.log('---')
    console.log(tweetText)
    console.log('---')
    console.log(`Character count: ${tweetText.length}/280`)
    return { dryRun: true, text: tweetText }
  }

  if (!credentials) {
    console.warn('⚠️  Twitter credentials not configured, skipping Twitter post')
    console.warn('   Required env vars: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET')
    return { skipped: true, reason: 'credentials_missing' }
  }

  const tweetText = formatTweet(content, releaseUrl)

  if (tweetText.length > 280) {
    console.error(`❌ Tweet too long: ${tweetText.length}/280 characters`)
    return { error: true, reason: 'tweet_too_long', length: tweetText.length }
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

    if (!response.ok) {
      console.error('❌ Twitter API error:', data)
      return { error: true, status: response.status, data }
    }

    console.log(`✅ Tweet posted successfully: https://twitter.com/i/status/${data.data.id}`)
    return { success: true, tweetId: data.data.id, url: `https://twitter.com/i/status/${data.data.id}` }
  } catch (error) {
    console.error('❌ Error posting to Twitter:', error.message)
    return { error: true, message: error.message }
  }
}

/**
 * Verify Twitter credentials are valid
 * @returns {Promise<boolean>}
 */
export async function verifyCredentials() {
  const credentials = getCredentials()

  if (!credentials) {
    return false
  }

  try {
    const url = 'https://api.twitter.com/2/users/me'
    const authHeader = generateOAuthHeader('GET', url, credentials)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader
      }
    })

    return response.ok
  } catch {
    return false
  }
}
