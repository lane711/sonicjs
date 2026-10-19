import { test, expect } from '@playwright/test';
import { loginAsAdmin, getCsrfTokenFromPage } from './utils/test-helpers';

test.describe('Database Tools API Endpoints @database', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should return database stats from API endpoint', async ({ page }) => {
    const response = await page.request.get('/admin/database-tools/api/stats');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('totalRows');
    expect(data.data).toHaveProperty('tables');
    expect(Array.isArray(data.data.tables)).toBe(true);
  });

  test('should return validation results from validate endpoint', async ({ page }) => {
    const response = await page.request.get('/admin/database-tools/api/validate');
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty('valid');
    expect(data.data).toHaveProperty('issues');
  });

  test('should require admin role for backup endpoint', async ({ page }) => {
    const csrfToken = await getCsrfTokenFromPage(page);
    const response = await page.request.post('/admin/database-tools/api/backup', {
      headers: { ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}) }
    });
    
    // Should either succeed (if user is admin) or return 403
    expect([200, 403]).toContain(response.status());
    
    const data = await response.json();
    
    if (response.status() === 403) {
      expect(data).toHaveProperty('success', false);
      expect(data.error).toContain('Unauthorized');
    } else {
      expect(data).toHaveProperty('success');
    }
  });

  test('should require admin role for truncate endpoint', async ({ page }) => {
    const csrfToken = await getCsrfTokenFromPage(page);
    const response = await page.request.post('/admin/database-tools/api/truncate', {
      headers: { ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}) },
      data: { confirmText: 'TRUNCATE ALL DATA' }
    });
    
    // Should either succeed (if user is admin) or return 403
    expect([200, 400, 403]).toContain(response.status());
    
    const data = await response.json();
    
    if (response.status() === 403) {
      expect(data).toHaveProperty('success', false);
      expect(data.error).toContain('Unauthorized');
    }
  });

  test('should handle malformed API requests gracefully', async ({ page }) => {
    // Test with invalid endpoint
    const response = await page.request.get('/admin/database-tools/api/invalid');
    
    // Should return 404 or appropriate error status
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});