import { renderAdminLayoutCatalyst, AdminLayoutCatalystData } from '../layouts/admin-layout-catalyst.template'

export interface FormsDocsPageData {
  user?: {
    name: string
    email: string
    role: string
  }
  version?: string
}

export function renderFormsDocsPage(data: FormsDocsPageData): string {
  const pageContent = `
    <style>
      /* Light theme matching examples page */
      .docs-container {
        display: flex;
        gap: 0;
        min-height: calc(100vh - 200px);
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .docs-sidebar {
        width: 280px;
        background: #f8f9fa;
        border-right: 1px solid #e0e0e0;
        padding: 1.5rem 0;
        overflow-y: auto;
      }
      
      .docs-sidebar h3 {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #6b7280;
        padding: 0 1.5rem;
        margin-bottom: 0.75rem;
      }
      
      .docs-nav {
        list-style: none;
        padding: 0;
        margin: 0 0 2rem 0;
      }
      
      .docs-nav li {
        margin: 0;
      }
      
      .docs-nav a {
        display: block;
        padding: 0.75rem 1.5rem;
        color: #374151;
        text-decoration: none;
        font-size: 0.875rem;
        transition: all 0.2s;
        border-left: 3px solid transparent;
      }
      
      .docs-nav a:hover {
        background: #e9ecef;
        color: #1f2937;
      }
      
      .docs-nav a.active {
        background: #e3f2fd;
        color: #1976d2;
        border-left-color: #1976d2;
        font-weight: 500;
      }
      
      .docs-content {
        flex: 1;
        padding: 2rem;
        background: #ffffff;
        overflow-y: auto;
      }
      
      .doc-section {
        display: none;
      }
      
      .doc-section.active {
        display: block;
      }
      
      .doc-header {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #e0e0e0;
      }
      
      .doc-header h2 {
        font-size: 1.875rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 0.5rem;
      }
      
      .doc-header p {
        color: #6b7280;
        font-size: 1rem;
      }
      
      .field-example {
        background: #f8f9fa;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }
      
      .field-example h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 0.75rem;
      }
      
      .field-example p {
        color: #6b7280;
        font-size: 0.875rem;
        margin-bottom: 1rem;
      }
      
      .code-block {
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 1rem;
        border-radius: 6px;
        overflow-x: auto;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.875rem;
        line-height: 1.6;
      }
      
      .info-box {
        background: #e3f2fd;
        border: 1px solid #90caf9;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1.5rem;
        color: #1565c0;
        font-size: 0.875rem;
      }
      
      .info-box strong {
        font-weight: 600;
      }
    </style>

    <div class="mb-6">
      <div class="flex items-center gap-3 mb-4">
        <a href="/admin/forms" class="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back to Forms
        </a>
      </div>
      <h1 class="text-3xl font-bold text-zinc-950 dark:text-white">Forms Quick Reference</h1>
      <p class="mt-2 text-zinc-600 dark:text-zinc-400">Comprehensive guide to all Form.io field types and features</p>
    </div>

    <div class="docs-container">
      <!-- Sidebar Navigation -->
      <aside class="docs-sidebar">
        <h3>Quick Start</h3>
        <ul class="docs-nav">
          <li><a href="#overview" class="doc-link active">Overview</a></li>
          <li><a href="#getting-started" class="doc-link">Getting Started</a></li>
        </ul>
        
        <h3>Basic Fields</h3>
        <ul class="docs-nav">
          <li><a href="#textfield" class="doc-link">Text Field</a></li>
          <li><a href="#textarea" class="doc-link">Text Area</a></li>
          <li><a href="#number" class="doc-link">Number</a></li>
          <li><a href="#password" class="doc-link">Password</a></li>
          <li><a href="#email" class="doc-link">Email</a></li>
          <li><a href="#url" class="doc-link">URL</a></li>
          <li><a href="#phonenumber" class="doc-link">Phone Number</a></li>
        </ul>
        
        <h3>Date & Time</h3>
        <ul class="docs-nav">
          <li><a href="#datetime" class="doc-link">Date/Time</a></li>
          <li><a href="#day" class="doc-link">Day</a></li>
          <li><a href="#time" class="doc-link">Time</a></li>
        </ul>
        
        <h3>Selection Fields</h3>
        <ul class="docs-nav">
          <li><a href="#select" class="doc-link">Select Dropdown</a></li>
          <li><a href="#selectboxes" class="doc-link">Select Boxes</a></li>
          <li><a href="#radio" class="doc-link">Radio</a></li>
          <li><a href="#checkbox" class="doc-link">Checkbox</a></li>
        </ul>
        
        <h3>Advanced Fields</h3>
        <ul class="docs-nav">
          <li><a href="#currency" class="doc-link">Currency</a></li>
          <li><a href="#tags" class="doc-link">Tags</a></li>
          <li><a href="#survey" class="doc-link">Survey</a></li>
          <li><a href="#signature" class="doc-link">Signature</a></li>
          <li><a href="#file" class="doc-link">File Upload</a></li>
          <li><a href="#address" class="doc-link">Address</a></li>
          <li><a href="#turnstile" class="doc-link">🛡️ Turnstile</a></li>
        </ul>
        
        <h3>Layout Components</h3>
        <ul class="docs-nav">
          <li><a href="#panel" class="doc-link">Panel</a></li>
          <li><a href="#columns" class="doc-link">Columns</a></li>
          <li><a href="#tabs" class="doc-link">Tabs</a></li>
          <li><a href="#table" class="doc-link">Table</a></li>
          <li><a href="#fieldset" class="doc-link">Fieldset</a></li>
        </ul>
        
        <h3>Data Components</h3>
        <ul class="docs-nav">
          <li><a href="#datagrid" class="doc-link">Data Grid</a></li>
          <li><a href="#editgrid" class="doc-link">Edit Grid</a></li>
        </ul>
        
        <h3>Guides</h3>
        <ul class="docs-nav">
          <li><a href="#wizard" class="doc-link">Multi-Page Wizards</a></li>
          <li><a href="#embedding" class="doc-link">Embedding Forms</a></li>
          <li><a href="#validation" class="doc-link">Validation</a></li>
          <li><a href="#conditional" class="doc-link">Conditional Logic</a></li>
        </ul>
      </aside>

      <!-- Main Content Area -->
      <main class="docs-content">
        
        <!-- Overview Section -->
        <section id="overview" class="doc-section active">
          <div class="doc-header">
            <h2>📚 Overview</h2>
            <p>Complete reference for SonicJS Forms powered by Form.io</p>
          </div>
          
          <div class="info-box">
            <strong>💡 New to SonicJS Forms?</strong> Start with "Getting Started" in the sidebar, then explore the field types you need.
          </div>
          
          <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #1f2937;">Key Features</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div style="padding: 1rem; background: #f0fdf4; border-radius: 8px;">
              <strong style="color: #16a34a;">✓ Visual Builder</strong>
              <p style="font-size: 0.875rem; color: #15803d; margin-top: 0.25rem;">Drag-and-drop interface</p>
            </div>
            <div style="padding: 1rem; background: #f0fdf4; border-radius: 8px;">
              <strong style="color: #16a34a;">✓ 40+ Field Types</strong>
              <p style="font-size: 0.875rem; color: #15803d; margin-top: 0.25rem;">Text, date, file, signature, etc.</p>
            </div>
            <div style="padding: 1rem; background: #f0fdf4; border-radius: 8px;">
              <strong style="color: #16a34a;">✓ Multi-Page Wizards</strong>
              <p style="font-size: 0.875rem; color: #15803d; margin-top: 0.25rem;">Step-by-step forms</p>
            </div>
            <div style="padding: 1rem; background: #f0fdf4; border-radius: 8px;">
              <strong style="color: #16a34a;">✓ Headless API</strong>
              <p style="font-size: 0.875rem; color: #15803d; margin-top: 0.25rem;">JSON schema & REST API</p>
            </div>
            <div style="padding: 1rem; background: #f0fdf4; border-radius: 8px;">
              <strong style="color: #16a34a;">✓ File Uploads</strong>
              <p style="font-size: 0.875rem; color: #15803d; margin-top: 0.25rem;">Cloudflare R2 storage</p>
            </div>
            <div style="padding: 1rem; background: #f0fdf4; border-radius: 8px;">
              <strong style="color: #16a34a;">✓ 100% Open Source</strong>
              <p style="font-size: 0.875rem; color: #15803d; margin-top: 0.25rem;">No vendor lock-in</p>
            </div>
          </div>
          
          <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem; color: #1f2937;">Quick Links</h3>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <a href="/admin/forms/examples" style="display: inline-flex; align-items: center; padding: 0.625rem 1.25rem; background: #3b82f6; color: white; border-radius: 6px; text-decoration: none; font-size: 0.875rem; font-weight: 500;">
              <svg style="width: 1rem; height: 1rem; margin-right: 0.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              View Examples
            </a>
            <a href="/admin/forms/new" style="display: inline-flex; align-items: center; padding: 0.625rem 1.25rem; background: #10b981; color: white; border-radius: 6px; text-decoration: none; font-size: 0.875rem; font-weight: 500;">
              <svg style="width: 1rem; height: 1rem; margin-right: 0.5rem;" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
              </svg>
              Create New Form
            </a>
            <a href="/admin/forms" style="display: inline-flex; align-items: center; padding: 0.625rem 1.25rem; background: #6b7280; color: white; border-radius: 6px; text-decoration: none; font-size: 0.875rem; font-weight: 500;">
              <svg style="width: 1rem; height: 1rem; margin-right: 0.5rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
              View All Forms
            </a>
          </div>
        </section>

        <!-- Getting Started Section -->
        <section id="getting-started" class="doc-section">
          <div class="doc-header">
            <h2>🚀 Getting Started</h2>
            <p>Create your first form in 3 easy steps</p>
          </div>
          
          <div class="field-example">
            <h3>Step 1: Create a Form</h3>
            <p>Navigate to <code>/admin/forms</code> and click "Create Form"</p>
          </div>
          
          <div class="field-example">
            <h3>Step 2: Build Your Form</h3>
            <p>Drag and drop field types from the sidebar to build your form visually</p>
          </div>
          
          <div class="field-example">
            <h3>Step 3: Publish & Embed</h3>
            <p>Save your form and access it via:</p>
            <ul style="margin-left: 1.5rem; margin-top: 0.5rem; list-style-type: disc;">
              <li><code>/forms/your-form-name</code> - Public form page</li>
              <li><code>/forms/your-form-name/schema</code> - JSON schema API</li>
              <li><code>/api/forms/:id/submit</code> - Submission endpoint</li>
            </ul>
          </div>
        </section>

        <!-- Text Field -->
        <section id="textfield" class="doc-section">
          <div class="doc-header">
            <h2>📝 Text Field</h2>
            <p>Single-line text input for short text values</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Most common field type for names, titles, and short text</p>
            <pre class="code-block">{
  "type": "textfield",
  "key": "firstName",
  "label": "First Name",
  "placeholder": "Enter your first name",
  "validate": {
    "required": true,
    "minLength": 2,
    "maxLength": 50
  }
}</pre>
          </div>
          
          <div class="info-box">
            <strong>💡 Pro Tip:</strong> Use <code>inputMask</code> for formatted input like SSN or custom patterns.
          </div>
        </section>

        <!-- Text Area -->
        <section id="textarea" class="doc-section">
          <div class="doc-header">
            <h2>📄 Text Area</h2>
            <p>Multi-line text input for longer text content</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Perfect for comments, descriptions, and multi-line text</p>
            <pre class="code-block">{
  "type": "textarea",
  "key": "comments",
  "label": "Additional Comments",
  "placeholder": "Enter your comments here...",
  "rows": 5,
  "validate": {
    "required": false,
    "maxLength": 1000
  }
}</pre>
          </div>
        </section>

        <!-- Number Field -->
        <section id="number" class="doc-section">
          <div class="doc-header">
            <h2>🔢 Number</h2>
            <p>Numeric input with validation</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>For ages, quantities, scores, and any numeric value</p>
            <pre class="code-block">{
  "type": "number",
  "key": "age",
  "label": "Age",
  "placeholder": "18",
  "validate": {
    "required": true,
    "min": 18,
    "max": 120
  }
}</pre>
          </div>
        </section>

        <!-- Password Field -->
        <section id="password" class="doc-section">
          <div class="doc-header">
            <h2>🔒 Password</h2>
            <p>Masked text input for sensitive data</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Automatically masks input for security</p>
            <pre class="code-block">{
  "type": "password",
  "key": "password",
  "label": "Password",
  "placeholder": "Enter password",
  "validate": {
    "required": true,
    "minLength": 8,
    "pattern": "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$"
  }
}</pre>
          </div>
        </section>

        <!-- Email Field -->
        <section id="email" class="doc-section">
          <div class="doc-header">
            <h2>📧 Email</h2>
            <p>Email input with automatic validation</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Validates email format automatically</p>
            <pre class="code-block">{
  "type": "email",
  "key": "email",
  "label": "Email Address",
  "placeholder": "you@example.com",
  "validate": {
    "required": true
  }
}</pre>
          </div>
        </section>

        <!-- URL Field -->
        <section id="url" class="doc-section">
          <div class="doc-header">
            <h2>🌐 URL</h2>
            <p>URL input with validation</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Validates URL format (http/https)</p>
            <pre class="code-block">{
  "type": "url",
  "key": "website",
  "label": "Website",
  "placeholder": "https://example.com",
  "validate": {
    "required": false
  }
}</pre>
          </div>
        </section>

        <!-- Phone Number Field -->
        <section id="phonenumber" class="doc-section">
          <div class="doc-header">
            <h2>📞 Phone Number</h2>
            <p>Phone number input with formatting</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Automatically formats phone numbers</p>
            <pre class="code-block">{
  "type": "phoneNumber",
  "key": "phone",
  "label": "Phone Number",
  "placeholder": "(555) 555-5555",
  "validate": {
    "required": true
  }
}</pre>
          </div>
        </section>

        <!-- DateTime Field -->
        <section id="datetime" class="doc-section">
          <div class="doc-header">
            <h2>📅 Date/Time</h2>
            <p>Date and time picker</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Interactive date/time picker with format control</p>
            <pre class="code-block">{
  "type": "datetime",
  "key": "appointmentDateTime",
  "label": "Appointment Date & Time",
  "format": "yyyy-MM-dd hh:mm a",
  "enableTime": true,
  "validate": {
    "required": true
  }
}</pre>
          </div>
        </section>

        <!-- Day Field -->
        <section id="day" class="doc-section">
          <div class="doc-header">
            <h2>📆 Day</h2>
            <p>Day/Month/Year selector</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Separate dropdowns for day, month, and year</p>
            <pre class="code-block">{
  "type": "day",
  "key": "birthDate",
  "label": "Date of Birth",
  "fields": {
    "day": { "placeholder": "Day" },
    "month": { "placeholder": "Month" },
    "year": { "placeholder": "Year" }
  },
  "validate": {
    "required": true
  }
}</pre>
          </div>
        </section>

        <!-- Time Field -->
        <section id="time" class="doc-section">
          <div class="doc-header">
            <h2>🕐 Time</h2>
            <p>Time picker (hours and minutes)</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Select time in HH:MM format</p>
            <pre class="code-block">{
  "type": "time",
  "key": "preferredTime",
  "label": "Preferred Contact Time",
  "validate": {
    "required": false
  }
}</pre>
          </div>
        </section>

        <!-- Select Field -->
        <section id="select" class="doc-section">
          <div class="doc-header">
            <h2>🔽 Select Dropdown</h2>
            <p>Single selection dropdown</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Choose one option from a list</p>
            <pre class="code-block">{
  "type": "select",
  "key": "country",
  "label": "Country",
  "placeholder": "Select your country",
  "data": {
    "values": [
      { "label": "United States", "value": "us" },
      { "label": "Canada", "value": "ca" },
      { "label": "United Kingdom", "value": "uk" },
      { "label": "Australia", "value": "au" }
    ]
  },
  "validate": {
    "required": true
  }
}</pre>
          </div>
        </section>

        <!-- Select Boxes Field -->
        <section id="selectboxes" class="doc-section">
          <div class="doc-header">
            <h2>☑️ Select Boxes</h2>
            <p>Multiple checkbox selections</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Select multiple options with checkboxes</p>
            <pre class="code-block">{
  "type": "selectboxes",
  "key": "interests",
  "label": "Areas of Interest",
  "values": [
    { "label": "Sports", "value": "sports" },
    { "label": "Music", "value": "music" },
    { "label": "Technology", "value": "tech" },
    { "label": "Travel", "value": "travel" }
  ]
}</pre>
          </div>
        </section>

        <!-- Radio Field -->
        <section id="radio" class="doc-section">
          <div class="doc-header">
            <h2>🔘 Radio</h2>
            <p>Single selection with radio buttons</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Choose one option from radio buttons</p>
            <pre class="code-block">{
  "type": "radio",
  "key": "gender",
  "label": "Gender",
  "values": [
    { "label": "Male", "value": "male" },
    { "label": "Female", "value": "female" },
    { "label": "Non-binary", "value": "nonbinary" },
    { "label": "Prefer not to say", "value": "other" }
  ],
  "validate": {
    "required": true
  }
}</pre>
          </div>
        </section>

        <!-- Checkbox Field -->
        <section id="checkbox" class="doc-section">
          <div class="doc-header">
            <h2>✅ Checkbox</h2>
            <p>Single checkbox for boolean values</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>For agreements, subscriptions, and yes/no options</p>
            <pre class="code-block">{
  "type": "checkbox",
  "key": "newsletter",
  "label": "Subscribe to newsletter",
  "validate": {
    "required": false
  }
}

// Required checkbox (terms agreement)
{
  "type": "checkbox",
  "key": "terms",
  "label": "I agree to the terms and conditions",
  "validate": {
    "required": true
  }
}</pre>
          </div>
        </section>

        <!-- Currency Field -->
        <section id="currency" class="doc-section">
          <div class="doc-header">
            <h2>💰 Currency</h2>
            <p>Formatted currency input</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Automatically formats with currency symbol</p>
            <pre class="code-block">{
  "type": "currency",
  "key": "salary",
  "label": "Expected Salary",
  "currency": "USD",
  "placeholder": "$50,000",
  "validate": {
    "required": true,
    "min": 0
  }
}</pre>
          </div>
        </section>

        <!-- Tags Field -->
        <section id="tags" class="doc-section">
          <div class="doc-header">
            <h2>🏷️ Tags</h2>
            <p>Multi-value tag input</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Type and press Enter to add tags</p>
            <pre class="code-block">{
  "type": "tags",
  "key": "skills",
  "label": "Skills",
  "placeholder": "Type and press Enter (e.g. JavaScript, Python)",
  "validate": {
    "required": false
  }
}</pre>
          </div>
        </section>

        <!-- Survey Field -->
        <section id="survey" class="doc-section">
          <div class="doc-header">
            <h2>📊 Survey</h2>
            <p>Matrix-style rating questions</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Multiple questions with rating scale</p>
            <pre class="code-block">{
  "type": "survey",
  "key": "satisfaction",
  "label": "Customer Satisfaction Survey",
  "questions": [
    { "label": "Product Quality", "value": "quality" },
    { "label": "Customer Service", "value": "service" },
    { "label": "Value for Money", "value": "value" }
  ],
  "values": [
    { "label": "Poor", "value": "1" },
    { "label": "Fair", "value": "2" },
    { "label": "Good", "value": "3" },
    { "label": "Excellent", "value": "4" }
  ]
}</pre>
          </div>
        </section>

        <!-- Signature Field -->
        <section id="signature" class="doc-section">
          <div class="doc-header">
            <h2>✍️ Signature</h2>
            <p>Digital signature pad</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Capture signatures with mouse or touch</p>
            <pre class="code-block">{
  "type": "signature",
  "key": "signature",
  "label": "Signature",
  "footer": "Sign above",
  "width": "100%",
  "height": "150px",
  "validate": {
    "required": true
  }
}</pre>
          </div>
        </section>

        <!-- File Upload Field -->
        <section id="file" class="doc-section">
          <div class="doc-header">
            <h2>📁 File Upload</h2>
            <p>File upload with storage options</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Upload files to Cloudflare R2 or base64 encode</p>
            <pre class="code-block">{
  "type": "file",
  "key": "resume",
  "label": "Upload Resume",
  "storage": "r2",
  "filePattern": ".pdf,.doc,.docx",
  "fileMaxSize": "5MB",
  "multiple": false,
  "validate": {
    "required": true
  }
}

// Multiple files
{
  "type": "file",
  "key": "attachments",
  "label": "Attachments",
  "storage": "base64",
  "multiple": true,
  "fileMaxSize": "10MB"
}</pre>
          </div>
          
          <div class="info-box">
            <strong>💡 Storage Options:</strong> Use <code>storage: "r2"</code> for Cloudflare R2 (recommended) or <code>storage: "base64"</code> to encode in submission data.
          </div>
        </section>

        <!-- Address Field -->
        <section id="address" class="doc-section">
          <div class="doc-header">
            <h2>📍 Address</h2>
            <p>Address autocomplete with Google Maps</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Google Maps API-powered address autocomplete</p>
            <pre class="code-block">{
  "type": "address",
  "key": "address",
  "label": "Address",
  "provider": "google",
  "map": {
    "key": "YOUR_GOOGLE_MAPS_API_KEY"
  },
  "validate": {
    "required": true
  }
}</pre>
          </div>
          
          <div class="info-box">
            <strong>⚠️ API Key Required:</strong> Enable Google Maps Places API and Maps JavaScript API in Google Cloud Console.
          </div>
        </section>

        <!-- Turnstile Component -->
        <section id="turnstile" class="doc-section">
          <div class="doc-header">
            <h2>🛡️ Turnstile</h2>
            <p>CAPTCHA-free bot protection by Cloudflare</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Add invisible bot protection to your forms</p>
            <pre class="code-block">{
  "type": "turnstile",
  "key": "turnstile",
  "label": "Turnstile Verification",
  "theme": "auto",
  "size": "normal",
  "appearance": "always",
  "persistent": false,
  "protected": true
}</pre>
          </div>
          
          <div class="field-example">
            <h3>Configuration Options</h3>
            <pre class="code-block">{
  "type": "turnstile",
  "key": "turnstile",
  "label": "Security Check",
  "theme": "light",          // "light", "dark", "auto"
  "size": "compact",         // "normal", "compact"
  "appearance": "always",    // "always", "execute", "interaction-only"
  "action": "submit-form",   // Optional: action name for analytics
  "errorMessage": "Please complete the security verification"
}</pre>
          </div>
          
          <div class="info-box">
            <strong>🔧 Setup Required:</strong> Enable the Turnstile plugin in Settings → Plugins and configure your site key and secret key from Cloudflare Dashboard.
          </div>
          
          <div class="info-box">
            <strong>💡 Usage Tips:</strong>
            <ul style="margin: 10px 0 0 20px; padding: 0;">
              <li><strong>Invisible Mode:</strong> Use <code>"appearance": "interaction-only"</code> for seamless UX</li>
              <li><strong>Dark Mode:</strong> Use <code>"theme": "auto"</code> to match user preferences</li>
              <li><strong>Compact Size:</strong> Use <code>"size": "compact"</code> for mobile forms</li>
              <li><strong>Backend Validation:</strong> Tokens are automatically validated server-side</li>
            </ul>
          </div>
        </section>

        <!-- Panel Component -->
        <section id="panel" class="doc-section">
          <div class="doc-header">
            <h2>📦 Panel</h2>
            <p>Group fields in collapsible panels</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Used for wizards and grouping related fields</p>
            <pre class="code-block">{
  "type": "panel",
  "key": "personalInfo",
  "title": "Personal Information",
  "collapsible": true,
  "collapsed": false,
  "components": [
    { "type": "textfield", "key": "firstName", "label": "First Name" },
    { "type": "textfield", "key": "lastName", "label": "Last Name" },
    { "type": "email", "key": "email", "label": "Email" }
  ]
}</pre>
          </div>
        </section>

        <!-- Columns Component -->
        <section id="columns" class="doc-section">
          <div class="doc-header">
            <h2>📊 Columns</h2>
            <p>Multi-column layout</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Create side-by-side fields (responsive)</p>
            <pre class="code-block">{
  "type": "columns",
  "columns": [
    {
      "components": [
        { "type": "textfield", "key": "firstName", "label": "First Name" }
      ],
      "width": 6
    },
    {
      "components": [
        { "type": "textfield", "key": "lastName", "label": "Last Name" }
      ],
      "width": 6
    }
  ]
}</pre>
          </div>
          
          <div class="info-box">
            <strong>💡 Width System:</strong> Width is based on 12-column grid. Use 6 for 50%, 4 for 33%, 3 for 25%, etc.
          </div>
        </section>

        <!-- Tabs Component -->
        <section id="tabs" class="doc-section">
          <div class="doc-header">
            <h2>📑 Tabs</h2>
            <p>Organize fields in tabs</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Create tabbed interface for complex forms</p>
            <pre class="code-block">{
  "type": "tabs",
  "components": [
    {
      "label": "Personal Info",
      "key": "tab1",
      "components": [...]
    },
    {
      "label": "Contact Info",
      "key": "tab2",
      "components": [...]
    }
  ]
}</pre>
          </div>
        </section>

        <!-- Table Component -->
        <section id="table" class="doc-section">
          <div class="doc-header">
            <h2>📋 Table</h2>
            <p>Table layout for forms</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Create table-based layouts</p>
            <pre class="code-block">{
  "type": "table",
  "numRows": 3,
  "numCols": 2,
  "rows": [
    [
      { "components": [{ "type": "textfield", "key": "cell1" }] },
      { "components": [{ "type": "textfield", "key": "cell2" }] }
    ]
  ]
}</pre>
          </div>
        </section>

        <!-- Fieldset Component -->
        <section id="fieldset" class="doc-section">
          <div class="doc-header">
            <h2>📦 Fieldset</h2>
            <p>Group fields with border and legend</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>HTML fieldset with legend label</p>
            <pre class="code-block">{
  "type": "fieldset",
  "legend": "Contact Information",
  "components": [
    { "type": "email", "key": "email", "label": "Email" },
    { "type": "phoneNumber", "key": "phone", "label": "Phone" }
  ]
}</pre>
          </div>
        </section>

        <!-- Data Grid Component -->
        <section id="datagrid" class="doc-section">
          <div class="doc-header">
            <h2>🗃️ Data Grid</h2>
            <p>Repeatable row data entry</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Add/remove rows of structured data</p>
            <pre class="code-block">{
  "type": "datagrid",
  "key": "items",
  "label": "Items",
  "addAnother": "Add Item",
  "components": [
    { "type": "textfield", "key": "name", "label": "Item Name" },
    { "type": "number", "key": "quantity", "label": "Quantity" },
    { "type": "currency", "key": "price", "label": "Price" }
  ]
}</pre>
          </div>
        </section>

        <!-- Edit Grid Component -->
        <section id="editgrid" class="doc-section">
          <div class="doc-header">
            <h2>✏️ Edit Grid</h2>
            <p>Editable table with modal editing</p>
          </div>
          
          <div class="field-example">
            <h3>Basic Usage</h3>
            <p>Similar to Data Grid but with modal editing</p>
            <pre class="code-block">{
  "type": "editgrid",
  "key": "contacts",
  "label": "Contacts",
  "components": [
    { "type": "textfield", "key": "name", "label": "Name" },
    { "type": "email", "key": "email", "label": "Email" },
    { "type": "phoneNumber", "key": "phone", "label": "Phone" }
  ]
}</pre>
          </div>
        </section>

        <!-- Multi-Page Wizards Guide -->
        <section id="wizard" class="doc-section">
          <div class="doc-header">
            <h2>🧙 Multi-Page Wizards</h2>
            <p>Create step-by-step forms with progress tracking</p>
          </div>
          
          <div class="info-box">
            <strong>💡 How It Works:</strong> Set <code>display: "wizard"</code> and use Panel components for each step. Form.io automatically adds navigation buttons.
          </div>
          
          <div class="field-example">
            <h3>Complete Wizard Example</h3>
            <pre class="code-block">{
  "display": "wizard",
  "components": [
    {
      "type": "panel",
      "key": "step1",
      "title": "Step 1: Personal Info",
      "components": [
        { "type": "textfield", "key": "firstName", "label": "First Name" },
        { "type": "textfield", "key": "lastName", "label": "Last Name" }
      ]
    },
    {
      "type": "panel",
      "key": "step2",
      "title": "Step 2: Contact Info",
      "components": [
        { "type": "email", "key": "email", "label": "Email" },
        { "type": "phoneNumber", "key": "phone", "label": "Phone" }
      ]
    },
    {
      "type": "panel",
      "key": "step3",
      "title": "Step 3: Review",
      "components": [
        { "type": "checkbox", "key": "terms", "label": "I agree" }
      ]
    }
  ]
}</pre>
          </div>
        </section>

        <!-- Embedding Forms Guide -->
        <section id="embedding" class="doc-section">
          <div class="doc-header">
            <h2>🌐 Embedding Forms</h2>
            <p>Multiple ways to embed forms on your website</p>
          </div>
          
          <div class="field-example">
            <h3>Method 1: JavaScript (Recommended)</h3>
            <p>Load form schema via API and render with Form.io</p>
            <pre class="code-block">&lt;div id="form"&gt;&lt;/div&gt;
&lt;script src="https://cdn.form.io/formiojs/formio.full.min.js"&gt;&lt;/script&gt;
&lt;script&gt;
  fetch('/forms/contact_form/schema')
    .then(r => r.json())
    .then(data => {
      Formio.createForm(
        document.getElementById('form'),
        data.schema
      ).then(form => {
        // Handle submission
        form.on('submitDone', (submission) => {
          console.log('Submitted:', submission);
        });
      });
    });
&lt;/script&gt;</pre>
          </div>
          
          <div class="field-example">
            <h3>Method 2: iFrame</h3>
            <p>Simple iframe embed (less flexible)</p>
            <pre class="code-block">&lt;iframe 
  src="/forms/contact_form"
  width="100%"
  height="600"
  frameborder="0"
&gt;&lt;/iframe&gt;</pre>
          </div>
          
          <div class="field-example">
            <h3>Method 3: React Component</h3>
            <p>Use Form.io React library</p>
            <pre class="code-block">import { Form } from '@formio/react';

function MyForm() {
  const [schema, setSchema] = useState(null);
  
  useEffect(() => {
    fetch('/forms/contact_form/schema')
      .then(r => r.json())
      .then(data => setSchema(data.schema));
  }, []);
  
  const handleSubmit = (submission) => {
    fetch('/api/forms/123/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission.data)
    });
  };
  
  return schema ? (
    &lt;Form form={schema} onSubmit={handleSubmit} /&gt;
  ) : null;
}</pre>
          </div>
        </section>

        <!-- Validation Guide -->
        <section id="validation" class="doc-section">
          <div class="doc-header">
            <h2>✅ Validation</h2>
            <p>Built-in validation rules</p>
          </div>
          
          <div class="field-example">
            <h3>Common Validation Rules</h3>
            <pre class="code-block">{
  "validate": {
    "required": true,           // Field must have value
    "minLength": 2,            // Minimum characters
    "maxLength": 50,           // Maximum characters
    "min": 0,                  // Minimum number value
    "max": 100,                // Maximum number value
    "pattern": "^[A-Za-z]+$",  // Regular expression
    "custom": "valid = (input === 'yes');" // Custom validation
  }
}</pre>
          </div>
          
          <div class="field-example">
            <h3>Custom Error Messages</h3>
            <pre class="code-block">{
  "validate": {
    "required": true,
    "customMessage": "Please provide your full name"
  }
}</pre>
          </div>
        </section>

        <!-- Conditional Logic Guide -->
        <section id="conditional" class="doc-section">
          <div class="doc-header">
            <h2>🔀 Conditional Logic</h2>
            <p>Show/hide fields based on conditions</p>
          </div>
          
          <div class="field-example">
            <h3>Simple Conditional</h3>
            <p>Show field only when condition is met</p>
            <pre class="code-block">{
  "type": "textfield",
  "key": "companyName",
  "label": "Company Name",
  "conditional": {
    "show": true,
    "when": "hasCompany",
    "eq": true
  }
}</pre>
          </div>
          
          <div class="field-example">
            <h3>Advanced Conditional (JavaScript)</h3>
            <p>Complex conditions using custom JavaScript</p>
            <pre class="code-block">{
  "type": "textfield",
  "key": "discount",
  "label": "Discount Code",
  "customConditional": "show = (data.total > 100 && data.memberType === 'premium');"
}</pre>
          </div>
        </section>

      </main>
    </div>

    <script>
      // Navigation
      document.querySelectorAll('.doc-link').forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const targetId = this.getAttribute('href').substring(1);
          
          // Update active link
          document.querySelectorAll('.doc-link').forEach(l => l.classList.remove('active'));
          this.classList.add('active');
          
          // Update active section
          document.querySelectorAll('.doc-section').forEach(s => s.classList.remove('active'));
          document.getElementById(targetId).classList.add('active');
          
          // Scroll to top
          document.querySelector('.docs-content').scrollTop = 0;
        });
      });
    </script>
  `

  const layoutData: AdminLayoutCatalystData = {
    title: 'Forms Quick Reference',
    pageTitle: 'Forms Quick Reference',
    content: pageContent,
    user: data.user,
    version: data.version
  }

  return renderAdminLayoutCatalyst(layoutData)
}
