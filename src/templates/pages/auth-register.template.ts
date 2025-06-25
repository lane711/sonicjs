import { renderAlert } from '../components/alert.template'

export interface RegisterPageData {
  error?: string
}

export function renderRegisterPage(data: RegisterPageData): string {
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
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .form-input {
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          padding: 16px;
          width: 100%;
          font-size: 16px;
          transition: all 0.3s ease;
          background: #f8f9fa;
        }
        .form-input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          padding: 16px;
          color: white;
          font-weight: 600;
          font-size: 16px;
          width: 100%;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        .floating-element {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }
        .floating-1 {
          width: 100px;
          height: 100px;
          top: 15%;
          left: 15%;
          animation: float 6s ease-in-out infinite;
        }
        .floating-2 {
          width: 60px;
          height: 60px;
          top: 70%;
          right: 20%;
          animation: float 8s ease-in-out infinite reverse;
        }
        .floating-3 {
          width: 80px;
          height: 80px;
          bottom: 15%;
          left: 25%;
          animation: float 7s ease-in-out infinite;
        }
        .floating-4 {
          width: 40px;
          height: 40px;
          top: 40%;
          right: 10%;
          animation: float 5s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .logo {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin-bottom: 2rem;
        }
        .link-text {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
        }
        .link-text:hover {
          text-decoration: underline;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body class="min-h-screen flex">
      <!-- Left Side - Gradient Background -->
      <div class="hidden lg:flex lg:w-1/2 gradient-bg relative items-center justify-center overflow-hidden">
        <!-- Floating Elements -->
        <div class="floating-element floating-1"></div>
        <div class="floating-element floating-2"></div>
        <div class="floating-element floating-3"></div>
        <div class="floating-element floating-4"></div>
        
        <!-- Content -->
        <div class="text-center text-white px-8 z-10">
          <div class="logo">SonicJS AI</div>
          <h1 class="text-4xl font-bold mb-6">Join Us Today!</h1>
          <p class="text-xl opacity-90 max-w-md">
            Create your account and start building amazing experiences with our AI-powered CMS platform.
          </p>
        </div>
      </div>

      <!-- Right Side - Form -->
      <div class="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-white">
        <div class="w-full max-w-md">
          <!-- Mobile Logo -->
          <div class="lg:hidden text-center mb-8">
            <div class="text-2xl font-bold text-gray-800">SonicJS AI</div>
          </div>

          <!-- Header -->
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p class="text-gray-600">Join thousands of developers using SonicJS AI</p>
          </div>
          
          <!-- Alerts -->
          ${data.error ? `<div class="mb-6">${renderAlert({ type: 'error', message: data.error })}</div>` : ''}
          
          <!-- Form -->
          <form 
            id="register-form"
            hx-post="/auth/register/form"
            hx-target="#form-response"
            hx-swap="innerHTML"
            class="space-y-6"
          >
            <!-- First and Last Name -->
            <div class="form-grid">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input 
                  id="firstName" 
                  name="firstName" 
                  type="text" 
                  required 
                  class="form-input" 
                  placeholder="First name"
                >
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
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
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input 
                id="username" 
                name="username" 
                type="text" 
                required 
                class="form-input" 
                placeholder="Choose a username"
              >
            </div>
            
            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                autocomplete="email"
                required 
                class="form-input" 
                placeholder="Enter your email"
              >
            </div>
            
            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                autocomplete="new-password"
                required 
                minlength="8"
                class="form-input" 
                placeholder="Create a password (min. 8 characters)"
              >
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn-primary">
              Create Account
            </button>
          </form>
          
          <!-- Links -->
          <div class="mt-8 text-center">
            <p class="text-gray-600">
              Already have an account? 
              <a href="/auth/login" class="link-text">Sign in here</a>
            </p>
          </div>
          
          <div id="form-response"></div>
        </div>
      </div>
    </body>
    </html>
  `
}