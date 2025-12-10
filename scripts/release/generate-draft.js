#!/usr/bin/env node

/**
 * Generate Release Draft
 *
 * Creates a markdown file in docs/releases/ with the complete release
 * announcement content for review before publishing.
 *
 * Usage:
 *   node scripts/release/generate-draft.js
 *   node scripts/release/generate-draft.js --version 2.3.8
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.join(__dirname, '../..')
const RELEASES_DIR = path.join(ROOT_DIR, 'docs/releases')

/**
 * Get version from args or package.json
 */
function getVersion() {
  const args = process.argv.slice(2)
  const versionIndex = args.indexOf('--version')
  if (versionIndex !== -1 && args[versionIndex + 1]) {
    return args[versionIndex + 1]
  }

  const corePackageJsonPath = path.join(ROOT_DIR, 'packages/core/package.json')
  const corePackageJson = JSON.parse(fs.readFileSync(corePackageJsonPath, 'utf8'))
  return corePackageJson.version
}

/**
 * Read content from .release-content.json if it exists
 */
function readContentFile() {
  const contentFilePath = path.join(ROOT_DIR, '.release-content.json')
  if (fs.existsSync(contentFilePath)) {
    return JSON.parse(fs.readFileSync(contentFilePath, 'utf8'))
  }
  return null
}

/**
 * Generate the draft markdown content
 */
function generateDraftMarkdown(version, content) {
  const date = new Date().toISOString().split('T')[0]
  const releaseUrl = `https://github.com/lane711/sonicjs/releases/tag/v${version}`

  // Format Twitter thread preview
  const hashtags = content.twitter.hashtags.map(t => `#${t.replace(/^#/, '')}`).join(' ')
  const mainTweet = `${content.twitter.text}\n\n${releaseUrl}\n\n${hashtags}`

  let twitterPreview = `### Tweet 1 (Main) - ${mainTweet.length}/280 chars
\`\`\`
${mainTweet}
\`\`\`
`

  if (content.twitter.thread && content.twitter.thread.length > 0) {
    content.twitter.thread.forEach((tweet, i) => {
      twitterPreview += `
### Tweet ${i + 2} (Thread) - ${tweet.length}/280 chars
\`\`\`
${tweet}
\`\`\`
`
    })
  }

  // Format Discord preview
  const discordHighlights = content.discord.highlights.map(h => `• ${h}`).join('\n')

  return `# Release v${version} - Draft

> **Status:** DRAFT - Review before publishing
> **Date:** ${date}
> **Release URL:** ${releaseUrl}

---

## Overview

${content.discord.description}

### Key Highlights
${content.discord.highlights.map(h => `- ${h}`).join('\n')}

---

## Discord Announcement

**Title:** ${content.discord.title}

**Description:**
${content.discord.description}

**Highlights:**
${discordHighlights}

**Links:**
- [Release Notes](${releaseUrl})
- [npm](https://www.npmjs.com/package/@sonicjs-cms/core)
- [GitHub](https://github.com/lane711/sonicjs)
- [Docs](https://sonicjs.com)

---

## Twitter Thread

${twitterPreview}

---

## Website Updates

### Home Page Changelog Entry
\`\`\`
${content.www.homeChangelog}
\`\`\`

### Full Changelog Entry
\`\`\`markdown
${content.www.fullChangelog}
\`\`\`

---

## Review Checklist

- [ ] Overview accurately describes the release
- [ ] All key highlights are included
- [ ] Discord message is engaging and informative
- [ ] Twitter thread is within character limits
- [ ] All tweets read well as a connected thread
- [ ] Website changelog entries are accurate

---

## Publish Commands

Once reviewed and approved, run:

\`\`\`bash
# Post to Discord, Twitter, and update WWW
npm run release:announce

# Or post to specific platforms
npm run release:announce -- --skip-www
npm run release:announce -- --skip-twitter --skip-www
\`\`\`

---

## Raw JSON Content

<details>
<summary>Click to expand .release-content.json</summary>

\`\`\`json
${JSON.stringify(content, null, 2)}
\`\`\`

</details>
`
}

/**
 * Main function
 */
async function main() {
  console.log('📝 Generating release draft...\n')

  const version = getVersion()
  console.log(`   Version: ${version}`)

  // Ensure releases directory exists
  if (!fs.existsSync(RELEASES_DIR)) {
    fs.mkdirSync(RELEASES_DIR, { recursive: true })
  }

  // Read existing content or prompt for it
  let content = readContentFile()

  if (!content) {
    console.log('\n⚠️  No .release-content.json found!')
    console.log('   Please create .release-content.json with the release content first.')
    console.log('\n   Example structure:')
    console.log(`   {
     "discord": {
       "title": "🚀 SonicJS v${version} Released!",
       "description": "Description of the release...",
       "highlights": ["Feature 1", "Feature 2", "Bug fix 1"]
     },
     "twitter": {
       "text": "Main tweet text (under 200 chars to leave room for URL/hashtags)",
       "hashtags": ["SonicJS", "CloudflareWorkers"],
       "thread": [
         "Thread tweet 2 with more details...",
         "Thread tweet 3 with call to action..."
       ]
     },
     "www": {
       "homeChangelog": "v${version} - Brief summary",
       "fullChangelog": "## v${version}\\n\\n### Changes\\n- Change 1\\n- Change 2"
     }
   }`)
    process.exit(1)
  }

  // Generate draft markdown
  const markdown = generateDraftMarkdown(version, content)

  // Write to file
  const draftFilePath = path.join(RELEASES_DIR, `v${version}.md`)
  fs.writeFileSync(draftFilePath, markdown)

  console.log(`\n✅ Draft generated: docs/releases/v${version}.md`)
  console.log('\n📋 Next steps:')
  console.log('   1. Review the draft file')
  console.log('   2. Edit .release-content.json if changes needed')
  console.log('   3. Re-run this script to update the draft')
  console.log('   4. When ready, run: npm run release:announce')
}

main().catch(error => {
  console.error('❌ Error:', error.message)
  process.exit(1)
})
