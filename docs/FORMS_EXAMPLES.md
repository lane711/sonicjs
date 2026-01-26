# SonicJS Forms - Interactive Examples

**Live, interactive examples showcasing all features of the SonicJS Forms system.**

---

## 🎯 Navigation

- [Basic Form Examples](#-basic-form-examples)
- [Multi-Page Wizards](#-multi-page-wizards)
- [Advanced Components](#-advanced-components)
- [Validation & Conditional Logic](#-validation--conditional-logic)
- [Headless Integration](#-headless-integration)
- [Custom Styling](#-custom-styling)
- [File Uploads](#-file-uploads)
- [Embedding Examples](#-embedding-examples)

---

## 📝 Basic Form Examples

### Example 1: Simple Contact Form

**What it demonstrates:** Basic text fields, email validation, text area, and submit button.

#### Live Preview
```
http://localhost:8787/forms/simple_contact
```

#### Schema (JSON)
```json
{
  "display": "form",
  "components": [
    {
      "type": "textfield",
      "key": "name",
      "label": "Full Name",
      "placeholder": "Enter your name",
      "validate": {
        "required": true,
        "minLength": 2,
        "maxLength": 100
      }
    },
    {
      "type": "email",
      "key": "email",
      "label": "Email Address",
      "placeholder": "you@example.com",
      "validate": {
        "required": true
      }
    },
    {
      "type": "textarea",
      "key": "message",
      "label": "Message",
      "placeholder": "How can we help you?",
      "rows": 5,
      "validate": {
        "required": true,
        "minLength": 10
      }
    },
    {
      "type": "button",
      "action": "submit",
      "label": "Send Message",
      "theme": "primary"
    }
  ]
}
```

#### How to Create
```typescript
// Via API
await fetch('/admin/forms', {
  method: 'POST',
  body: new URLSearchParams({
    name: 'simple_contact',
    displayName: 'Simple Contact Form',
    category: 'contact'
  })
});

// Then use builder to add components
```

---

### Example 2: Newsletter Signup

**What it demonstrates:** Minimal form with checkbox for consent.

#### Live Preview
```
http://localhost:8787/forms/newsletter_signup
```

#### Schema
```json
{
  "display": "form",
  "components": [
    {
      "type": "email",
      "key": "email",
      "label": "Email Address",
      "validate": { "required": true }
    },
    {
      "type": "checkbox",
      "key": "consent",
      "label": "I agree to receive marketing emails",
      "validate": { "required": true }
    },
    {
      "type": "button",
      "action": "submit",
      "label": "Subscribe"
    }
  ]
}
```

---

### Example 3: Feedback Survey

**What it demonstrates:** Radio buttons, select dropdowns, ratings.

#### Schema
```json
{
  "display": "form",
  "components": [
    {
      "type": "radio",
      "key": "satisfaction",
      "label": "How satisfied are you with our service?",
      "values": [
        { "label": "Very Satisfied", "value": "very_satisfied" },
        { "label": "Satisfied", "value": "satisfied" },
        { "label": "Neutral", "value": "neutral" },
        { "label": "Dissatisfied", "value": "dissatisfied" },
        { "label": "Very Dissatisfied", "value": "very_dissatisfied" }
      ],
      "validate": { "required": true }
    },
    {
      "type": "select",
      "key": "category",
      "label": "What category best describes your feedback?",
      "data": {
        "values": [
          { "label": "Product Quality", "value": "quality" },
          { "label": "Customer Service", "value": "service" },
          { "label": "Pricing", "value": "pricing" },
          { "label": "Delivery", "value": "delivery" },
          { "label": "Other", "value": "other" }
        ]
      }
    },
    {
      "type": "textarea",
      "key": "comments",
      "label": "Additional Comments",
      "rows": 4
    }
  ]
}
```

---

## 🧙 Multi-Page Wizards

### Example 4: Job Application Wizard

**What it demonstrates:** Multi-step form with personal info → experience → upload resume.

#### Live Preview
```
http://localhost:8787/forms/job_application
```

#### Schema Structure
```json
{
  "display": "wizard",
  "components": [
    {
      "type": "panel",
      "key": "personalInfo",
      "title": "Personal Information",
      "components": [
        {
          "type": "textfield",
          "key": "firstName",
          "label": "First Name",
          "validate": { "required": true }
        },
        {
          "type": "textfield",
          "key": "lastName",
          "label": "Last Name",
          "validate": { "required": true }
        },
        {
          "type": "email",
          "key": "email",
          "label": "Email",
          "validate": { "required": true }
        },
        {
          "type": "phoneNumber",
          "key": "phone",
          "label": "Phone Number"
        }
      ]
    },
    {
      "type": "panel",
      "key": "experience",
      "title": "Work Experience",
      "components": [
        {
          "type": "textfield",
          "key": "currentPosition",
          "label": "Current Position"
        },
        {
          "type": "textfield",
          "key": "currentCompany",
          "label": "Current Company"
        },
        {
          "type": "number",
          "key": "yearsExperience",
          "label": "Years of Experience",
          "validate": { "min": 0, "max": 50 }
        }
      ]
    },
    {
      "type": "panel",
      "key": "documents",
      "title": "Documents",
      "components": [
        {
          "type": "file",
          "key": "resume",
          "label": "Upload Resume",
          "storage": "r2",
          "fileTypes": [
            { "label": "PDF", "value": "application/pdf" },
            { "label": "Word", "value": "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
          ],
          "validate": { "required": true }
        },
        {
          "type": "textarea",
          "key": "coverLetter",
          "label": "Cover Letter",
          "rows": 8
        }
      ]
    }
  ]
}
```

#### Navigation Features
- ✅ Previous/Next buttons auto-generated
- ✅ Progress indicator shows current step
- ✅ Per-page validation (can't proceed with errors)
- ✅ Data persists when going back/forward

---

### Example 5: Product Registration Wizard

**What it demonstrates:** Conditional pages based on previous answers.

#### Conditional Logic
```json
{
  "display": "wizard",
  "components": [
    {
      "type": "panel",
      "key": "productType",
      "title": "Product Type",
      "components": [
        {
          "type": "select",
          "key": "type",
          "label": "What product did you purchase?",
          "data": {
            "values": [
              { "label": "Software", "value": "software" },
              { "label": "Hardware", "value": "hardware" }
            ]
          }
        }
      ]
    },
    {
      "type": "panel",
      "key": "softwareDetails",
      "title": "Software Details",
      "conditional": {
        "show": true,
        "when": "type",
        "eq": "software"
      },
      "components": [
        {
          "type": "textfield",
          "key": "licenseKey",
          "label": "License Key"
        }
      ]
    },
    {
      "type": "panel",
      "key": "hardwareDetails",
      "title": "Hardware Details",
      "conditional": {
        "show": true,
        "when": "type",
        "eq": "hardware"
      },
      "components": [
        {
          "type": "textfield",
          "key": "serialNumber",
          "label": "Serial Number"
        }
      ]
    }
  ]
}
```

---

## 🎨 Advanced Components

### Example 6: Address with Google Maps

**What it demonstrates:** Google Maps autocomplete for addresses.

#### Configuration
```json
{
  "type": "address",
  "key": "address",
  "label": "Delivery Address",
  "map": {
    "key": "YOUR_GOOGLE_MAPS_API_KEY",
    "region": "US"
  },
  "provider": "google",
  "validate": { "required": true }
}
```

#### Setup Required
1. Get Google Maps API key
2. Enable Places API and Maps JavaScript API
3. Add key to component's `map.key` field in builder

**See:** [Google Maps Setup Guide](./GOOGLE_MAPS_SETUP.md)

---

### Example 7: Signature Component

**What it demonstrates:** Digital signature capture.

```json
{
  "type": "signature",
  "key": "signature",
  "label": "Sign Here",
  "width": "100%",
  "height": "150px",
  "penColor": "black",
  "backgroundColor": "rgb(245,245,245)",
  "validate": { "required": true }
}
```

---

### Example 8: Date & Time Picker

**What it demonstrates:** Date selection with validation.

```json
{
  "type": "datetime",
  "key": "appointmentDate",
  "label": "Preferred Appointment Date",
  "format": "yyyy-MM-dd",
  "enableDate": true,
  "enableTime": false,
  "validate": {
    "required": true
  },
  "datePicker": {
    "minDate": "2026-01-01",
    "maxDate": "2026-12-31",
    "disable": ["2026-12-25", "2026-01-01"]
  }
}
```

---

## ✅ Validation & Conditional Logic

### Example 9: Dynamic Field Visibility

**What it demonstrates:** Show/hide fields based on user input.

```json
{
  "components": [
    {
      "type": "checkbox",
      "key": "hasCompany",
      "label": "I'm registering on behalf of a company"
    },
    {
      "type": "textfield",
      "key": "companyName",
      "label": "Company Name",
      "conditional": {
        "show": true,
        "when": "hasCompany",
        "eq": true
      },
      "validate": { "required": true }
    },
    {
      "type": "textfield",
      "key": "taxId",
      "label": "Tax ID",
      "conditional": {
        "show": true,
        "when": "hasCompany",
        "eq": true
      }
    }
  ]
}
```

---

### Example 10: Complex Validation Rules

**What it demonstrates:** Custom validation patterns.

```json
{
  "components": [
    {
      "type": "textfield",
      "key": "username",
      "label": "Username",
      "validate": {
        "required": true,
        "minLength": 3,
        "maxLength": 20,
        "pattern": "^[a-zA-Z0-9_]+$",
        "customMessage": "Username must be 3-20 characters and contain only letters, numbers, and underscores"
      }
    },
    {
      "type": "password",
      "key": "password",
      "label": "Password",
      "validate": {
        "required": true,
        "minLength": 8,
        "pattern": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]",
        "customMessage": "Password must contain uppercase, lowercase, number, and special character"
      }
    },
    {
      "type": "password",
      "key": "confirmPassword",
      "label": "Confirm Password",
      "validate": {
        "required": true,
        "custom": "valid = (input === data.password) ? true : 'Passwords must match';"
      }
    }
  ]
}
```

---

## 🌐 Headless Integration

### Example 11: React Integration

**Live Demo:** See full code in [FORMS_HEADLESS_FRONTEND.md](./FORMS_HEADLESS_FRONTEND.md)

```tsx
import { Form } from '@formio/react';

function ContactForm() {
  const [schema, setSchema] = useState(null);

  useEffect(() => {
    fetch('https://your-api.com/forms/contact/schema')
      .then(r => r.json())
      .then(data => setSchema(data.schema));
  }, []);

  const handleSubmit = async (submission) => {
    await fetch('https://your-api.com/api/forms/contact/submit', {
      method: 'POST',
      body: JSON.stringify({ data: submission.data })
    });
  };

  return schema ? <Form form={schema} onSubmit={handleSubmit} /> : <div>Loading...</div>;
}
```

---

### Example 12: Astro SSG Integration

```astro
---
// Fetch form at build time
const response = await fetch('https://your-api.com/forms/contact/schema');
const formData = await response.json();
---

<div id="contact-form"></div>

<script define:vars={{ formData }}>
  import('https://cdn.form.io/formiojs/formio.full.min.js').then(({ default: Formio }) => {
    Formio.createForm(document.getElementById('contact-form'), formData.schema);
  });
</script>
```

---

## 🎨 Custom Styling

### Example 13: Minimal Form (No Form.io CSS)

**What it demonstrates:** 100% custom styles, no Form.io defaults.

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Custom styles only - no Form.io CSS */
    .formio-component { margin-bottom: 1.5rem; }
    .formio-component label { 
      display: block; 
      font-weight: 600; 
      margin-bottom: 0.5rem; 
    }
    .formio-component input,
    .formio-component textarea { 
      width: 100%; 
      padding: 0.75rem; 
      border: 2px solid #e0e0e0; 
      border-radius: 8px; 
    }
    .formio-component button[type="submit"] { 
      background: #3b82f6; 
      color: white; 
      padding: 0.875rem 2rem; 
      border: none; 
      border-radius: 8px; 
      cursor: pointer; 
    }
  </style>
</head>
<body>
  <div id="form"></div>
  
  <!-- Only include JS, not CSS -->
  <script src="https://cdn.form.io/formiojs/formio.full.min.js"></script>
  <script>
    fetch('/forms/contact/schema')
      .then(r => r.json())
      .then(data => Formio.createForm(document.getElementById('form'), data.schema));
  </script>
</body>
</html>
```

**See:** [Forms Embedding Guide](./FORMS_EMBEDDING_GUIDE.md) for complete styling examples.

---

### Example 14: Themed Form with CSS Variables

```html
<style>
  :root {
    --form-primary: #8b5cf6;
    --form-border: #d1d5db;
    --form-radius: 12px;
  }
  
  .formio-component input,
  .formio-component select { 
    border: 2px solid var(--form-border);
    border-radius: var(--form-radius);
  }
  
  .formio-component button[type="submit"] { 
    background: var(--form-primary);
    border-radius: var(--form-radius);
  }
</style>
```

---

## 📤 File Uploads

### Example 15: Resume Upload Form

**What it demonstrates:** File upload to Cloudflare R2.

```json
{
  "components": [
    {
      "type": "textfield",
      "key": "fullName",
      "label": "Full Name",
      "validate": { "required": true }
    },
    {
      "type": "email",
      "key": "email",
      "label": "Email",
      "validate": { "required": true }
    },
    {
      "type": "file",
      "key": "resume",
      "label": "Upload Resume",
      "storage": "r2",
      "url": "/api/forms/upload",
      "fileTypes": [
        { "label": "PDF", "value": "application/pdf" },
        { "label": "Word", "value": "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
      ],
      "fileMaxSize": "5MB",
      "validate": { "required": true }
    }
  ]
}
```

#### R2 Configuration
File uploads are automatically stored in Cloudflare R2 when `storage: "r2"` is set. Files are tracked in the `form_files` table.

---

### Example 16: Multiple File Upload

```json
{
  "type": "file",
  "key": "documents",
  "label": "Upload Documents",
  "multiple": true,
  "storage": "r2",
  "fileMaxSize": "10MB",
  "fileMinSize": "1KB"
}
```

---

## 🔗 Embedding Examples

### Example 17: iFrame Embed

**Quickest way to embed a form:**

```html
<iframe 
  src="https://your-sonicjs-site.com/forms/contact_form"
  width="100%"
  height="600"
  frameborder="0"
  style="border: 1px solid #e0e0e0; border-radius: 8px;"
></iframe>
```

**Pros:**
- ✅ Instant embed, no coding required
- ✅ Form updates automatically

**Cons:**
- ⚠️ Limited styling control
- ⚠️ Can't match your site's exact design

---

### Example 18: JavaScript Embed with Custom Styles

**Best for matching your site's design:**

```html
<div id="my-form"></div>

<script src="https://cdn.form.io/formiojs/formio.full.min.js"></script>
<script>
  fetch('https://your-api.com/forms/contact/schema')
    .then(r => r.json())
    .then(data => {
      Formio.createForm(document.getElementById('my-form'), data.schema);
    });
</script>

<style>
  /* Your site's styles */
  #my-form .formio-component input {
    font-family: inherit;
    border: 2px solid var(--your-brand-color);
  }
</style>
```

---

## 🧪 Try It Yourself

### Create a Test Form

1. **Go to the builder:**
   ```
   http://localhost:8787/admin/forms/new
   ```

2. **Create a simple form:**
   - Name: `test_form`
   - Display Name: `My Test Form`

3. **Add components:**
   - Drag "Text Field" from sidebar
   - Configure label and validation
   - Drag "Email" field
   - Drag "Text Area"
   - Drag "Button" (Submit)

4. **Save and test:**
   - Click "Save Form"
   - Visit `/forms/test_form`
   - Submit and check `/admin/forms/{id}/submissions`

---

## 📊 Complex Examples

### Example 19: Event Registration with Payment

```json
{
  "display": "wizard",
  "components": [
    {
      "type": "panel",
      "key": "attendeeInfo",
      "title": "Attendee Information",
      "components": [
        { "type": "textfield", "key": "name", "label": "Full Name" },
        { "type": "email", "key": "email", "label": "Email" },
        { "type": "phoneNumber", "key": "phone", "label": "Phone" }
      ]
    },
    {
      "type": "panel",
      "key": "ticketSelection",
      "title": "Ticket Selection",
      "components": [
        {
          "type": "select",
          "key": "ticketType",
          "label": "Ticket Type",
          "data": {
            "values": [
              { "label": "Early Bird - $99", "value": "early_bird" },
              { "label": "Regular - $149", "value": "regular" },
              { "label": "VIP - $299", "value": "vip" }
            ]
          }
        },
        {
          "type": "number",
          "key": "quantity",
          "label": "Number of Tickets",
          "defaultValue": 1,
          "validate": { "min": 1, "max": 10 }
        }
      ]
    },
    {
      "type": "panel",
      "key": "payment",
      "title": "Payment",
      "components": [
        {
          "type": "htmlelement",
          "key": "totalPrice",
          "tag": "div",
          "content": "<p><strong>Total:</strong> <span id='total'>$0</span></p>"
        }
      ]
    }
  ]
}
```

---

## 🎯 Best Practices Demonstrated

### ✅ Form Design
- Keep forms under 10 fields when possible
- Use wizards for forms >6 fields
- Group related fields in panels
- Use clear, actionable button text
- Provide helpful placeholder text

### ✅ Validation
- Mark required fields clearly
- Provide instant feedback on errors
- Use appropriate input types (email, tel, number)
- Add custom validation messages
- Validate before allowing progression

### ✅ User Experience
- Show progress in wizards
- Allow users to go back and edit
- Persist data between pages
- Show clear success messages
- Handle errors gracefully

### ✅ Performance
- Lazy load forms with scripts
- Use CDN for Form.io library
- Minimize custom CSS
- Cache form schemas
- Optimize file upload sizes

---

## 📚 Related Documentation

- **[Quick Reference](./FORMS_QUICK_REFERENCE.md)** - One-page cheat sheet
- **[Embedding Guide](./FORMS_EMBEDDING_GUIDE.md)** - How to embed forms with custom styling
- **[Headless Frontend](./FORMS_HEADLESS_FRONTEND.md)** - React, Astro, Angular, Vue examples
- **[API Reference](./FORMS_API.md)** - Programmatic form creation
- **[Wizard Forms](./FORMIO_WIZARD_FORMS.md)** - Multi-page forms guide
- **[Testing Guide](./FORMS_TESTING_SUITE.md)** - E2E, unit, and manual tests

---

## 🆘 Need More Examples?

**Can't find what you're looking for?**

- 📖 Check [Form.io Examples](https://formio.github.io/formio.js/app/examples/) for more Form.io features
- 💬 Join our Discord for help
- 🐛 Open a GitHub issue for documentation requests
- 📧 Contact support@sonicjs.com

---

**Last Updated:** January 2026  
**Version:** 1.0.0
