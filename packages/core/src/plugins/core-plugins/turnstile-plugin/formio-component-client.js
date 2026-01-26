/**
 * Custom Form.io Turnstile Component (Client-side version)
 * 
 * This component adds Cloudflare Turnstile CAPTCHA-free bot protection to Form.io forms.
 * It can be dragged and dropped into the form builder.
 */

(function() {
  'use strict';

  if (!window.Formio || !window.Formio.Components) {
    console.error('Form.io library not loaded');
    return;
  }

  const FieldComponent = Formio.Components.components.field;

  class TurnstileComponent extends FieldComponent {
    static schema(...extend) {
      return FieldComponent.schema({
        type: 'turnstile',
        label: 'Turnstile Verification',
        key: 'turnstile',
        input: true,
        persistent: false, // Don't save token to database
        protected: true,   // Hide from API responses
        unique: false,
        hidden: false,
        clearOnHide: true,
        tableView: false,
        validate: {
          required: false
        },
        // Turnstile-specific settings
        siteKey: '',
        theme: 'auto',
        size: 'normal',
        action: '',
        appearance: 'always',
        errorMessage: 'Please complete the security verification'
      }, ...extend);
    }

    static get builderInfo() {
      return {
        title: 'Turnstile',
        group: 'premium',
        icon: 'shield-alt',
        weight: 120,
        documentation: '/admin/forms/docs#turnstile',
        schema: TurnstileComponent.schema()
      };
    }

    constructor(component, options, data) {
      super(component, options, data);
      this.widgetId = null;
      this.scriptLoaded = false;
    }

    init() {
      super.init();
      this.loadTurnstileScript();
    }

    loadTurnstileScript() {
      if (window.turnstile) {
        this.scriptLoaded = true;
        return Promise.resolve();
      }

      if (this.scriptPromise) {
        return this.scriptPromise;
      }

      this.scriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.scriptLoaded = true;
          resolve();
        };
        script.onerror = () => reject(new Error('Failed to load Turnstile'));
        document.head.appendChild(script);
      });

      return this.scriptPromise;
    }

    render() {
      return super.render(`
        <div ref="turnstileContainer" class="formio-component-turnstile">
          <div ref="turnstileWidget" style="margin: 10px 0;"></div>
          ${this.component.description ? `<div class="help-block">${this.component.description}</div>` : ''}
        </div>
      `);
    }

    attach(element) {
      this.loadRefs(element, {
        turnstileContainer: 'single',
        turnstileWidget: 'single'
      });

      const superAttach = super.attach(element);

      this.loadTurnstileScript()
        .then(() => this.renderWidget())
        .catch(err => {
          console.error('Failed to load Turnstile:', err);
          if (this.refs.turnstileWidget) {
            this.refs.turnstileWidget.innerHTML = `
              <div class="alert alert-danger" style="padding: 10px; background: #fee; border: 1px solid #fcc; border-radius: 4px;">
                <strong>Error:</strong> Failed to load security verification
              </div>
            `;
          }
        });

      return superAttach;
    }

    renderWidget() {
      if (!this.refs.turnstileWidget || !window.turnstile) {
        return;
      }

      // Clear any existing content
      this.refs.turnstileWidget.innerHTML = '';

      // Get site key from component settings or global plugin settings
      const siteKey = this.component.siteKey || 
                      (this.root && this.root.options && this.root.options.turnstileSiteKey) || 
                      '';
      
      if (!siteKey) {
        this.refs.turnstileWidget.innerHTML = `
          <div class="alert alert-warning" style="padding: 10px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px;">
            <strong>⚠️ Configuration Required:</strong> Turnstile site key not configured. 
            Please enable the Turnstile plugin in Settings → Plugins.
          </div>
        `;
        return;
      }

      try {
        const self = this;
        this.widgetId = window.turnstile.render(this.refs.turnstileWidget, {
          sitekey: siteKey,
          theme: this.component.theme || 'auto',
          size: this.component.size || 'normal',
          action: this.component.action || '',
          appearance: this.component.appearance || 'always',
          callback: function(token) {
            self.updateValue(token);
            self.triggerChange();
          },
          'error-callback': function() {
            self.updateValue(null);
            self.setCustomValidity(self.component.errorMessage || 'Security verification failed');
          },
          'expired-callback': function() {
            self.updateValue(null);
            self.setCustomValidity('Security verification expired. Please verify again.');
          },
          'timeout-callback': function() {
            self.updateValue(null);
            self.setCustomValidity('Security verification timed out. Please try again.');
          }
        });
      } catch (err) {
        console.error('Failed to render Turnstile widget:', err);
        this.refs.turnstileWidget.innerHTML = `
          <div class="alert alert-danger" style="padding: 10px; background: #fee; border: 1px solid #fcc; border-radius: 4px;">
            <strong>Error:</strong> Failed to render security verification
          </div>
        `;
      }
    }

    detach() {
      if (this.widgetId !== null && window.turnstile) {
        try {
          window.turnstile.remove(this.widgetId);
          this.widgetId = null;
        } catch (err) {
          console.error('Failed to remove Turnstile widget:', err);
        }
      }
      return super.detach();
    }

    getValue() {
      if (this.widgetId !== null && window.turnstile) {
        return window.turnstile.getResponse(this.widgetId);
      }
      return this.dataValue;
    }

    setValue(value, flags) {
      const changed = super.setValue(value, flags);
      return changed;
    }

    getValueAsString(value) {
      return value ? '✅ Verified' : '❌ Not Verified';
    }

    isEmpty(value) {
      return !value;
    }

    updateValue(value, flags) {
      const changed = super.updateValue(value, flags);
      
      // Clear any validation errors when token is received
      if (value) {
        this.setCustomValidity('');
      }
      
      return changed;
    }

    checkValidity(data, dirty, row) {
      const result = super.checkValidity(data, dirty, row);
      
      // If validation is required and no token
      if (this.component.validate && this.component.validate.required) {
        const value = this.getValue();
        if (!value) {
          this.setCustomValidity(this.component.errorMessage || 'Please complete the security verification');
          return false;
        }
      }
      
      return result;
    }
  }

  // Register the component
  Formio.Components.addComponent('turnstile', TurnstileComponent);
  console.log('✅ Turnstile component registered with Form.io');

  // Export for potential later use
  window.TurnstileComponent = TurnstileComponent;
})();
