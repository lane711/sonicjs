import fs from 'fs/promises';
import path from 'path';

export async function initProject(options: { name?: string }) {
  const projectName = options.name || 'my-sonicjs-project';
  
  console.log(`🚀 Initializing SonicJS project: ${projectName}`);
  
  try {
    // Create project structure
    await createProjectStructure(projectName);
    
    // Create basic configuration files
    await createConfigFiles(projectName);
    
    console.log(`✅ Project initialized successfully!`);
    console.log(`📁 Created: ${projectName}/`);
    console.log(`🔧 Next steps:`);
    console.log(`   cd ${projectName}`);
    console.log(`   npm install`);
    console.log(`   npm run dev`);
    
  } catch (error) {
    console.error(`❌ Error initializing project:`, error);
    process.exit(1);
  }
}

async function createProjectStructure(projectName: string) {
  const dirs = [
    projectName,
    `${projectName}/collections`,
    `${projectName}/src/app`,
    `${projectName}/src/lib`,
    `${projectName}/src/components`,
    `${projectName}/public`,
  ];
  
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function createConfigFiles(projectName: string) {
  // Create package.json
  const packageJson = {
    name: projectName,
    version: '0.1.0',
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
      test: 'jest',
      'test:e2e': 'playwright test',
      'db:generate': 'drizzle-kit generate',
      'db:migrate': 'wrangler d1 migrations apply --local',
      'db:studio': 'drizzle-kit studio'
    },
    dependencies: {
      'next': '^14.0.0',
      'react': '^18.0.0',
      'react-dom': '^18.0.0',
      'drizzle-orm': 'latest',
      'zod': 'latest'
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      '@types/react': '^18.0.0',
      'typescript': '^5.0.0',
      'tailwindcss': 'latest',
      'wrangler': 'latest',
      'drizzle-kit': 'latest'
    }
  };
  
  await fs.writeFile(
    path.join(projectName, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create basic README
  const readme = `# ${projectName}

A SonicJS headless CMS project powered by Cloudflare.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Commands

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run test\` - Run tests
- \`npm run db:migrate\` - Run database migrations
\`\`\`
`;
  
  await fs.writeFile(path.join(projectName, 'README.md'), readme);
}