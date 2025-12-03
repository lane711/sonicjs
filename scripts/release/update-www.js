#!/usr/bin/env node

/**
 * WWW Website Update Script for Release Announcements
 *
 * Updates the SonicJS website with:
 * 1. Version badge (next to logo)
 * 2. Home page changelog section
 * 3. Full changelog page
 *
 * Creates a PR on the WWW repository with the changes.
 */

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

const GITHUB_API_URL = 'https://api.github.com'

// Configuration - can be overridden via environment variables
const WWW_REPO_OWNER = process.env.WWW_REPO_OWNER || 'lane711'
const WWW_REPO_NAME = process.env.WWW_REPO_NAME || 'sonicjs-www'
const WWW_DEFAULT_BRANCH = process.env.WWW_DEFAULT_BRANCH || 'main'

// File paths in the WWW repo (adjust these based on actual structure)
const VERSION_FILE_PATH = process.env.WWW_VERSION_PATH || 'src/config/version.json'
const HOME_CHANGELOG_PATH = process.env.WWW_HOME_CHANGELOG_PATH || 'src/data/changelog-home.json'
const FULL_CHANGELOG_PATH = process.env.WWW_FULL_CHANGELOG_PATH || 'src/content/changelog.md'

/**
 * Get GitHub token from environment
 * @returns {string|null}
 */
function getGitHubToken() {
  return process.env.WWW_REPO_TOKEN || process.env.GITHUB_TOKEN || null
}

/**
 * Make a GitHub API request
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>}
 */
async function githubRequest(endpoint, options = {}) {
  const token = getGitHubToken()

  if (!token) {
    throw new Error('GitHub token not configured')
  }

  const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers
    }
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`GitHub API error: ${response.status} ${error.message || response.statusText}`)
  }

  return response.json()
}

/**
 * Get the SHA of a file in a repository
 * @param {string} path - File path
 * @param {string} branch - Branch name
 * @returns {Promise<{sha: string, content: string}|null>}
 */
async function getFileSha(path, branch = WWW_DEFAULT_BRANCH) {
  try {
    const data = await githubRequest(
      `/repos/${WWW_REPO_OWNER}/${WWW_REPO_NAME}/contents/${path}?ref=${branch}`
    )
    return {
      sha: data.sha,
      content: Buffer.from(data.content, 'base64').toString('utf8')
    }
  } catch (error) {
    if (error.message.includes('404')) {
      return null
    }
    throw error
  }
}

/**
 * Create or update a file in the repository
 * @param {string} path - File path
 * @param {string} content - File content
 * @param {string} message - Commit message
 * @param {string} branch - Branch name
 * @param {string|null} sha - Existing file SHA (for updates)
 * @returns {Promise<Object>}
 */
async function createOrUpdateFile(path, content, message, branch, sha = null) {
  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch
  }

  if (sha) {
    body.sha = sha
  }

  return githubRequest(
    `/repos/${WWW_REPO_OWNER}/${WWW_REPO_NAME}/contents/${path}`,
    {
      method: 'PUT',
      body: JSON.stringify(body)
    }
  )
}

/**
 * Create a new branch from the default branch
 * @param {string} branchName - New branch name
 * @returns {Promise<Object>}
 */
async function createBranch(branchName) {
  // Get the SHA of the default branch
  const refData = await githubRequest(
    `/repos/${WWW_REPO_OWNER}/${WWW_REPO_NAME}/git/ref/heads/${WWW_DEFAULT_BRANCH}`
  )

  // Create new branch
  return githubRequest(
    `/repos/${WWW_REPO_OWNER}/${WWW_REPO_NAME}/git/refs`,
    {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: refData.object.sha
      })
    }
  )
}

/**
 * Create a pull request
 * @param {string} title - PR title
 * @param {string} body - PR body
 * @param {string} head - Head branch
 * @param {string} base - Base branch
 * @returns {Promise<Object>}
 */
async function createPullRequest(title, body, head, base = WWW_DEFAULT_BRANCH) {
  return githubRequest(
    `/repos/${WWW_REPO_OWNER}/${WWW_REPO_NAME}/pulls`,
    {
      method: 'POST',
      body: JSON.stringify({
        title,
        body,
        head,
        base
      })
    }
  )
}

/**
 * Generate version.json content
 * @param {string} version - Version number
 * @returns {string}
 */
function generateVersionJson(version) {
  return JSON.stringify({
    version,
    updatedAt: new Date().toISOString()
  }, null, 2)
}

/**
 * Generate home changelog JSON entry
 * @param {string} version - Version number
 * @param {string} summary - Changelog summary
 * @param {string} existingContent - Existing JSON content
 * @returns {string}
 */
function generateHomeChangelogJson(version, summary, existingContent) {
  let entries = []

  try {
    entries = JSON.parse(existingContent || '[]')
  } catch {
    entries = []
  }

  // Add new entry at the beginning
  entries.unshift({
    version,
    date: new Date().toISOString().split('T')[0],
    summary
  })

  // Keep only the last 5 entries for home page
  entries = entries.slice(0, 5)

  return JSON.stringify(entries, null, 2)
}

