# SonicJS Forms - Quick Reference

**One-page cheat sheet for SonicJS Forms**

---

## 🚀 Quick Start

### Admin UI
```
/admin/forms          → List forms
/admin/forms/new      → Create new form
/forms/:name          → View public form
```

### API Endpoints
```typescript
GET  /forms/:name/schema        // Get form JSON
POST /api/forms/:id/submit      // Submit data
```

---

## 📝 Create Form

### Via Admin UI
1. Go to `/admin/forms/new`
2. Enter name, display name
3. Click "Create Form"
4. Drag components, configure
5. Save

### Via API
```typescript
await fetch('/admin/forms', {
  method: 'POST',
  body: new URLSearchParams({
    name: 'my_form',
    displayName: 'My Form'
  })
})
```

### Via SQL
```sql
INSERT INTO forms (id, name, display_name, formio_schema, settings, is_active, is_public, created_at, updated_at)
VALUES ('uuid', 'my_form', 'My Form', '{"components":[]}', '{}', 1, 1, 0, 0);
```

---

## ⚛️ React Integration

```tsx
import { Form } from '@formio/react'
import { useState, useEffect } from 'react'

function MyForm() {
  const [form, setForm] = useState(null)

  useEffect(() => {
    fetch('/forms/my_form/schema')
      .then(r => r.json())
      .then(setForm)
  }, [])

  const handleSubmit = async (submission) => {
    await fetch(form.submitUrl, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(submission)
    })
  }

  return form ? <Form form={form.schema} onSubmit={handleSubmit} /> : null
}
```

---

## 🚀 Astro Integration

```astro
---
const form = await fetch('/forms/my_form/schema').then(r => r.json())
---

<div id="form"></div>
<script src="https://cdn.form.io/formiojs/formio.full.min.js"></script>
<script define:vars={{ form }}>
  Formio.createForm(document.getElementById('form'), form.schema)
    .then(f => f.on('submit', async (s) => {
      await fetch(form.submitUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(s)
      })
    }))
</script>
```

---

## 📋 Common Components

```json
// Text Field
{"type": "textfield", "key": "name", "label": "Name", "validate": {"required": true}}

// Email
{"type": "email", "key": "email", "label": "Email", "validate": {"required": true}}

// Textarea
{"type": "textarea", "key": "message", "label": "Message", "rows": 5}

// Select Dropdown
{"type": "select", "key": "country", "label": "Country", "data": {"values": [
  {"label": "USA", "value": "us"},
  {"label": "Canada", "value": "ca"}
]}}

// Checkbox
{"type": "checkbox", "key": "agree", "label": "I agree"}

// File Upload
{"type": "file", "key": "resume", "label": "Resume", "storage": "r2"}
```

---

## 🧙 Multi-Page Wizard

### Toggle Display Type
In builder UI: Click **"Multi-Page Wizard"** button at top

### Schema Structure
```json
{
  "display": "wizard",
  "components": [
    {
      "type": "panel",
      "title": "Page 1",
      "key": "page1",
      "components": [...]
    },
    {
      "type": "panel",
      "title": "Page 2",
      "key": "page2",
      "components": [...]
    }
  ]
}
```

---

## 🗺️ Google Maps (Address)

### Setup
1. Get API key from Google Cloud Console
2. In form builder, drag **Address** component
3. Click **Edit** → **Data** tab
4. Set **Map → Key** to your API key

### Schema
```json
{
  "type": "address",
  "key": "address",
  "label": "Address",
  "map": {
    "key": "YOUR_GOOGLE_MAPS_API_KEY"
  }
}
```

---

## 📤 Form Submission

### Client-Side
```typescript
const response = await fetch('/api/forms/form-id/submit', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    data: {
      name: "John Doe",
      email: "john@example.com"
    }
  })
})

const result = await response.json()
// { success: true, submissionId: "...", message: "..." }
```

### Server Response
```json
{
  "success": true,
  "submissionId": "660e8400-e29b-41d4-a716-446655440001",
  "message": "Form submitted successfully"
}
```

---

## 🔐 Authentication

### Require Auth for Form
1. Edit form in admin
2. Set `settings.requireAuth = true`
3. Save

### Submit with Auth Token
```typescript
await fetch('/api/forms/form-id/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({data})
})
```

---

## 📊 View Submissions

### Admin UI
```
/admin/forms/:id/submissions
```

### Query Database
```sql
SELECT * FROM form_submissions WHERE form_id = 'form-id';
```

### Access Submission Data
```typescript
const submission = await db.prepare(
  'SELECT submission_data FROM form_submissions WHERE id = ?'
).bind(submissionId).first()

const data = JSON.parse(submission.submission_data)
console.log(data.name, data.email)
```

---

## 🎨 Styling

### Link Form.io CSS
```html
<link rel="stylesheet" href="https://cdn.form.io/formiojs/formio.full.min.css">
```

### Custom CSS
```css
.formio-component-label { font-weight: 600; }
.formio-component-textfield input { border-radius: 0.5rem; }
.btn-primary { background: #3b82f6; }
```

---

## 🔧 Environment Variables

```bash
# wrangler.toml or .env
GOOGLE_MAPS_API_KEY=your-key-here
TURNSTILE_SITE_KEY=your-key-here
TURNSTILE_SECRET_KEY=your-key-here
```

---

## 🐛 Troubleshooting

### Form Not Found
- Check `is_active = 1` and `is_public = 1`
- Verify form name in URL matches database

### Components Not Rendering
- Ensure Form.io script is loaded
- Check browser console for errors
- Verify schema is valid JSON

### Submission Failing
- Check network tab for error response
- Verify `submitUrl` is correct
- Check form authentication settings

### Google Maps Not Working
- Verify API key is set in component `map.key`
- Check Google Cloud Console for API errors
- Enable Places API and Maps JavaScript API

---

## 📚 Documentation

```
/docs/FORMIO_COMPONENTS_CONFIG.md      → Component reference
/docs/FORMIO_WIZARD_FORMS.md           → Multi-page forms
/docs/GOOGLE_MAPS_SETUP.md             → Maps integration
/docs/TURNSTILE_INTEGRATION.md         → Spam protection
/docs/FORMS_API.md                     → API & programmatic creation
/docs/FORMS_HEADLESS_FRONTEND.md       → React/Vue/Angular/Astro
/docs/FORMS_COMPLETE_SUMMARY.md        → Full feature summary
```

---

## 🎯 Common Use Cases

✅ Contact forms  
✅ Registration forms  
✅ Job applications (with file upload)  
✅ Surveys  
✅ Event registration  
✅ Newsletter signup  
✅ Support tickets  
✅ Booking forms  
✅ Feedback forms  

---

## ⚡ Key Features

✅ Visual form builder  
✅ 40+ field types  
✅ Multi-page wizards  
✅ File uploads (R2)  
✅ Real-time validation  
✅ Headless JSON API  
✅ React/Vue/Angular support  
✅ 100% open source  

---

**Need help?** Check the full documentation:
- **[Forms Embedding Guide](./FORMS_EMBEDDING_GUIDE.md)** - How to embed forms on your website with custom styling
- **[Forms Headless Frontend](./FORMS_HEADLESS_FRONTEND.md)** - Framework-specific examples (React, Astro, Angular, Vue)
- **[Forms API Reference](./FORMS_API.md)** - Programmatic form creation
- **[Testing Suite](./FORMS_TESTING_SUITE.md)** - E2E, unit, and manual testing guides

