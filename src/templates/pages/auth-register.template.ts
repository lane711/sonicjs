import { renderAlert } from '../components/alert.template'

export interface RegisterPageData {
  error?: string
}

export function renderRegisterPage(data: RegisterPageData): string {
  return `
    <!DOCTYPE html>
    <html lang="en" class="dark">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Register - SonicJS AI</title>
      <link rel="icon" type="image/x-icon" href="https://demo.sonicjs.com/images/favicon.ico">
      <script src="https://unpkg.com/htmx.org@2.0.3"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          darkMode: 'class',
          theme: {
            extend: {
              backdropBlur: {
                xs: '2px',
              }
            }
          }
        }
      </script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        
        .floating-element {
          position: absolute;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          backdrop-filter: blur(10px);
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
        .floating-5 {
          width: 90px;
          height: 90px;
          top: 10%;
          right: 25%;
          animation: float 9s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      </style>
    </head>
    <body class="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex">
      <!-- Background Pattern -->
      <div class="fixed inset-0 opacity-30">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat"></div>
      </div>
      
      <!-- Floating Elements -->
      <div class="floating-element floating-1"></div>
      <div class="floating-element floating-2"></div>
      <div class="floating-element floating-3"></div>
      <div class="floating-element floating-4"></div>
      <div class="floating-element floating-5"></div>
      
      <!-- Main Content -->
      <div class="relative z-10 w-full flex items-center justify-center px-4 py-8">
        <div class="w-full max-w-md">
          <!-- Logo Section -->
          <div class="text-center mb-8">
            <div class="w-16 h-16 mx-auto mb-4 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-white mb-2">SonicJS AI</h1>
            <p class="text-gray-300">AI-Powered Content Management</p>
          </div>
          
          <!-- Form Container -->
          <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <!-- Form Header -->
            <div class="relative px-8 py-6 border-b border-white/10">
              <div class="absolute inset-0 bg-gradient-to-r from-green-600/10 via-blue-600/10 to-purple-600/10"></div>
              <div class="relative text-center">
                <h2 class="text-xl font-semibold text-white mb-2">Join Us Today</h2>
                <p class="text-sm text-gray-300">Create your account and get started</p>
              </div>
            </div>
            
            <!-- Form Content -->
            <div class="p-8">
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
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label for="firstName" class="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <input 
                      id="firstName" 
                      name="firstName" 
                      type="text" 
                      required 
                      class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all" 
                      placeholder="First name"
                    >
                  </div>
                  <div>
                    <label for="lastName" class="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input 
                      id="lastName" 
                      name="lastName" 
                      type="text" 
                      required 
                      class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all" 
                      placeholder="Last name"
                    >
                  </div>
                </div>
                
                <!-- Username -->
                <div>
                  <label for="username" class="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input 
                    id="username" 
                    name="username" 
                    type="text" 
                    required 
                    class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all" 
                    placeholder="Choose a username"
                  >
                </div>
                
                <!-- Email -->
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    autocomplete="email"
                    required 
                    class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all" 
                    placeholder="Enter your email"
                  >
                </div>
                
                <!-- Password -->
                <div>
                  <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input 
                    id="password" 
                    name="password" 
                    type="password" 
                    autocomplete="new-password"
                    required 
                    minlength="8"
                    class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all" 
                    placeholder="Create a password (min. 8 characters)"
                  >
                </div>

                <!-- Submit Button -->
                <button 
                  type="submit" 
                  class="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all transform hover:scale-[1.02] hover:shadow-lg"
                >
                  Create Account
                </button>
              </form>
              
              <!-- Links -->
              <div class="mt-6 text-center">
                <p class="text-gray-300">
                  Already have an account? 
                  <a href="/auth/login" class="text-green-400 hover:text-green-300 font-medium transition-colors">Sign in here</a>
                </p>
              </div>
              
              <div id="form-response"></div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}