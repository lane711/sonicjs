import { renderAlert } from '../components/alert.template'

export interface LoginPageData {
  error?: string
  message?: string
}

export function renderLoginPage(data: LoginPageData): string {
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
          width: 120px;
          height: 120px;
          top: 20%;
          left: 10%;
          animation: float 6s ease-in-out infinite;
        }
        .floating-2 {
          width: 80px;
          height: 80px;
          top: 60%;
          right: 15%;
          animation: float 8s ease-in-out infinite reverse;
        }
        .floating-3 {
          width: 60px;
          height: 60px;
          bottom: 20%;
          left: 20%;
          animation: float 7s ease-in-out infinite;
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
      </style>
    </head>
    <body class="min-h-screen flex">
      <!-- Left Side - Gradient Background -->
      <div class="hidden lg:flex lg:w-1/2 gradient-bg relative items-center justify-center overflow-hidden">
        <!-- Floating Elements -->
        <div class="floating-element floating-1"></div>
        <div class="floating-element floating-2"></div>
        <div class="floating-element floating-3"></div>
        
        <!-- Content -->
        <div class="text-center text-white px-8 z-10">
          <div class="logo">SonicJS AI</div>
          <h1 class="text-4xl font-bold mb-6">Welcome Back!</h1>
          <p class="text-xl opacity-90 max-w-md">
            Sign in to your account and continue building amazing experiences with our AI-powered CMS.
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
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p class="text-gray-600">Enter your credentials to access your account</p>
          </div>
          
          <!-- Alerts -->
          ${data.error ? `<div class="mb-6">${renderAlert({ type: 'error', message: data.error })}</div>` : ''}
          ${data.message ? `<div class="mb-6">${renderAlert({ type: 'success', message: data.message })}</div>` : ''}
          
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
                autocomplete="current-password"
                required 
                class="form-input" 
                placeholder="Enter your password"
              >
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn-primary">
              Sign In
            </button>
          </form>
          
          <!-- Links -->
          <div class="mt-8 text-center">
            <p class="text-gray-600">
              Don't have an account? 
              <a href="/auth/register" class="link-text">Create one here</a>
            </p>
          </div>
          
          <div id="form-response"></div>
        </div>
      </div>
    </body>
    </html>
  `
}