# Turnstile Integration with Form.io Forms

## Overview
Integrate Cloudflare Turnstile (CAPTCHA-free bot protection) with SonicJS Form.io forms system.

## Features
1. **Custom Form.io Component** - Add Turnstile widget to any form via drag-and-drop
2. **Per-Form Configuration** - Enable/disable Turnstile per form with global fallback
3. **Seamless Validation** - Automatic token verification on form submission
4. **Headless Support** - Helper functions for React/Vue/Angular frontends
5. **Flexible Modes** - Managed, Non-Interactive, or Invisible modes

---

## Architecture

### 1. Custom Form.io Component
**File:** `packages/core/src/plugins/core-plugins/turnstile-plugin/formio-component.ts`

Create a custom Turnstile component that:
- Renders the Cloudflare Turnstile widget
- Captures the verification token
- Includes token in form submission data
- Supports all Turnstile options (theme, size, mode, etc.)

### 2. Form Settings Enhancement
**File:** `packages/core/migrations/030_add_turnstile_to_forms.sql`

Add Turnstile settings to forms table:
```sql
ALTER TABLE forms ADD COLUMN turnstile_enabled INTEGER DEFAULT 0;
ALTER TABLE forms ADD COLUMN turnstile_settings TEXT; -- JSON config
```

### 3. Submission API Validation
**File:** `packages/core/src/routes/public-forms.ts`

Modify `POST /:identifier/submit` to:
- Extract Turnstile token from submission data
- Validate token using TurnstileService
- Reject submission if validation fails
- Support global and per-form configuration

### 4. Headless Helpers
**File:** `packages/core/src/plugins/core-plugins/turnstile-plugin/headless-helpers.ts`

Export helper functions for frontend developers:
- `getTurnstileConfig(formId)` - Get Turnstile settings for a form
- `renderTurnstile(element, config)` - Render widget in headless app
- `validateTurnstile(token, formId)` - Validate token (for testing)

---

## Implementation Steps

### Step 1: Create Custom Form.io Component

```typescript
// packages/core/src/plugins/core-plugins/turnstile-plugin/formio-component.ts

import { Components } from 'formiojs';

export class TurnstileComponent extends Components.components.component {
  static schema(...extend) {
    return Components.components.component.schema({
      type: 'turnstile',
      label: 'Cloudflare Turnstile',
      key: 'turnstile',
      input: true,
      theme: 'auto',
      size: 'normal',
      mode: 'managed',
      appearance: 'always',
      siteKey: '',
      ...extend
    });
  }

  static get builderInfo() {
    return {
      title: 'Turnstile',
      group: 'advanced',
      icon: 'shield-check',
      weight: 110,
      documentation: '/docs/turnstile',
      schema: TurnstileComponent.schema()
    };
  }

  render() {
    return this.renderTemplate('turnstile', {
      siteKey: this.component.siteKey,
      theme: this.component.theme || 'auto',
      size: this.component.size || 'normal',
      mode: this.component.mode || 'managed',
      appearance: this.component.appearance || 'always'
    });
  }

  attach(element) {
    this.loadRefs(element, {
      turnstileWidget: 'single',
      input: 'single'
    });

    // Load Turnstile script if not already loaded
    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // Wait for script to load and render widget
    const renderWidget = () => {
      if (window.turnstile && this.refs.turnstileWidget) {
        const widgetId = window.turnstile.render(this.refs.turnstileWidget, {
          sitekey: this.component.siteKey,
          theme: this.component.theme,
          size: this.component.size,
          mode: this.component.mode,
          appearance: this.component.appearance,
          callback: (token) => {
            this.updateValue(token);
          },
          'error-callback': () => {
            this.updateValue(null);
          },
          'expired-callback': () => {
            this.updateValue(null);
          }
        });
        this.widgetId = widgetId;
      } else {
        setTimeout(renderWidget, 100);
      }
    };

    renderWidget();

    return super.attach(element);
  }

  detach() {
    if (window.turnstile && this.widgetId !== undefined) {
      window.turnstile.remove(this.widgetId);
    }
    return super.detach();
  }

  getValue() {
    return this.dataValue;
  }

  setValue(value) {
    this.dataValue = value;
    if (this.refs.input) {
      this.refs.input.value = value || '';
    }
  }

  updateValue(value) {
    this.dataValue = value;
    this.triggerChange();
  }
}

// Register component with Form.io
export function registerTurnstileComponent() {
  Components.addComponent('turnstile', TurnstileComponent);
}
```

