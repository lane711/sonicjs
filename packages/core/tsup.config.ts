import { defineConfig } from 'tsup'

export default defineConfig({
  // Entry points
  entry: {
    index: 'src/index.ts',
    services: 'src/services/index.ts',
    middleware: 'src/middleware/index.ts',
    routes: 'src/routes/index.ts',
    templates: 'src/templates/index.ts',
    plugins: 'src/plugins/index.ts',
    utils: 'src/utils/index.ts',
    types: 'src/types/index.ts',
  },

  // Output formats
  format: ['esm', 'cjs'],

  // Generate TypeScript definitions
  // Temporarily disabled - needs type error fixes in routes
  dts: false,

  // Code splitting for better tree-shaking
  splitting: true,

  // Generate sourcemaps for debugging
  sourcemap: true,

  // Clean dist folder before build
  clean: true,

  // Don't minify for better debugging (can enable for production)
  minify: false,

  // Tree-shaking
  treeshake: true,

  // External dependencies (not bundled)
  external: [
    '@cloudflare/workers-types',
    'hono',
    'drizzle-orm',
    'zod',
  ],

  // Bundle these dependencies (included in package)
  noExternal: [
    'drizzle-zod',
    'marked',
    'highlight.js',
    'semver'
  ],

  // Target environment
  target: 'es2022',
  platform: 'neutral',

  // Output extension
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js'
    }
  },

  // TypeScript options
  tsconfig: './tsconfig.json',

  // Build hooks
  onSuccess: async () => {
    // Create stub type definition files since dts generation is disabled
    const fs = await import('fs')
    const path = await import('path')

    const distDir = path.resolve(process.cwd(), 'dist')

    const typeFiles = {
      'index.d.ts': `// Main exports from @sonicjs-cms/core package
export * from '../src/index'

// Explicitly re-export key types and classes
export type { Plugin, PluginContext } from '../src/types/index'
export { TemplateRenderer, templateRenderer, renderTemplate } from '../src/utils/template-renderer'
`,
      'templates.d.ts': `// Template exports from core package
export * from '../src/templates/index'
`,
      'routes.d.ts': `// Route exports from core package
export * from '../src/routes/index'
`,
      'middleware.d.ts': `// Middleware exports from core package
export * from '../src/middleware/index'
`,
      'services.d.ts': `// Service exports from core package
export * from '../src/services/index'
`,
      'plugins.d.ts': `// Plugin exports from core package
export * from '../src/plugins/index'
`,
      'utils.d.ts': `// Utility exports from core package
export * from '../src/utils/index'
`,
      'types.d.ts': `// Type exports from core package
export * from '../src/types/index'
`,
    }

    for (const [filename, content] of Object.entries(typeFiles)) {
      const filePath = path.join(distDir, filename)
      fs.writeFileSync(filePath, content, 'utf-8')
    }

    console.log('✓ Type definition files created')
    console.log('✓ Build complete!')
  },
})
