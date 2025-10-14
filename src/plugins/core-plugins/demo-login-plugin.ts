import { PluginBuilder } from '../sdk/plugin-builder'
import type { Plugin, PluginContext, HookHandler } from '../types'

/**
 * Demo Login Plugin
 * 
 * Prefills the login form with demo credentials (admin@sonicjs.com/admin123)
 * when activated, making it easy for demo site visitors to log in.
 */

const demoLoginAssets = {
  js: `
    // Demo Login Prefill Script
    (function() {
      'use strict';
      
      function prefillLoginForm() {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        if (emailInput && passwordInput) {
          emailInput.value = 'admin@sonicjs.com';
          passwordInput.value = 'admin123';
          
          // Add visual indication that form is prefilled
          const form = emailInput.closest('form');
          if (form) {
            const notice = document.createElement('div');
            notice.className = 'mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm';
            notice.innerHTML = '🎯 <strong>Demo Mode:</strong> Login form prefilled with demo credentials';
            form.insertBefore(notice, form.firstChild);
          }
        }
      }
      
      // Prefill on page load
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', prefillLoginForm);
      } else {
        prefillLoginForm();
      }
      
      // Also handle HTMX page changes (for SPA-like navigation)
      document.addEventListener('htmx:afterSwap', function(event) {
        if (event.detail.target.id === 'main-content' || 
            document.getElementById('email')) {
          setTimeout(prefillLoginForm, 100);
        }
      });
    })();
  `
}

const loginPrefillHook: HookHandler = async (data: any, context: any) => {
  // Add demo login script to pages that contain login forms
  if (data.pageType === 'auth-login' || data.template?.includes('login')) {
    if (!data.scripts) {
      data.scripts = []
    }
    
    // Add inline script for login prefill
    data.inlineScripts = data.inlineScripts || []
    data.inlineScripts.push(demoLoginAssets.js)
  }
  
  return data
}

const demoLoginPlugin: Plugin = PluginBuilder.create({
  name: 'demo-login-plugin',
  version: '1.0.0-beta.1',
  description: 'Prefills login form with demo credentials for easy site demonstration',
  author: {
    name: 'SonicJS'
  }
})
  .addHook('template:render', loginPrefillHook)
  .addHook('page:before-render', loginPrefillHook)
  .metadata({
    description: 'Prefills login form with demo credentials (admin@sonicjs.com/admin123) for easy site demonstration',
    author: {
      name: 'SonicJS'
    },
    dependencies: []
  })
  .build()

export { demoLoginPlugin }