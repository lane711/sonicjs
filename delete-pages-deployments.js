#!/usr/bin/env node

/**
 * Delete all Cloudflare Pages deployments for a project
 * Usage: CF_API_TOKEN=your_token node delete-pages-deployments.js
 */

const PROJECT_NAME = 'demo-sonicjs-com';
const ACCOUNT_ID = 'f9d6328dc3115e621758a741dda3d5c4';

// Get API token from environment or wrangler config
const API_TOKEN = process.env.CF_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;

if (!API_TOKEN) {
  console.error('Error: Please set CF_API_TOKEN or CLOUDFLARE_API_TOKEN environment variable');
  console.error('You can create one at: https://dash.cloudflare.com/profile/api-tokens');
  process.exit(1);
}

async function fetchDeployments() {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch deployments: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result || [];
}

async function deleteDeployment(deploymentId) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments/${deploymentId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete deployment ${deploymentId}: ${error}`);
  }

  return true;
}

async function main() {
  console.log(`Fetching deployments for project: ${PROJECT_NAME}...`);

  const deployments = await fetchDeployments();
  console.log(`Found ${deployments.length} deployments`);

  if (deployments.length === 0) {
    console.log('No deployments to delete');
    return;
  }

  console.log('Starting deletion...');
  let deleted = 0;
  let failed = 0;

  for (const deployment of deployments) {
    try {
      await deleteDeployment(deployment.id);
      deleted++;
      console.log(`[${deleted + failed}/${deployments.length}] Deleted: ${deployment.id}`);

      // Rate limit: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      failed++;
      console.error(`[${deleted + failed}/${deployments.length}] Failed: ${deployment.id} - ${error.message}`);
    }
  }

  console.log(`\nComplete! Deleted: ${deleted}, Failed: ${failed}`);
  console.log('\nYou can now delete the project with:');
  console.log(`wrangler pages project delete ${PROJECT_NAME}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
