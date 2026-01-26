# 📸 PR Screenshot Guide - Form.io + Turnstile Integration

## Screenshots to Take

### 1. Form Builder Interface
**URL**: http://localhost:8787/admin/forms/{any-form-id}/builder

**What to show:**
- Left sidebar with component groups (Basic Fields, Layout, Premium, Advanced)
- Center canvas with form preview
- Right sidebar with component settings
- Top toolbar with Save, Preview, View Public Form buttons
- Glass-morphism dark theme

**Tips:**
- Drag a few components to show the builder in action
- Show the Turnstile component in the Premium section

---

### 2. Turnstile Component in Premium Section
**URL**: http://localhost:8787/admin/forms/{any-form-id}/builder

**What to show:**
- Close-up of the left sidebar
- Premium section expanded
- **Turnstile** component with shield icon (🛡️)
- File and Signature components below it

**Tips:**
- Make sure Premium section is visible
- Highlight the Turnstile component

---

### 3. Turnstile Placeholder in Builder
**URL**: http://localhost:8787/admin/forms/{any-form-id}/builder

**What to show:**
- Form canvas with Turnstile component dragged in
- Beautiful gradient placeholder with:
  - 🛡️ Shield emoji
  - "Turnstile Verification" title
  - "CAPTCHA-free bot protection by Cloudflare" subtitle
  - "Widget will appear here on the live form" note

**Tips:**
- Drag Turnstile into a form
- Show it between other fields for context

---

### 4. Live Turnstile Widget on Public Form
**URL**: http://localhost:8787/forms/{form-name}

**What to show:**
- Full public form with fields
- **Live Turnstile widget** (actual Cloudflare widget, not placeholder)
- Submit button below
- Clean, professional styling

**Tips:**
- Use a form that has Turnstile component
- Show the form in action

---

### 5. Quick Reference Page
**URL**: http://localhost:8787/admin/forms/docs

**What to show:**
- Left sidebar navigation with all field types
- **Turnstile section** highlighted in sidebar
- Right content area showing Turnstile documentation
- Configuration examples with JSON schemas

**Tips:**
- Click on "Turnstile" in sidebar to show that section
- Show both sidebar and content

---

### 6. Examples Page - Turnstile Section
**URL**: http://localhost:8787/admin/forms/examples#turnstile-protection

**What to show:**
- Left sidebar with "🛡️ Turnstile Protection" highlighted
- Right content with:
  - Feature highlights box (purple gradient)
  - Live example form with Turnstile
  - Setup instructions
  - Pro tip

**Tips:**
- Click "Turnstile Protection" in sidebar
- Show the full page with form and documentation

---

### 7. Forms List Page with New Buttons
**URL**: http://localhost:8787/admin/forms

**What to show:**
- Header with three colorful buttons:
  - **Examples** (blue)
  - **Quick Reference** (purple)
  - **Create Form** (green)
- Forms table below
- Clean layout

**Tips:**
- Show the full page header with buttons
- Highlight the new styling

---

### 8. Multi-Page Wizard
**URL**: http://localhost:8787/admin/forms/examples#wizard-form

**What to show:**
- Multi-step form with step indicators
- Step 1, 2, 3 buttons at top
- Form fields for current step
- Previous/Next navigation buttons

**Tips:**
- Click on "Multi-Page Wizard" in examples page
- Show a wizard in action

---

### 9. Form Submission Success
**URL**: http://localhost:8787/forms/{form-name}

**What to show:**
- Success message after form submission
- "Thank you for your submission!" or similar
- Green success styling
- Form data cleared

**Tips:**
- Fill out a form completely
- Complete Turnstile challenge
- Submit form
- Capture success message

---

### 10. Turnstile Settings in Plugin
**URL**: http://localhost:8787/admin/settings/plugins

**What to show:**
- Turnstile plugin enabled
- Settings form with:
  - Site Key field
  - Secret Key field
  - Theme dropdown
  - Size dropdown
  - Mode dropdown
- Save button

**Tips:**
- Enable Turnstile plugin
- Show configuration options

---

## How to Take Screenshots

### Option 1: Browser Developer Tools (Recommended)
1. Open the page you want to screenshot
2. Press F12 to open DevTools
3. Press Ctrl+Shift+P (Cmd+Shift+P on Mac)
4. Type "screenshot"
5. Select "Capture full size screenshot"
6. Save the image

### Option 2: Browser Extensions
- **Awesome Screenshot** (Chrome/Firefox)
- **Nimbus Screenshot** (Chrome/Firefox)
- **Lightshot** (Windows/Mac/Linux)

### Option 3: OS Tools
- **Windows**: Windows Key + Shift + S
- **Mac**: Command + Shift + 4
- **Linux**: Flameshot, Spectacle, or Shutter

---

## How to Add Screenshots to PR

### Method 1: Direct Upload (Easiest)
1. Go to PR: https://github.com/SonicJs-Org/sonicjs/pull/571
2. Click "Edit" button on PR description
3. Drag and drop your screenshots into the editor
4. GitHub will automatically upload and generate markdown
5. Replace the `<!-- TODO: Add screenshot -->` comments with the uploaded images
6. Click "Update comment"

### Method 2: GitHub Issues
1. Create a new comment on the PR
2. Drag and drop screenshots
3. GitHub generates URLs like: `https://user-images.githubusercontent.com/...`
4. Copy those URLs
5. Edit PR description
6. Add markdown: `![Caption](URL)`

### Method 3: External Hosting
1. Upload to Imgur, Cloudinary, or similar
2. Get image URLs
3. Edit PR description
4. Add markdown: `![Caption](URL)`

---

## Screenshot Naming Convention

Use descriptive names:
- `formio-builder-interface.png`
- `turnstile-component-premium.png`
- `turnstile-placeholder-builder.png`
- `turnstile-widget-public-form.png`
- `quick-reference-page.png`
- `examples-page-turnstile.png`
- `forms-list-buttons.png`
- `multi-page-wizard.png`
- `form-submission-success.png`
- `turnstile-plugin-settings.png`

---

## Image Optimization Tips

- **Resolution**: 1920x1080 or similar (Full HD)
- **Format**: PNG for UI screenshots (better quality)
- **Compression**: Use TinyPNG or similar to reduce file size
- **Max size**: Keep under 1MB per image
- **Crop**: Remove unnecessary whitespace
- **Highlight**: Use arrows or boxes to highlight key features (optional)

---

## Example Markdown

```markdown
### Form Builder Interface
![Form Builder with drag-and-drop components and glass-morphism theme](https://user-images.githubusercontent.com/.../formio-builder.png)

The visual form builder features:
- Drag-and-drop component palette
- Live preview canvas
- Component settings panel
- Glass-morphism dark theme
```

---

## Quick Checklist

- [ ] 1. Form Builder Interface
- [ ] 2. Turnstile Component in Premium Section
- [ ] 3. Turnstile Placeholder in Builder
- [ ] 4. Live Turnstile Widget on Public Form
- [ ] 5. Quick Reference Page
- [ ] 6. Examples Page - Turnstile Section
- [ ] 7. Forms List Page with New Buttons
- [ ] 8. Multi-Page Wizard
- [ ] 9. Form Submission Success
- [ ] 10. Turnstile Settings in Plugin

---

## Need Help?

If you need help taking screenshots or uploading them:
1. Comment on the PR with questions
2. Check GitHub's documentation: https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/attaching-files
3. Tag @Claude for assistance
