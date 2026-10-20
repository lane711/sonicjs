import { test, expect } from './fixtures';
import { loginAsAdmin, getCsrfTokenFromPage } from './utils/test-helpers';

test.describe('Migrations API Endpoints @content @media @api', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should return migration status from API endpoint', async ({ page }) => {
    const response = await page.request.get('/admin/api/migrations/status');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('totalMigrations');
    expect(data.data).toHaveProperty('appliedMigrations');
    expect(data.data).toHaveProperty('pendingMigrations');
    expect(data.data).toHaveProperty('migrations');
    expect(Array.isArray(data.data.migrations)).toBe(true);
  });

  test('should return validation results from validate endpoint', async ({ page }) => {
    const response = await page.request.get('/admin/api/migrations/validate');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
  });

  test('should explain that migration execution is managed by Wrangler', async ({ page }) => {
    const csrfToken = await getCsrfTokenFromPage(page);
    const response = await page.request.post('/admin/api/migrations/run', {
      headers: { ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}) }
    });

    expect(response.status()).toBe(409);
    
    const data = await response.json();
    expect(data).toHaveProperty('success', false);
    expect(data.message).toContain('wrangler d1 migrations apply');
  });

  test('should handle malformed API requests gracefully', async ({ page }) => {
    // Test with invalid endpoint
    const response = await page.request.get('/admin/api/migrations/invalid');
    
    // Should return 404 or appropriate error status
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
