export interface LogoData {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'white' | 'dark'
  showText?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-6 w-auto',
  md: 'h-8 w-auto',
  lg: 'h-12 w-auto',
  xl: 'h-16 w-auto'
}

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl'
}

export function renderLogo(data: LogoData = {}): string {
  const {
    size = 'md',
    variant = 'default',
    showText = true,
    className = ''
  } = data

  const sizeClass = sizeClasses[size]
  const textSizeClass = textSizeClasses[size]
  
  // SonicJS logo SVG - modern, clean design representing speed and edge computing
  const logoSvg = `
    <svg class="${sizeClass} ${className}" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sonic-gradient-${variant}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${variant === 'white' ? '#ffffff' : variant === 'dark' ? '#1f2937' : '#3b82f6'};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${variant === 'white' ? '#f8fafc' : variant === 'dark' ? '#374151' : '#1d4ed8'};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Sonic wave/speed lines representing fast edge computing -->
      <g transform="translate(5, 8)">
        <!-- Main wave -->
        <path d="M0 12 Q8 8 16 12 T32 12" stroke="url(#sonic-gradient-${variant})" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M0 16 Q12 12 24 16 T48 16" stroke="url(#sonic-gradient-${variant})" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.8"/>
        <path d="M0 20 Q16 16 32 20 T64 20" stroke="url(#sonic-gradient-${variant})" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.6"/>
        
        <!-- Speed particles -->
        <circle cx="52" cy="12" r="1.5" fill="url(#sonic-gradient-${variant})" opacity="0.9"/>
        <circle cx="58" cy="16" r="1" fill="url(#sonic-gradient-${variant})" opacity="0.7"/>
        <circle cx="64" cy="20" r="0.8" fill="url(#sonic-gradient-${variant})" opacity="0.5"/>
      </g>
    </svg>
  `

  if (!showText) {
    return logoSvg
  }

  const textColor = variant === 'white' ? 'text-white' : variant === 'dark' ? 'text-gray-900' : 'text-gray-900'
  
  return `
    <div class="flex items-center space-x-3 ${className}">
      ${logoSvg}
      ${showText ? `
        <div class="flex flex-col">
          <span class="${textSizeClass} font-bold ${textColor} leading-tight">SonicJS</span>
          <span class="text-xs ${textColor} opacity-75 leading-tight">AI</span>
        </div>
      ` : ''}
    </div>
  `
}