### Step 2: Add Component Template

```typescript
// packages/core/src/plugins/core-plugins/turnstile-plugin/formio-template.ts

export const turnstileTemplate = `
<div class="formio-component formio-component-turnstile">
  {{#if component.label}}
  <label class="control-label" for="{{component.key}}">
    {{component.label}}
    {{#if component.tooltip}}
    <i class="{{iconClass 'question-sign'}} text-muted" data-tooltip="{{component.tooltip}}"></i>
    {{/if}}
  </label>
  {{/if}}
  
  <div ref="turnstileWidget" class="turnstile-widget"></div>
  <input type="hidden" ref="input" name="{{component.key}}" value="{{dataValue}}" />
  
  {{#if component.description}}
  <div class="help-block">{{component.description}}</div>
  {{/if}}
</div>
`;
```

### Step 3: Database Migration

```sql
-- packages/core/migrations/030_add_turnstile_to_forms.sql

-- Add Turnstile configuration to forms table
ALTER TABLE forms ADD COLUMN turnstile_enabled INTEGER DEFAULT 0;
ALTER TABLE forms ADD COLUMN turnstile_settings TEXT;

-- Update existing forms to inherit global settings
UPDATE forms SET turnstile_settings = '{"inherit":true}' WHERE turnstile_settings IS NULL;
```

### Step 4: Update Form Submission Handler

```typescript
// packages/core/src/routes/public-forms.ts

import { TurnstileService } from '../plugins/core-plugins/turnstile-plugin/services/turnstile'

// Modify POST /:identifier/submit endpoint
publicFormsRoutes.post('/:identifier/submit', async (c) => {
  try {
    const db = c.env.DB
    const identifier = c.req.param('identifier')
    const body = await c.req.json()

    // Get form by ID or name
    const form = await db.prepare(
      'SELECT * FROM forms WHERE (id = ? OR name = ?) AND is_active = 1'
    ).bind(identifier, identifier).first()

    if (!form) {
      return c.json({ error: 'Form not found' }, 404)
    }

    // Check if Turnstile is enabled for this form
    const turnstileEnabled = form.turnstile_enabled === 1
    const turnstileSettings = form.turnstile_settings 
      ? JSON.parse(form.turnstile_settings as string) 
      : { inherit: true }

    // If Turnstile is enabled (or inheriting global settings)
    if (turnstileEnabled || turnstileSettings.inherit) {
      const turnstileService = new TurnstileService(db)
      
      // Check if Turnstile is globally enabled
      const globalEnabled = await turnstileService.isEnabled()
      
      if (globalEnabled || turnstileEnabled) {
        // Extract Turnstile token from submission data
        const turnstileToken = body.data?.turnstile || body.turnstile
        
        if (!turnstileToken) {
          return c.json({ 
            error: 'Turnstile verification required',
            code: 'TURNSTILE_MISSING'
          }, 400)
        }

        // Verify the token
        const clientIp = c.req.header('cf-connecting-ip')
        const verification = await turnstileService.verifyToken(turnstileToken, clientIp)
        
        if (!verification.success) {
          return c.json({ 
            error: verification.error || 'Turnstile verification failed',
            code: 'TURNSTILE_INVALID'
          }, 403)
        }

        // Remove Turnstile token from submission data before storing
        if (body.data?.turnstile) {
          delete body.data.turnstile
        }
      }
    }

    // Create submission (existing code)
    const submissionId = crypto.randomUUID()
    const now = Date.now()

    await db.prepare(`
      INSERT INTO form_submissions (
        id, form_id, submission_data, user_id, ip_address, user_agent,
        submitted_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      submissionId,
      form.id,
      JSON.stringify(body.data),
      null,
      c.req.header('cf-connecting-ip') || null,
      c.req.header('user-agent') || null,
      now,
      now
    ).run()

    // Update submission count
    await db.prepare(`
      UPDATE forms 
      SET submission_count = submission_count + 1,
          updated_at = ?
      WHERE id = ?
    `).bind(now, form.id).run()

    return c.json({ 
      success: true, 
      submissionId,
      message: 'Form submitted successfully' 
    })
  } catch (error: any) {
    console.error('Error submitting form:', error)
    return c.json({ error: 'Failed to submit form' }, 500)
  }
})
```

### Step 5: Headless Integration Helpers

```typescript
// packages/core/src/plugins/core-plugins/turnstile-plugin/headless-helpers.ts

export interface TurnstileConfig {
  enabled: boolean
  siteKey: string
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
  mode?: 'managed' | 'non-interactive' | 'invisible'
  appearance?: 'always' | 'execute' | 'interaction-only'
}

/**
 * Get Turnstile configuration for a form
 * Use this in your headless frontend to determine if Turnstile is needed
 */
export async function getTurnstileConfig(formId: string): Promise<TurnstileConfig | null> {
  try {
    const response = await fetch(`/api/forms/${formId}/turnstile-config`)
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error('Error fetching Turnstile config:', error)
    return null
  }
}

/**
 * Render Turnstile widget in a DOM element
 * Use this in React/Vue/Angular after mounting your form component
 */
export function renderTurnstile(
  element: HTMLElement,
  config: TurnstileConfig,
  onSuccess: (token: string) => void,
  onError?: () => void
): string | null {
  if (!config.enabled) return null

  // Load Turnstile script if not already loaded
  if (!window.turnstile) {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }

  // Wait for script and render
  const render = () => {
    if (window.turnstile) {
      return window.turnstile.render(element, {
        sitekey: config.siteKey,
        theme: config.theme || 'auto',
        size: config.size || 'normal',
        mode: config.mode || 'managed',
        appearance: config.appearance || 'always',
        callback: onSuccess,
        'error-callback': onError,
        'expired-callback': onError
      })
    } else {
      setTimeout(render, 100)
    }
  }

  return render()
}

/**
 * React Hook for Turnstile integration
 * Example usage:
 * 
 * const { turnstileConfig, turnstileToken, TurnstileWidget } = useTurnstile(formId)
 * 
 * return (
 *   <form onSubmit={(e) => handleSubmit(e, { ...formData, turnstile: turnstileToken })}>
 *     <input name="name" />
 *     <TurnstileWidget />
 *     <button type="submit">Submit</button>
 *   </form>
 * )
 */
export function useTurnstile(formId: string) {
  const [config, setConfig] = React.useState<TurnstileConfig | null>(null)
  const [token, setToken] = React.useState<string | null>(null)
  const widgetRef = React.useRef<HTMLDivElement>(null)
  const widgetId = React.useRef<string | null>(null)

  React.useEffect(() => {
    getTurnstileConfig(formId).then(setConfig)
  }, [formId])

  React.useEffect(() => {
    if (config?.enabled && widgetRef.current) {
      widgetId.current = renderTurnstile(
        widgetRef.current,
        config,
        setToken,
        () => setToken(null)
      )
    }

    return () => {
      if (window.turnstile && widgetId.current) {
        window.turnstile.remove(widgetId.current)
      }
    }
  }, [config])

  const TurnstileWidget = () => {
    if (!config?.enabled) return null
    return <div ref={widgetRef} />
  }

  return {
    turnstileConfig: config,
    turnstileToken: token,
    TurnstileWidget,
    isEnabled: config?.enabled || false
  }
}
```

### Step 6: Add Turnstile Config API Endpoint

```typescript
// Add to packages/core/src/routes/public-forms.ts

// Get Turnstile configuration for a form (for headless frontends)
publicFormsRoutes.get('/:identifier/turnstile-config', async (c) => {
  try {
    const db = c.env.DB
    const identifier = c.req.param('identifier')

    // Get form
    const form = await db.prepare(
      'SELECT id, turnstile_enabled, turnstile_settings FROM forms WHERE (id = ? OR name = ?) AND is_active = 1'
    ).bind(identifier, identifier).first()

    if (!form) {
      return c.json({ error: 'Form not found' }, 404)
    }

    const turnstileService = new TurnstileService(db)
    const globalSettings = await turnstileService.getSettings()
    
    const formSettings = form.turnstile_settings 
      ? JSON.parse(form.turnstile_settings as string)
      : { inherit: true }

    // Determine effective settings
    const enabled = form.turnstile_enabled === 1 || 
                   (formSettings.inherit && globalSettings?.enabled)

    if (!enabled || !globalSettings) {
      return c.json({ enabled: false })
    }

    return c.json({
      enabled: true,
      siteKey: formSettings.siteKey || globalSettings.siteKey,
      theme: formSettings.theme || globalSettings.theme || 'auto',
      size: formSettings.size || globalSettings.size || 'normal',
      mode: formSettings.mode || globalSettings.mode || 'managed',
      appearance: formSettings.appearance || globalSettings.appearance || 'always'
    })
  } catch (error: any) {
    console.error('Error fetching Turnstile config:', error)
    return c.json({ error: 'Failed to fetch config' }, 500)
  }
})
```

---

## Usage Examples

### 1. Builder Usage
1. Open form builder at `/admin/forms/{id}/builder`
2. Find "Turnstile" in Advanced tab
3. Drag Turnstile component into form
4. Configure site key (or inherit from global settings)
5. Save form

### 2. Per-Form Settings
1. Go to form edit page
2. Enable "Turnstile Protection"
3. Choose to inherit global settings or customize
4. Save

### 3. Headless React Example

```jsx
import { useTurnstile } from '@sonicjs-cms/core/turnstile'

function ContactForm() {
  const { turnstileToken, TurnstileWidget, isEnabled } = useTurnstile('contact-form')
  const [formData, setFormData] = useState({ name: '', email: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const payload = {
      data: {
        ...formData,
        ...(isEnabled && { turnstile: turnstileToken })
      }
    }

    const response = await fetch('/api/forms/contact-form/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (response.ok) {
      alert('Submitted!')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="name" 
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <input 
        name="email" 
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      <TurnstileWidget />
      <button type="submit" disabled={isEnabled && !turnstileToken}>
        Submit
      </button>
    </form>
  }
}
```

### 4. Vanilla JS Example

```javascript
// Fetch form schema
const response = await fetch('/forms/contact-form/schema')
const { schema, settings, submitUrl } = await response.json()

// Check if Turnstile is needed
const turnstileConfig = await fetch('/api/forms/contact-form/turnstile-config')
  .then(r => r.json())

// Render form with Form.io
Formio.createForm(document.getElementById('form'), schema).then(form => {
  // Add Turnstile if enabled
  if (turnstileConfig.enabled) {
    const turnstileDiv = document.createElement('div')
    form.element.appendChild(turnstileDiv)
    
    window.turnstile.render(turnstileDiv, {
      sitekey: turnstileConfig.siteKey,
      callback: (token) => {
        form.submission = {
          ...form.submission,
          data: { ...form.submission.data, turnstile: token }
        }
      }
    })
  }

  // Handle submission
  form.on('submit', async (submission) => {
    const response = await fetch(submitUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    })
    
    if (response.ok) {
      alert('Submitted!')
    } else {
      const error = await response.json()
      alert(error.error)
    }
  })
})
```

---

## Configuration Options

### Global Settings (Admin UI)
- **Site Key** - Cloudflare Turnstile site key
- **Secret Key** - Cloudflare Turnstile secret key
- **Theme** - light, dark, auto
- **Size** - normal, compact
- **Mode** - managed, non-interactive, invisible
- **Appearance** - always, execute, interaction-only
- **Enabled** - Global enable/disable

### Per-Form Settings
- **Inherit Global** - Use global Turnstile settings
- **Override** - Custom settings for this form
- **Enabled** - Enable/disable for this specific form

---

## Testing Checklist

- [ ] Turnstile component appears in builder Advanced tab
- [ ] Can drag Turnstile into form
- [ ] Widget renders correctly in builder preview
- [ ] Can save form with Turnstile component
- [ ] Public form shows Turnstile widget
- [ ] Form submission with valid token succeeds
- [ ] Form submission without token fails (when enabled)
- [ ] Form submission with invalid token fails
- [ ] Headless API returns correct Turnstile config
- [ ] React hook renders widget correctly
- [ ] Token is included in headless submissions
- [ ] Per-form override works
- [ ] Global disable works
- [ ] All Turnstile modes work (managed, non-interactive, invisible)

---

## Documentation Needed

1. **User Guide** - How to add Turnstile to forms in builder
2. **Admin Guide** - How to configure Turnstile globally and per-form
3. **Developer Guide** - Headless integration examples for React/Vue/Angular
4. **API Reference** - Turnstile endpoints and responses
5. **Troubleshooting** - Common issues and solutions

---

## Next Steps

1. ✅ Create implementation plan (this document)
2. ⏳ Create Form.io custom component
3. ⏳ Add database migration
4. ⏳ Update submission API
5. ⏳ Create headless helpers
6. ⏳ Add API endpoint for config
7. ⏳ Update admin UI for per-form settings
8. ⏳ Write documentation
9. ⏳ Add E2E tests
10. ⏳ Add unit tests
