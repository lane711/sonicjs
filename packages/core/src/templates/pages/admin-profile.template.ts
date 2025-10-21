import { renderAdminLayout, AdminLayoutData } from '../layouts/admin-layout-v2.template'
import { renderAlert } from '../components/alert.template'

export interface UserProfile {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  phone?: string
  bio?: string
  avatar_url?: string
  timezone: string
  language: string
  theme: string
  email_notifications: boolean
  two_factor_enabled: boolean
  role: string
  created_at: number
  last_login_at?: number
}

export interface ProfilePageData {
  profile: UserProfile
  timezones: Array<{ value: string; label: string }>
  languages: Array<{ value: string; label: string }>
  error?: string
  success?: string
  user?: {
    name: string
    email: string
    role: string
  }
}

export function renderProfilePage(data: ProfilePageData): string {
  const pageContent = `
    <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 class="text-2xl font-semibold text-white">User Profile</h1>
          <p class="mt-2 text-sm text-gray-300">Manage your account settings and preferences</p>
        </div>
      </div>

      <!-- Breadcrumb -->
      <nav class="flex mb-6" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-3">
          <li>
            <a href="/admin" class="text-gray-300 hover:text-white transition-colors">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
            </a>
          </li>
          <li class="flex items-center">
            <svg class="h-5 w-5 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm font-medium text-gray-200">Profile</span>
          </li>
        </ol>
      </nav>

      <!-- Alert Messages -->
      ${data.error ? renderAlert({ type: 'error', message: data.error, dismissible: true }) : ''}
      ${data.success ? renderAlert({ type: 'success', message: data.success, dismissible: true }) : ''}

      <!-- Profile Form -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Profile Form -->
        <div class="lg:col-span-2">
          <div class="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <!-- Form Header -->
            <div class="relative px-8 py-6 border-b border-white/10">
              <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
              <div class="relative flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <div>
                  <h2 class="text-xl font-semibold text-white">Profile Information</h2>
                  <p class="text-sm text-gray-300">Update your account details and preferences</p>
                </div>
              </div>
            </div>

            <!-- Form Content -->
            <form id="profile-form" hx-put="/admin/profile" hx-target="#form-messages" class="p-8 space-y-6">
              <div id="form-messages"></div>

              <!-- Basic Information -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input 
                    type="text" 
                    name="first_name" 
                    value="${data.profile.first_name}"
                    required
                    class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
                    placeholder="Enter your first name"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    name="last_name" 
                    value="${data.profile.last_name}"
                    required
                    class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
                    placeholder="Enter your last name"
                  >
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input 
                  type="text" 
                  name="username" 
                  value="${data.profile.username}"
                  required
                  class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
                  placeholder="Enter your username"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value="${data.profile.email}"
                  required
                  class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
                  placeholder="Enter your email address"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value="${data.profile.phone || ''}"
                  class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
                  placeholder="Enter your phone number"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea 
                  name="bio" 
                  rows="3"
                  class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all resize-none"
                  placeholder="Tell us about yourself..."
                >${data.profile.bio || ''}</textarea>
              </div>

              <!-- Preferences -->
              <div class="pt-6 border-t border-white/10">
                <h3 class="text-lg font-semibold text-white mb-4">Preferences</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                    <select 
                      name="timezone"
                      class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
                    >
                      ${data.timezones.map(tz => `
                        <option value="${tz.value}" ${tz.value === data.profile.timezone ? 'selected' : ''}>${tz.label}</option>
                      `).join('')}
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Language</label>
                    <select 
                      name="language"
                      class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
                    >
                      ${data.languages.map(lang => `
                        <option value="${lang.value}" ${lang.value === data.profile.language ? 'selected' : ''}>${lang.label}</option>
                      `).join('')}
                    </select>
                  </div>
                </div>
              </div>

              <!-- Notifications -->
              <div class="pt-6 border-t border-white/10">
                <h3 class="text-lg font-semibold text-white mb-4">Notifications</h3>
                
                <div class="space-y-5">
                  <div class="flex gap-3">
                    <div class="flex h-6 shrink-0 items-center">
                      <div class="group grid size-4 grid-cols-1">
                        <input
                          type="checkbox"
                          id="email_notifications"
                          name="email_notifications"
                          value="1"
                          ${data.profile.email_notifications ? 'checked' : ''}
                          class="col-start-1 row-start-1 appearance-none rounded border border-zinc-950/10 dark:border-white/10 bg-white dark:bg-white/5 checked:border-indigo-500 checked:bg-indigo-500 indeterminate:border-indigo-500 indeterminate:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:border-zinc-950/5 dark:disabled:border-white/5 disabled:bg-zinc-950/10 dark:disabled:bg-white/10 disabled:checked:bg-zinc-950/10 dark:disabled:checked:bg-white/10 forced-colors:appearance-auto"
                        />
                        <svg viewBox="0 0 14 14" fill="none" class="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-zinc-950/25 dark:group-has-[:disabled]:stroke-white/25">
                          <path d="M3 8L6 11L11 3.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-has-[:checked]:opacity-100" />
                          <path d="M3 7H11" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-has-[:indeterminate]:opacity-100" />
                        </svg>
                      </div>
                    </div>
                    <div class="text-sm/6">
                      <label for="email_notifications" class="font-medium text-zinc-950 dark:text-white">Email notifications</label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <div class="pt-6 border-t border-white/10">
                <button 
                  type="submit"
                  class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Profile Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Avatar -->
          <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4">Profile Picture</h3>
            
            <div class="text-center">
              <div class="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                ${data.profile.avatar_url 
                  ? `<img src="${data.profile.avatar_url}" alt="Profile picture" class="w-full h-full object-cover">`
                  : `<span class="text-2xl font-bold text-white">${data.profile.first_name.charAt(0)}${data.profile.last_name.charAt(0)}</span>`
                }
              </div>
              
              <form id="avatar-form" hx-post="/admin/profile/avatar" hx-target="#avatar-messages" hx-encoding="multipart/form-data">
                <input 
                  type="file" 
                  name="avatar" 
                  accept="image/*"
                  class="hidden"
                  id="avatar-input"
                  onchange="document.getElementById('avatar-form').dispatchEvent(new Event('submit'))"
                >
                <label 
                  for="avatar-input"
                  class="inline-block px-4 py-2 bg-white/10 text-white rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                >
                  Change Picture
                </label>
              </form>
              
              <div id="avatar-messages" class="mt-3"></div>
            </div>
          </div>

          <!-- Account Info -->
          <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4">Account Information</h3>
            
            <div class="space-y-3 text-sm">
              <div>
                <span class="text-gray-400">Role:</span>
                <span class="text-white ml-2 capitalize">${data.profile.role}</span>
              </div>
              <div>
                <span class="text-gray-400">Member Since:</span>
                <span class="text-white ml-2">${new Date(data.profile.created_at).toLocaleDateString()}</span>
              </div>
              ${data.profile.last_login_at ? `
                <div>
                  <span class="text-gray-400">Last Login:</span>
                  <span class="text-white ml-2">${new Date(data.profile.last_login_at).toLocaleDateString()}</span>
                </div>
              ` : ''}
              <div>
                <span class="text-gray-400">Two-Factor Auth:</span>
                <span class="text-white ml-2">${data.profile.two_factor_enabled ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>

          <!-- Security Actions -->
          <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4">Security</h3>
            
            <div class="space-y-3">
              <button 
                type="button"
                onclick="showChangePasswordModal()"
                class="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586l4.293-4.293A6 6 0 0119 9z"/>
                </svg>
                Change Password
              </button>
              
              <button 
                type="button"
                onclick="toggle2FA()"
                class="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                ${data.profile.two_factor_enabled ? 'Disable' : 'Enable'} 2FA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div id="password-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 hidden">
      <div class="backdrop-blur-xl bg-white/10 rounded-xl border border-white/20 shadow-2xl w-full max-w-md mx-4">
        <div class="relative px-6 py-4 border-b border-white/10">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
          <div class="relative flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">Change Password</h3>
            <button onclick="closePasswordModal()" class="text-gray-300 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <form id="password-form" hx-post="/admin/profile/password" hx-target="#password-messages" class="p-6 space-y-4">
          <div id="password-messages"></div>
          
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
            <input 
              type="password" 
              name="current_password" 
              required
              class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">New Password</label>
            <input 
              type="password" 
              name="new_password" 
              required
              minlength="8"
              class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
            <input 
              type="password" 
              name="confirm_password" 
              required
              minlength="8"
              class="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
            >
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-white/10">
            <button 
              type="button" 
              onclick="closePasswordModal()"
              class="px-4 py-2 bg-white/10 text-white rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>

    <script>
      function showChangePasswordModal() {
        document.getElementById('password-modal').classList.remove('hidden');
      }

      function closePasswordModal() {
        document.getElementById('password-modal').classList.add('hidden');
        document.getElementById('password-form').reset();
      }

      function toggle2FA() {
        // TODO: Implement 2FA toggle
        alert('Two-factor authentication setup coming soon!');
      }

      // Close modal on escape key
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !document.getElementById('password-modal').classList.contains('hidden')) {
          closePasswordModal();
        }
      });

      // Close modal on backdrop click
      document.getElementById('password-modal').addEventListener('click', function(e) {
        if (e.target === this) {
          closePasswordModal();
        }
      });
    </script>
  `

  const layoutData: AdminLayoutData = {
    title: 'User Profile',
    pageTitle: 'Profile',
    currentPath: '/admin/profile',
    user: data.user,
    content: pageContent
  }

  return renderAdminLayout(layoutData)
}