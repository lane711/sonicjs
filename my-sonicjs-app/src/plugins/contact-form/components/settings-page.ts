import { html } from 'hono/html'
import type { ContactSettings } from '../types'

export function renderSettingsPage(settings: ContactSettings, turnstileAvailable: boolean = false) {
  const showMap = settings.showMap === 1 || settings.showMap === true || settings.showMap === 'true' || settings.showMap === 'on'
  const useTurnstile = settings.useTurnstile === 1 || settings.useTurnstile === true || settings.useTurnstile === 'true' || settings.useTurnstile === 'on'

  const content = html`
    <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header with Back Button -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl/8 font-semibold text-zinc-950 dark:text-white sm:text-xl/8">📧 Contact Form Settings</h1>
          <p class="mt-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
            Configure your contact form display and functionality
          </p>
        </div>
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a href="/admin/plugins" class="inline-flex items-center justify-center rounded-lg bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm font-semibold text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm">
            <svg class="-ml-0.5 mr-1.5 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to Plugins
          </a>
        </div>
      </div>

      <!-- Settings Card -->
      <div class="rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-950/5 dark:ring-white/10 p-6">
        <h2 class="text-xl font-semibold text-zinc-950 dark:text-white mb-6">Contact Information</h2>
        <form id="settingsForm" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Company Name</label>
              <input type="text" name="companyName" value="${settings.companyName || 'My Company'}" class="w-full rounded-lg bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10">
            </div>
            <div>
              <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Phone Number</label>
              <input type="text" name="phoneNumber" value="${settings.phoneNumber || '555-0199'}" class="w-full rounded-lg bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Contact Description</label>
            <textarea name="description" rows="3" class="w-full rounded-lg bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10">${settings.description || ''}</textarea>
          </div>

          <hr class="border-zinc-200 dark:border-zinc-800">

          <div>
            <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Street Address</label>
            <input type="text" name="address" value="${settings.address || '123 Web Dev Lane'}" class="w-full rounded-lg bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10">
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">City</label>
              <input type="text" name="city" value="${settings.city || ''}" class="w-full rounded-lg bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10">
            </div>
            <div>
              <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">State / Zip</label>
              <input type="text" name="state" value="${settings.state || ''}" class="w-full rounded-lg bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10">
            </div>
          </div>
          
          <hr class="border-zinc-200 dark:border-zinc-800">
          
          <div class="flex items-center gap-3 p-4 border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <input type="checkbox" id="showMap" name="showMap" ${showMap ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: #4f46e5; cursor: pointer;">
            <label for="showMap" class="text-base font-semibold text-zinc-900 dark:text-white select-none cursor-pointer">Enable Google Map</label>
          </div>

          <div>
            <label class="block text-sm font-medium text-zinc-950 dark:text-white mb-2">Map API Key</label>
            <input type="password" name="mapApiKey" value="${settings.mapApiKey || ''}" class="w-full rounded-lg bg-white dark:bg-white/5 px-3 py-2 text-sm text-zinc-950 dark:text-white ring-1 ring-inset ring-zinc-950/10 dark:ring-white/10">
          </div>

          ${turnstileAvailable ? html`
          <hr class="border-zinc-200 dark:border-zinc-800">
          
          <div class="flex items-center gap-3 p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <input type="checkbox" id="useTurnstile" name="useTurnstile" ${useTurnstile ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: #3b82f6; cursor: pointer;">
            <div>
              <label for="useTurnstile" class="text-base font-semibold text-zinc-900 dark:text-white select-none cursor-pointer block">🛡️ Enable Cloudflare Turnstile Protection</label>
              <p class="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Add CAPTCHA-free bot protection to your contact form (requires Turnstile plugin)</p>
            </div>
          </div>
          ` : ''}

          <div class="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button type="submit" class="inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-6 py-2.5 text-sm font-semibold hover:bg-indigo-500 shadow-sm">Save Settings</button>
          </div>
        </form>
      </div>

      <!-- Success Message -->
      <div id="msg" class="hidden mt-4 max-w-3xl p-4 rounded-xl bg-green-50 text-green-900 border border-green-200 dark:bg-green-900/20 dark:text-green-100 dark:border-green-800">✅ Settings Saved!</div>
    </div>
    <script>
      document.getElementById('settingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.submitter;
        btn.innerText = 'Saving...'; btn.disabled = true;
        const data = Object.fromEntries(new FormData(e.target));
        data.showMap = document.getElementById('showMap').checked;
        const turnstileCheckbox = document.getElementById('useTurnstile');
        if (turnstileCheckbox) {
          data.useTurnstile = turnstileCheckbox.checked;
        }
        try {
          console.log('[Contact Form] Saving settings to /admin/plugins/contact-form');
          
          // Get the auth token from cookie to send in header (SameSite=Strict prevents automatic sending)
          const authToken = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
          
          const headers = {'Content-Type': 'application/json'};
          if (authToken) {
            headers['Authorization'] = 'Bearer ' + authToken;
            console.log('[Contact Form] Including auth token in Authorization header');
          }
          
          const res = await fetch('/admin/plugins/contact-form', { 
            method: 'POST', 
            headers: headers,
            body: JSON.stringify(data),
            credentials: 'same-origin' // Include cookies for authentication
          });
          console.log('[Contact Form] Response status:', res.status, res.ok);
          if (res.ok) { 
            console.log('[Contact Form] Settings saved successfully, showing message');
            document.getElementById('msg').classList.remove('hidden'); 
            setTimeout(() => document.getElementById('msg').classList.add('hidden'), 3000); 
          } else {
            const errorText = await res.text();
            console.error('[Contact Form] Save failed:', res.status, errorText);
          }
        } catch (error) {
          console.error('[Contact Form] Fetch error:', error);
        }
        btn.innerText = 'Save Settings'; btn.disabled = false;
      });
    </script>
  `
  return renderLocalLayout('Contact Settings', content)
}

