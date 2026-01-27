import { renderAdminLayoutCatalyst, AdminLayoutCatalystData } from '../layouts/admin-layout-catalyst.template'

export interface FormsExamplesPageData {
  user?: {
    name: string
    email: string
    role: string
  }
  version?: string
}

export function renderFormsExamplesPage(data: FormsExamplesPageData): string {
  const pageContent = `
    <style>
      /* Light theme for examples page */
      .examples-container {
        display: flex;
        gap: 0;
        min-height: calc(100vh - 200px);
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .examples-sidebar {
        width: 280px;
        background: #f8f9fa;
        border-right: 1px solid #e0e0e0;
        padding: 1.5rem 0;
        overflow-y: auto;
      }
      
      .examples-sidebar h3 {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #6b7280;
        padding: 0 1.5rem;
        margin-bottom: 0.75rem;
      }
      
      .examples-nav {
        list-style: none;
        padding: 0;
        margin: 0 0 2rem 0;
      }
      
      .examples-nav li {
        margin: 0;
      }
      
      .examples-nav a {
        display: block;
        padding: 0.75rem 1.5rem;
        color: #374151;
        text-decoration: none;
        font-size: 0.875rem;
        transition: all 0.2s;
        border-left: 3px solid transparent;
      }
      
      .examples-nav a:hover {
        background: #e9ecef;
        color: #1f2937;
      }
      
      .examples-nav a.active {
        background: #e3f2fd;
        color: #1976d2;
        border-left-color: #1976d2;
        font-weight: 500;
      }
      
      .examples-content {
        flex: 1;
        padding: 2rem;
        background: #ffffff;
        overflow-y: auto;
      }
      
      .example-section {
        display: none;
      }
      
      .example-section.active {
        display: block;
      }
      
      .example-header {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #e0e0e0;
      }
      
      .example-header h2 {
        font-size: 1.875rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 0.5rem;
      }
      
      .example-header p {
        color: #6b7280;
        font-size: 1rem;
      }
      
      .example-demo {
        background: #f8f9fa;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 2rem;
        margin-bottom: 2rem;
      }
      
      .example-code {
        background: #1e1e1e;
        color: #d4d4d4;
        padding: 1.5rem;
        border-radius: 8px;
        overflow-x: auto;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.875rem;
        line-height: 1.6;
      }
      
      .code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      
      .code-header h3 {
        font-size: 0.875rem;
        font-weight: 600;
        color: #374151;
      }
      
      .copy-btn {
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .copy-btn:hover {
        background: #e5e7eb;
      }
      
      /* Form.io overrides for lighter theme */
      .formio-component {
        margin-bottom: 1.25rem;
      }
      
      .formio-component label {
        color: #374151;
        font-weight: 500;
        margin-bottom: 0.5rem;
      }
      
      .formio-component input,
      .formio-component textarea,
      .formio-component select {
        border: 1px solid #d1d5db;
        border-radius: 6px;
        padding: 0.625rem 0.875rem;
      }
      
      .formio-component input:focus,
      .formio-component textarea:focus,
      .formio-component select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      .btn-primary {
        background: #3b82f6 !important;
        border-color: #3b82f6 !important;
        padding: 0.625rem 1.25rem !important;
        border-radius: 6px !important;
      }
      
      .btn-primary:hover {
        background: #2563eb !important;
        border-color: #2563eb !important;
      }
      
      .alert-success {
        background: #10b981 !important;
        color: white !important;
        border: none !important;
        border-radius: 6px !important;
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
      <h1 class="text-3xl font-bold text-zinc-950 dark:text-white">Form Examples</h1>
      <p class="mt-2 text-zinc-600 dark:text-zinc-400">Interactive examples showcasing Form.io capabilities</p>
    </div>

    <div class="examples-container">
      <!-- Sidebar Navigation -->
      <aside class="examples-sidebar">
        <h3>Getting Started</h3>
        <ul class="examples-nav">
          <li><a href="#kitchen-sink" class="example-link active">Kitchen Sink</a></li>
          <li><a href="#simple-contact" class="example-link">Simple Contact Form</a></li>
          <li><a href="#thank-you" class="example-link">Thank You Page</a></li>
        </ul>
        
        <h3>Advanced Forms</h3>
        <ul class="examples-nav">
          <li><a href="#wizard-form" class="example-link">Multi-Page Wizard</a></li>
          <li><a href="#conditional-logic" class="example-link">Conditional Logic</a></li>
          <li><a href="#file-upload" class="example-link">File Upload</a></li>
        </ul>
        
        <h3>Components</h3>
        <ul class="examples-nav">
          <li><a href="#address-maps" class="example-link">Address with Maps</a></li>
          <li><a href="#signature" class="example-link">Signature Pad</a></li>
          <li><a href="#data-grid" class="example-link">Data Grid</a></li>
          <li><a href="#turnstile-protection" class="example-link">🛡️ Turnstile Protection</a></li>
        </ul>
      </aside>

      <!-- Main Content Area -->
      <main class="examples-content">
        
        <!-- Kitchen Sink Example -->
        <section id="kitchen-sink" class="example-section active">
          <div class="example-header">
            <h2>🍳 Kitchen Sink</h2>
            <p>A comprehensive form showcasing all major field types and configurations.</p>
          </div>
          
          <div class="example-demo">
            <div id="form-kitchen-sink"></div>
          </div>
          
          <div class="code-header">
            <h3>Form Schema (JSON)</h3>
            <button class="copy-btn" onclick="copyCode('kitchen-sink-code')">Copy Code</button>
          </div>
          <pre class="example-code" id="kitchen-sink-code">{
  "display": "form",
  "components": [
    // Basic Text Fields
    { "type": "textfield", "key": "firstName", "label": "First Name" },
    { "type": "email", "key": "email", "label": "Email" },
    { "type": "phoneNumber", "key": "phone", "label": "Phone" },
    { "type": "password", "key": "password", "label": "Password" },
    { "type": "url", "key": "website", "label": "Website" },
    { "type": "textarea", "key": "bio", "label": "Biography" },
    
    // Date & Time
    { "type": "datetime", "key": "appointmentDateTime", "label": "Appointment" },
    { "type": "day", "key": "birthDate", "label": "Birth Date" },
    { "type": "time", "key": "preferredTime", "label": "Time" },
    
    // Selections
    { "type": "select", "key": "country", "label": "Country", 
      "data": { "values": [{ "label": "USA", "value": "us" }] }},
    { "type": "selectboxes", "key": "interests", "label": "Interests",
      "values": [{ "label": "Sports", "value": "sports" }] },
    { "type": "radio", "key": "gender", "label": "Gender",
      "values": [{ "label": "Male", "value": "male" }] },
    { "type": "checkbox", "key": "newsletter", "label": "Newsletter" },
    
    // Advanced
    { "type": "currency", "key": "salary", "label": "Salary" },
    { "type": "tags", "key": "skills", "label": "Skills" },
    { "type": "survey", "key": "satisfaction", "label": "Satisfaction" },
    { "type": "signature", "key": "signature", "label": "Signature" },
    { "type": "file", "key": "resume", "label": "Resume", "storage": "base64" }
  ]
}</pre>
        </section>

        <!-- Simple Contact Form Example -->
        <section id="simple-contact" class="example-section">
          <div class="example-header">
            <h2>📧 Simple Contact Form</h2>
            <p>A minimal contact form with validation.</p>
          </div>
          
          <div class="example-demo">
            <div id="form-simple-contact"></div>
          </div>
          
          <div class="code-header">
            <h3>Form Schema (JSON)</h3>
            <button class="copy-btn" onclick="copyCode('contact-code')">Copy Code</button>
          </div>
          <pre class="example-code" id="contact-code">{
  "display": "form",
  "components": [
    {
      "type": "textfield",
      "key": "name",
      "label": "Full Name",
      "validate": { "required": true }
    },
    {
      "type": "email",
      "key": "email",
      "label": "Email Address",
      "validate": { "required": true }
    },
    {
      "type": "textarea",
      "key": "message",
      "label": "Message",
      "rows": 5,
      "validate": { "required": true }
    }
  ]
}</pre>
        </section>

        <!-- Thank You Page Example -->
        <section id="thank-you" class="example-section">
          <div class="example-header">
            <h2>🎉 Thank You Page</h2>
            <p>Handle form submission and redirect to a thank you message.</p>
          </div>
          
          <div class="example-demo">
            <div id="form-thank-you"></div>
            <div id="thank-you-message" style="display: none; padding: 2rem; background: #10b981; color: white; border-radius: 8px; text-align: center;">
              <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">✅ Thank You!</h3>
              <p>Your form has been submitted successfully.</p>
            </div>
          </div>
          
          <div class="code-header">
            <h3>Form Schema (JSON)</h3>
            <button class="copy-btn" onclick="copyCode('thankyou-schema-code')">Copy Code</button>
          </div>
          <pre class="example-code" id="thankyou-schema-code">{
  "display": "form",
  "components": [
    { "type": "textfield", "key": "firstName", "label": "First Name", 
      "validate": { "required": true }},
    { "type": "textfield", "key": "lastName", "label": "Last Name", 
      "validate": { "required": true }},
    { "type": "email", "key": "email", "label": "Email Address", 
      "validate": { "required": true }},
    { "type": "phoneNumber", "key": "phone", "label": "Phone Number" },
    { "type": "textarea", "key": "message", "label": "Message", 
      "validate": { "required": true }},
    { "type": "button", "action": "submit", "label": "Submit Form" }
  ]
}</pre>
          
          <div class="code-header">
            <h3>JavaScript Code</h3>
            <button class="copy-btn" onclick="copyCode('thankyou-code')">Copy Code</button>
          </div>
          <pre class="example-code" id="thankyou-code">Formio.createForm(document.getElementById('formio'), formSchema)
  .then(function(form) {
    // Handle successful submission
    form.on('submitDone', function(submission) {
      console.log('Form submitted:', submission);
      
      // Hide form and show thank you message
      form.element.style.display = 'none';
      document.getElementById('thank-you-message').style.display = 'block';
      
      // Or redirect to another page:
      // window.location = '/thank-you';
    });
  });</pre>
        </section>

        <!-- Wizard Form Example -->
        <section id="wizard-form" class="example-section">
          <div class="example-header">
            <h2>🧙 Multi-Page Wizard</h2>
            <p>Step-by-step form with multiple pages and progress indicator.</p>
          </div>
          
          <div class="example-demo">
            <div id="form-wizard"></div>
          </div>
          
          <div class="code-header">
            <h3>Form Schema (JSON)</h3>
            <button class="copy-btn" onclick="copyCode('wizard-code')">Copy Code</button>
          </div>
          <pre class="example-code" id="wizard-code">{
  "display": "wizard",
  "components": [
    {
      "type": "panel",
      "key": "step1PersonalInfo",
      "title": "Step 1: Personal Information",
      "components": [
        { "type": "textfield", "key": "firstName", "label": "First Name" },
        { "type": "textfield", "key": "lastName", "label": "Last Name" },
        { "type": "datetime", "key": "birthDate", "label": "Date of Birth" },
        { "type": "select", "key": "gender", "label": "Gender" }
      ]
    },
    {
      "type": "panel",
      "key": "step2ContactInfo",
      "title": "Step 2: Contact Information",
      "components": [
        { "type": "email", "key": "email", "label": "Email" },
        { "type": "phoneNumber", "key": "phone", "label": "Phone" },
        { "type": "textfield", "key": "address", "label": "Address" },
        { "type": "select", "key": "country", "label": "Country" }
      ]
    },
    {
      "type": "panel",
      "key": "step3Preferences",
      "title": "Step 3: Preferences & Review",
      "components": [
        { "type": "selectboxes", "key": "interests", "label": "Interests" },
        { "type": "radio", "key": "contactMethod", "label": "Contact Method" },
        { "type": "textarea", "key": "comments", "label": "Comments" },
        { "type": "checkbox", "key": "terms", "label": "I agree to terms" }
      ]
    }
  ]
}</pre>
        </section>

        <!-- More examples... -->
        <section id="conditional-logic" class="example-section">
          <div class="example-header">
            <h2>🔀 Conditional Logic</h2>
            <p>Show/hide fields based on user input.</p>
          </div>
          <div class="example-demo">
            <div id="form-conditional"></div>
          </div>
        </section>

        <section id="file-upload" class="example-section">
          <div class="example-header">
            <h2>📁 File Upload</h2>
            <p>Upload files to Cloudflare R2 storage.</p>
          </div>
          <div class="example-demo">
            <div id="form-file-upload"></div>
          </div>
        </section>

        <section id="address-maps" class="example-section">
          <div class="example-header">
            <h2>📍 Address with Maps</h2>
            <p>Google Maps autocomplete for address input.</p>
          </div>
          <div class="example-demo">
            <div id="form-address"></div>
          </div>
        </section>

        <section id="signature" class="example-section">
          <div class="example-header">
            <h2>✍️ Signature Pad</h2>
            <p>Capture digital signatures.</p>
          </div>
          <div class="example-demo">
            <div id="form-signature"></div>
          </div>
        </section>

        <section id="data-grid" class="example-section">
          <div class="example-header">
            <h2>📊 Data Grid</h2>
            <p>Repeatable data entry with add/remove rows.</p>
          </div>
          <div class="example-demo">
            <div id="form-data-grid"></div>
          </div>
        </section>

        <section id="turnstile-protection" class="example-section">
          <div class="example-header">
            <h2>🛡️ Turnstile Protection</h2>
            <p>CAPTCHA-free bot protection by Cloudflare - drag and drop from the Premium section in the form builder.</p>
          </div>
          
          <div class="info-box" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; font-size: 18px;">✨ Key Features</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li><strong>No CAPTCHA puzzles</strong> - Seamless user experience</li>
              <li><strong>Invisible protection</strong> - Works in the background</li>
              <li><strong>Auto-validated</strong> - Server-side token verification</li>
              <li><strong>Privacy-first</strong> - Cloudflare's secure infrastructure</li>
            </ul>
          </div>
          
          <div class="example-demo">
            <div id="form-turnstile"></div>
          </div>
          
          <div class="info-box" style="margin-top: 20px;">
            <strong>🔧 Setup Instructions:</strong>
            <ol style="margin: 10px 0 0 20px; padding: 0;">
              <li>Go to <strong>Settings → Plugins</strong> and enable Turnstile plugin</li>
              <li>Get free API keys from <a href="https://dash.cloudflare.com/?to=/:account/turnstile" target="_blank" style="color: #3b82f6;">Cloudflare Dashboard</a></li>
              <li>Configure site key and secret key in plugin settings</li>
              <li>Drag Turnstile component from <strong>Premium</strong> section in form builder</li>
            </ol>
          </div>
          
          <div class="info-box" style="margin-top: 15px; background: #fef3c7; border: 1px solid #fbbf24;">
            <strong>💡 Pro Tip:</strong> Use <code>"appearance": "interaction-only"</code> for invisible mode - the widget only appears when suspicious activity is detected!
          </div>
        </section>

      </main>
    </div>

    <!-- Load Form.io -->
    <script src="https://cdn.form.io/formiojs/formio.full.min.js"></script>
    
    <!-- Register Turnstile Component -->
    <script>
      // Register custom Turnstile component (same as public forms)
      (function() {
        // Will register when Form.io loads
        function registerTurnstile() {
          if (!window.Formio || !window.Formio.Components) {
            return false;
          }

          const FieldComponent = Formio.Components.components.field;

          class TurnstileComponent extends FieldComponent {
            static schema(...extend) {
              return FieldComponent.schema({
                type: 'turnstile',
                label: 'Turnstile Verification',
                key: 'turnstile',
                input: true,
                persistent: false,
                protected: true
              }, ...extend);
            }

            render() {
              return super.render(\`
                <div ref="turnstileContainer" class="formio-component-turnstile">
                  <div ref="turnstileWidget" style="margin: 15px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; text-align: center; color: white;">
                    <div style="font-size: 32px; margin-bottom: 10px;">🛡️</div>
                    <div style="font-weight: 600; font-size: 16px; margin-bottom: 5px;">Turnstile Verification</div>
                    <div style="font-size: 13px; opacity: 0.9;">CAPTCHA-free bot protection by Cloudflare</div>
                    <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">Enable Turnstile plugin in Settings → Plugins to activate</div>
                  </div>
                </div>
              \`);
            }

            attach(element) {
              this.loadRefs(element, { turnstileContainer: 'single', turnstileWidget: 'single' });
              return super.attach(element);
            }
          }

          Formio.Components.addComponent('turnstile', TurnstileComponent);
          console.log('✅ Turnstile component registered on examples page');
          return true;
        }
        
        // Try to register immediately
        if (!registerTurnstile()) {
          // If Form.io not loaded yet, try again after a delay
          setTimeout(registerTurnstile, 100);
        }
      })();
    </script>
    
    <script>
      // Debug: Check if elements exist
      console.log('Script loaded');
      
      // Navigation function
      function setupNavigation() {
        console.log('Setting up navigation...');
        const links = document.querySelectorAll('.example-link');
        console.log('Found', links.length, 'navigation links');
        
        // Navigation
        links.forEach(link => {
          link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            console.log('Navigating to:', targetId);
            
            // Update active link
            document.querySelectorAll('.example-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Update active section
            document.querySelectorAll('.example-section').forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
              targetSection.classList.add('active');
              console.log('Activated section:', targetId);
            } else {
              console.error('Section not found:', targetId);
            }
            
            // Scroll to top
            const content = document.querySelector('.examples-content');
            if (content) {
              content.scrollTop = 0;
            }
            
            // Update URL hash
            window.location.hash = targetId;
          });
        });
        
        // Handle initial hash on page load
        function handleHash() {
          const hash = window.location.hash.substring(1);
          console.log('Handling hash:', hash);
          if (hash) {
            const link = document.querySelector('.example-link[href="#' + hash + '"]');
            if (link) {
              link.click();
            }
          }
        }
        
        // Call on load and hash change
        handleHash();
        window.addEventListener('hashchange', handleHash);
      }

      // Copy code function
      window.copyCode = function(elementId) {
        const code = document.getElementById(elementId).textContent;
        navigator.clipboard.writeText(code).then(() => {
          const btn = event.target;
          const originalText = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => btn.textContent = originalText, 2000);
        });
      };

      // Initialize forms
      function initForms() {
        const kitchenSinkSchema = {
          display: 'form',
          components: [
            { 
              type: 'htmlelement', 
              tag: 'h3', 
              content: 'Basic Fields',
              className: 'mb-3 text-lg font-semibold'
            },
            { type: 'textfield', key: 'firstName', label: 'First Name', placeholder: 'Enter your first name', validate: { required: true } },
            { type: 'textfield', key: 'lastName', label: 'Last Name', placeholder: 'Enter your last name', validate: { required: true } },
            { type: 'email', key: 'email', label: 'Email Address', placeholder: 'you@example.com', validate: { required: true } },
            { type: 'phoneNumber', key: 'phone', label: 'Phone Number', placeholder: '(555) 555-5555' },
            { type: 'number', key: 'age', label: 'Age', placeholder: '18', validate: { min: 18, max: 120 } },
            { type: 'password', key: 'password', label: 'Password', placeholder: 'Enter password', validate: { required: true } },
            { type: 'url', key: 'website', label: 'Website', placeholder: 'https://example.com' },
            { type: 'textarea', key: 'bio', label: 'Biography', rows: 4, placeholder: 'Tell us about yourself' },
            
            { 
              type: 'htmlelement', 
              tag: 'h3', 
              content: 'Date & Time Fields',
              className: 'mt-4 mb-3 text-lg font-semibold'
            },
            { type: 'datetime', key: 'appointmentDateTime', label: 'Appointment Date & Time', format: 'yyyy-MM-dd hh:mm a', enableTime: true },
            { type: 'day', key: 'birthDate', label: 'Birth Date (Day/Month/Year)' },
            { type: 'time', key: 'preferredTime', label: 'Preferred Contact Time' },
            
            { 
              type: 'htmlelement', 
              tag: 'h3', 
              content: 'Selection Fields',
              className: 'mt-4 mb-3 text-lg font-semibold'
            },
            { 
              type: 'select', 
              key: 'country', 
              label: 'Country', 
              placeholder: 'Select your country',
              data: { 
                values: [
                  { label: 'United States', value: 'us' },
                  { label: 'Canada', value: 'ca' },
                  { label: 'United Kingdom', value: 'uk' },
                  { label: 'Australia', value: 'au' },
                  { label: 'Germany', value: 'de' },
                  { label: 'France', value: 'fr' }
                ] 
              }
            },
            { 
              type: 'selectboxes', 
              key: 'interests', 
              label: 'Interests (Multiple Selection)', 
              values: [
                { label: 'Sports', value: 'sports' },
                { label: 'Music', value: 'music' },
                { label: 'Technology', value: 'tech' },
                { label: 'Travel', value: 'travel' },
                { label: 'Reading', value: 'reading' }
              ]
            },
            { 
              type: 'radio', 
              key: 'gender', 
              label: 'Gender', 
              values: [
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
                { label: 'Non-binary', value: 'nonbinary' },
                { label: 'Prefer not to say', value: 'prefer_not_to_say' }
              ]
            },
            { type: 'checkbox', key: 'newsletter', label: 'Subscribe to newsletter' },
            { type: 'checkbox', key: 'terms', label: 'I agree to the terms and conditions', validate: { required: true } },
            
            { 
              type: 'htmlelement', 
              tag: 'h3', 
              content: 'Advanced Fields',
              className: 'mt-4 mb-3 text-lg font-semibold'
            },
            { 
              type: 'currency', 
              key: 'salary', 
              label: 'Expected Salary', 
              currency: 'USD',
              placeholder: '$50,000'
            },
            { 
              type: 'tags', 
              key: 'skills', 
              label: 'Skills (Type and press Enter)', 
              placeholder: 'e.g. JavaScript, Python, React'
            },
            { 
              type: 'survey', 
              key: 'satisfaction', 
              label: 'Satisfaction Survey',
              questions: [
                { label: 'Product Quality', value: 'quality' },
                { label: 'Customer Service', value: 'service' },
                { label: 'Value for Money', value: 'value' }
              ],
              values: [
                { label: 'Poor', value: '1' },
                { label: 'Fair', value: '2' },
                { label: 'Good', value: '3' },
                { label: 'Excellent', value: '4' }
              ]
            },
            { 
              type: 'signature', 
              key: 'signature', 
              label: 'Signature', 
              footer: 'Sign above',
              width: '100%',
              height: '150px'
            },
            { 
              type: 'file', 
              key: 'resume', 
              label: 'Upload Resume (PDF, DOC)', 
              storage: 'base64',
              filePattern: '.pdf,.doc,.docx',
              fileMaxSize: '5MB'
            },
            
            { type: 'button', action: 'submit', label: 'Submit Kitchen Sink Form', theme: 'primary', className: 'mt-4' }
          ]
        };
        Formio.createForm(document.getElementById('form-kitchen-sink'), kitchenSinkSchema);

        // Simple Contact
        const contactSchema = {
          display: 'form',
          components: [
            { type: 'textfield', key: 'name', label: 'Full Name', validate: { required: true } },
            { type: 'email', key: 'email', label: 'Email Address', validate: { required: true } },
            { type: 'textarea', key: 'message', label: 'Message', rows: 5, validate: { required: true } },
            { type: 'button', action: 'submit', label: 'Send Message', theme: 'primary' }
          ]
        };
        Formio.createForm(document.getElementById('form-simple-contact'), contactSchema);

        // Thank You Page - Match Form.io's official example
        const thankYouSchema = {
          display: 'form',
          components: [
            { 
              type: 'htmlelement', 
              tag: 'p', 
              content: 'Fill out this form and watch it redirect to a thank you page after submission.',
              className: 'mb-4 text-gray-600'
            },
            { type: 'textfield', key: 'firstName', label: 'First Name', placeholder: 'Enter your first name', validate: { required: true } },
            { type: 'textfield', key: 'lastName', label: 'Last Name', placeholder: 'Enter your last name', validate: { required: true } },
            { type: 'email', key: 'email', label: 'Email Address', placeholder: 'you@example.com', validate: { required: true } },
            { type: 'phoneNumber', key: 'phone', label: 'Phone Number', placeholder: '(555) 555-5555' },
            { type: 'textarea', key: 'message', label: 'Message', rows: 4, placeholder: 'Your message here...', validate: { required: true } },
            { type: 'button', action: 'submit', label: 'Submit Form', theme: 'primary' }
          ]
        };
        Formio.createForm(document.getElementById('form-thank-you'), thankYouSchema)
          .then(function(form) {
            form.on('submitDone', function(submission) {
              console.log('Form submitted:', submission);
              form.element.style.display = 'none';
              const thankYouMsg = document.getElementById('thank-you-message');
              thankYouMsg.style.display = 'block';
              // In a real application, you would redirect:
              // window.location = '/thank-you-page';
            });
          });

        // Wizard - Proper 3-step multi-page wizard
        const wizardSchema = {
          display: 'wizard',
          components: [
            {
              type: 'panel',
              key: 'step1PersonalInfo',
              title: 'Step 1: Personal Information',
              components: [
                { 
                  type: 'htmlelement', 
                  tag: 'p', 
                  content: 'Please provide your personal information.',
                  className: 'mb-3 text-gray-600'
                },
                { type: 'textfield', key: 'firstName', label: 'First Name', placeholder: 'John', validate: { required: true } },
                { type: 'textfield', key: 'lastName', label: 'Last Name', placeholder: 'Doe', validate: { required: true } },
                { type: 'datetime', key: 'birthDate', label: 'Date of Birth', format: 'yyyy-MM-dd', validate: { required: true } },
                { 
                  type: 'select', 
                  key: 'gender', 
                  label: 'Gender',
                  data: { 
                    values: [
                      { label: 'Male', value: 'male' },
                      { label: 'Female', value: 'female' },
                      { label: 'Non-binary', value: 'nonbinary' },
                      { label: 'Prefer not to say', value: 'other' }
                    ]
                  }
                }
              ]
            },
            {
              type: 'panel',
              key: 'step2ContactInfo',
              title: 'Step 2: Contact Information',
              components: [
                { 
                  type: 'htmlelement', 
                  tag: 'p', 
                  content: 'How can we reach you?',
                  className: 'mb-3 text-gray-600'
                },
                { type: 'email', key: 'email', label: 'Email Address', placeholder: 'john.doe@example.com', validate: { required: true } },
                { type: 'phoneNumber', key: 'phone', label: 'Phone Number', placeholder: '(555) 555-5555', validate: { required: true } },
                { type: 'textfield', key: 'address', label: 'Street Address', placeholder: '123 Main St' },
                { type: 'textfield', key: 'city', label: 'City', placeholder: 'New York' },
                { 
                  type: 'select', 
                  key: 'country', 
                  label: 'Country',
                  data: { 
                    values: [
                      { label: 'United States', value: 'us' },
                      { label: 'Canada', value: 'ca' },
                      { label: 'United Kingdom', value: 'uk' },
                      { label: 'Australia', value: 'au' }
                    ]
                  },
                  validate: { required: true }
                }
              ]
            },
            {
              type: 'panel',
              key: 'step3Preferences',
              title: 'Step 3: Preferences & Review',
              components: [
                { 
                  type: 'htmlelement', 
                  tag: 'p', 
                  content: 'Almost done! Tell us your preferences.',
                  className: 'mb-3 text-gray-600'
                },
                { 
                  type: 'selectboxes', 
                  key: 'interests', 
                  label: 'Areas of Interest', 
                  values: [
                    { label: 'Product Updates', value: 'products' },
                    { label: 'Newsletter', value: 'newsletter' },
                    { label: 'Special Offers', value: 'offers' },
                    { label: 'Events & Webinars', value: 'events' }
                  ]
                },
                { 
                  type: 'radio', 
                  key: 'contactMethod', 
                  label: 'Preferred Contact Method',
                  values: [
                    { label: 'Email', value: 'email' },
                    { label: 'Phone', value: 'phone' },
                    { label: 'SMS', value: 'sms' }
                  ],
                  validate: { required: true }
                },
                { type: 'textarea', key: 'comments', label: 'Additional Comments', rows: 3, placeholder: 'Any other information you would like to share...' },
                { type: 'checkbox', key: 'terms', label: 'I agree to the terms and conditions', validate: { required: true } }
              ]
            }
          ]
        };
        Formio.createForm(document.getElementById('form-wizard'), wizardSchema);

        // Conditional Logic
        const conditionalSchema = {
          display: 'form',
          components: [
            { type: 'checkbox', key: 'hasCompany', label: 'I am registering on behalf of a company' },
            { type: 'textfield', key: 'companyName', label: 'Company Name', 
              conditional: { show: true, when: 'hasCompany', eq: true }
            },
            { type: 'button', action: 'submit', label: 'Submit', theme: 'primary' }
          ]
        };
        Formio.createForm(document.getElementById('form-conditional'), conditionalSchema);

        // File Upload - Proper example with actual file field
        const fileSchema = {
          display: 'form',
          components: [
            { 
              type: 'htmlelement', 
              tag: 'p', 
              content: 'Upload files to Cloudflare R2 storage (or base64 encoding for demo).',
              className: 'mb-4 text-gray-600'
            },
            { type: 'textfield', key: 'name', label: 'Your Name', placeholder: 'John Doe', validate: { required: true } },
            { type: 'email', key: 'email', label: 'Email Address', placeholder: 'john@example.com', validate: { required: true } },
            { 
              type: 'file', 
              key: 'resume', 
              label: 'Upload Resume (PDF, DOC, DOCX)', 
              storage: 'base64',
              filePattern: '.pdf,.doc,.docx',
              fileMaxSize: '5MB',
              validate: { required: true }
            },
            { 
              type: 'file', 
              key: 'portfolio', 
              label: 'Portfolio/Work Samples (Optional)', 
              storage: 'base64',
              filePattern: '.pdf,.zip,.jpg,.png',
              fileMaxSize: '10MB',
              multiple: false
            },
            { 
              type: 'file', 
              key: 'attachments', 
              label: 'Additional Attachments (Multiple files allowed)', 
              storage: 'base64',
              multiple: true,
              fileMaxSize: '5MB'
            },
            { type: 'textarea', key: 'coverLetter', label: 'Cover Letter', rows: 5, placeholder: 'Tell us why you are a great fit...' },
            { type: 'button', action: 'submit', label: 'Upload & Submit', theme: 'primary' }
          ]
        };
        Formio.createForm(document.getElementById('form-file-upload'), fileSchema);

        // Address (without API key for demo)
        const addressSchema = {
          display: 'form',
          components: [
            { type: 'textfield', key: 'street', label: 'Street Address' },
            { type: 'textfield', key: 'city', label: 'City' },
            { type: 'textfield', key: 'state', label: 'State' },
            { type: 'textfield', key: 'zip', label: 'ZIP Code' },
            { type: 'button', action: 'submit', label: 'Submit', theme: 'primary' }
          ]
        };
        Formio.createForm(document.getElementById('form-address'), addressSchema);

        // Signature
        const signatureSchema = {
          display: 'form',
          components: [
            { type: 'textfield', key: 'name', label: 'Your Name' },
            { type: 'signature', key: 'signature', label: 'Sign Here', width: '100%', height: '150px' },
            { type: 'button', action: 'submit', label: 'Submit', theme: 'primary' }
          ]
        };
        Formio.createForm(document.getElementById('form-signature'), signatureSchema);

        // Data Grid
        const dataGridSchema = {
          display: 'form',
          components: [
            { 
              type: 'datagrid', 
              key: 'items', 
              label: 'Items',
              components: [
                { type: 'textfield', key: 'item', label: 'Item' },
                { type: 'number', key: 'quantity', label: 'Quantity' }
              ]
            },
            { type: 'button', action: 'submit', label: 'Submit', theme: 'primary' }
          ]
        };
        Formio.createForm(document.getElementById('form-data-grid'), dataGridSchema);
        
        // Turnstile Protection Form
        const turnstileSchema = {
          components: [
            { 
              type: 'textfield', 
              key: 'fullName', 
              label: 'Full Name',
              placeholder: 'Enter your full name',
              validate: { required: true }
            },
            { 
              type: 'email', 
              key: 'email', 
              label: 'Email Address',
              placeholder: 'you@example.com',
              validate: { required: true }
            },
            { 
              type: 'textarea', 
              key: 'message', 
              label: 'Message',
              placeholder: 'Tell us what you are thinking...',
              rows: 4,
              validate: { required: true }
            },
            {
              type: 'turnstile',
              key: 'turnstile',
              label: 'Security Verification',
              theme: 'auto',
              size: 'normal',
              appearance: 'always',
              persistent: false,
              protected: true
            },
            { 
              type: 'button', 
              action: 'submit', 
              label: 'Send Secure Message', 
              theme: 'primary',
              block: true
            }
          ]
        };
        Formio.createForm(document.getElementById('form-turnstile'), turnstileSchema);
      }

      // Wait for Form.io to load
      if (typeof Formio !== 'undefined') {
        initForms();
        setupNavigation();
      } else {
        setTimeout(function checkFormio() {
          if (typeof Formio !== 'undefined') {
            initForms();
            setupNavigation();
          } else {
            setTimeout(checkFormio, 100);
          }
        }, 100);
      }
    </script>
  `

  const layoutData: AdminLayoutCatalystData = {
    title: 'Forms Examples',
    pageTitle: 'Forms Examples',
    content: pageContent,
    user: data.user,
    version: data.version
  }

  return renderAdminLayoutCatalyst(layoutData)
}
