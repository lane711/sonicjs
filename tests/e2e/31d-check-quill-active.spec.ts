import { test } from '@playwright/test';

test.describe('Check Quill Plugin Status', () => {
  test('check if quill plugin is active in database', async ({ request }) => {
    // Direct API call to check plugin status
    const response = await request.get('/admin/plugins');
    const html = await response.text();

    console.log('\n\n=== CHECKING QUILL PLUGIN STATUS ===');

    // Check if quill-editor appears in the plugins list
    const hasQuillPlugin = html.includes('quill-editor') || html.includes('Quill');
    console.log('Has Quill plugin in plugins list:', hasQuillPlugin);

    // Check for active status indicators
    const hasActiveStatus = html.includes('active') || html.includes('Active');
    console.log('Has active status text:', hasActiveStatus);

    console.log('=== END STATUS CHECK ===\n\n');

    // Also try to directly query the API for plugin data if available
    try {
      const apiResponse = await request.get('/api/plugins/quill-editor');
      if (apiResponse.ok()) {
        const pluginData = await apiResponse.json();
        console.log('\n=== PLUGIN API DATA ===');
        console.log(JSON.stringify(pluginData, null, 2));
        console.log('=== END API DATA ===\n');
      } else {
        console.log('\nPlugin API endpoint returned:', apiResponse.status());
      }
    } catch (e) {
      console.log('\nNo API endpoint available for plugin data');
    }
  });
});
