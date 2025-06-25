import { renderForm, FormData, FormField } from '../components/form.template'
import { renderAlert } from '../components/alert.template'
import { renderLogo } from '../components/logo.template'

export interface LoginPageData {
  error?: string
  message?: string
}

export function renderLoginPage(data: LoginPageData): string {
  const fields: FormField[] = [
    {
      name: 'email',
      label: 'Email address',
      type: 'email',
      placeholder: 'Email address',
      required: true
    },
    {
      name: 'password',
      label: 'Password',
      type: 'text', // We'll handle password type in the HTML directly
      placeholder: 'Password',
      required: true
    }
  ]

  const formData: FormData = {
    id: 'login-form',
    hxPost: '/auth/login/form',
    hxTarget: '#form-response',
    fields: fields,
    submitButtons: [
      {
        label: 'Sign in',
        type: 'submit',
        className: 'w-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
      }
    ]
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login - SonicJS AI</title>
      <script src="https://unpkg.com/htmx.org@2.0.3"></script>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <style>
        .form-input {
          appearance: none;
          position: relative;
          display: block;
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background-color: white;
          color: #111827;
          placeholder-color: #6b7280;
        }
        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          ring: 2px;
          ring-color: #3b82f6;
          z-index: 10;
        }
        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.25rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          border: 1px solid transparent;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 150ms ease-in-out;
        }
      </style>
    </head>
    <body class="bg-gray-50 min-h-screen flex items-center justify-center">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <div class="flex justify-center mb-6">
            ${renderLogo({ size: 'xl', showText: true })}
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to SonicJS AI
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Or <a href="/auth/register" class="font-medium text-blue-600 hover:text-blue-500">create a new account</a>
          </p>
        </div>
        
        ${data.error ? `<div id="login-form-error">${renderAlert({ type: 'error', message: data.error })}</div>` : ''}
        ${data.message ? renderAlert({ type: 'success', message: data.message }) : ''}
        
        ${renderForm(formData)}
        
        <div id="form-response"></div>
      </div>
      
      <script>
        // Make password field actually a password type
        document.addEventListener('DOMContentLoaded', function() {
          const passwordField = document.querySelector('input[name="password"]');
          if (passwordField) {
            passwordField.type = 'password';
            passwordField.autocomplete = 'current-password';
          }
          
          const emailField = document.querySelector('input[name="email"]');
          if (emailField) {
            emailField.autocomplete = 'email';
          }
        });
      </script>
    </body>
    </html>
  `
}