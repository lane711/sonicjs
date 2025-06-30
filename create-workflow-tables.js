#!/usr/bin/env node

// Script to create workflow tables directly via wrangler
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function createWorkflowTables() {
  console.log('🔧 Creating workflow tables...\n');
  
  // SQL commands to create workflow tables
  const sqlCommands = [
    // Workflow States Table
    `CREATE TABLE IF NOT EXISTS workflow_states (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#6B7280',
      is_initial INTEGER DEFAULT 0,
      is_final INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    
    // Insert default workflow states
    `INSERT OR IGNORE INTO workflow_states (id, name, description, color, is_initial, is_final) VALUES
    ('draft', 'Draft', 'Content is being worked on', '#F59E0B', 1, 0),
    ('pending-review', 'Pending Review', 'Content is waiting for review', '#3B82F6', 0, 0),
    ('approved', 'Approved', 'Content has been approved', '#10B981', 0, 0),
    ('published', 'Published', 'Content is live', '#059669', 0, 1),
    ('rejected', 'Rejected', 'Content was rejected', '#EF4444', 0, 1),
    ('archived', 'Archived', 'Content has been archived', '#6B7280', 0, 1);`,
    
    // Workflows Table
    `CREATE TABLE IF NOT EXISTS workflows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      collection_id TEXT,
      is_active INTEGER DEFAULT 1,
      auto_publish INTEGER DEFAULT 0,
      require_approval INTEGER DEFAULT 1,
      approval_levels INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    
    // Workflow Transitions Table
    `CREATE TABLE IF NOT EXISTS workflow_transitions (
      id TEXT PRIMARY KEY,
      workflow_id TEXT NOT NULL,
      from_state_id TEXT NOT NULL,
      to_state_id TEXT NOT NULL,
      required_permission TEXT,
      auto_transition INTEGER DEFAULT 0,
      transition_conditions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    
    // Content Workflow Status Table
    `CREATE TABLE IF NOT EXISTS content_workflow_status (
      id TEXT PRIMARY KEY,
      content_id TEXT NOT NULL,
      workflow_id TEXT NOT NULL,
      current_state_id TEXT NOT NULL,
      assigned_to TEXT,
      due_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(content_id, workflow_id)
    );`,
    
    // Workflow History Table
    `CREATE TABLE IF NOT EXISTS workflow_history (
      id TEXT PRIMARY KEY,
      content_id TEXT NOT NULL,
      workflow_id TEXT NOT NULL,
      from_state_id TEXT,
      to_state_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      comment TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    
    // Create default workflow
    `INSERT OR IGNORE INTO workflows (id, name, description, is_active, require_approval, approval_levels)
    VALUES ('default-workflow', 'Default Workflow', 'Standard content approval workflow', 1, 1, 1);`,
    
    // Create workflow transitions
    `INSERT OR IGNORE INTO workflow_transitions (id, workflow_id, from_state_id, to_state_id, required_permission) VALUES
    ('t1', 'default-workflow', 'draft', 'pending-review', 'content:submit'),
    ('t2', 'default-workflow', 'pending-review', 'approved', 'content:approve'),
    ('t3', 'default-workflow', 'approved', 'published', 'content:publish'),
    ('t4', 'default-workflow', 'pending-review', 'rejected', 'content:approve');`
  ];
  
  for (let i = 0; i < sqlCommands.length; i++) {
    const sql = sqlCommands[i];
    console.log(`📝 Executing command ${i + 1}/${sqlCommands.length}...`);
    
    try {
      const { stdout, stderr } = await execAsync(`npx wrangler d1 execute sonicjs-dev --local --command="${sql.replace(/"/g, '\\"')}"`);
      console.log(`✅ Success`);
      if (stderr) {
        console.warn(`⚠️  Warning: ${stderr.trim()}`);
      }
    } catch (error) {
      console.error(`❌ Error executing command ${i + 1}:`, error.message);
      // Continue with next command
    }
  }
  
  console.log('\n🔍 Verifying tables were created...');
  
  try {
    const { stdout } = await execAsync(`npx wrangler d1 execute sonicjs-dev --local --command="SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'workflow%'"`);
    console.log('✅ Workflow tables verification:', stdout);
  } catch (error) {
    console.error('❌ Error verifying tables:', error.message);
  }
  
  console.log('\n🎉 Workflow tables creation completed!');
  console.log('\nNext steps:');
  console.log('1. Test the workflow engine: node init-workflow-data.js');
  console.log('2. Visit /admin/workflow/debug to check the API');
  console.log('3. Visit /admin/workflow/dashboard to see the dashboard');
}

createWorkflowTables().catch(console.error);