# Form.io CodePen Examples & References
**For Phase 2 Implementation**

---

## 🎯 Live Examples

### 1. Full Form Builder Demo
**URL:** https://codepen.io/travist/full/xVyMjo/

**What it shows:**
- Complete Form.io form builder in action
- Drag & drop interface
- Field configuration
- Live preview
- Form rendering

**Key takeaways for our implementation:**
- Builder initialization code
- How to handle form schema
- Event listeners for save/load
- Preview functionality

---

## 📝 Implementation Notes for Tomorrow

### What to copy from the example:

**1. Form.io Builder Initialization:**
```javascript
Formio.builder(document.getElementById('builder'), {
  // Initial form schema (can be empty for new forms)
}, {
  // Builder options
  builder: {
    premium: false,
    data: false,
    advanced: false,
    layout: true,
    basic: true
  }
}).then(function(builder) {
  // Builder is ready
  builder.on('change', function(schema) {
    console.log('Form schema changed:', schema);
  });
});
```

**2. Getting Form Schema:**
```javascript
const schema = builder.schema;
// This is what we save to our `forms.formio_schema` column
```

**3. Rendering a Form:**
```javascript
Formio.createForm(document.getElementById('formio'), schema).then(function(form) {
  form.on('submit', function(submission) {
    console.log('Submission:', submission);
  });
});
```

---

## 🎨 UI Integration Strategy

### Our Admin Builder Page Structure:
```html
<div class="builder-page">
  <!-- Header -->
  <div class="header">
    <h1>Form Builder: Contact Form</h1>
    <button id="save-btn">Save</button>
    <button id="preview-btn">Preview</button>
  </div>
  
  <!-- Form.io Builder Container -->
  <div id="builder"></div>
</div>
```

### CSS to Match SonicJS Theme:
```css
/* Make Form.io match our dark theme */
.formio-builder {
  background: transparent;
  color: inherit;
}

.formio-builder .formio-component {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}
```

---

## 🔧 Phase 2 Implementation Checklist

Using the CodePen example as reference:

### Form Builder Page:
- [ ] Load Form.io CDN scripts
- [ ] Initialize builder with existing schema (if editing)
- [ ] Listen for `change` events
- [ ] Implement save button (PUT to `/api/admin/forms/:id`)
- [ ] Implement preview modal
- [ ] Style to match SonicJS theme

### Save Functionality:
```javascript
document.getElementById('save-btn').addEventListener('click', async () => {
  const schema = builder.schema;
  
  const response = await fetch(`/api/admin/forms/${formId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formio_schema: schema })
  });
  
  if (response.ok) {
    showNotification('Form saved!');
  }
});
```

### Preview Functionality:
```javascript
document.getElementById('preview-btn').addEventListener('click', () => {
  const schema = builder.schema;
  
  // Open modal with form preview
  const modal = document.getElementById('preview-modal');
  modal.classList.remove('hidden');
  
  // Render form in preview
  Formio.createForm(
    document.getElementById('preview-container'),
    schema
  );
});
```

---

## 📚 Additional Form.io Resources

### Official Docs:
- Builder API: https://github.com/formio/formio.js/wiki/Form-Builder
- Form Renderer: https://github.com/formio/formio.js/wiki/Form-Renderer
- Components: https://help.form.io/userguide/forms/form-components

### CDN Links (Use These):
```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.form.io/formiojs/formio.full.min.css">

<!-- JavaScript -->
<script src="https://cdn.form.io/formiojs/formio.full.min.js"></script>
```

### Version Pinning (For Production):
```html
<!-- Pin to specific version for stability -->
<link rel="stylesheet" href="https://cdn.form.io/formiojs/5.0.0/formio.full.min.css">
<script src="https://cdn.form.io/formiojs/5.0.0/formio.full.min.js"></script>
```

---

## 🎯 Tomorrow's Quick Reference

1. **Start here:** Copy CodePen structure
2. **Wrap it in:** SonicJS admin layout
3. **Connect to:** Our database (forms table)
4. **Test with:** Sample contact form from migration

**CodePen URL:** https://codepen.io/travist/full/xVyMjo/

---

**This example will save hours of figuring out the Form.io API!** 🚀