/**
 * Prepend changelog entry to full changelog
 * @param {string} version - Version number
 * @param {string} fullChangelog - Full changelog markdown
 * @param {string} existingContent - Existing changelog content
 * @returns {string}
 */
function prependToChangelog(version, fullChangelog, existingContent) {
  const date = new Date().toISOString().split('T')[0]
  const header = existingContent ? '' : '# Changelog\n\nAll notable changes to SonicJS will be documented here.\n\n'

  const newEntry = `## [${version}] - ${date}\n\n${fullChangelog}\n\n---\n\n`

  if (!existingContent) {
    return header + newEntry
  }

  // Insert after the header (if exists) or at the beginning
  const headerMatch = existingContent.match(/^#\s+Changelog[\s\S]*?\n\n/)
  if (headerMatch) {
    return existingContent.replace(headerMatch[0], headerMatch[0] + newEntry)
  }

  return newEntry + existingContent
}

/**
 * Update WWW repository with release information
 * @param {WwwContent} content - Generated content
 * @param {ReleaseInfo} releaseInfo - Release information
 * @param {Object} options - Options
 * @param {boolean} options.dryRun - If true, don't make actual changes
 * @returns {Promise<Object>}
 */
export async function updateWww(content, releaseInfo, options = {}) {
  const { version } = releaseInfo
  const branchName = `release/v${version}-changelog`

  if (options.dryRun) {
    console.log('🔵 [DRY RUN] Would update WWW repository:')
    console.log(`   Branch: ${branchName}`)
    console.log(`   Version file: ${VERSION_FILE_PATH}`)
    console.log(`   Home changelog: ${HOME_CHANGELOG_PATH}`)
    console.log(`   Full changelog: ${FULL_CHANGELOG_PATH}`)
    console.log('\n   Version JSON:')
    console.log(generateVersionJson(version))
    console.log('\n   Home changelog summary:')
    console.log(content.homeChangelog)
    console.log('\n   Full changelog entry:')
    console.log(content.fullChangelog)
    return { dryRun: true }
  }

  const token = getGitHubToken()
  if (!token) {
    console.warn('⚠️  GitHub token not configured, skipping WWW update')
    console.warn('   Required env var: WWW_REPO_TOKEN or GITHUB_TOKEN')
    return { skipped: true, reason: 'token_missing' }
  }

  try {
    console.log(`📝 Creating branch: ${branchName}`)
    await createBranch(branchName)

    // Get existing file contents
    const [versionFile, homeChangelogFile, fullChangelogFile] = await Promise.all([
      getFileSha(VERSION_FILE_PATH, branchName),
      getFileSha(HOME_CHANGELOG_PATH, branchName),
      getFileSha(FULL_CHANGELOG_PATH, branchName)
    ])

    // Update version file
    console.log(`📝 Updating ${VERSION_FILE_PATH}`)
    await createOrUpdateFile(
      VERSION_FILE_PATH,
      generateVersionJson(version),
      `chore: update version to ${version}`,
      branchName,
      versionFile?.sha
    )

    // Update home changelog
    console.log(`📝 Updating ${HOME_CHANGELOG_PATH}`)
    await createOrUpdateFile(
      HOME_CHANGELOG_PATH,
      generateHomeChangelogJson(version, content.homeChangelog, homeChangelogFile?.content),
      `docs: add v${version} to home changelog`,
      branchName,
      homeChangelogFile?.sha
    )

    // Update full changelog
    console.log(`📝 Updating ${FULL_CHANGELOG_PATH}`)
    await createOrUpdateFile(
      FULL_CHANGELOG_PATH,
      prependToChangelog(version, content.fullChangelog, fullChangelogFile?.content),
      `docs: add v${version} changelog entry`,
      branchName,
      fullChangelogFile?.sha
    )

    // Create pull request
    console.log('📝 Creating pull request')
    const pr = await createPullRequest(
      `docs: Update changelog and version for v${version}`,
      `## Summary\n\nAutomated update for SonicJS v${version} release.\n\n### Changes\n- Updated version badge to ${version}\n- Added changelog entry to home page\n- Added full changelog entry\n\n---\n\n🤖 Generated automatically by release-announce workflow`,
      branchName
    )

    console.log(`✅ Pull request created: ${pr.html_url}`)
    return { success: true, prUrl: pr.html_url, prNumber: pr.number }
  } catch (error) {
    console.error('❌ Error updating WWW repository:', error.message)
    return { error: true, message: error.message }
  }
}

/**
 * Check if WWW repo is accessible
 * @returns {Promise<boolean>}
 */
export async function verifyWwwAccess() {
  const token = getGitHubToken()
  if (!token) {
    return false
  }

  try {
    await githubRequest(`/repos/${WWW_REPO_OWNER}/${WWW_REPO_NAME}`)
    return true
  } catch {
    return false
  }
}
