#!/usr/bin/env node

/**
 * Test Data Cleanup Script
 * 
 * This script cleans up test data created during e2e testing:
 * - Collections with test names (test_*, delete_*, temp_*)
 * - Users with test emails (test*, temp*)
 * - Content items created for testing
 * - Media files uploaded during tests
 */

const API_BASE = process.env.API_BASE || 'http://localhost:8787';

async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${await response.text()}`);
  }
  
  return response.json();
}

async function cleanupTestCollections() {
  console.log('🗂️  Checking for test collections...');
  
  try {
    const { data: collections } = await fetchAPI('/api/collections');
    
    const testCollections = collections.filter(collection => 
      /^(test_|delete_|temp_|e2e_)/.test(collection.name) ||
      /test|delete|temp|e2e/i.test(collection.display_name)
    );
    
    if (testCollections.length === 0) {
      console.log('✅ No test collections found');
      return;
    }
    
    console.log(`Found ${testCollections.length} test collections to clean up:`);
    testCollections.forEach(col => {
      console.log(`  - ${col.name} (${col.display_name})`);
    });
    
    // Note: Admin API for deleting collections may not be implemented yet
    console.log('⚠️  Manual cleanup required - collection deletion API not available');
    
    return testCollections;
    
  } catch (error) {
    console.error('❌ Error checking collections:', error.message);
  }
}

async function cleanupTestContent() {
  console.log('📄 Checking for test content...');
  
  try {
    const { data: content } = await fetchAPI('/api/content');
    
    const testContent = content.filter(item => 
      /test|temp|e2e/i.test(item.title || '') ||
      /test|temp|e2e/i.test(item.slug || '')
    );
    
    if (testContent.length === 0) {
      console.log('✅ No test content found');
      return;
    }
    
    console.log(`Found ${testContent.length} test content items:`);
    testContent.forEach(item => {
      console.log(`  - ${item.title} (${item.slug})`);
    });
    
    return testContent;
    
  } catch (error) {
    console.error('❌ Error checking content:', error.message);
  }
}

async function cleanupTestUsers() {
  console.log('👤 Checking for test users...');
  
  try {
    // Note: User API may not be publicly accessible
    console.log('⚠️  User cleanup requires admin access - check manually via admin interface');
    console.log('   Look for users with emails like: test*, temp*, e2e*');
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  }
}

async function generateCleanupReport() {
  console.log('📊 Generating cleanup report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    collections: await cleanupTestCollections(),
    content: await cleanupTestContent(),
    users: 'Manual check required'
  };
  
  // Save report
  const fs = require('fs');
  const path = require('path');
  
  const reportPath = path.join(__dirname, '..', 'test-cleanup-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📋 Cleanup report saved to: ${reportPath}`);
  
  return report;
}

async function main() {
  console.log('🧹 Starting test data cleanup...\n');
  
  try {
    // Check server availability
    await fetchAPI('/health');
    console.log('✅ Server is running\n');
    
    await cleanupTestCollections();
    console.log();
    
    await cleanupTestContent();
    console.log();
    
    await cleanupTestUsers();
    console.log();
    
    await generateCleanupReport();
    
    console.log('\n✨ Cleanup check complete!');
    console.log('\n📝 Manual cleanup steps:');
    console.log('   1. Review generated report');
    console.log('   2. Delete test collections via admin interface');
    console.log('   3. Remove test content items');
    console.log('   4. Check for test user accounts');
    console.log('   5. Clear any uploaded test media files');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  cleanupTestCollections,
  cleanupTestContent,
  cleanupTestUsers,
  generateCleanupReport
};