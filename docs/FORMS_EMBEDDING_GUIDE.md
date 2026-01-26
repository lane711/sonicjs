# How to Embed SonicJS Forms on Your Website

**Complete guide for embedding forms on your own site with custom styling.**

---

## 🎯 Overview

There are **three ways** to embed SonicJS forms on your website:

| Method | Best For | Styling Control | Difficulty |
|--------|----------|----------------|------------|
| **1. Direct API Integration** | Full control, custom styling | ✅ Full | Medium |
| **2. iFrame Embed** | Quick embed, minimal code | ⚠️ Limited | Easy |
| **3. JavaScript Widget** | Balance of ease and control | ✅ Good | Easy |

---

## Method 1: Direct API Integration (Recommended)

**Best for:** Developers who want full control over styling and behavior.

### Step 1: Fetch the Form Schema

```javascript
// Fetch form schema from SonicJS
const response = await fetch('https://your-sonicjs-site.com/forms/contact_form/schema');
const formData = await response.json();

// Response includes:
// - formData.schema (Form.io JSON schema)
// - formData.submitUrl (where to POST submissions)
// - formData.settings (button text, messages, etc.)
```

### Step 2: Render with Form.io Library

#### Option A: Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Your site's CSS -->
  <link rel="stylesheet" href="/your-styles.css">
  
  <!-- Form.io CSS (optional, for base styling) -->
  <link rel="stylesheet" href="https://cdn.form.io/formiojs/formio.full.min.css">
