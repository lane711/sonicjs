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
      "./src/pages/api/v1/test/vars/set.test.ts"
    ]
  },
});