#!/usr/bin/env node

// Debug script for workflow dashboard issues
// This script will help identify why workflow states aren't showing up

const { createClient } = require('@libsql/client');
const path = require('path');

// Configuration
const config = {
  // Update these paths according to your setup
  databasePath: process.env.DB_PATH || './.wrangler/state/v3/d1/miniflare-D1DatabaseObject/755d5c8bf08a9272238e9b8a4abc2e0aae7d3347653c5decacd3aca91d2a26bf.sqlite',
  databaseUrl: process.env.DATABASE_URL || `file:${path.resolve('./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/755d5c8bf08a9272238e9b8a4abc2e0aae7d3347653c5decacd3aca91d2a26bf.sqlite')}`,
};

async function debugWorkflow() {
  console.log('🔍 Starting Workflow Debug Session...\n');
  
  let client;
  try {
    // Initialize database client
    client = createClient({
      url: config.databaseUrl,
    });

    // Test 1: Check if workflow_states table exists and has data
    console.log('📋 Test 1: Checking workflow_states table...');
    try {
      const statesResult = await client.execute('SELECT * FROM workflow_states ORDER BY name');
      console.log(`✅ Found ${statesResult.rows.length} workflow states:`);
      statesResult.rows.forEach(row => {
        console.log(`   - ${row.id}: ${row.name} (${row.color}) ${row.is_initial ? '[INITIAL]' : ''} ${row.is_final ? '[FINAL]' : ''}`);
      });
    } catch (error) {
      console.error('❌ Error querying workflow_states:', error.message);
      
      // Check if table exists
      try {
        const tableCheck = await client.execute(`
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name='workflow_states'
        `);
        if (tableCheck.rows.length === 0) {
          console.log('⚠️  workflow_states table does not exist!');
          console.log('   Run the migration: npm run migrate or apply 005_stage7_workflow_automation.sql');
        }
      } catch (e) {
        console.error('❌ Error checking table existence:', e.message);
      }
    }

    console.log('\n');

    // Test 2: Check workflows table
    console.log('📋 Test 2: Checking workflows table...');
    try {
      const workflowsResult = await client.execute(`
        SELECT w.*, c.name as collection_name 
        FROM workflows w 
        LEFT JOIN collections c ON w.collection_id = c.id
        ORDER BY w.name
      `);
      console.log(`✅ Found ${workflowsResult.rows.length} workflows:`);
      workflowsResult.rows.forEach(row => {
        console.log(`   - ${row.id}: ${row.name} (Collection: ${row.collection_name || 'Global'}) ${row.is_active ? '[ACTIVE]' : '[INACTIVE]'}`);
      });
    } catch (error) {
      console.error('❌ Error querying workflows:', error.message);
    }

    console.log('\n');

    // Test 3: Check content with workflow states
    console.log('📋 Test 3: Checking content workflow status...');
    try {
      const contentResult = await client.execute(`
        SELECT 
          c.id,
          c.title,
          c.workflow_state_id,
          cws.current_state_id,
          ws.name as state_name,
          ws.color as state_color
        FROM content c
        LEFT JOIN content_workflow_status cws ON c.id = cws.content_id
        LEFT JOIN workflow_states ws ON (cws.current_state_id = ws.id OR c.workflow_state_id = ws.id)
        ORDER BY c.created_at DESC
        LIMIT 10
      `);
      console.log(`✅ Found ${contentResult.rows.length} content items:`);
      contentResult.rows.forEach(row => {
        console.log(`   - ${row.title}: workflow_state_id="${row.workflow_state_id}", current_state_id="${row.current_state_id}", resolved_state="${row.state_name}"`);
      });
    } catch (error) {
      console.error('❌ Error querying content workflow status:', error.message);
    }

    console.log('\n');

    // Test 4: Simulate WorkflowEngine.getWorkflowStates()
    console.log('📋 Test 4: Simulating WorkflowEngine.getWorkflowStates()...');
    try {
      const statesQuery = `
        SELECT * FROM workflow_states 
        ORDER BY is_initial DESC, name ASC
      `;
      const statesResult = await client.execute(statesQuery);
      console.log(`✅ Query returned ${statesResult.rows.length} states:`);
      console.log('Raw query result:', JSON.stringify(statesResult.rows, null, 2));
    } catch (error) {
      console.error('❌ Error simulating getWorkflowStates():', error.message);
    }

    console.log('\n');

    // Test 5: Simulate WorkflowEngine.getContentByState() for each state
    console.log('📋 Test 5: Simulating WorkflowEngine.getContentByState() for each state...');
    try {
      const statesResult = await client.execute('SELECT id, name FROM workflow_states');
      
      for (const state of statesResult.rows) {
        const contentQuery = `
          SELECT 
            c.*,
            cws.assigned_to,
            cws.due_date,
            ws.name as state_name,
            ws.color as state_color,
            col.name as collection_name,
            u.username as assigned_to_name
          FROM content c
          JOIN content_workflow_status cws ON c.id = cws.content_id
          JOIN workflow_states ws ON cws.current_state_id = ws.id
          JOIN collections col ON c.collection_id = col.id
          LEFT JOIN users u ON cws.assigned_to = u.id
          WHERE cws.current_state_id = ?
          ORDER BY c.updated_at DESC
          LIMIT 10
        `;
        
        const contentResult = await client.execute(contentQuery, [state.id]);
        console.log(`   - ${state.name} (${state.id}): ${contentResult.rows.length} content items`);
        
        if (contentResult.rows.length > 0) {
          contentResult.rows.forEach(content => {
            console.log(`     * ${content.title} (${content.collection_name})`);
          });
        }
      }
    } catch (error) {
      console.error('❌ Error simulating getContentByState():', error.message);
    }

    console.log('\n');

    // Test 6: Check database connection and basic operations
    console.log('📋 Test 6: Database connection and basic operations...');
    try {
      const dbVersion = await client.execute('SELECT sqlite_version()');
      console.log(`✅ SQLite version: ${dbVersion.rows[0]['sqlite_version()']}`);
      
      const tableCount = await client.execute(`
        SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'
      `);
      console.log(`✅ Total tables in database: ${tableCount.rows[0].count}`);
    } catch (error) {
      console.error('❌ Database connection error:', error.message);
    }

    console.log('\n');

    // Test 7: Check if migration was applied correctly
    console.log('📋 Test 7: Checking migration application...');
    try {
      const expectedTables = [
        'workflow_states',
        'workflows', 
        'workflow_transitions',
        'content_workflow_status',
        'workflow_history'
      ];
      
      for (const tableName of expectedTables) {
        const tableCheck = await client.execute(`
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name='${tableName}'
        `);
        if (tableCheck.rows.length > 0) {
          console.log(`✅ Table ${tableName} exists`);
        } else {
          console.log(`❌ Table ${tableName} is missing!`);
        }
      }
    } catch (error) {
      console.error('❌ Error checking migration:', error.message);
    }

    console.log('\n');

    // Test 8: Check for any errors in the workflow route logic
    console.log('📋 Test 8: Checking workflow route logic simulation...');
    try {
      // Simulate the exact query from the workflow dashboard route
      const states = await client.execute(`
        SELECT * FROM workflow_states 
        ORDER BY is_initial DESC, name ASC
      `);
      
      console.log(`✅ States query returned ${states.rows.length} results`);
      
      const stateData = [];
      for (const state of states.rows) {
        const content = await client.execute(`
          SELECT 
            c.*,
            cws.assigned_to,
            cws.due_date,
            ws.name as state_name,
            ws.color as state_color,
            col.name as collection_name,
            u.username as assigned_to_name
          FROM content c
          JOIN content_workflow_status cws ON c.id = cws.content_id
          JOIN workflow_states ws ON cws.current_state_id = ws.id
          JOIN collections col ON c.collection_id = col.id
          LEFT JOIN users u ON cws.assigned_to = u.id
          WHERE cws.current_state_id = ?
          ORDER BY c.updated_at DESC
          LIMIT 10
        `, [state.id]);
        
        stateData.push({
          ...state,
          count: content.rows.length,
          content: content.rows.slice(0, 5)
        });
      }
      
      console.log('✅ Route simulation completed successfully');
      console.log('Final state data structure:', JSON.stringify(stateData, null, 2));
      
    } catch (error) {
      console.error('❌ Error in route simulation:', error.message);
    }

  } catch (error) {
    console.error('❌ Critical error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }

  console.log('\n🏁 Debug session completed!');
  console.log('\n💡 Recommendations:');
  console.log('1. If workflow_states table is empty, run the migration again');
  console.log('2. If content_workflow_status table is empty, initialize workflow for existing content');
  console.log('3. Check browser console for JavaScript errors');
  console.log('4. Verify the database path and permissions');
  console.log('5. Test the /admin/workflow/dashboard route directly');
}

// Additional helper function to initialize missing workflow data
async function initializeWorkflowData() {
  console.log('\n🔧 Initializing missing workflow data...');
  
  let client;
  try {
    client = createClient({
      url: config.databaseUrl,
    });

    // Check if content exists without workflow status
    const contentWithoutWorkflow = await client.execute(`
      SELECT c.id, c.title, c.collection_id
      FROM content c
      LEFT JOIN content_workflow_status cws ON c.id = cws.content_id
      WHERE cws.id IS NULL
      LIMIT 10
    `);

    if (contentWithoutWorkflow.rows.length > 0) {
      console.log(`Found ${contentWithoutWorkflow.rows.length} content items without workflow status`);
      
      // Get the default workflow
      const defaultWorkflow = await client.execute(`
        SELECT id FROM workflows WHERE is_active = 1 LIMIT 1
      `);
      
      if (defaultWorkflow.rows.length > 0) {
        const workflowId = defaultWorkflow.rows[0].id;
        
        // Initialize workflow status for content without it
        for (const content of contentWithoutWorkflow.rows) {
          await client.execute(`
            INSERT INTO content_workflow_status (content_id, workflow_id, current_state_id)
            VALUES (?, ?, 'draft')
          `, [content.id, workflowId]);
          
          console.log(`✅ Initialized workflow for: ${content.title}`);
        }
      } else {
        console.log('❌ No active workflow found!');
      }
    } else {
      console.log('✅ All content has workflow status');
    }

  } catch (error) {
    console.error('❌ Error initializing workflow data:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Command line interface
const args = process.argv.slice(2);
if (args.includes('--init')) {
  initializeWorkflowData();
} else {
  debugWorkflow();
}