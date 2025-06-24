import { renderForm, FormData, FormField } from '../components/form.template'
import { renderAlert } from '../components/alert.template'
import { renderLogo } from '../components/logo.template'

export interface RegisterPageData {
  error?: string
}

export function renderRegisterPage(data: RegisterPageData): string {
  const fields: FormField[] = [
    {
      name: 'firstName',
      label: 'First name',
      type: 'text',
      placeholder: 'First name',
      required: true
    },
    {
      name: 'lastName',
      label: 'Last name',
      type: 'text',
      placeholder: 'Last name',
      required: true
    },
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      placeholder: 'Username',
      required: true
    },
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
      placeholder: 'Password (min. 8 characters)',
      required: true
    }
  ]

  const formData: FormData = {
    id: 'register-form',
    hxPost: '/auth/register/form',
    hxTarget: '#form-response',
    fields: fields,
    submitButtons: [
      {
        label: 'Create account',
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
      <title>Register - SonicJS AI</title>
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
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
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
            Create your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Or <a href="/auth/login" class="font-medium text-blue-600 hover:text-blue-500">sign in to existing account</a>
          </p>
        </div>
        
        ${data.error ? renderAlert({ type: 'error', message: data.error }) : ''}
        
        <div class="mt-8 space-y-6">
          <form 
            id="register-form"
            hx-post="/auth/register/form"
            hx-target="#form-response"
            hx-swap="innerHTML"
            class="space-y-4"
          >
            <!-- First and Last Name Grid -->
            <div class="form-grid">
              <div class="form-group">
                <label for="firstName" class="form-label">First name</label>
                <input 
                  id="firstName" 
                  name="firstName" 
                  type="text" 
                  required 
                  class="form-input" 
                  placeholder="First name"
                >
              </div>
              <div class="form-group">
                <label for="lastName" class="form-label">Last name</label>
                <input 
                  id="lastName" 
                  name="lastName" 
                  type="text" 
                  required 
                  class="form-input" 
                  placeholder="Last name"
                >
              </div>
            </div>
            
            <!-- Username -->
            <div class="form-group">
              <label for="username" class="form-label">Username</label>
              <input 
                id="username" 
                name="username" 
                type="text" 
                required 
                class="form-input" 
                placeholder="Username"
              >
            </div>
            
            <!-- Email -->
            <div class="form-group">
              <label for="email" class="form-label">Email address</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                autocomplete="email" 
                required 
                class="form-input" 
                placeholder="Email address"
              >
            </div>
            
            <!-- Password -->
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                autocomplete="new-password" 
                required 
                class="form-input" 
                placeholder="Password (min. 8 characters)"
              >
            </div>

            <div>
              <button 
                type="submit"
                class="btn w-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create account
              </button>
            </div>
          </form>
          
          <div id="form-response"></div>
        </div>
      </div>
    </body>
    </html>
  `
}