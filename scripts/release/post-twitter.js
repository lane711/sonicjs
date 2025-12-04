#!/usr/bin/env node

/**
 * Twitter/X Post Script for Release Announcements
 *
 * Uses Twitter API v2 to post release announcements as threads.
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
 * @property {string} text - Main tweet text
 * @property {string[]} hashtags - Hashtags to append
 * @property {string[]} [thread] - Additional tweets for thread
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
 * Format the main tweet with hashtags
 * @param {string} text - Tweet text
 * @param {string[]} hashtags - Hashtags to append
 * @param {string} releaseUrl - URL to the release
 * @returns {string} - Formatted tweet text
 */
function formatMainTweet(text, hashtags, releaseUrl) {
  const hashtagStr = hashtags.map(tag => `#${tag.replace(/^#/, '')}`).join(' ')
  return `${text}\n\n${releaseUrl}\n\n${hashtagStr}`
}

/**
 * Build thread tweets from content
 * @param {TwitterContent} content - Twitter content
 * @param {string} releaseUrl - URL to the release
 * @returns {string[]} - Array of tweet texts
 */
function buildThread(content, releaseUrl) {
  const tweets = []

  // Tweet 1: Main announcement with link and hashtags
  const mainTweet = formatMainTweet(content.text, content.hashtags, releaseUrl)
  tweets.push(mainTweet)

  // Additional thread tweets if provided
  if (content.thread && content.thread.length > 0) {
    for (const threadTweet of content.thread) {
      if (threadTweet.length <= 280) {
        tweets.push(threadTweet)
      } else {
        // Split long tweets
        const chunks = splitIntoTweets(threadTweet)
        tweets.push(...chunks)
      }
    }
  }

  return tweets
}

/**
 * Split long text into tweet-sized chunks
 * @param {string} text - Text to split
 * @param {number} maxLength - Max length per tweet (default 280)
 * @returns {string[]} - Array of tweets
 */
function splitIntoTweets(text, maxLength = 275) {
  const tweets = []
  const sentences = text.split(/(?<=[.!?])\s+/)
  let currentTweet = ''

  for (const sentence of sentences) {
    if ((currentTweet + ' ' + sentence).trim().length <= maxLength) {
      currentTweet = (currentTweet + ' ' + sentence).trim()
    } else {
      if (currentTweet) {
        tweets.push(currentTweet)
      }
      // If single sentence is too long, split by words
      if (sentence.length > maxLength) {
        const words = sentence.split(' ')
        currentTweet = ''
        for (const word of words) {
          if ((currentTweet + ' ' + word).trim().length <= maxLength) {
            currentTweet = (currentTweet + ' ' + word).trim()
          } else {
            if (currentTweet) {
              tweets.push(currentTweet)
            }
            currentTweet = word
          }
        }
      } else {
        currentTweet = sentence
      }
    }
  }

  if (currentTweet) {
    tweets.push(currentTweet)
  }

  return tweets
}

/**
 * Post a single tweet
 * @param {string} text - Tweet text
 * @param {TwitterCredentials} credentials - Twitter credentials
 * @param {string|null} replyToId - Tweet ID to reply to (for threads)
 * @returns {Promise<Object>} - Twitter API response
 */
async function postSingleTweet(text, credentials, replyToId = null) {
  const authHeader = generateOAuthHeader('POST', TWITTER_API_URL, credentials)

  const body = { text }
  if (replyToId) {
    body.reply = { in_reply_to_tweet_id: replyToId }
  }

  const response = await fetch(TWITTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(`Twitter API error: ${response.status} - ${JSON.stringify(data)}`)
  }

  return data
}

/**
 * Post a thread to Twitter/X
 * @param {TwitterContent} content - Content to post
 * @param {string} releaseUrl - URL to the release
 * @param {Object} options - Options
 * @param {boolean} options.dryRun - If true, don't actually post
 * @returns {Promise<Object>} - Result with tweet IDs
 */
export async function postToTwitter(content, releaseUrl, options = {}) {
  const credentials = getCredentials()
  const tweets = buildThread(content, releaseUrl)

  if (options.dryRun) {
    console.log('🔵 [DRY RUN] Would post Twitter thread:')
    console.log('---')
    tweets.forEach((tweet, i) => {
      console.log(`Tweet ${i + 1}/${tweets.length} (${tweet.length}/280 chars):`)
      console.log(tweet)
      console.log('')
    })
    console.log('---')
    return { dryRun: true, tweets, tweetCount: tweets.length }
  }

  if (!credentials) {
    console.warn('⚠️  Twitter credentials not configured, skipping Twitter post')
    console.warn('   Required env vars: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET')
    return { skipped: true, reason: 'credentials_missing' }
  }

  // Validate all tweets before posting
  for (let i = 0; i < tweets.length; i++) {
    if (tweets[i].length > 280) {
      console.error(`❌ Tweet ${i + 1} too long: ${tweets[i].length}/280 characters`)
      return { error: true, reason: 'tweet_too_long', tweetIndex: i, length: tweets[i].length }
    }
  }

  try {
    const postedTweets = []
    let previousTweetId = null

    for (let i = 0; i < tweets.length; i++) {
      console.log(`   Posting tweet ${i + 1}/${tweets.length}...`)

      const result = await postSingleTweet(tweets[i], credentials, previousTweetId)
      const tweetId = result.data.id

      postedTweets.push({
        id: tweetId,
        url: `https://twitter.com/i/status/${tweetId}`,
        text: tweets[i]
      })

      previousTweetId = tweetId

      // Small delay between tweets to avoid rate limiting
      if (i < tweets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    const mainTweetUrl = postedTweets[0].url
    console.log(`✅ Thread posted successfully (${tweets.length} tweets): ${mainTweetUrl}`)

    return {
      success: true,
      tweetId: postedTweets[0].id,
      url: mainTweetUrl,
      threadLength: tweets.length,
      tweets: postedTweets
    }
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
