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
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    
    // Should redirect to login page
    await page.waitForURL(/\/auth\/login/);
    
    // Verify we're on the login page
    expect(page.url()).toContain('/auth/login');
    await expect(page.locator('h2')).toContainText('Sign In');
    
    // Verify no error message is shown
    await expect(page.locator('.error-message')).toHaveCount(0);
  });

  test('Admin routes should require authentication', async ({ page }) => {
    // Try to access admin without auth
    await page.goto('/admin');
    
    // Should redirect to login
    await page.waitForURL(/\/auth\/login/);
    
    // Verify we're on the login page
    expect(page.url()).toContain('/auth/login');
    await expect(page.locator('h2')).toContainText('Sign In');
    
    // Verify error message is shown (check if it's in URL params)
    expect(page.url()).toContain('error=Please%20login%20to%20access%20the%20admin%20area');
  });

  test('404 routes should return not found', async ({ page }) => {
    const response = await page.goto('/nonexistent-route');
    expect(response?.status()).toBe(404);
  });
}); 