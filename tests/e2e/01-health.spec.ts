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

  test('404 routes should return not found', async ({ page }) => {
    const response = await page.goto('/nonexistent-route');
    expect(response?.status()).toBe(404);
  });
}); 