import { spawn } from 'child_process';

export async function migrate(options: { up?: boolean; down?: boolean }) {
  console.log('🔄 Running database migrations...');
  
  if (options.down) {
    console.log('⬇️  Running down migrations');
    // Implement down migrations when needed
    console.log('⚠️  Down migrations not yet implemented');
    return;
  }
  
  try {
    // Generate migrations first
    console.log('📝 Generating migrations...');
    await runCommand('npx', ['drizzle-kit', 'generate']);
    
    // Apply migrations locally
    console.log('🏗️  Applying migrations locally...');
    await runCommand('npx', ['wrangler', 'd1', 'migrations', 'apply', '--local']);
    
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}