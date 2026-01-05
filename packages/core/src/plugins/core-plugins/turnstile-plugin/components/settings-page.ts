import type { TurnstileSettings } from '../services/turnstile'

export function renderSettingsPage(settings: TurnstileSettings | null): string {
  const currentSettings = settings || {
    siteKey: '',
    secretKey: '',
    theme: 'auto',
    size: 'normal',
    mode: 'managed',
    appearance: 'always',
    enabled: false
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Turnstile Settings - SonicJS</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    </head>
    <body class="bg-light">
      <div class="container py-5">
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <!-- Header -->
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 class="h3 mb-1">
                  <i class="bi bi-shield-check text-primary me-2"></i>
                  Cloudflare Turnstile Settings
                </h1>
                <p class="text-muted mb-0">Configure CAPTCHA-free bot protection for your forms</p>
              </div>
              <a href="/admin/plugins" class="btn btn-outline-secondary">
                <i class="bi bi-arrow-left me-1"></i> Back to Plugins
              </a>
            </div>

            <!-- Success Alert -->
            <div id="success-alert" class="alert alert-success alert-dismissible fade" role="alert" style="display: none;">
              <i class="bi bi-check-circle me-2"></i>
              <span id="success-message">Settings saved successfully!</span>
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>

            <!-- Error Alert -->
            <div id="error-alert" class="alert alert-danger alert-dismissible fade" role="alert" style="display: none;">
              <i class="bi bi-exclamation-triangle me-2"></i>
              <span id="error-message">An error occurred</span>
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>

            <!-- Info Card -->
            <div class="card mb-4 border-info">
              <div class="card-body">
                <h5 class="card-title">
                  <i class="bi bi-info-circle text-info me-2"></i>
                  Getting Started
                </h5>
                <p class="card-text mb-2">
                  Cloudflare Turnstile provides CAPTCHA-free bot protection. To use it:
                </p>
                <ol class="mb-0">
                  <li>Get your site key and secret key from the 
                    <a href="https://dash.cloudflare.com/?to=/:account/turnstile" target="_blank" rel="noopener">
                      Cloudflare Dashboard <i class="bi bi-box-arrow-up-right small"></i>
                    </a>
                  </li>
                  <li>Enter your keys below and enable Turnstile</li>
                  <li>The widget will automatically appear on protected forms</li>
                </ol>
              </div>
            </div>

            <!-- Settings Form -->
            <div class="card shadow-sm">
              <div class="card-body">
                <form id="settings-form">
                  <!-- Enable/Disable Toggle -->
                  <div class="mb-4">
                    <div class="form-check form-switch">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="enabled" 
                        name="enabled"
                        ${currentSettings.enabled ? 'checked' : ''}
                      >
                      <label class="form-check-label fw-bold" for="enabled">
                        Enable Turnstile Protection
                      </label>
                    </div>
                    <small class="text-muted">Turn on to protect all forms with Turnstile verification</small>
                  </div>

                  <hr>

                  <!-- Site Key -->
                  <div class="mb-3">
                    <label for="siteKey" class="form-label fw-bold">
                      Site Key <span class="text-danger">*</span>
                    </label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="siteKey" 
                      name="siteKey"
                      value="${currentSettings.siteKey}"
                      placeholder="0x4AAAAAAAA..."
                      required
                    >
                    <small class="text-muted">
                      Public site key (visible in frontend HTML)
                    </small>
                  </div>

                  <!-- Secret Key -->
                  <div class="mb-3">
                    <label for="secretKey" class="form-label fw-bold">
                      Secret Key <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <input 
                        type="password" 
                        class="form-control" 
                        id="secretKey" 
                        name="secretKey"
                        value="${currentSettings.secretKey}"
                        placeholder="0x4AAAAAAAA..."
                        required
                      >
                      <button class="btn btn-outline-secondary" type="button" id="toggle-secret">
                        <i class="bi bi-eye" id="eye-icon"></i>
                      </button>
                    </div>
                    <small class="text-muted">
                      Private secret key (used for server-side verification only)
                    </small>
                  </div>

                  <hr>

                  <!-- Theme -->
                  <div class="mb-3">
                    <label for="theme" class="form-label fw-bold">Widget Theme</label>
                    <select class="form-select" id="theme" name="theme">
                      <option value="auto" ${currentSettings.theme === 'auto' ? 'selected' : ''}>Auto (matches page theme)</option>
                      <option value="light" ${currentSettings.theme === 'light' ? 'selected' : ''}>Light</option>
                      <option value="dark" ${currentSettings.theme === 'dark' ? 'selected' : ''}>Dark</option>
                    </select>
                    <small class="text-muted">Visual appearance of the Turnstile widget</small>
                  </div>

                  <!-- Size -->
                  <div class="mb-3">
                    <label for="size" class="form-label fw-bold">Widget Size</label>
                    <select class="form-select" id="size" name="size">
                      <option value="normal" ${currentSettings.size === 'normal' ? 'selected' : ''}>Normal (300x65px)</option>
                      <option value="compact" ${currentSettings.size === 'compact' ? 'selected' : ''}>Compact (130x120px)</option>
                    </select>
                    <small class="text-muted">Size of the Turnstile challenge widget</small>
                  </div>

                  <!-- Widget Mode -->
                  <div class="mb-3">
                    <label for="mode" class="form-label fw-bold">Widget Mode</label>
                    <select class="form-select" id="mode" name="mode">
                      <option value="managed" ${!currentSettings.mode || currentSettings.mode === 'managed' ? 'selected' : ''}>
                        Managed (Recommended) - Adaptive challenge
                      </option>
                      <option value="non-interactive" ${currentSettings.mode === 'non-interactive' ? 'selected' : ''}>
                        Non-Interactive - Always visible, minimal friction
                      </option>
                      <option value="invisible" ${currentSettings.mode === 'invisible' ? 'selected' : ''}>
                        Invisible - No visible widget
                      </option>
                    </select>
                    <small class="text-muted">
                      <strong>Managed:</strong> Shows challenge only when needed. 
                      <strong>Non-Interactive:</strong> Always shows but doesn't require interaction. 
                      <strong>Invisible:</strong> Runs in background without UI.
                    </small>
                  </div>

                  <!-- Appearance (Pre-clearance) -->
                  <div class="mb-4">
                    <label for="appearance" class="form-label fw-bold">Pre-clearance / Appearance</label>
                    <select class="form-select" id="appearance" name="appearance">
                      <option value="always" ${!currentSettings.appearance || currentSettings.appearance === 'always' ? 'selected' : ''}>
                        Always - Pre-clearance enabled
                      </option>
                      <option value="execute" ${currentSettings.appearance === 'execute' ? 'selected' : ''}>
                        Execute - Challenge on explicit trigger
                      </option>
                      <option value="interaction-only" ${currentSettings.appearance === 'interaction-only' ? 'selected' : ''}>
                        Interaction Only - Challenge on user interaction
                      </option>
                    </select>
                    <small class="text-muted">
                      Controls when Turnstile verification occurs. 
                      <strong>Always:</strong> Verifies immediately (pre-clearance). 
                      <strong>Execute:</strong> Verifies on form submit. 
                      <strong>Interaction Only:</strong> Only after user interaction.
                    </small>
                  </div>

                  <!-- Submit Button -->
                  <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button type="reset" class="btn btn-secondary">
                      <i class="bi bi-x-circle me-1"></i> Reset
                    </button>
                    <button type="submit" class="btn btn-primary">
                      <i class="bi bi-save me-1"></i> Save Settings
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Usage Guide -->
            <div class="card mt-4">
              <div class="card-body">
                <h5 class="card-title">
                  <i class="bi bi-book text-primary me-2"></i>
                  Usage Guide
                </h5>
                <p>Once enabled, Turnstile will automatically protect forms that use the verification middleware:</p>
                <pre class="bg-light p-3 rounded"><code>import { verifyTurnstile } from '@sonicjs-cms/core/plugins'

// Protect a route with Turnstile
app.post('/api/contact', verifyTurnstile, async (c) => {
  // Form processing code...
})</code></pre>
                <p class="mb-0">
                  <a href="https://developers.cloudflare.com/turnstile/" target="_blank" rel="noopener">
                    View Turnstile Documentation <i class="bi bi-box-arrow-up-right small"></i>
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
      <script>
        // Toggle secret key visibility
        document.getElementById('toggle-secret').addEventListener('click', function() {
          const secretInput = document.getElementById('secretKey');
          const eyeIcon = document.getElementById('eye-icon');
          
          if (secretInput.type === 'password') {
            secretInput.type = 'text';
            eyeIcon.classList.remove('bi-eye');
            eyeIcon.classList.add('bi-eye-slash');
          } else {
            secretInput.type = 'password';
            eyeIcon.classList.remove('bi-eye-slash');
            eyeIcon.classList.add('bi-eye');
          }
        });

        // Form submission
        document.getElementById('settings-form').addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const formData = new FormData(e.target);
          const settings = {
            siteKey: formData.get('siteKey'),
            secretKey: formData.get('secretKey'),
            theme: formData.get('theme'),
            size: formData.get('size'),
            enabled: formData.get('enabled') === 'on'
          };

          try {
            const response = await fetch('/admin/plugins/turnstile/settings', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(settings)
            });

            if (response.ok) {
              const successAlert = document.getElementById('success-alert');
              successAlert.style.display = 'block';
              successAlert.classList.add('show');
              setTimeout(() => {
                successAlert.classList.remove('show');
                setTimeout(() => successAlert.style.display = 'none', 150);
              }, 3000);
            } else {
              throw new Error('Failed to save settings');
            }
          } catch (error) {
            const errorAlert = document.getElementById('error-alert');
            document.getElementById('error-message').textContent = error.message;
            errorAlert.style.display = 'block';
            errorAlert.classList.add('show');
          }
        });
      </script>
    </body>
    </html>
  `
}
