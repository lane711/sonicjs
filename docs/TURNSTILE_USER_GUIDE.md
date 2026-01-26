# Turnstile Integration Guide

## Overview

SonicJS Forms now supports **Cloudflare Turnstile** - a free, privacy-friendly CAPTCHA alternative that protects your forms from bots without annoying your users.

**Key Features:**
- ✅ CAPTCHA-free user experience
- ✅ Privacy-focused (no personal data collection)
- ✅ Free for unlimited use
- ✅ Works with builder and headless applications
- ✅ Configurable per-form or globally

---

## Quick Start (5 Minutes)

### 1. Get Turnstile Keys (Free)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account → **Turnstile**
3. Click **Add Site**
4. Enter your domain (or use `localhost` for testing)
5. Copy your **Site Key** and **Secret Key**

### 2. Configure in SonicJS

1. Go to **Admin → Plugins → Turnstile**
2. Paste your **Site Key** and **Secret Key**
3. Choose your preferences:
   - **Theme:** Light, Dark, or Auto
   - **Mode:** Managed (recommended), Non-Interactive, or Invisible
   - **Size:** Normal or Compact
4. Enable **Turnstile Protection**
5. Click **Save Settings**

### 3. Add to Your Forms

**Option A: Use Existing Forms (Global Protection)**
- Turnstile is automatically added to all public forms
- No changes needed!

**Option B: Per-Form Control**
1. Edit a form
2. Toggle **Turnstile Protection** on/off
3. Optionally override global settings
4. Save

**Option C: Add to Builder**
1. Open form in builder
2. Drag **Turnstile** component from Advanced tab
3. Widget appears in form
4. Save and publish

---

## Modes Explained

### 🎯 Managed Mode (Recommended)
- **Best for:** Most forms
- **Behavior:** Automatic challenge when needed
- **User Experience:** Usually invisible, occasional challenge for suspicious traffic
- **Use When:** You want balanced protection with minimal friction

### 🔒 Non-Interactive Mode
- **Best for:** High-security forms
- **Behavior:** Always shows visible verification
- **User Experience:** User sees "Verifying you are human..." every time
- **Use When:** Security is more important than convenience

### 👻 Invisible Mode
- **Best for:** Premium user experience
- **Behavior:** Completely invisible
- **User Experience:** No visible widget at all
- **Use When:** You want zero UI impact (requires custom implementation)

---

## Usage Examples

### Example 1: Contact Form (Public)

Your contact form at `/forms/contact` automatically has Turnstile protection once you enable it globally. No code changes needed!

**Test it:**
1. Visit your form: `https://yoursite.com/forms/contact`
2. Fill out the form
3. Notice the Turnstile widget (or lack thereof in Managed mode)
4. Submit - Turnstile validates automatically

### Example 2: Newsletter Signup (Headless React)

```tsx
import { useTurnstile } from '@sonicjs-cms/core/turnstile'

function NewsletterSignup() {
  const { turnstileToken, TurnstileWidget, isEnabled, isReady } = useTurnstile('newsletter')
  const [email, setEmail] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const response = await fetch('/api/forms/newsletter/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          email,
          ...(isEnabled && { turnstile: turnstileToken })
        }
      })
    })

    if (response.ok) {
      alert('Subscribed!')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
      />
      
      <TurnstileWidget />
      
      <button type="submit" disabled={isEnabled && !isReady}>
        Subscribe
      </button>
    </form>
  )
}
```

### Example 3: Custom Form (Vanilla JS)

```html
<form id="my-form">
  <input name="name" required />
  <div id="turnstile"></div>
  <button type="submit">Submit</button>
</form>

<script>
// Fetch Turnstile config
fetch('/api/forms/my-form/turnstile-config')
  .then(r => r.json())
  .then(config => {
    if (config.enabled) {
      // Load Turnstile script
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.onload = () => {
        // Render widget
        let token = null
        turnstile.render('#turnstile', {
          sitekey: config.siteKey,
          callback: (t) => token = t
        })
        
        // Handle form submission
        document.getElementById('my-form').onsubmit = async (e) => {
          e.preventDefault()
          
          const formData = new FormData(e.target)
          const data = Object.fromEntries(formData)
          
          const response = await fetch('/api/forms/my-form/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: { ...data, turnstile: token }
            })
          })
          
          if (response.ok) {
            alert('Submitted!')
          } else {
            const error = await response.json()
            alert(error.error)
          }
        }
      }
      document.head.appendChild(script)
    }
  })
</script>
```

---

## Per-Form Configuration

### Enable Turnstile for Specific Forms

1. Go to **Admin → Forms**
2. Click on a form
3. Click **Edit**
4. Find **Security** section
5. Toggle **Turnstile Protection** ON
6. Choose **Inherit Global Settings** or **Custom**
7. If Custom:
   - Site Key (optional, uses global if empty)
   - Theme, Mode, Size
