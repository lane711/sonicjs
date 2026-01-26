# Cloudflare Turnstile Integration for SonicJS Forms

**Status:** 📋 Ready to implement  
**Replaces:** Google reCAPTCHA (now removed from builder)

---

## Why Turnstile?

Cloudflare Turnstile is a **better alternative** to reCAPTCHA:

✅ **Free & Open Source**  
✅ **Privacy-focused** (no tracking/cookies)  
✅ **Better UX** (invisible challenges)  
✅ **Faster** (runs on Cloudflare's edge)  
✅ **No vendor lock-in**  
✅ **You already use Cloudflare!**

---

## Quick Setup

### 1. Get Turnstile Keys

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account → **Turnstile**
3. Click **Add Site**
4. Configure:
   - **Site Name:** "SonicJS Forms"
   - **Domain:** `yourdomain.com` (or `localhost` for dev)
   - **Widget Mode:** Managed (recommended)
5. Click **Create**
6. Copy your **Site Key** and **Secret Key**

### 2. Add to Environment

Edit `my-sonicjs-app/wrangler.toml`:

```toml
[vars]
ENVIRONMENT = "development"
GOOGLE_MAPS_API_KEY = "your-google-maps-key"
TURNSTILE_SITE_KEY = "0x4AAAAAAAbcd..."  # Add this
TURNSTILE_SECRET_KEY = "0x4BBBBBBbcd..."  # Add this
```

### 3. Add Turnstile Component to Forms

**Two Options:**

#### Option A: Custom Form.io Component (Recommended)
Create a custom Turnstile component that integrates with Form.io

#### Option B: Manual HTML Integration
Add Turnstile to your public form template

---

## Implementation: Custom Turnstile Component

### Step 1: Create Turnstile Component

Create `/packages/core/src/formio-components/turnstile.ts`:

```typescript
import { Components } from '@formio/js';

export class TurnstileComponent extends Components.components.component {
  static schema(...extend: any[]) {
    return Components.components.component.schema({
      type: 'turnstile',
      label: 'Turnstile',
      key: 'turnstile',
      input: true,
      protected: false,
      persistent: true
    }, ...extend);
  }

  static get builderInfo() {
    return {
      title: 'Turnstile',
      group: 'premium',
      icon: 'shield-alt',
      weight: 10,
      documentation: '/docs/turnstile',
      schema: TurnstileComponent.schema()
    };
  }

  render() {
    return super.render(`
      <div class="formio-component-turnstile">
        <div class="cf-turnstile"
             data-sitekey="${this.component.siteKey || ''}"
             data-theme="${this.component.theme || 'auto'}"
             data-size="${this.component.size || 'normal'}">
        </div>
      </div>
    `);
  }

  attach(element: HTMLElement) {
    this.loadRefs(element, {
      turnstile: 'single'
    });

    // Load Turnstile script
    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return super.attach(element);
  }

  getValue() {
    // Get Turnstile token
    const token = document.querySelector('.cf-turnstile input[name="cf-turnstile-response"]')?.value;
    return token || '';
  }
}

// Register the component
Components.addComponent('turnstile', TurnstileComponent);
```

### Step 2: Register Component in Builder

Update `/packages/core/src/templates/pages/admin-forms-builder.template.ts`:

```javascript
// Import custom components
import { TurnstileComponent } from '../formio-components/turnstile';

// In initBuilder():
Formio.Components.setComponent('turnstile', TurnstileComponent);

const builderOptions = {
  builder: {
    premium: {
      components: {
        file: true,
        signature: true,
        turnstile: true,  // Add Turnstile
        // ... rest
      }
    }
  }
};
```

### Step 3: Server-Side Verification

Add verification to `/packages/core/src/routes/public-forms.ts`:

```typescript
// Handle form submission
publicFormsRoutes.post('/:name/submit', async (c) => {
  try {
    const db = c.env.DB;
    const formName = c.req.param('name');
    const body = await c.req.json();
    
    // Verify Turnstile token if present
    if (body.data.turnstile) {
      const turnstileToken = body.data.turnstile;
      const secretKey = c.env.TURNSTILE_SECRET_KEY;
      
      const verifyResponse = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: secretKey,
            response: turnstileToken,
            remoteip: c.req.header('cf-connecting-ip')
          })
        }
      );
      
      const verifyResult = await verifyResponse.json();
      
      if (!verifyResult.success) {
        return c.json({ 
          error: 'Verification failed. Please try again.' 
        }, 400);
      }
      
      // Remove token from submission data
      delete body.data.turnstile;
    }
    
    // Continue with normal submission...
    // ... rest of submission code
  }
});
```

---

## Simple HTML Integration (Quick Start)

If you don't want to create a custom component, add Turnstile directly to public forms:

### Update Public Form Template

In `/packages/core/src/routes/public-forms.ts`:

```javascript
const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <title>${form.display_name}</title>
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
  </head>
  <body>
    <div class="container">
      <h1>${form.display_name}</h1>
      
      <div id="formio-form"></div>
      
      <!-- Add Turnstile Widget -->
      <div class="cf-turnstile" 
           data-sitekey="${c.env.TURNSTILE_SITE_KEY}"
           data-theme="auto"
           style="margin: 20px 0;"></div>
      
      <button id="submit-btn">Submit</button>
    </div>
    
    <script>
      // Form submission with Turnstile
      document.getElementById('submit-btn').addEventListener('click', async () => {
        const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]').value;
        
        // Get form data
        const formData = form.submission.data;
        formData.turnstile = turnstileResponse;
        
        // Submit
        await fetch('/api/forms/${form.id}/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: formData })
        });
      });
    </script>
  </body>
  </html>
`;
```

---

## Testing

### 1. Test Keys (Provided by Cloudflare)

For development/testing, use these keys:

**Visible (always passes):**
- Site Key: `1x00000000000000000000AA`
- Secret Key: `1x0000000000000000000000000000000AA`

**Invisible (always passes):**
- Site Key: `2x00000000000000000000AB`
- Secret Key: `2x0000000000000000000000000000000AA`

**Always fails:**
- Site Key: `3x00000000000000000000FF`
- Secret Key: `3x0000000000000000000000000000000FF`

### 2. Verify Setup

1. Add Turnstile to a test form
2. Submit the form
3. Check server logs for verification result
4. Verify submission is blocked if token invalid

---

## Configuration Options

### Widget Modes

**Managed (Recommended):**
```html
<div class="cf-turnstile" data-sitekey="..." data-theme="auto"></div>
```

**Non-interactive (Invisible):**
```html
<div class="cf-turnstile" data-sitekey="..." data-size="invisible"></div>
```

**Flexible:**
```html
<div class="cf-turnstile" data-sitekey="..." data-size="flexible"></div>
```

### Themes

- `light` - Light theme
- `dark` - Dark theme
- `auto` - Matches system preference (recommended)

### Languages

Turnstile auto-detects language, or you can specify:
```html
<div class="cf-turnstile" data-language="es"></div>
```

---

## Comparison: Turnstile vs reCAPTCHA

| Feature | Turnstile | reCAPTCHA |
|---------|-----------|-----------|
| **Cost** | Free | Free (with limits) |
| **Privacy** | No tracking | Tracks users |
| **Performance** | Faster (edge) | Slower |
| **UX** | Better (invisible) | Intrusive |
| **Vendor** | Cloudflare | Google |
| **Open Source** | Yes | No |
| **Setup** | Easier | More complex |

---

## Next Steps

1. ✅ reCAPTCHA removed from builder
2. 📋 Get Turnstile keys from Cloudflare
3. 📋 Choose implementation approach:
   - **Option A:** Custom Form.io component (better UX)
   - **Option B:** HTML integration (faster setup)
4. 📋 Test with development keys
5. 📋 Deploy with production keys

---

## Resources

- **Cloudflare Turnstile:** https://dash.cloudflare.com/turnstile
- **Documentation:** https://developers.cloudflare.com/turnstile/
- **Widget Modes:** https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
- **Server Verification:** https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

---

**Ready to implement?** Let me know if you want me to build the custom Turnstile component or use the simple HTML integration!