function renderLocalLayout(title: string, content: any) {
  return html`
    <!DOCTYPE html>
    <html lang="en" class="dark">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - SonicJS</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <script>tailwind.config = { darkMode: 'class', theme: { extend: { colors: { zinc: { 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b' } } } } }</script>
      <style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'); body { font-family: 'Inter', sans-serif; }</style>
    </head>
    <body class="min-h-screen bg-white dark:bg-zinc-900">
      <div class="relative isolate flex min-h-svh w-full max-lg:flex-col lg:bg-zinc-100 dark:lg:bg-zinc-950">
        <div class="fixed inset-y-0 left-0 w-64 max-lg:hidden">
          <nav class="flex h-full min-h-0 flex-col bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
            <div class="flex flex-col border-b border-zinc-950/5 p-4 dark:border-white/5">
              <a href="/admin" class="flex items-center gap-2 font-bold text-xl dark:text-white">SonicJS</a>
            </div>
            <div class="flex flex-1 flex-col overflow-y-auto p-4 gap-0.5">
               <a href="/admin" class="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5">Dashboard</a>
               <a href="/admin/collections" class="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5">Collections</a>
               <a href="/admin/content" class="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5">Content</a>
               <a href="/admin/media" class="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5">Media</a>
               <a href="/admin/users" class="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5">Users</a>
               <a href="/admin/plugins" class="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-zinc-950 bg-zinc-100 dark:bg-zinc-800 dark:text-white">
                 <span class="absolute inset-y-2 -left-4 w-0.5 rounded-full bg-cyan-500"></span>
                 Plugins
               </a>
            </div>
             <div class="border-t border-zinc-950/5 p-4 dark:border-white/5">
               <a href="/admin/settings" class="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-950/5 dark:text-white dark:hover:bg-white/5">Settings</a>
             </div>
          </nav>
        </div>
        <main class="flex flex-1 flex-col pb-2 lg:min-w-0 lg:pl-64 lg:pr-2">
          <div class="grow p-6 lg:rounded-lg lg:bg-white lg:p-10 lg:shadow-sm lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
            ${content}
          </div>
        </main>
      </div>
    </body>
    </html>
  `
}
