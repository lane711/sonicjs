import { renderLogo } from '@sonicjs-cms/core/templates'

export interface DocsLayoutData {
  title: string
  content: string
  currentPath: string
  navigation: NavigationItem[]
}

export interface NavigationItem {
  title: string
  path: string
  children?: NavigationItem[]
}


export function renderDocsLayout(data: DocsLayoutData): string {
  const navItems = [
    { path: '/docs', label: 'Documentation', active: data.currentPath === '/docs' },
    { path: '/docs/getting-started', label: 'Getting Started', active: data.currentPath === '/docs/getting-started' },
    { path: '/docs/api-reference', label: 'API Reference', active: data.currentPath === '/docs/api-reference' },
    { path: '/docs/content-management', label: 'Content Management', active: data.currentPath === '/docs/content-management' },
    { path: '/admin', label: 'Admin Panel', active: false }
  ]

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <title>${data.title} - SonicJS AI Documentation</title>
  <link rel="icon" type="image/x-icon" href="https://demo.sonicjs.com/images/favicon.ico">
  
  <!-- Styles -->
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  
  <style>
    /* Modern gradient background - Dark Mode */
    .bg-gradient-docs { 
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
    }
    
    .bg-gradient-subtle {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    }
    
    /* Typography and content styling - Dark Mode */
    .prose { 
      @apply max-w-none;
      line-height: 1.7;
      color: #d1d5db !important; /* Default light text color for all prose content */
    }
    
    /* Ensure all text elements are light colored */
    .prose *,
    .prose p,
    .prose div,
    .prose span,
    .prose td,
    .prose th,
    .prose li {
      color: inherit !important;
    }
    
    /* Override any potential dark text */
    .prose {
      --tw-prose-body: #d1d5db !important;
      --tw-prose-headings: #f9fafb !important;
      --tw-prose-lead: #d1d5db !important;
      --tw-prose-links: #a855f7 !important;
      --tw-prose-bold: #f9fafb !important;
      --tw-prose-counters: #9ca3af !important;
      --tw-prose-bullets: #6b7280 !important;
      --tw-prose-hr: #374151 !important;
      --tw-prose-quotes: #d1d5db !important;
      --tw-prose-quote-borders: #8b5cf6 !important;
      --tw-prose-captions: #9ca3af !important;
      --tw-prose-code: #c4b5fd !important;
      --tw-prose-pre-code: #e5e7eb !important;
      --tw-prose-pre-bg: #1e293b !important;
      --tw-prose-th-borders: #374151 !important;
      --tw-prose-td-borders: #374151 !important;
    }
    
    /* Enhanced Heading Styles - Much Bigger - Maximum Specificity - Dark Mode */
    div.prose.prose-lg.max-w-none h1,
    .prose h1,
    .prose-lg h1,
    .max-w-none h1,
    h1 { 
      font-size: 4.5rem !important; /* 72px */
      font-weight: 900 !important;
      margin-bottom: 4rem !important;
      padding-bottom: 2rem !important;
      border-bottom: 2px solid transparent !important;
      position: relative !important;
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
      border-image: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%) 1 !important;
      letter-spacing: -0.03em !important;
      line-height: 1.05 !important;
    }
    
    .prose h1::after,
    .prose-lg h1::after,
    .max-w-none h1::after {
      content: '' !important;
      position: absolute !important;
      bottom: 0 !important;
      left: 0 !important;
      width: 8rem !important;
      height: 0.5rem !important;
      border-radius: 9999px !important;
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%) !important;
    }
    
    div.prose.prose-lg.max-w-none h2,
    .prose h2,
    .prose-lg h2,
    .max-w-none h2,
    h2 { 
      font-size: 3rem !important; /* 48px */
      font-weight: 800 !important;
      color: #e5e7eb !important;
      margin-bottom: 3rem !important;
      margin-top: 5rem !important;
      padding-bottom: 1.5rem !important;
      border-bottom: 1px solid #374151 !important;
      position: relative !important;
      letter-spacing: -0.025em !important;
      line-height: 1.15 !important;
    }
    
    .prose h2::before,
    .prose-lg h2::before,
    .max-w-none h2::before {
      content: counter(h2-counter, decimal-leading-zero) !important;
      position: absolute !important;
      left: -4rem !important;
      top: 0.5rem !important;
      font-size: 1rem !important;
      font-weight: 700 !important;
      color: #ffffff !important;
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%) !important;
      width: 3rem !important;
      height: 3rem !important;
      border-radius: 9999px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      counter-increment: h2-counter !important;
    }
    
    .prose h2:hover,
    .prose-lg h2:hover,
    .max-w-none h2:hover {
      color: #a855f7 !important;
      transition: color 0.3s ease !important;
    }
    
    .prose h3,
    .prose-lg h3,
    .max-w-none h3 { 
      font-size: 1.875rem !important; /* 30px */
      font-weight: 700 !important;
      color: #d1d5db !important;
      margin-bottom: 2rem !important;
      margin-top: 4rem !important;
      position: relative !important;
      padding-left: 2rem !important;
      line-height: 1.25 !important;
      letter-spacing: -0.02em !important;
    }
    
    .prose h3::before,
    .prose-lg h3::before,
    .max-w-none h3::before {
      content: '▶' !important;
      position: absolute !important;
      left: 0 !important;
      top: 0.25rem !important;
      color: #06b6d4 !important;
      font-size: 1.125rem !important;
      transform: rotate(90deg) !important;
    }
    
    .prose h3:hover::before,
    .prose-lg h3:hover::before,
    .max-w-none h3:hover::before {
      color: #0891b2 !important;
      transform: rotate(90deg) scale(1.3) !important;
      transition: all 0.2s ease !important;
    }
    
    .prose h4,
    .prose-lg h4,
    .max-w-none h4 {
      font-size: 1.5rem !important; /* 24px */
      font-weight: 700 !important;
      color: #d1d5db !important;
      margin-bottom: 1.5rem !important;
      margin-top: 3rem !important;
      display: flex !important;
      align-items: center !important;
      line-height: 1.3 !important;
    }
    
    .prose h4::before,
    .prose-lg h4::before,
    .max-w-none h4::before {
      content: '●' !important;
      margin-right: 0.75rem !important;
      color: #10b981 !important;
      font-size: 1rem !important;
    }
    
    .prose h5,
    .prose-lg h5,
    .max-w-none h5 {
      font-size: 1.25rem !important; /* 20px */
      font-weight: 700 !important;
      color: #9ca3af !important;
      margin-bottom: 1rem !important;
      margin-top: 2rem !important;
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
    }
    
    .prose h6,
    .prose-lg h6,
    .max-w-none h6 {
      font-size: 1.125rem !important; /* 18px */
      font-weight: 600 !important;
      color: #9ca3af !important;
      margin-bottom: 0.75rem !important;
      margin-top: 1.5rem !important;
      text-transform: uppercase !important;
      letter-spacing: 0.1em !important;
    }
    
    /* Reset counter for each article */
    .prose,
    .prose-lg,
    .max-w-none {
      counter-reset: h2-counter !important;
    }
    
    /* Responsive heading sizes */
    @media (max-width: 768px) {
      .prose h1 {
        @apply text-5xl mb-12 pb-6;
        line-height: 1.1;
      }
      
      .prose h2 {
        @apply text-3xl mb-8 mt-12 pb-4;
      }
      
      .prose h2::before {
        @apply -left-12 w-10 h-10 text-sm;
      }
      
      .prose h3 {
        @apply text-2xl mb-6 mt-10 pl-6;
      }
      
      .prose h3::before {
        @apply text-base;
      }
      
      .prose h4 {
        @apply text-xl mb-4 mt-8;
      }
    }
    
    @media (max-width: 480px) {
      .prose h1 {
        @apply text-4xl mb-8 pb-4;
      }
      
      .prose h1::after {
        @apply w-24 h-1;
      }
      
      .prose h2 {
        @apply text-2xl mb-6 mt-8 pb-3;
      }
      
      .prose h2::before {
        display: none;
      }
    }
    
    .prose p { 
      @apply text-gray-300 leading-relaxed mb-8 text-lg;
    }
    
    .prose strong {
      @apply text-gray-100 font-semibold;
    }
    
    /* Section spacing and heading anchors */
    .prose > * + * {
      margin-top: 1.5rem;
    }
    
    .prose h1 + *,
    .prose h2 + *,
    .prose h3 + * {
      margin-top: 1rem;
    }
    
    /* Heading anchor links */
    .prose h2:target,
    .prose h3:target,
    .prose h4:target {
      @apply bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg -m-4;
      animation: highlight 2s ease-in-out;
    }
    
    @keyframes highlight {
      0% { background: rgba(147, 51, 234, 0.1); }
      50% { background: rgba(147, 51, 234, 0.05); }
      100% { background: transparent; }
    }
    
    /* Heading hover effects for anchor links */
    .prose h2:hover::after,
    .prose h3:hover::after,
    .prose h4:hover::after {
      content: '🔗';
      @apply ml-2 text-gray-400 text-sm opacity-0 transition-opacity duration-200;
      opacity: 1;
    }
    
    /* Special styling for "Key Features" type headings */
    .prose h3:contains("Features")::before,
    .prose h3:contains("Benefits")::before,
    .prose h3:contains("Advantages")::before {
      content: '⭐';
      transform: none;
    }
    
    /* Modern code styling - Dark Mode */
    .prose code { 
      @apply px-2 py-1 rounded-md text-sm font-mono;
      background: rgba(139, 92, 246, 0.2) !important;
      color: #c4b5fd !important;
      border: 1px solid rgba(139, 92, 246, 0.3) !important;
    }
    
    .prose pre { 
      @apply p-6 rounded-xl overflow-x-auto mb-6 shadow-lg;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
      border: 1px solid #475569 !important;
    }
    
    .prose pre code { 
      @apply bg-transparent p-0 border-0;
      color: #e5e7eb !important;
    }
    
    /* Enhanced List styling */
    .prose ul { 
      @apply mb-8 space-y-4 pl-4;
    }
    
    .prose ol { 
      @apply mb-8 space-y-4 pl-4;
    }
    
    .prose li { 
      @apply text-gray-300 leading-relaxed text-base;
    }
    
    .prose ul li {
      @apply relative pl-8 py-2;
    }
    
    .prose ul li::before {
      content: '✨';
      @apply absolute left-0 top-2 text-purple-400 text-lg;
    }
    
    .prose ol li {
      @apply relative pl-4 py-2;
      counter-increment: list-counter;
    }
    
    .prose ol {
      counter-reset: list-counter;
    }
    
    .prose ol li::before {
      content: counter(list-counter);
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%) !important;
      @apply absolute left-0 top-2 w-6 h-6 text-white text-xs font-bold rounded-full flex items-center justify-center;
    }
    
    /* Nested lists */
    .prose ul ul li::before {
      content: '▸';
      @apply text-purple-300 text-sm;
    }
    
    .prose li > ul,
    .prose li > ol {
      @apply mt-3 mb-0;
    }
    
    /* Enhanced Blockquote styling - Dark Mode */
    .prose blockquote { 
      @apply border-l-4 pl-8 py-6 italic text-gray-300 mb-8 rounded-r-xl shadow-sm;
      border-left-color: #8b5cf6;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
      position: relative;
    }
    
    .prose blockquote::before {
      content: '"';
      @apply absolute -top-2 -left-2 text-6xl text-purple-400 font-serif;
    }
    
    /* Feature list styling (lists with emojis) - Dark Mode */
    .prose ul li:has(strong) {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
      @apply border border-blue-500/20 rounded-lg p-4 my-3;
    }
    
    .prose ul li:has(strong)::before {
      content: '⚡';
      @apply text-blue-400;
    }
    
    /* Table styling - Dark Mode */
    .prose table { 
      @apply w-full border-collapse mb-6 shadow-lg rounded-lg overflow-hidden;
    }
    
    .prose th { 
      background: linear-gradient(135deg, #374151 0%, #1f2937 100%) !important;
      @apply px-6 py-4 font-semibold text-gray-200 text-left border-b border-gray-600;
    }
    
    .prose td { 
      @apply px-6 py-4 border-b border-gray-700 text-gray-300;
    }
    
    .prose tr:hover td {
      @apply bg-gray-800/50;
    }
    
    /* Links - Dark Mode */
    .prose a {
      @apply text-purple-400 hover:text-purple-300 underline decoration-purple-500/50 hover:decoration-purple-400 transition-colors duration-200;
    }
    
    /* Navigation styling - Dark Mode */
    .nav-item { 
      @apply block px-4 py-3 text-sm rounded-lg transition-all duration-200 border border-transparent text-gray-300;
    }
    
    .nav-item:hover {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%) !important;
      @apply text-purple-300 border-purple-500/30 transform translate-x-1;
    }
    
    .nav-item.active { 
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%) !important;
      @apply text-white border-purple-400 shadow-sm font-medium;
    }
    
    /* Sidebar styling - Dark Mode */
    .sidebar-section {
      @apply mb-6;
    }
    
    .sidebar-title {
      @apply text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4;
    }
    
    /* Custom scrollbar - Dark Mode */
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #374151;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
      border-radius: 3px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #7c3aed 0%, #0891b2 100%);
    }
    
    /* Special heading callouts */
    .prose h2:first-of-type {
      @apply bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100 shadow-sm;
      margin-top: 0;
    }
    
    /* Documentation section headings */
    .prose h2[id*="quick"],
    .prose h2[id*="start"],
    .prose h2[id*="getting"] {
      @apply bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 pl-6;
    }
    
    .prose h2[id*="api"],
    .prose h2[id*="reference"] {
      @apply bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-400 pl-6;
    }
    
    .prose h2[id*="trouble"],
    .prose h2[id*="error"],
    .prose h2[id*="debug"] {
      @apply bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 pl-6;
    }
    
    /* Heading animations */
    .prose h1,
    .prose h2,
    .prose h3 {
      animation: slideInFromLeft 0.6s ease-out;
    }
    
    @keyframes slideInFromLeft {
      0% {
        opacity: 0;
        transform: translateX(-20px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }
  </style>
  
  <!-- Syntax highlighting -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script>hljs.highlightAll();</script>
</head>
<body class="bg-gradient-subtle min-h-screen">
  <div class="min-h-screen flex">
    <!-- Sidebar Navigation -->
    <aside class="w-72 bg-gray-800/80 backdrop-blur-sm shadow-xl border-r border-gray-700/50 fixed h-full overflow-y-auto custom-scrollbar">
      <div class="p-8">
        <!-- Logo/Header -->
        <div class="mb-8">
          <a href="/docs" class="block hover:opacity-80 transition-opacity">
            ${renderLogo({ size: 'lg', showText: true, variant: 'white' })}
          </a>
          <p class="text-sm text-gray-400 font-medium mt-2">Documentation</p>
        </div>
        
        <!-- Navigation -->
        <nav class="space-y-2">
          ${renderNavigation(data.navigation, data.currentPath)}
        </nav>
        
        <!-- Footer Links -->
        <div class="mt-12 pt-6 border-t border-gray-700">
          <div class="space-y-2">
            <a href="/admin" class="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-purple-400 transition-colors">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Admin Panel
            </a>
            <a href="https://github.com/lane711/sonicjs-ai" target="_blank" class="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-purple-400 transition-colors">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </aside>
    
    <!-- Main Content -->
    <main class="ml-72 flex-1">
      <div class="max-w-5xl mx-auto px-12 py-12">
        <!-- Breadcrumb -->
        <div class="mb-10">
          <div class="flex items-center text-sm text-gray-400 mb-6">
            <a href="/docs" class="hover:text-purple-400 transition-colors font-medium">Documentation</a>
            <svg class="w-4 h-4 mx-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <span class="text-gray-300 font-medium">${data.title}</span>
          </div>
        </div>
        
        <!-- Content Container -->
        <div class="bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 p-12 mb-12">
          <div class="prose prose-lg max-w-none">
            ${data.content}
          </div>
        </div>
        
        <!-- Enhanced Footer -->
        <footer class="mt-16 pt-12 border-t border-gray-700/50">
          <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8">
            <div class="flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
              <div class="mb-4 md:mb-0">
                <p class="font-medium">© 2024 SonicJS AI Documentation</p>
                <p class="text-gray-400">Built with ❤️ using TypeScript & Hono</p>
              </div>
              <div class="flex space-x-6">
                <a href="/docs" class="hover:text-purple-400 transition-colors font-medium">Documentation</a>
                <a href="/docs/api" class="hover:text-purple-400 transition-colors font-medium">API Reference</a>
                <a href="/admin" class="hover:text-purple-400 transition-colors font-medium">Admin</a>
                <a href="https://github.com/lane711/sonicjs-ai" target="_blank" class="hover:text-purple-400 transition-colors font-medium">GitHub</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  </div>
</body>
</html>`
}

function renderNavigation(items: NavigationItem[], currentPath: string): string {
  return items.map(item => {
    const isActive = currentPath === item.path
    const hasChildren = item.children && item.children.length > 0
    
    return `
      <div>
        <a href="${item.path}" 
           class="nav-item block px-3 py-2 text-sm rounded-md transition-colors ${
             isActive 
               ? 'active' 
               : 'text-gray-300 hover:bg-gray-700/50 hover:text-gray-100'
           }">
          ${item.title}
        </a>
        ${hasChildren ? `
          <div class="ml-4 mt-1 space-y-1">
            ${renderNavigation(item.children!, currentPath)}
          </div>
        ` : ''}
      </div>
    `
  }).join('')
} 