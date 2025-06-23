#!/usr/bin/env node

import { Command } from 'commander';
import { generateCollection } from './commands/generate';
import { initProject } from './commands/init';
import { migrate } from './commands/migrate';

const program = new Command();

program
  .name('sonicjs')
  .description('SonicJS CLI - Cloudflare-native headless CMS with Hono.js')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new SonicJS project')
  .option('-n, --name <name>', 'Project name')
  .action(initProject);

program
  .command('generate:collection')
  .alias('g:collection')
  .description('Generate a new content collection')
  .argument('<name>', 'Collection name')
  .option('-f, --fields <fields>', 'Comma-separated field definitions')
  .action(generateCollection);

program
  .command('migrate')
  .description('Run database migrations')
  .option('--up', 'Run up migrations')
  .option('--down', 'Run down migrations')
  .action(migrate);

program
  .command('dev')
  .description('Start development server')
  .action(() => {
    console.log('Starting SonicJS development server...');
    console.log('Run: wrangler dev');
  });

program
  .command('build')
  .description('Build for production')
  .action(() => {
    console.log('Building SonicJS for production...');
    console.log('Run: tsc && wrangler deploy --dry-run');
  });

program
  .command('deploy')
  .description('Deploy to Cloudflare Workers')
  .action(() => {
    console.log('Deploying to Cloudflare Workers...');
    console.log('Run: wrangler deploy');
  });

program.parse();