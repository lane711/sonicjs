import { test, expect } from '@playwright/test';
import { checkAPIHealth } from './utils/test-helpers';

test.describe('Health Checks', () => {
  test('API health endpoint should return running status', async ({ page }) => {
    const health = await checkAPIHealth(page);

    expect(health).toHaveProperty('name', 'SonicJS AI');
    expect(health).toHaveProperty('version'); // Version comes from @sonicjs-cms/core package
    expect(health.version).toMatch(/^\d+\.\d+\.\d+$/); // Verify semver format
    expect(health).toHaveProperty('status', 'running');
    expect(health).toHaveProperty('timestamp');
  });

  test('404 routes should return not found', async ({ request }) => {
    // Use request API directly to check 404 status without redirect following
    const response = await request.get('/api/nonexistent-route-12345');
    expect(response.status()).toBe(404);
  });
}); 