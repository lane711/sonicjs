# Social Media Marketing Agent

A Claude Code sub-agent for posting to Discord and Twitter/X on command.

## Quick Start

Use the `/social-post` slash command in Claude Code:

```
/social-post Post to discord: We just released version 2.4.0!
/social-post Tweet about our new admin dashboard
/social-post Announce on both platforms that we hit 1000 stars!
```

## Available Scripts

### Post to Discord

```bash
# Simple message
npm run social:discord "Your message here"

# With title
npm run social:discord -- --title "New Release" --message "We released v2.4!"

# Dry run (preview without posting)
npm run social:discord -- --dry-run "Test message"
```

### Post to Twitter/X

```bash
# Simple tweet
npm run social:twitter "Your tweet here"

# With custom hashtags
npm run social:twitter -- --hashtags "SonicJS,CMS,CloudFlare" "Your tweet"

# With a link
npm run social:twitter -- --url "https://sonicjs.com" "Check out SonicJS!"

# Dry run
npm run social:twitter -- --dry-run "Test tweet"
```

### Post to Both Platforms

```bash
# Same message to both
npm run social:post "Your announcement here"

# With options
npm run social:post -- --title "Big News" --message "We released v2.4!"

# Discord only
npm run social:post -- --discord-only "Discord only message"

# Twitter only
npm run social:post -- --twitter-only "Twitter only message"

# Dry run
npm run social:post -- --dry-run "Test message"
```

## Environment Variables

### Discord
- `DISCORD_WEBHOOK_URL` - Optional. Uses the default SonicJS webhook if not set.

### Twitter/X
All four of these are required to post to Twitter:
- `TWITTER_API_KEY` - Twitter API Key (Consumer Key)
- `TWITTER_API_SECRET` - Twitter API Secret (Consumer Secret)
- `TWITTER_ACCESS_TOKEN` - User Access Token
- `TWITTER_ACCESS_SECRET` - User Access Token Secret

## Claude Code Slash Command

The `/social-post` command is an interactive agent that:

1. Parses your request to understand the message and platform
2. Shows a preview (dry run) of what will be posted
3. Asks for confirmation
4. Posts to the specified platform(s)
5. Reports the result

### Examples

```
/social-post discord: Just released v2.4.0 with new admin features!
/social-post tweet: Check out the fastest CMS on Cloudflare - SonicJS v2.4!
/social-post both: SonicJS v2.4.0 is here! New admin UI, better performance.
```

## Twitter Character Limits

- Maximum tweet length: 280 characters
- Default hashtags are added: #SonicJS #CloudflareCMS #OpenSource #Webdev
- Use `--hashtags "Tag1,Tag2"` to customize
- Use `--no-hashtags` to skip hashtags

## Files

- `.claude/commands/social-post.md` - Claude Code slash command
- `scripts/social/post-discord.js` - Discord posting script
- `scripts/social/post-twitter.js` - Twitter posting script
- `scripts/social/post-both.js` - Cross-platform posting script

## Security Notes

- The Discord webhook URL is stored in `docs/ai/discord-release-notifications.md`
- Twitter credentials should be set as environment variables, not committed
- Always do a dry run first to preview before posting
