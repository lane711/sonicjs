# Magic Link Authentication Plugin

Passwordless authentication for SonicJS via email magic links. Users sign in by clicking a secure one-time link sent to their email - no password required.

## Features

- ✅ **Passwordless**: No passwords to remember or manage
- ✅ **Secure**: One-time use tokens with configurable expiration
- ✅ **Rate Limited**: Prevents abuse with configurable request limits
- ✅ **Email Integration**: Uses SonicJS email plugin (Resend)
- ✅ **User Tracking**: Logs IP and user agent for security
- ✅ **Auto Cleanup**: Expired links are automatically ignored

## Status

**Inactive by default** - Most developers prefer traditional email/password authentication.

## Installation

The plugin is included with SonicJS but inactive by default.

### Prerequisites

1. **Email Plugin**: Must be installed and configured
   - Go to Admin → Plugins → Email Plugin
   - Configure Resend API key
   - Set from email and name

### Activation

1. Navigate to **Admin → Plugins**
2. Find "Magic Link Authentication"
3. Click **Activate**
4. Configure settings (optional)

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| Link Expiry (minutes) | 15 | How long magic links remain valid |
| Rate Limit (per hour) | 5 | Maximum requests per email per hour |
| Allow New User Registration | false | Allow new users to register via magic link |

## Usage

### For End Users

1. Go to `/auth/magic-link/request`
2. Enter email address
3. Click "Send Magic Link"
4. Check email for magic link
5. Click link to sign in

### API Endpoints

#### Request Magic Link

```bash
POST /auth/magic-link/request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account exists for this email, you will receive a magic link shortly."
}
```

#### Verify Magic Link

```bash
GET /auth/magic-link/verify?token=<token>
```

Redirects to dashboard on success, login page on failure.

## Security Features

- **One-time use**: Links can only be used once
- **Time-limited**: Links expire after configured minutes (default: 15)
- **Rate limiting**: Prevents brute force attacks (default: 5 per hour)
- **IP tracking**: Logs IP address for security auditing
- **User agent tracking**: Records browser/device information
- **Secure tokens**: Uses crypto.randomUUID() for token generation
- **Email verification**: Only sends to verified email addresses
- **No user enumeration**: Same response for existing/non-existing emails

## Database Schema

```sql
CREATE TABLE magic_links (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  used INTEGER DEFAULT 0,
  used_at INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL
);
```

## Integration Example

### Custom Login Page

```html
<form id="magic-link-form">
  <input type="email" id="email" placeholder="Enter your email" required>
  <button type="submit">Send Magic Link</button>
</form>

<script>
document.getElementById('magic-link-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = document.getElementById('email').value

  const response = await fetch('/auth/magic-link/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })

  const data = await response.json()
  alert(data.message)
})
</script>
```

## Development

In development mode (`ENVIRONMENT=development`), the API response includes the magic link URL for testing:

```json
{
  "message": "...",
  "dev_link": "http://localhost:8787/auth/magic-link/verify?token=..."
}
```

**⚠️ This is automatically removed in production**

## Troubleshooting

### Magic link not received

1. Check email plugin is active and configured
2. Verify Resend API key is valid
3. Check from email domain is verified in Resend
4. Check spam folder
5. Check rate limit not exceeded

### Link expired

- Default expiry is 15 minutes
- Increase `linkExpiryMinutes` in plugin settings
- Request a new link

### Rate limit exceeded

- Wait one hour or adjust `rateLimitPerHour` setting
- Default is 5 requests per hour per email

## Dependencies

- **email plugin**: Required for sending magic links

## Comparison: Magic Link vs Email/Password

| Feature | Magic Link | Email/Password |
|---------|-----------|----------------|
| Security | High (no password to steal) | Medium (password can be weak) |
| UX | Simple (one click) | Traditional (remember password) |
| Setup | Requires email config | Works out of box |
| Use Case | Modern apps, high security | Traditional apps, offline access |
| Default | ❌ Inactive | ✅ Active |

## Why Inactive by Default?

Most developers expect traditional email/password authentication:

1. **Familiarity**: Email/password is the standard
2. **Email dependency**: Requires email plugin setup
3. **Use case**: Better for modern, security-focused apps
4. **Offline**: Email/password works without email service

Activate this plugin when you want passwordless authentication for better security and user experience.

## License

MIT