8. Save

### Disable Turnstile for Specific Forms

Even if globally enabled, you can disable Turnstile for specific forms:

1. Edit the form
2. Toggle **Turnstile Protection** OFF
3. Save

This is useful for:
- Internal forms
- Authenticated-only forms
- Testing environments

---

## Troubleshooting

### Issue: "Turnstile verification required" Error

**Cause:** Form expects Turnstile token but didn't receive one

**Solution:**
1. Check Turnstile is enabled in settings
2. Verify widget is visible on form
3. Ensure token is included in submission
4. Check browser console for JavaScript errors

### Issue: "Turnstile verification failed" Error

**Cause:** Invalid or expired token

**Solution:**
1. Verify Site Key and Secret Key are correct
2. Check domain is added to Cloudflare Turnstile
3. Ensure you're not reusing tokens (they're single-use)
4. Try refreshing the page

### Issue: Widget Not Appearing

**Cause:** Script not loading or configuration issue

**Solution:**
1. Check browser console for errors
2. Verify `challenges.cloudflare.com` is not blocked
3. Test with different browser
4. Check Site Key is correct
5. Try disabling browser extensions

### Issue: "Widget already exists" Error

**Cause:** Trying to render multiple widgets in same container

**Solution:**
- Remove old widget before rendering new one
- In React: use cleanup in useEffect
- In vanilla JS: call `turnstile.remove(widgetId)` first

---

## Best Practices

### ✅ DO:
- **Use Managed Mode** for most forms (best UX)
- **Test on localhost** before deploying
- **Add Turnstile component** in form builder for consistent UX
- **Handle errors gracefully** - show user-friendly messages
- **Reset widget** after successful submission
- **Check isEnabled** before requiring token in headless apps

### ❌ DON'T:
- **Reuse tokens** - they're single-use only
- **Hardcode keys** - use environment variables
- **Skip error handling** - users need feedback
- **Forget to cleanup** - remove widgets on component unmount
- **Use for internal tools** - only public-facing forms

---

## API Reference

### GET `/api/forms/:id/turnstile-config`

Get Turnstile configuration for a form.

**Response:**
```json
{
  "enabled": true,
  "siteKey": "0x4AAA...",
  "theme": "auto",
  "size": "normal",
  "mode": "managed",
  "appearance": "always"
}
```

### POST `/api/forms/:id/submit`

Submit a form with Turnstile verification.

**Request:**
```json
{
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "turnstile": "0.AbCd..." // Token from widget
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "submissionId": "uuid",
  "message": "Form submitted successfully"
}
```

**Error Response (400):**
```json
{
  "error": "Turnstile verification required",
  "code": "TURNSTILE_MISSING"
}
```

**Error Response (403):**
```json
{
  "error": "Security verification failed",
  "code": "TURNSTILE_INVALID"
}
```

---

## Advanced Topics

### Custom Styling

```css
/* Style the Turnstile widget */
.turnstile-widget {
  margin: 20px 0;
}

.cf-turnstile {
  transform: scale(0.9); /* Make smaller */
}
```

### Conditional Display

Only show Turnstile for anonymous users:

```javascript
const { TurnstileWidget, isEnabled } = useTurnstile('contact')
const user = useUser()

return (
  <form>
    {/* ... other fields ... */}
    
    {!user && isEnabled && <TurnstileWidget />}
    
    <button type="submit">Submit</button>
  </form>
)
```

### Custom Error Messages

```javascript
const { error } = useTurnstile('contact')

{error && (
  <div className="error-message">
    <strong>Security Verification Failed</strong>
    <p>Please refresh the page and try again.</p>
  </div>
)}
```

### Pre-clearance Mode

Enable in Admin → Plugins → Turnstile:
- **Pre-clearance:** ON
- **Pre-clearance Level:** Managed

This issues a clearance cookie that bypasses Cloudflare Firewall Rules, improving performance for verified users.

---

## Resources

- **Cloudflare Turnstile Docs:** https://developers.cloudflare.com/turnstile/
- **Get Turnstile Keys:** https://dash.cloudflare.com/
- **React Integration:** See `packages/core/src/plugins/core-plugins/turnstile-plugin/react-hooks.tsx`
- **Vanilla JS Examples:** See docs/TURNSTILE_FORMIO_INTEGRATION.md

---

## Support

Having issues? Check:
1. This documentation
2. Browser console for errors
3. Cloudflare Turnstile dashboard for errors
4. SonicJS GitHub issues

**Common Questions:**
- Q: Is Turnstile free? A: Yes, completely free for unlimited use
- Q: Does it work offline? A: No, requires internet connection
- Q: Can I customize the look? A: Limited styling, mostly theme/size options
- Q: Does it collect personal data? A: No, privacy-focused design

---

**Last Updated:** January 25, 2026  
**Version:** 1.0.0
