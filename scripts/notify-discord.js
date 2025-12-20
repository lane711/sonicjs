#!/usr/bin/env node

/**
 * Discord release notification script (Legacy)
 *
 * Posts a basic release notification to Discord when a new version is published.
 *
 * NOTE: This script is kept for backwards compatibility.
 * For AI-enhanced announcements (Discord + Twitter + WWW), use:
 *   npm run release:announce
 *
 * Environment (loaded from ~/Dropbox/Data/.env):
 *   DISCORD_WEBHOOK_URL - Discord webhook URL
 *
 * @deprecated Use `npm run release:announce` for full release announcements
 */

import fs from 'fs'
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
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rootDir = path.join(__dirname, '..')
const corePackageJsonPath = path.join(rootDir, 'packages/core/package.json')

async function notifyDiscord() {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn('⚠ DISCORD_WEBHOOK_URL not set, skipping Discord notification')
    return
  }

  try {
    // Read core version
    const corePackageJson = JSON.parse(fs.readFileSync(corePackageJsonPath, 'utf8'))
    const version = corePackageJson.version

    const message = {
      embeds: [
        {
          title: `🚀 SonicJS v${version} Released!`,
          description: `A new version of SonicJS has been published to npm.`,
          color: 0x5865f2, // Discord blurple
          fields: [
            {
              name: '📦 Install',
              value: '```bash\nnpm create sonicjs@latest\n```',
              inline: false,
            },
            {
              name: '📚 Links',
              value: [
                '[npm](https://www.npmjs.com/package/@sonicjs-cms/core)',
                '[GitHub](https://github.com/lane711/sonicjs)',
                '[Docs](https://sonicjs.com)',
              ].join(' • '),
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'SonicJS CMS',
          },
        },
      ],
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    if (response.ok) {
      console.log(`✅ Discord notification sent for v${version}`)
    } else {
      const errorText = await response.text()
      console.error(`❌ Discord notification failed: ${response.status} ${errorText}`)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error sending Discord notification:', error)
    process.exit(1)
  }
}

notifyDiscord()
