import { renderAlert } from '../components/alert.template'

export interface LoginPageData {
  error?: string
  message?: string
}

export function renderLoginPage(data: LoginPageData, demoLoginActive: boolean = false): string {
  return `
    <!DOCTYPE html>
    <html lang="en" class="h-full dark">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login - SonicJS AI</title>
      <link rel="icon" type="image/x-icon" href="https://demo.sonicjs.com/images/favicon.ico">
      <script src="https://unpkg.com/htmx.org@2.0.3"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          darkMode: 'class',
          theme: {
            extend: {}
          }
        }
      </script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
      </style>
    </head>
    <body class="h-full bg-zinc-950">
      <div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <!-- Logo Section -->
        <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white">
            <svg class="h-7 w-7 text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h1 class="mt-6 text-3xl font-semibold tracking-tight text-white">SonicJS AI</h1>
          <p class="mt-2 text-sm text-zinc-400">Sign in to your account to continue</p>
        </div>

        <!-- Form Container -->
        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div class="bg-zinc-900 shadow-sm ring-1 ring-white/10 rounded-xl px-6 py-8 sm:px-10">
            <!-- Alerts -->
            ${data.error ? `<div class="mb-6">${renderAlert({ type: 'error', message: data.error })}</div>` : ''}
            ${data.message ? `<div class="mb-6">${renderAlert({ type: 'success', message: data.message })}</div>` : ''}

            <!-- Form Response (HTMX target) -->
            <div id="form-response" class="mb-6"></div>

            <!-- Form -->
            <form
              id="login-form"
              hx-post="/auth/login/form"
              hx-target="#form-response"
              hx-swap="innerHTML"
              class="space-y-6"
            >
              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  class="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
                  placeholder="Enter your email"
                >
              </div>

              <!-- Password -->
              <div>
                <label for="password" class="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  class="w-full rounded-lg bg-zinc-800 px-3 py-2 text-sm text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white transition-shadow"
                  placeholder="Enter your password"
                >
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                class="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors"
              >
                Sign In
              </button>
            </form>

            <!-- Links -->
            <div class="mt-6 text-center">
              <p class="text-sm text-zinc-400">
                Don't have an account?
                <a href="/auth/register" class="font-semibold text-white hover:text-zinc-300 transition-colors">Create one here</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      ${demoLoginActive ? `
      <script>
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
                notice.className = 'mb-6 rounded-lg bg-blue-500/10 p-4 ring-1 ring-blue-500/20';
                notice.innerHTML = '<div class="flex items-start gap-x-3"><svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><div><h3 class="text-sm font-semibold text-blue-300">Demo Mode</h3><p class="mt-1 text-sm text-blue-400">Login form prefilled with demo credentials</p></div></div>';
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
      </script>
      ` : ''}
    </body>
    </html>
  `
}