</head>
<body>
  <!-- Your site layout -->
  <div class="your-page-container">
    <h1>Contact Us</h1>
    
    <!-- Form container -->
    <div id="sonicjs-form"></div>
  </div>

  <!-- Form.io JS -->
  <script src="https://cdn.form.io/formiojs/formio.full.min.js"></script>
  
  <script>
    async function loadForm() {
      // 1. Fetch schema
      const response = await fetch('https://your-sonicjs-site.com/forms/contact_form/schema');
      const formData = await response.json();
      
      // 2. Render form
      const form = await Formio.createForm(
        document.getElementById('sonicjs-form'),
        formData.schema,
        {
          // Custom submit handler
          hooks: {
            beforeSubmit: (submission, next) => {
              next();
            }
          }
        }
      );
      
      // 3. Handle submission
      form.on('submit', async (submission) => {
        try {
          const result = await fetch(`https://your-sonicjs-site.com${formData.submitUrl}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: submission.data })
          });
          
          if (result.ok) {
            alert(formData.settings.successMessage || 'Form submitted successfully!');
            form.emit('submitDone', submission);
          }
        } catch (error) {
          console.error('Submission error:', error);
          form.emit('submitError', error);
        }
      });
    }
    
    loadForm();
  </script>
</body>
</html>
```

#### Option B: React

```tsx
import React, { useEffect, useState } from 'react';
import { Form } from '@formio/react';

function SonicJSForm({ formName }) {
  const [formSchema, setFormSchema] = useState(null);
  const [submitUrl, setSubmitUrl] = useState('');

  useEffect(() => {
    async function loadForm() {
      const response = await fetch(`https://your-sonicjs-site.com/forms/${formName}/schema`);
      const data = await response.json();
      setFormSchema(data.schema);
      setSubmitUrl(data.submitUrl);
    }
    loadForm();
  }, [formName]);

  const handleSubmit = async (submission) => {
    const response = await fetch(`https://your-sonicjs-site.com${submitUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: submission.data })
    });
    
    if (response.ok) {
      alert('Form submitted successfully!');
    }
  };

  if (!formSchema) return <div>Loading form...</div>;

  return (
    <div className="my-custom-form-wrapper">
      <Form form={formSchema} onSubmit={handleSubmit} />
    </div>
  );
}

export default SonicJSForm;
```

### Step 3: Apply Custom Styling

#### Override Form.io CSS with Your Site's Styles

```css
/* Your site's custom form styles */
.formio-component {
  margin-bottom: 1.5rem;
}

.formio-component label {
  font-family: 'Your Font', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  display: block;
}

.formio-component input,
.formio-component textarea,
.formio-component select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Your Font', sans-serif;
  font-size: 16px;
  transition: border-color 0.2s;
}

.formio-component input:focus,
.formio-component textarea:focus,
.formio-component select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Submit button */
.formio-component button[type="submit"] {
  background: #3b82f6;
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.formio-component button[type="submit"]:hover {
  background: #2563eb;
}

/* Error messages */
.formio-errors {
  color: #ef4444;
  font-size: 14px;
  margin-top: 0.25rem;
}

/* Success message */
.formio-component .alert-success {
  background: #10b981;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}
```

---

## Method 2: iFrame Embed

**Best for:** Quick embeds when you don't need deep styling customization.

### Basic iFrame Embed

```html
<iframe 
  src="https://your-sonicjs-site.com/forms/contact_form"
  width="100%"
  height="600"
  frameborder="0"
  style="border: 1px solid #e0e0e0; border-radius: 8px;"
></iframe>
```

### Responsive iFrame

```html
<div style="position: relative; padding-bottom: 100%; height: 0;">
  <iframe 
    src="https://your-sonicjs-site.com/forms/contact_form"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
  ></iframe>
</div>
```

### iFrame with Auto-Height (Advanced)

```html
<iframe 
  id="sonicjs-form-iframe"
  src="https://your-sonicjs-site.com/forms/contact_form"
  width="100%"
  frameborder="0"
></iframe>

<script>
  // Auto-adjust height based on content
  window.addEventListener('message', function(event) {
    if (event.origin === 'https://your-sonicjs-site.com') {
      const iframe = document.getElementById('sonicjs-form-iframe');
      if (event.data.type === 'formHeight') {
        iframe.style.height = event.data.height + 'px';
      }
    }
  });
</script>
```

### Styling Limitations with iFrame

⚠️ **Important:** iFrames have **limited styling control** due to cross-origin restrictions. You can:
- ✅ Control iframe container (border, shadow, margin)
- ❌ Cannot override internal form styles
- ❌ Cannot match your site's fonts/colors exactly

**Solution:** Use Method 1 (Direct API Integration) for full styling control.

---

## Method 3: JavaScript Widget (Coming Soon)

**Best for:** Non-developers who want a simple embed code with decent styling.

### Widget Code (Future Feature)

```html
<!-- Simple embed widget (planned feature) -->
<div id="sonicjs-form-widget" data-form="contact_form"></div>
<script src="https://your-sonicjs-site.com/widgets/forms.js"></script>
<script>
  SonicJSForms.init({
    container: '#sonicjs-form-widget',
    form: 'contact_form',
    theme: 'auto', // Detects your site's colors
    customStyles: {
      primaryColor: '#3b82f6',
      fontFamily: 'Your Font'
    }
  });
</script>
```

---

## 🎨 Styling Your Forms

### Strategy 1: No Form.io CSS (Full Custom Styling)

**Don't load** Form.io's CSS and write all styles from scratch:

```html
<!-- DON'T include this: -->
<!-- <link rel="stylesheet" href="https://cdn.form.io/formiojs/formio.full.min.css"> -->

<!-- Only include Form.io JS: -->
<script src="https://cdn.form.io/formiojs/formio.full.min.js"></script>
```

Then create your own CSS targeting `.formio-component` classes.

### Strategy 2: Form.io CSS + Overrides (Easiest)

Load Form.io's CSS as a **base**, then override specific styles:

```html
<!-- Load base styles -->
<link rel="stylesheet" href="https://cdn.form.io/formiojs/formio.full.min.css">

<!-- Your overrides -->
<style>
  /* Override colors */
  .formio-component .btn-primary {
    background: var(--your-brand-color) !important;
  }
  
  /* Override fonts */
  .formio-component * {
    font-family: var(--your-font-stack) !important;
  }
</style>
```

### Strategy 3: CSS Variables (Best for Themes)

Define CSS variables for easy theming:

```css
:root {
  --form-primary-color: #3b82f6;
  --form-border-color: #e0e0e0;
  --form-border-radius: 8px;
  --form-input-padding: 0.75rem;
  --form-font-family: 'Inter', sans-serif;
}

.formio-component input,
.formio-component select,
.formio-component textarea {
  border: 2px solid var(--form-border-color);
  border-radius: var(--form-border-radius);
  padding: var(--form-input-padding);
  font-family: var(--form-font-family);
}

.formio-component button[type="submit"] {
  background: var(--form-primary-color);
  border-radius: var(--form-border-radius);
}
```

---

## 📱 Making Forms Responsive

### Mobile-Friendly CSS

```css
/* Desktop styles */
.formio-component {
  max-width: 600px;
  margin: 0 auto;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .formio-component input,
  .formio-component textarea,
  .formio-component select {
    font-size: 16px; /* Prevents iOS zoom */
    padding: 1rem;
  }
  
  .formio-component button[type="submit"] {
    width: 100%;
    padding: 1rem;
  }
}
```

---

## 🔐 Handling Authentication

If your form requires authentication, include credentials:

```javascript
// Fetch with auth
const response = await fetch('https://your-sonicjs-site.com/forms/private_form/schema', {
  credentials: 'include', // Send cookies
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN' // Or use Bearer token
  }
});

// Submit with auth
await fetch(submitUrl, {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({ data: submission.data })
});
```

---

## 🌐 CORS Configuration

To embed forms on external domains, ensure your SonicJS instance allows CORS:

```typescript
// In your SonicJS wrangler.toml or middleware
app.use('*', async (c, next) => {
  c.res.headers.set('Access-Control-Allow-Origin', 'https://your-external-site.com');
  c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.res.headers.set('Access-Control-Allow-Credentials', 'true');
  
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }
  
  await next();
});
```

---

## 🎯 Complete Working Example

### HTML + Vanilla JS with Full Custom Styling

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Us</title>
  
  <style>
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f9fafb;
      padding: 2rem;
      margin: 0;
    }
    
    .page-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    h1 {
      color: #1f2937;
      margin-bottom: 1.5rem;
    }
    
    /* Form styling */
    .formio-component {
      margin-bottom: 1.5rem;
    }
    
    .formio-component label {
      display: block;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }
    
    .formio-component input:not([type="checkbox"]):not([type="radio"]),
    .formio-component textarea,
    .formio-component select {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #d1d5db;
      border-radius: 8px;
      font-size: 16px;
      font-family: inherit;
      transition: all 0.2s;
    }
    
    .formio-component input:focus,
    .formio-component textarea:focus,
    .formio-component select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .formio-component button[type="submit"] {
      background: #3b82f6;
      color: white;
      padding: 0.875rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      transition: background 0.2s;
    }
    
    .formio-component button[type="submit"]:hover {
      background: #2563eb;
    }
    
    .formio-errors {
      color: #ef4444;
      font-size: 14px;
      margin-top: 0.25rem;
    }
    
    .alert-success {
      background: #10b981;
      color: white;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }
    
    #loading {
      text-align: center;
      color: #6b7280;
      padding: 2rem;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <h1>📧 Contact Us</h1>
    
    <div id="loading">Loading form...</div>
    <div id="sonicjs-form" style="display: none;"></div>
  </div>

  <script src="https://cdn.form.io/formiojs/formio.full.min.js"></script>
  
  <script>
    const SONICJS_API = 'https://your-sonicjs-site.com';
    const FORM_NAME = 'contact_form';
    
    async function loadForm() {
      try {
        // 1. Fetch form schema
        const response = await fetch(`${SONICJS_API}/forms/${FORM_NAME}/schema`);
        if (!response.ok) throw new Error('Failed to load form');
        
        const formData = await response.json();
        
        // 2. Hide loading, show form
        document.getElementById('loading').style.display = 'none';
        document.getElementById('sonicjs-form').style.display = 'block';
        
        // 3. Render form
        const form = await Formio.createForm(
          document.getElementById('sonicjs-form'),
          formData.schema
        );
        
        // 4. Handle submission
        form.on('submit', async (submission) => {
          try {
            const result = await fetch(`${SONICJS_API}${formData.submitUrl}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data: submission.data })
            });
            
            const data = await result.json();
            
            if (result.ok) {
              // Show success message
              const successMsg = formData.settings.successMessage || 'Thank you! Your form has been submitted.';
              const alertDiv = document.createElement('div');
              alertDiv.className = 'alert-success';
              alertDiv.textContent = successMsg;
              form.element.prepend(alertDiv);
              
              // Reset form
              form.emit('submitDone', submission);
              form.reset();
              
              // Scroll to top
              form.element.scrollIntoView({ behavior: 'smooth' });
            } else {
              throw new Error(data.error || 'Submission failed');
            }
          } catch (error) {
            console.error('Submission error:', error);
            alert('Failed to submit form. Please try again.');
            form.emit('submitError', error);
          }
        });
        
      } catch (error) {
        console.error('Error loading form:', error);
        document.getElementById('loading').innerHTML = 
          '<p style="color: #ef4444;">Failed to load form. Please refresh the page.</p>';
      }
    }
    
    // Load form when page is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadForm);
    } else {
      loadForm();
    }
  </script>
</body>
</html>
```

---

## 🔧 Troubleshooting

### Form Not Loading
- ✅ Check browser console for errors
- ✅ Verify CORS is configured correctly
- ✅ Ensure form is set to "public" in SonicJS admin

### Styling Not Applied
- ✅ Use `!important` to override Form.io default styles
- ✅ Check CSS specificity (use browser DevTools)
- ✅ Ensure custom CSS loads **after** Form.io CSS

### Submissions Not Working
- ✅ Check network tab for failed POST requests
- ✅ Verify `submitUrl` in schema response
- ✅ Ensure authentication is handled if required

---

## 📚 Additional Resources

- **[Forms Headless Frontend Guide](./FORMS_HEADLESS_FRONTEND.md)** - Framework-specific examples (React, Astro, Angular, Vue, Svelte)
- **[Forms Quick Reference](./FORMS_QUICK_REFERENCE.md)** - Cheat sheet for common tasks
- **[Form.io Documentation](https://help.form.io/)** - Official Form.io docs
- **[SonicJS Forms API](./FORMS_API.md)** - Complete API reference

---

## 🆘 Need Help?

- 💬 **Discord:** Join our community for support
- 📧 **Email:** support@sonicjs.com
- 🐛 **Issues:** GitHub Issues
- 📖 **Docs:** Full documentation at docs.sonicjs.com

---

**Created:** January 2026  
**Last Updated:** January 2026  
**Version:** 1.0.0
