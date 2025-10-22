/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    // Vitest configuration options
    globals:true,
    reporters: ['verbose'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      // playwright test should be excluded from vitest, add a seperate playright test command later
      './e2e',
      './tests-examples',
      // this file has only comments
      "./src/pages/api/v1/test/vars/set.test.ts"
    ]
  },
});