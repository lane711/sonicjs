#!/usr/bin/env node
/**
 * Script to update import statements from local paths to @sonicjs-cms/core
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Import patterns to replace
const replacements = [
  // Middleware imports
  {
    pattern: /from\s+['"]\.\.\/middleware\/auth['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/middleware\/auth['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/middleware\/plugin-middleware['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/middleware\/plugin-middleware['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/middleware\/bootstrap['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/middleware\/bootstrap['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/middleware\/logging['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/middleware\/logging['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/middleware\/performance['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/middleware\/performance['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/middleware\/permissions['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/middleware\/permissions['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },

  // Utils imports
  {
    pattern: /from\s+['"]\.\.\/utils\/sanitize['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/utils\/sanitize['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/utils\/template-renderer['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/utils\/template-renderer['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/utils\/query-filter['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/utils\/query-filter['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/utils\/metrics['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/utils\/metrics['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },

  // Templates imports
  {
    pattern: /from\s+['"]\.\.\/templates\/form\.template['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/templates\/form\.template['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/templates\/table\.template['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/templates\/table\.template['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/templates\/pagination\.template['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/templates\/pagination\.template['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/templates\/alert\.template['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/templates\/alert\.template['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/templates\/confirmation-dialog\.template['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/templates\/confirmation-dialog\.template['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/templates\/filter-bar\.template['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/templates\/filter-bar\.template['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },

  // Types imports
  {
    pattern: /from\s+['"]\.\.\/types\/plugin['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/types\/plugin['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/types\/collection-config['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/types\/collection-config['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },

  // Services imports
  {
    pattern: /from\s+['"]\.\.\/services\/logger['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/services\/logger['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/services\/collection-sync['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/services\/collection-sync['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/services\/collection-loader['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/services\/collection-loader['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/services\/migration-service['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/services\/migration-service['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/services\/plugin-service['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/services\/plugin-service['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/services\/plugin-bootstrap['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/services\/plugin-bootstrap['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },

  // Plugins imports
  {
    pattern: /from\s+['"]\.\.\/plugins\/core\/hook-system['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/plugins\/core\/hook-system['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/plugins\/core\/plugin-registry['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/plugins\/core\/plugin-registry['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/plugins\/core\/plugin-manager['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/plugins\/core\/plugin-manager['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/plugins\/core\/plugin-validator['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/plugins\/core\/plugin-validator['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/plugins\/sdk\/plugin-builder['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/plugins\/sdk\/plugin-builder['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },

  // Three levels deep paths
  {
    pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/middleware\/auth['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/utils\/template-renderer['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/services\/logger['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },

  // Four levels deep paths
  {
    pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/middleware\/auth['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/utils\/template-renderer['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/services\/logger['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/types\/plugin['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },

  // Plugin directory - these import from src/types via ../types or ../../types
  {
    pattern: /from\s+['"]\.\.\/types['"](?!\/)(?!\.js)/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/\.\.\/types['"](?!\/)(?!\.js)/g,
    replacement: "from '@sonicjs-cms/core'"
  },
  {
    pattern: /from\s+['"]\.\.\/types\.js['"]/g,
    replacement: "from '@sonicjs-cms/core'"
  },
];

// Find all TypeScript files in src/
const files = glob.sync('src/**/*.{ts,tsx}', {
  cwd: projectRoot,
  ignore: [
    'src/db/**',
    'src/types/**',
    'src/utils/**',
    'src/services/**',
    'src/middleware/**',
    'src/plugins/core/**',
    'src/plugins/sdk/**',
    'src/templates/form.template.ts',
    'src/templates/table.template.ts',
    'src/templates/pagination.template.ts',
    'src/templates/alert.template.ts',
    'src/templates/confirmation-dialog.template.ts',
    'src/templates/filter-bar.template.ts',
  ]
});

console.log(`Found ${files.length} files to process`);

let totalChanges = 0;

files.forEach(file => {
  const filePath = join(projectRoot, file);
  let content = readFileSync(filePath, 'utf8');
  let fileChanges = 0;

  replacements.forEach(({ pattern, replacement }) => {
    const before = content;
    content = content.replace(pattern, replacement);
    if (content !== before) {
      fileChanges++;
    }
  });

  if (fileChanges > 0) {
    writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated ${file} (${fileChanges} replacements)`);
    totalChanges++;
  }
});

console.log(`\nDone! Updated ${totalChanges} files.`);
