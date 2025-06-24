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

const SONICJS_LOGO = `<svg viewBox="380 1300 2250 400" aria-hidden="true" class="h-8"><path fill="#F1F2F2" d="M476.851,1404.673h168.536c4.714,0,8.695-1.618,11.944-4.866c3.241-3.241,4.866-7.222,4.866-11.943    c0-2.357-0.443-4.569-1.327-6.636c-0.885-2.06-2.067-3.829-3.539-5.308c-1.479-1.472-3.249-2.654-5.308-3.538    c-2.067-0.885-4.279-1.327-6.635-1.327H476.851c-20.057,0-37.158,7.154-51.313,21.454c-14.155,14.308-21.233,31.483-21.233,51.534    c0,20.058,7.078,37.234,21.233,51.534c14.155,14.308,31.255,21.454,51.313,21.454h112.357c10.907,0,20.196,3.837,27.868,11.502    c7.666,7.672,11.502,16.885,11.502,27.646c0,10.769-3.836,19.982-11.502,27.647c-7.672,7.673-16.961,11.502-27.868,11.502H421.115    c-4.721,0-8.702,1.624-11.944,4.865c-3.248,3.249-4.866,7.23-4.866,11.944c0,3.248,0.733,6.123,2.212,8.626    c1.472,2.509,3.462,4.499,5.971,5.972c2.502,1.472,5.378,2.212,8.626,2.212h168.094c20.052,0,37.227-7.078,51.534-21.234    c14.3-14.155,21.454-31.331,21.454-51.534c0-20.196-7.154-37.379-21.454-51.534c-14.308-14.156-31.483-21.234-51.534-21.234    H476.851c-10.616,0-19.76-3.905-27.426-11.721c-7.672-7.811-11.501-17.101-11.501-27.87c0-10.761,3.829-19.975,11.501-27.647    C457.091,1408.508,466.235,1404.673,476.851,1404.673z"></path><path fill="#F1F2F2" d="M974.78,1398.211c-5.016,6.574-10.034,13.146-15.048,19.721c-1.828,2.398-3.657,4.796-5.487,7.194    c1.994,1.719,3.958,3.51,5.873,5.424c18.724,18.731,28.089,41.216,28.089,67.459c0,26.251-9.366,48.658-28.089,67.237    c-18.731,18.579-41.215,27.868-67.459,27.868c-9.848,0-19.156-1.308-27.923-3.923l-4.185,3.354    c-8.587,6.885-17.154,13.796-25.725,20.702c17.52,8.967,36.86,13.487,58.054,13.487c35.533,0,65.91-12.608,91.124-37.821    c25.214-25.215,37.821-55.584,37.821-91.125c0-35.534-12.607-65.911-37.821-91.126    C981.004,1403.663,977.926,1400.854,974.78,1398.211z"></path><path fill="#F1F2F2" d="M1364.644,1439.619c-4.72,0-8.702,1.624-11.943,4.865c-3.249,3.249-4.866,7.23-4.866,11.944v138.014    l-167.651-211.003c-0.297-0.586-0.74-1.03-1.327-1.326c-4.721-4.714-10.249-7.742-16.588-9.069    c-6.346-1.326-12.608-0.732-18.801,1.77c-6.192,2.509-11.059,6.49-14.598,11.944c-3.539,5.46-5.308,11.577-5.308,18.357v208.348    c0,4.721,1.618,8.703,4.866,11.944c3.241,3.241,7.222,4.865,11.943,4.865c2.945,0,5.751-0.738,8.405-2.211    c2.654-1.472,4.713-3.463,6.193-5.971c1.473-2.503,2.212-5.378,2.212-8.627v-205.251l166.325,209.675    c2.06,2.654,4.423,4.865,7.078,6.635c5.308,3.829,11.349,5.75,18.137,5.75c5.308,0,10.464-1.182,15.482-3.538    c3.539-1.769,6.56-4.127,9.069-7.078c2.502-2.945,4.491-6.338,5.971-10.175c1.473-3.829,2.212-7.664,2.212-11.501v-141.552    c0-4.714-1.624-8.695-4.865-11.944C1373.339,1441.243,1369.359,1439.619,1364.644,1439.619z"></path><path fill="#F1F2F2" d="M1508.406,1432.983c-2.654-1.472-5.46-2.212-8.404-2.212c-4.721,0-8.703,1.7-11.944,5.087    c-3.249,3.395-4.865,7.3-4.865,11.723v163.228c0,4.721,1.616,8.702,4.865,11.943c3.241,3.249,7.223,4.866,11.944,4.866    c2.944,0,5.751-0.732,8.404-2.212c2.655-1.472,4.714-3.539,6.193-6.194c1.473-2.654,2.213-5.453,2.213-8.404V1447.58    c0-2.945-0.74-5.75-2.213-8.405C1513.12,1436.522,1511.06,1434.462,1508.406,1432.983z"></path><path fill="#F1F2F2" d="M1499.78,1367.957c-4.575,0-8.481,1.625-11.722,4.866c-3.249,3.249-4.865,7.23-4.865,11.943    c0,2.951,0.732,5.75,2.212,8.405c1.472,2.654,3.463,4.721,5.971,6.193c2.503,1.479,5.378,2.212,8.627,2.212    c4.423,0,8.328-1.618,11.721-4.865c3.387-3.243,5.088-7.224,5.088-11.944c0-4.713-1.701-8.694-5.088-11.943    C1508.33,1369.582,1504.349,1367.957,1499.78,1367.957z"></path><path fill="#F1F2F2" d="M1859.627,1369.727H1747.27c-35.388,0-65.69,12.607-90.904,37.821    c-25.213,25.215-37.82,55.591-37.82,91.125c0,35.54,12.607,65.911,37.82,91.125c25.215,25.215,55.516,37.821,90.904,37.821h56.178    c4.714,0,8.695-1.618,11.944-4.866c3.241-3.241,4.865-7.222,4.865-11.943c0-4.714-1.624-8.695-4.865-11.943    c-3.249-3.243-7.23-4.866-11.944-4.866h-56.178c-26.251,0-48.659-9.359-67.237-28.09c-18.579-18.723-27.868-41.207-27.868-67.459    c0-26.243,9.29-48.659,27.868-67.237c18.579-18.579,40.987-27.868,67.237-27.868h112.357c4.714,0,8.696-1.693,11.944-5.087    c3.241-3.387,4.865-7.368,4.865-11.943c0-4.569-1.624-8.475-4.865-11.723C1868.322,1371.351,1864.341,1369.727,1859.627,1369.727z    "></path><path fill="#34D399" d="M2219.256,1371.054h-112.357c-4.423,0-8.336,1.624-11.723,4.865c-3.393,3.249-5.087,7.23-5.087,11.944    c0,4.721,1.694,8.702,5.087,11.943c3.387,3.249,7.3,4.866,11.723,4.866h95.547v95.105c0,26.251-9.365,48.659-28.088,67.237    c-18.731,18.579-41.215,27.868-67.459,27.868c-26.251,0-48.659-9.289-67.237-27.868c-18.579-18.579-27.868-40.987-27.868-67.237    c0-4.713-1.701-8.771-5.088-12.165c-3.393-3.387-7.374-5.087-11.943-5.087c-4.575,0-8.481,1.7-11.722,5.087    c-3.249,3.393-4.865,7.451-4.865,12.165c0,35.388,12.607,65.69,37.82,90.904c25.215,25.213,55.584,37.82,91.126,37.82    c35.532,0,65.91-12.607,91.125-37.82c25.214-25.215,37.82-55.516,37.82-90.904v-111.915c0-4.714-1.624-8.695-4.865-11.944    C2227.951,1372.678,2223.971,1371.054,2219.256,1371.054z"></path><path fill="#34D399" d="M2574.24,1502.875c-14.306-14.156-31.483-21.234-51.533-21.234H2410.35    c-10.617,0-19.762-3.829-27.426-11.501c-7.672-7.664-11.501-16.954-11.501-27.868c0-10.907,3.829-20.196,11.501-27.868    c7.664-7.664,16.809-11.501,27.426-11.501h112.357c4.714,0,8.695-1.617,11.944-4.866c3.241-3.241,4.865-7.222,4.865-11.943    c0-4.714-1.624-8.695-4.865-11.944c-3.249-3.241-7.23-4.865-11.944-4.865H2410.35c-20.058,0-37.158,7.154-51.313,21.454    c-14.156,14.308-21.232,31.483-21.232,51.534c0,20.058,7.077,37.234,21.232,51.534c14.156,14.308,31.255,21.454,51.313,21.454    h112.357c7.078,0,13.637,1.77,19.684,5.308c6.042,3.539,10.838,8.336,14.377,14.377c3.538,6.047,5.307,12.607,5.307,19.685    c0,10.616-3.835,19.76-11.501,27.425c-7.672,7.673-16.961,11.502-27.868,11.502h-168.094c-4.721,0-8.703,1.7-11.944,5.087    c-3.249,3.393-4.865,7.374-4.865,11.943c0,4.576,1.616,8.481,4.865,11.723c3.241,3.249,7.223,4.866,11.944,4.866h168.094    c20.051,0,37.227-7.078,51.533-21.234c14.302-14.155,21.454-31.331,21.454-51.534    C2595.695,1534.213,2588.542,1517.03,2574.24,1502.875z"></path><path fill="#34D399" d="M854.024,1585.195l20.001-16.028c16.616-13.507,33.04-27.265,50.086-40.251    c1.13-0.861,2.9-1.686,2.003-3.516c-0.843-1.716-2.481-2.302-4.484-2.123c-8.514,0.765-17.016-0.538-25.537-0.353    c-1.124,0.024-2.768,0.221-3.163-1.25c-0.371-1.369,1.088-2.063,1.919-2.894c6.26-6.242,12.574-12.43,18.816-18.691    c9.303-9.327,18.565-18.714,27.851-28.066c1.848-1.859,3.701-3.713,5.549-5.572c2.655-2.661,5.309-5.315,7.958-7.982    c0.574-0.579,1.259-1.141,1.246-1.94c-0.004-0.257-0.078-0.538-0.254-0.853c-0.556-0.981-1.441-1.1-2.469-0.957    c-0.658,0.096-1.315,0.185-1.973,0.275c-3.844,0.538-7.689,1.076-11.533,1.608c-3.641,0.505-7.281,1.02-10.922,1.529    c-4.162,0.582-8.324,1.158-12.486,1.748c-1.142,0.161-2.409,1.662-3.354,0.508c-0.419-0.508-0.431-1.028-0.251-1.531    c0.269-0.741,0.957-1.441,1.387-2.021c3.414-4.58,6.882-9.124,10.356-13.662c1.74-2.272,3.48-4.544,5.214-6.822    c4.682-6.141,9.369-12.281,14.051-18.422c0.09-0.119,0.181-0.237,0.271-0.355c6.848-8.98,13.7-17.958,20.553-26.936    c0.488-0.64,0.977-1.28,1.465-1.92c2.159-2.828,4.315-5.658,6.476-8.486c4.197-5.501,8.454-10.954,12.67-16.442    c0.263-0.347,0.538-0.718,0.717-1.106c0.269-0.586,0.299-1.196-0.335-1.776c-0.825-0.753-1.8-0.15-2.595,0.419    c-0.67,0.472-1.333,0.957-1.955,1.489c-2.206,1.889-4.401,3.797-6.595,5.698c-3.958,3.438-7.922,6.876-11.976,10.194    c-2.443,2.003-4.865,4.028-7.301,6.038c-18.689-10.581-39.53-15.906-62.549-15.906c-35.54,0-65.911,12.607-91.125,37.82    c-25.214,25.215-37.821,55.592-37.821,91.126c0,35.54,12.607,65.91,37.821,91.125c4.146,4.146,8.445,7.916,12.87,11.381    c-9.015,11.14-18.036,22.277-27.034,33.429c-1.208,1.489-3.755,3.151-2.745,4.891c0.078,0.144,0.173,0.281,0.305,0.425    c1.321,1.429,3.492-1.303,4.933-2.457c6.673-5.333,13.333-10.685,19.982-16.042c3.707-2.984,7.417-5.965,11.124-8.952    c1.474-1.188,2.951-2.373,4.425-3.561c6.41-5.164,12.816-10.333,19.238-15.481L854.024,1585.195z M797.552,1498.009    c0-26.243,9.29-48.728,27.868-67.459c18.579-18.723,40.987-28.089,67.238-28.089c12.273,0,23.712,2.075,34.34,6.171    c-3.37,2.905-6.734,5.816-10.069,8.762c-6.075,5.351-12.365,10.469-18.667,15.564c-4.179,3.378-8.371,6.744-12.514,10.164    c-7.54,6.23-15.037,12.52-22.529,18.804c-7.091,5.955-14.182,11.904-21.19,17.949c-1.136,0.974-3.055,1.907-2.135,3.94    c0.831,1.836,2.774,1.417,4.341,1.578l12.145-0.599l14.151-0.698c1.031-0.102,2.192-0.257,2.89,0.632    c0.034,0.044,0.073,0.078,0.106,0.127c1.017,1.561-0.67,2.105-1.387,2.942c-6.308,7.318-12.616,14.637-18.978,21.907    c-8.161,9.339-16.353,18.649-24.544,27.958c-2.146,2.433-4.275,4.879-6.422,7.312c-1.034,1.172-2.129,2.272-1.238,3.922    c0.933,1.728,2.685,1.752,4.323,1.602c4.134-0.367,8.263-0.489,12.396-0.492c0.242,0,0.485-0.005,0.728-0.004    c2.711,0.009,5.422,0.068,8.134,0.145c2.582,0.074,5.166,0.165,7.752,0.249c0.275,1.62-0.879,2.356-1.62,3.259    c-1.333,1.626-2.667,3.247-4,4.867c-4.315,5.252-8.62,10.514-12.928,15.772c-3.562-2.725-7.007-5.733-10.324-9.051    C806.842,1546.667,797.552,1524.26,797.552,1498.009z"></path></svg>`;

export function renderDocsLayout(data: DocsLayoutData): string {
  const navItems = [
    { path: '/docs', label: 'Documentation', active: data.currentPath === '/docs' },
    { path: '/docs/getting-started', label: 'Getting Started', active: data.currentPath === '/docs/getting-started' },
    { path: '/docs/api-reference', label: 'API Reference', active: data.currentPath === '/docs/api-reference' },
    { path: '/docs/content-management', label: 'Content Management', active: data.currentPath === '/docs/content-management' },
    { path: '/admin', label: 'Admin Panel', active: false }
  ]

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
              ${SONICJS_LOGO}
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