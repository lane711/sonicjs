# Cloudflare Turnstile Plugin

CAPTCHA-free bot protection using Cloudflare Turnstile. Provides reusable verification middleware for any form in your SonicJS application.

## Features

- ✅ **Zero friction**: No more annoying CAPTCHAs for users
- ✅ **Privacy-focused**: Respects user privacy
- ✅ **Reusable**: Works with any form (contact, registration, comments, etc.)
- ✅ **Easy integration**: Simple middleware approach
- ✅ **Configurable**: Admin UI for settings management
- ✅ **Cloudflare native**: Optimized for Cloudflare Workers

## Installation

The Turnstile plugin is a core plugin and is included by default in SonicJS.

### 1. Get Turnstile Keys

1. Go to [Cloudflare Dashboard → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Create a new site
3. Copy your **Site Key** (public) and **Secret Key** (private)

### 2. Configure Plugin

1. Navigate to **Admin → Plugins → Turnstile**
2. Enter your Site Key and Secret Key
3. Choose theme (Light/Dark/Auto) and size (Normal/Compact)
4. Enable Turnstile
5. Save settings

## Usage

### Basic Integration (Middleware)

The easiest way to protect a form is using the `verifyTurnstile` middleware:

```typescript
import { verifyTurnstile } from '@sonicjs-cms/core/plugins'

// Protect your form endpoint
app.post('/api/contact', verifyTurnstile, async (c) => {
  // Token already verified at this point
  const formData = await c.req.formData()
  // Process form...
  return c.json({ success: true })
})
```

### Frontend Integration

Add the Turnstile widget to your HTML form:

```html
<form action="/api/contact" method="POST">
  <input type="text" name="name" required>
  <input type="email" name="email" required>
  <textarea name="message" required></textarea>
  
  <!-- Turnstile Widget -->
  <div class="cf-turnstile" 
       data-sitekey="YOUR_SITE_KEY"
       data-theme="auto">
  </div>
  
  <button type="submit">Send</button>
</form>

<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

### Dynamic Widget Rendering

Use the widget helper functions:

```typescript
import { renderInlineTurnstile } from '@sonicjs-cms/core/plugins'

const widget = renderInlineTurnstile('YOUR_SITE_KEY', {
  theme: 'auto',
  size: 'normal'
})

// Insert widget HTML into your form
```

### Custom Error Handling

Create a middleware with custom error responses:

```typescript
import { createTurnstileMiddleware } from '@sonicjs-cms/core/plugins'

const customTurnstile = createTurnstileMiddleware({
  onError: (c, error) => {
    return c.html(`<h1>Verification Failed</h1><p>${error}</p>`, 403)
  },
  onMissing: (c) => {
    return c.html('<h1>Please complete the verification</h1>', 400)
  }
})

app.post('/api/secure-endpoint', customTurnstile, handler)
```

### Programmatic Verification

Manually verify tokens in your code:

```typescript
import { TurnstileService } from '@sonicjs-cms/core/plugins'

async function myHandler(c: Context) {
  const db = c.get('db')
  const turnstileService = new TurnstileService(db)
  
  const token = c.req.query('cf-turnstile-response')
  const result = await turnstileService.verifyToken(token)
  
  if (!result.success) {
    return c.json({ error: result.error }, 403)
  }
  
  // Process request...
}
```

## Integration Examples

### Example 1: Contact Form

```typescript
// routes/contact.ts
import { Hono } from 'hono'
import { verifyTurnstile, renderInlineTurnstile } from '@sonicjs-cms/core/plugins'

const app = new Hono()

// Show form with widget
app.get('/contact', async (c) => {
  const db = c.get('db')
  const turnstileService = new TurnstileService(db)
  const settings = await turnstileService.getSettings()
  
  const widget = settings?.siteKey 
    ? renderInlineTurnstile(settings.siteKey)
    : ''
  
  return c.html(`
    <form action="/api/contact" method="POST">
      <input type="text" name="name" required>
      <input type="email" name="email" required>
      ${widget}
      <button type="submit">Send</button>
    </form>
  `)
})

// Process form (protected by Turnstile)
app.post('/api/contact', verifyTurnstile, async (c) => {
  const formData = await c.req.formData()
  // Save message...
  return c.json({ success: true })
})

export default app
```

### Example 2: User Registration

```typescript
import { verifyTurnstile } from '@sonicjs-cms/core/plugins'

app.post('/auth/register', verifyTurnstile, async (c) => {
  const { email, password } = await c.req.json()
  // Create user...
  return c.json({ success: true })
})
```

### Example 3: Comment Submission

```typescript
import { verifyTurnstile } from '@sonicjs-cms/core/plugins'

app.post('/api/comments', verifyTurnstile, async (c) => {
  const { postId, comment } = await c.req.json()
  // Save comment...
  return c.json({ success: true })
})
```

## Configuration Options

### Widget Themes

- **Auto**: Automatically matches user's system theme
- **Light**: Light mode always
- **Dark**: Dark mode always

### Widget Sizes

- **Normal**: 300x65px - Standard size
- **Compact**: 130x120px - Space-saving vertical layout

## API Reference

### Middleware

#### `verifyTurnstile`

Standard middleware for form protection.

```typescript
verifyTurnstile(c: Context, next: Next): Promise<Response>
```

#### `createTurnstileMiddleware(options)`

Factory for creating custom middleware with error handlers.

```typescript
createTurnstileMiddleware({
  onError?: (c: Context, error: string) => Response
  onMissing?: (c: Context) => Response
}): Middleware
```

### Service

#### `TurnstileService`

Main service for Turnstile operations.

**Methods:**

- `getSettings()`: Get current Turnstile settings
- `saveSettings(settings)`: Save Turnstile settings
- `verifyToken(token, remoteIp?)`: Verify a Turnstile token
- `isEnabled()`: Check if Turnstile is enabled and configured

### Widget Helpers

#### `renderInlineTurnstile(siteKey, options?)`

Generate inline widget HTML.

#### `renderTurnstileWidget(settings, containerId?)`

Generate widget from settings object.

#### `getTurnstileScript()`

Get just the Turnstile script tag.

#### `renderExplicitTurnstile(siteKey, options?)`

Generate explicit rendering JavaScript.

## How It Works

1. **Frontend**: User sees Turnstile widget on form
2. **Challenge**: Widget performs invisible or interactive challenge
3. **Token**: Widget generates a token upon successful verification
4. **Submission**: Form submits with token
5. **Backend**: Middleware verifies token with Cloudflare API
6. **Processing**: If valid, form is processed; if invalid, request is rejected

## Troubleshooting

### Widget Not Appearing

- Check that Turnstile is enabled in plugin settings
- Verify site key is correct
- Check browser console for JavaScript errors
- Ensure Turnstile script is loaded

### Verification Failing

- Check secret key is correct
- Verify token is being sent in request (`cf-turnstile-response` field)
- Check Cloudflare dashboard for API errors
- Ensure your domain is added to Turnstile site configuration

### Testing Locally

During development, use Turnstile's test keys:

- **Site Key**: `1x00000000000000000000AA`
- **Secret Key**: `1x0000000000000000000000000000000AA`

These always return successful verification.

## Security Notes

- Secret key is **never** exposed to the frontend
- Tokens are single-use and expire quickly
- Verification happens server-side only
- Failed verifications are logged for monitoring

## Resources

- [Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
- [Widget Customization](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
- [Server-side Validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)

## License

MIT
