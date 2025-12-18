import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    ignores: [
      'dist/**',
      'node_modules/**',
      '**/*.test.ts',
      '**/*.spec.ts',
      'src/plugins/available/email-templates-plugin/fix-email-case.ts',
      'src/plugins/available/email-templates-plugin/initialize-email-system.ts',
    ],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Naming conventions to enforce coding standards
      '@typescript-eslint/naming-convention': [
        'error',
        // Default: camelCase for everything
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        // Variables: camelCase, UPPER_CASE, or PascalCase (for Zod schemas like PluginConfigSchema)
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        // Functions: camelCase or PascalCase (for React components)
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        // Parameters: camelCase
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        // Object literal properties: allow flexibility for HTTP headers, DB columns, numeric keys
        {
          selector: 'objectLiteralProperty',
          format: null, // Disable format check - allows Content-Type, Authorization, numeric keys, etc.
        },
        // Class/type properties: camelCase (allows flexibility for API responses)
        {
          selector: 'property',
          format: ['camelCase', 'UPPER_CASE', 'snake_case', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        // Type properties: allow PascalCase for Hono's Bindings/Variables convention
        {
          selector: 'typeProperty',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE', 'snake_case'],
        },
        // Types, classes, interfaces, enums: PascalCase
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        // Enum members: PascalCase or UPPER_CASE
        {
          selector: 'enumMember',
          format: ['PascalCase', 'UPPER_CASE'],
        },
        // Import names: camelCase or PascalCase
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase'],
        },
      ],

      // Additional TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
