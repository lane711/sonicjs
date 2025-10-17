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
  dts: true,

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
    console.log('✓ Build complete!')
  },
})
