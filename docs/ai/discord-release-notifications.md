# Discord Release Notifications

This document describes how Discord notifications are sent when a new version of SonicJS is released.

## Overview

When a release is published, a notification is automatically posted to the SonicJS Discord server with details about the new version.

## Setup

### Discord Webhook URL

The notification requires a Discord webhook URL. Set it as an environment variable before running a release:

```bash
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
```

### Current Webhook

The SonicJS Discord webhook URL:
```
https://discord.com/api/webhooks/1443339433318285442/lnxdw64Wze72PjY8EhxPYF6bLGjqBwOi8EqwOnZxUFPo82E37o6myjQ1aO-8dzvsaStN
```

## Usage

### Automatic (During Release)

Discord notifications are automatically sent at the end of each release command:

```bash
# Set the webhook URL
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/1443339433318285442/lnxdw64Wze72PjY8EhxPYF6bLGjqBwOi8EqwOnZxUFPo82E37o6myjQ1aO-8dzvsaStN"

# Run any release command - notification is sent automatically
npm run release:patch
npm run release:minor
npm run release:major
```

### Manual (Standalone)

To send a notification manually without publishing:

```bash
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/1443339433318285442/lnxdw64Wze72PjY8EhxPYF6bLGjqBwOi8EqwOnZxUFPo82E37o6myjQ1aO-8dzvsaStN"

npm run notify:discord
```

Or as a one-liner:

```bash
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/1443339433318285442/lnxdw64Wze72PjY8EhxPYF6bLGjqBwOi8EqwOnZxUFPo82E37o6myjQ1aO-8dzvsaStN" node scripts/notify-discord.js
```

## What Gets Posted

The notification includes:

- Version number (read from `packages/core/package.json`)
- Install command (`npm create sonicjs@latest`)
- Links to npm, GitHub, and documentation
- Timestamp

Example Discord embed:

```
🚀 SonicJS v2.3.2 Released!

A new version of SonicJS has been published to npm.

📦 Install
npm create sonicjs@latest

📚 Links
npm • GitHub • Docs
```

## Files

- `scripts/notify-discord.js` - The notification script
- `package.json` - Contains the npm scripts

## Troubleshooting

### "DISCORD_WEBHOOK_URL not set"

The script will warn and skip if the environment variable is not set. Make sure to export it before running.

### Notification Failed

Check that:
1. The webhook URL is correct and active
2. The Discord channel still exists
3. You have internet connectivity

## Security Note

The webhook URL should be treated as a secret. Anyone with the URL can post messages to the Discord channel. Avoid committing it directly to version control.
