#!/usr/bin/env node

// Script to initialize workflow data and fix missing content workflow status
const { createClient } = require('@libsql/client');
const path = require('path');

const config = {
  databasePath: process.env.DB_PATH || './.wrangler/state/v3/d1/miniflare-D1DatabaseObject/755d5c8bf08a9272238e9b8a4abc2e0aae7d3347653c5decacd3aca91d2a26bf.sqlite',
  databaseUrl: process.env.DATABASE_URL || `file:${path.resolve('./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/755d5c8bf08a9272238e9b8a4abc2e0aae7d3347653c5decacd3aca91d2a26bf.sqlite')}`,
};

async function initializeWorkflowData() {
  console.log('🚀 Initializing workflow data...\n');
  
  let client;
  try {
    client = createClient({
      url: config.databaseUrl,
    });

    // 1. Ensure workflow states exist
    console.log('📋 Step 1: Ensuring workflow states exist...');
    const statesResult = await client.execute('SELECT COUNT(*) as count FROM workflow_states');
    console.log(`Current workflow states count: ${statesResult.rows[0].count}`);
    
    if (statesResult.rows[0].count === 0) {
      console.log('No workflow states found. Inserting default states...');
      
      const defaultStates = [
        { id: 'draft', name: 'Draft', description: 'Content is being worked on', color: '#F59E0B', is_initial: 1, is_final: 0 },
        { id: 'pending-review', name: 'Pending Review', description: 'Content is waiting for review', color: '#3B82F6', is_initial: 0, is_final: 0 },
        { id: 'approved', name: 'Approved', description: 'Content has been approved', color: '#10B981', is_initial: 0, is_final: 0 },
        { id: 'published', name: 'Published', description: 'Content is live', color: '#059669', is_initial: 0, is_final: 1 },
        { id: 'rejected', name: 'Rejected', description: 'Content was rejected', color: '#EF4444', is_initial: 0, is_final: 1 },
        { id: 'archived', name: 'Archived', description: 'Content has been archived', color: '#6B7280', is_initial: 0, is_final: 1 }
      ];
      
      for (const state of defaultStates) {
        await client.execute(`
          INSERT OR IGNORE INTO workflow_states (id, name, description, color, is_initial, is_final) 
          VALUES (?, ?, ?, ?, ?, ?)
        `, [state.id, state.name, state.description, state.color, state.is_initial, state.is_final]);
        console.log(`✅ Inserted state: ${state.name}`);
      }
    } else {
      console.log('✅ Workflow states already exist');
    }

    // 2. Ensure workflows exist
    console.log('\n📋 Step 2: Ensuring workflows exist...');
    const workflowsResult = await client.execute('SELECT COUNT(*) as count FROM workflows');
    console.log(`Current workflows count: ${workflowsResult.rows[0].count}`);
    
    if (workflowsResult.rows[0].count === 0) {
      console.log('No workflows found. Creating default workflow...');
      
      await client.execute(`
        INSERT INTO workflows (id, name, description, is_active, require_approval, approval_levels)
        VALUES ('default-workflow', 'Default Workflow', 'Standard content approval workflow', 1, 1, 1)
      `);
      console.log('✅ Created default workflow');
      
      // Add transitions
      const transitions = [
        { from: 'draft', to: 'pending-review', permission: 'content:submit' },
        { from: 'pending-review', to: 'approved', permission: 'content:approve' },
        { from: 'approved', to: 'published', permission: 'content:publish' },
        { from: 'pending-review', to: 'rejected', permission: 'content:approve' },
        { from: 'draft', to: 'archived', permission: 'content:archive' },
        { from: 'published', to: 'archived', permission: 'content:archive' }
      ];
      
      for (const transition of transitions) {
        await client.execute(`
          INSERT INTO workflow_transitions (workflow_id, from_state_id, to_state_id, required_permission)
          VALUES ('default-workflow', ?, ?, ?)
        `, [transition.from, transition.to, transition.permission]);
        console.log(`✅ Added transition: ${transition.from} → ${transition.to}`);
      }
    } else {
      console.log('✅ Workflows already exist');
    }

    // 3. Initialize content workflow status for existing content
    console.log('\n📋 Step 3: Initializing content workflow status...');
    
    const contentWithoutWorkflow = await client.execute(`
      SELECT c.id, c.title, c.collection_id, c.status
      FROM content c
      LEFT JOIN content_workflow_status cws ON c.id = cws.content_id
      WHERE cws.id IS NULL
    `);
    
    console.log(`Found ${contentWithoutWorkflow.rows.length} content items without workflow status`);
    
    if (contentWithoutWorkflow.rows.length > 0) {
      const defaultWorkflow = await client.execute(`
        SELECT id FROM workflows WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1
      `);
      
      if (defaultWorkflow.rows.length > 0) {
        const workflowId = defaultWorkflow.rows[0].id;
        console.log(`Using workflow: ${workflowId}`);
        
        for (const content of contentWithoutWorkflow.rows) {
          // Determine initial state based on content status
          let initialState = 'draft';
          if (content.status === 'published') {
            initialState = 'published';
          } else if (content.status === 'archived') {
            initialState = 'archived';
          }
          
          await client.execute(`
            INSERT INTO content_workflow_status (content_id, workflow_id, current_state_id)
            VALUES (?, ?, ?)
          `, [content.id, workflowId, initialState]);
          
          // Update content table to have workflow_state_id
          await client.execute(`
            UPDATE content SET workflow_state_id = ? WHERE id = ?
          `, [initialState, content.id]);
          
          console.log(`✅ Initialized workflow for: ${content.title} (${initialState})`);
        }
      } else {
        console.log('❌ No active workflow found to initialize content');
      }
    } else {
      console.log('✅ All content already has workflow status');
    }

    // 4. Verify the setup
    console.log('\n📋 Step 4: Verifying setup...');
    
    const finalStatesResult = await client.execute('SELECT COUNT(*) as count FROM workflow_states');
    const finalWorkflowsResult = await client.execute('SELECT COUNT(*) as count FROM workflows');
    const finalContentStatusResult = await client.execute('SELECT COUNT(*) as count FROM content_workflow_status');
    
    console.log(`✅ Final verification:
  - Workflow states: ${finalStatesResult.rows[0].count}
  - Workflows: ${finalWorkflowsResult.rows[0].count}
  - Content workflow status: ${finalContentStatusResult.rows[0].count}`);

    // 5. Test the workflow engine query
    console.log('\n📋 Step 5: Testing workflow engine query...');
    
    const testStates = await client.execute(`
      SELECT * FROM workflow_states 
      ORDER BY is_initial DESC, name ASC
    `);
    
    console.log(`✅ Workflow engine query returns ${testStates.rows.length} states:`);
    testStates.rows.forEach(state => {
      console.log(`   - ${state.name} (${state.id}): ${state.color}`);
    });

    console.log('\n🎉 Workflow initialization completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Visit /admin/workflow/debug to test the API');
    console.log('2. Visit /admin/workflow/dashboard to see the dashboard');
    console.log('3. Check browser console for any JavaScript errors');

  } catch (error) {
    console.error('❌ Error during initialization:', error);
    console.error('Stack:', error.stack);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the initialization
initializeWorkflowData();