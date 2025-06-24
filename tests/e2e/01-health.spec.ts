import { test, expect } from '@playwright/test';
import { checkAPIHealth } from './utils/test-helpers';

test.describe('Health Checks', () => {
  test('API health endpoint should return running status', async ({ page }) => {
    const health = await checkAPIHealth(page);
    
    expect(health).toHaveProperty('name', 'SonicJS AI');
    expect(health).toHaveProperty('version', '0.1.0');
    expect(health).toHaveProperty('status', 'running');
    expect(health).toHaveProperty('timestamp');
  });

  test('Home page should redirect to login', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to login page
    await page.waitForURL('/auth/login');
    await expect(page.locator('h1')).toContainText('Login');
  });

  test('Admin routes should require authentication', async ({ page }) => {
    // Try to access admin without auth
    await page.goto('/admin');
    
    // Should redirect to login
    await page.waitForURL(/\/auth\/login/);
    await expect(page.locator('h1')).toContainText('Login');
  });

  test('404 routes should return not found', async ({ page }) => {
    const response = await page.goto('/nonexistent-route');
    expect(response?.status()).toBe(404);
  });
}); 