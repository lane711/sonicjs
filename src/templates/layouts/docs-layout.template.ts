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
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <title>${data.title} - SonicJS AI Documentation</title>
  
  <!-- Styles -->
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
  
  <style>
    /* Modern gradient background */
    .bg-gradient-docs { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .bg-gradient-subtle {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    
    /* Typography and content styling */
    .prose { 
      @apply max-w-none;
      line-height: 1.7;
    }
    
    /* Enhanced Heading Styles - Much Bigger - Maximum Specificity */
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
      border-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1 !important;
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    }
    
    div.prose.prose-lg.max-w-none h2,
    .prose h2,
    .prose-lg h2,
    .max-w-none h2,
    h2 { 
      font-size: 3rem !important; /* 48px */
      font-weight: 800 !important;
      color: #1f2937 !important;
      margin-bottom: 3rem !important;
      margin-top: 5rem !important;
      padding-bottom: 1.5rem !important;
      border-bottom: 1px solid #e5e7eb !important;
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
      color: #c084fc !important;
      background-color: #faf5ff !important;
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
      color: #7c3aed !important;
      transition: color 0.3s ease !important;
    }
    
    .prose h3,
    .prose-lg h3,
    .max-w-none h3 { 
      font-size: 1.875rem !important; /* 30px */
      font-weight: 700 !important;
      color: #374151 !important;
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
      color: #8b5cf6 !important;
      font-size: 1.125rem !important;
      transform: rotate(90deg) !important;
    }
    
    .prose h3:hover::before,
    .prose-lg h3:hover::before,
    .max-w-none h3:hover::before {
      color: #7c3aed !important;
      transform: rotate(90deg) scale(1.3) !important;
      transition: all 0.2s ease !important;
    }
    
    .prose h4,
    .prose-lg h4,
    .max-w-none h4 {
      font-size: 1.5rem !important; /* 24px */
      font-weight: 700 !important;
      color: #374151 !important;
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
      color: #c084fc !important;
      font-size: 1rem !important;
    }
    
    .prose h5,
    .prose-lg h5,
    .max-w-none h5 {
      font-size: 1.25rem !important; /* 20px */
      font-weight: 700 !important;
      color: #4b5563 !important;
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
      color: #6b7280 !important;
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
      @apply text-gray-700 leading-relaxed mb-8 text-lg;
    }
    
    .prose strong {
      @apply text-gray-900 font-semibold;
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
    
    /* Modern code styling */
    .prose code { 
      @apply bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 px-2 py-1 rounded-md text-sm font-mono border border-purple-100;
    }
    
    .prose pre { 
      @apply bg-gray-900 p-6 rounded-xl overflow-x-auto mb-6 shadow-lg border border-gray-200;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }
    
    .prose pre code { 
      @apply bg-transparent text-gray-100 p-0 border-0;
      color: #e2e8f0;
    }
    
    /* Enhanced List styling */
    .prose ul { 
      @apply mb-8 space-y-4 pl-4;
    }
    
    .prose ol { 
      @apply mb-8 space-y-4 pl-4;
    }
    
    .prose li { 
      @apply text-gray-700 leading-relaxed text-base;
    }
    
    .prose ul li {
      @apply relative pl-8 py-2;
    }
    
    .prose ul li::before {
      content: '✨';
      @apply absolute left-0 top-2 text-purple-500 text-lg;
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
      @apply absolute left-0 top-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center;
    }
    
    /* Nested lists */
    .prose ul ul li::before {
      content: '▸';
      @apply text-purple-400 text-sm;
    }
    
    .prose li > ul,
    .prose li > ol {
      @apply mt-3 mb-0;
    }
    
    /* Enhanced Blockquote styling */
    .prose blockquote { 
      @apply border-l-4 pl-8 py-6 italic text-gray-700 mb-8 rounded-r-xl shadow-sm;
      border-left-color: #8b5cf6;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      position: relative;
    }
    
    .prose blockquote::before {
      content: '"';
      @apply absolute -top-2 -left-2 text-6xl text-purple-300 font-serif;
    }
    
    /* Feature list styling (lists with emojis) */
    .prose ul li:has(strong) {
      @apply bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 my-3;
    }
    
    .prose ul li:has(strong)::before {
      content: '⚡';
      @apply text-blue-500;
    }
    
    /* Table styling */
    .prose table { 
      @apply w-full border-collapse mb-6 shadow-lg rounded-lg overflow-hidden;
    }
    
    .prose th { 
      @apply px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-gray-800 text-left border-b border-gray-200;
    }
    
    .prose td { 
      @apply px-6 py-4 border-b border-gray-100 text-gray-600;
    }
    
    .prose tr:hover td {
      @apply bg-gray-50;
    }
    
    /* Links */
    .prose a {
      @apply text-purple-600 hover:text-purple-800 underline decoration-purple-300 hover:decoration-purple-500 transition-colors duration-200;
    }
    
    /* Navigation styling */
    .nav-item { 
      @apply block px-4 py-3 text-sm rounded-lg transition-all duration-200 border border-transparent;
    }
    
    .nav-item:hover {
      @apply bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border-purple-100 transform translate-x-1;
    }
    
    .nav-item.active { 
      @apply bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200 shadow-sm font-medium;
    }
    
    /* Sidebar styling */
    .sidebar-section {
      @apply mb-6;
    }
    
    .sidebar-title {
      @apply text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4;
    }
    
    /* Custom scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 3px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
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
    <aside class="w-72 bg-white/80 backdrop-blur-sm shadow-xl border-r border-gray-200/50 fixed h-full overflow-y-auto custom-scrollbar">
      <div class="p-8">
        <!-- Logo/Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold mb-2">
            <a href="/docs" class="bg-gradient-docs bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              SonicJS AI
            </a>
          </h1>
          <p class="text-sm text-gray-500 font-medium">Documentation</p>
        </div>
        
        <!-- Navigation -->
        <nav class="space-y-2">
          ${renderNavigation(data.navigation, data.currentPath)}
        </nav>
        
        <!-- Footer Links -->
        <div class="mt-12 pt-6 border-t border-gray-200">
          <div class="space-y-2">
            <a href="/admin" class="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-purple-600 transition-colors">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Admin Panel
            </a>
            <a href="https://github.com/lane711/sonicjs-ai" target="_blank" class="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-purple-600 transition-colors">
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
          <div class="flex items-center text-sm text-gray-500 mb-6">
            <a href="/docs" class="hover:text-purple-600 transition-colors font-medium">Documentation</a>
            <svg class="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
            <span class="text-gray-700 font-medium">${data.title}</span>
          </div>
        </div>
        
        <!-- Content Container -->
        <div class="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-12 mb-12">
          <div class="prose prose-lg max-w-none">
            ${data.content}
          </div>
        </div>
        
        <!-- Enhanced Footer -->
        <footer class="mt-16 pt-12 border-t border-gray-200/50">
          <div class="bg-white/50 backdrop-blur-sm rounded-xl p-8">
            <div class="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
              <div class="mb-4 md:mb-0">
                <p class="font-medium">© 2024 SonicJS AI Documentation</p>
                <p class="text-gray-500">Built with ❤️ using TypeScript & Hono</p>
              </div>
              <div class="flex space-x-6">
                <a href="/docs" class="hover:text-purple-600 transition-colors font-medium">Documentation</a>
                <a href="/docs/api" class="hover:text-purple-600 transition-colors font-medium">API Reference</a>
                <a href="/admin" class="hover:text-purple-600 transition-colors font-medium">Admin</a>
                <a href="https://github.com/lane711/sonicjs-ai" target="_blank" class="hover:text-purple-600 transition-colors font-medium">GitHub</a>
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
               : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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