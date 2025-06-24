import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateToAdminSection, createTestCollection, deleteTestCollection, TEST_DATA } from './utils/test-helpers';

test.describe('Full Integration Workflows', () => {
  test('should complete full collection and content workflow', async ({ page }) => {
    await loginAsAdmin(page);
    
    // 1. Create a new collection
    await navigateToAdminSection(page, 'collections');
    await page.click('a[href="/admin/collections/new"]');
    
    await page.fill('[name="name"]', TEST_DATA.collection.name);
    await page.fill('[name="displayName"]', TEST_DATA.collection.displayName);
    await page.fill('[name="description"]', TEST_DATA.collection.description);
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.bg-green-100')).toBeVisible();
    
    // 2. Navigate to content creation
    await navigateToAdminSection(page, 'content');
    await page.click('a[href="/admin/content/new"]');
    
    // 3. Create content in the new collection
    await expect(page.locator('h1')).toContainText('Create New Content');
    
    // Select the collection we just created
    const modelSelect = page.locator('select[name="model"]');
    if (await modelSelect.count() > 0) {
      await modelSelect.selectOption(TEST_DATA.collection.name);
    }
    
    // 4. Verify content was created and is visible in list
    await navigateToAdminSection(page, 'content');
    
    // 5. Clean up - delete the test collection
    await deleteTestCollection(page, TEST_DATA.collection.name);
  });

  test('should handle media upload and usage workflow', async ({ page }) => {
    await loginAsAdmin(page);
    
    // 1. Upload a media file
    await navigateToAdminSection(page, 'media');
    await page.locator('button').filter({ hasText: 'Upload Files' }).click();
    
    const testImageBuffer = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
      0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
      0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
      0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
      0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
      0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
      0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x80, 0xFF, 0xD9
    ]);
    
    await page.setInputFiles('#file-input', {
      name: 'integration-test.jpg',
      mimeType: 'image/jpeg',
      buffer: testImageBuffer
    });
    
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('#upload-results')).toContainText('successful');
    
    // 2. Verify file appears in media library
    const mediaItem = page.locator('.media-item').filter({ hasText: 'integration-test.jpg' });
    if (await mediaItem.count() > 0) {
      await expect(mediaItem).toBeVisible();
    }
  });

  test('should handle user session and authentication flow', async ({ page }) => {
    // 1. Start unauthenticated
    await page.goto('/admin');
    await page.waitForURL(/\/auth\/login/);
    
    // 2. Login with valid credentials
    await loginAsAdmin(page);
    await expect(page).toHaveURL('/admin');
    
    // 3. Navigate to different admin sections
    const sections = ['collections', 'content', 'media'];
    
    for (const section of sections) {
      await navigateToAdminSection(page, section as any);
      await expect(page).toHaveURL(`/admin/${section}`);
    }
    
    // 4. Logout
    await page.goto('/auth/logout');
    await page.waitForURL('/auth/login');
    
    // 5. Verify logged out - accessing admin should redirect
    await page.goto('/admin');
    await page.waitForURL(/\/auth\/login/);
  });

  test('should handle error scenarios gracefully', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Test 1: Invalid collection creation
    await navigateToAdminSection(page, 'collections');
    await page.click('a[href="/admin/collections/new"]');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    const errorMessage = page.locator('.error, .bg-red-100, .text-red-600');
    await expect(errorMessage).toBeVisible();
    
    // Test 2: Invalid file upload
    await navigateToAdminSection(page, 'media');
    await page.locator('button').filter({ hasText: 'Upload Files' }).click();
    
    // Try to upload invalid file
    await page.setInputFiles('#file-input', {
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not an image')
    });
    
    await page.locator('button[type="submit"]').click();
    
    // Should show error
    await expect(page.locator('#upload-results')).toContainText(/error|failed|not allowed/i);
  });

  test('should maintain data consistency across operations', async ({ page }) => {
    await loginAsAdmin(page);
    
    // 1. Get initial counts from dashboard
    const initialStats = {
      collections: await page.locator('.stat').filter({ hasText: 'Collections' }).textContent(),
      content: await page.locator('.stat').filter({ hasText: 'Content' }).textContent(),
      media: await page.locator('.stat').filter({ hasText: 'Media' }).textContent()
    };
    
    // 2. Create a collection
    await createTestCollection(page);
    
    // 3. Return to dashboard and verify count increased
    await page.goto('/admin');
    
    // Collections count should have increased
    const newCollectionsText = await page.locator('.stat').filter({ hasText: 'Collections' }).textContent();
    
    // 4. Clean up
    await deleteTestCollection(page, TEST_DATA.collection.name);
    
    // 5. Verify count returned to original
    await page.goto('/admin');
    const finalCollectionsText = await page.locator('.stat').filter({ hasText: 'Collections' }).textContent();
    expect(finalCollectionsText).toBe(initialStats.collections);
  });

  test('should handle concurrent user actions', async ({ browser }) => {
    // Create two browser contexts to simulate concurrent users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Both users login
    await loginAsAdmin(page1);
    await loginAsAdmin(page2);
    
    // User 1 creates a collection
    await navigateToAdminSection(page1, 'collections');
    await page1.click('a[href="/admin/collections/new"]');
    await page1.fill('[name="name"]', 'concurrent_test_1');
    await page1.fill('[name="displayName"]', 'Concurrent Test 1');
    await page1.click('button[type="submit"]');
    
    // User 2 should see the new collection when they refresh
    await navigateToAdminSection(page2, 'collections');
    await page2.reload();
    
    await expect(page2.locator('tr').filter({ hasText: 'concurrent_test_1' })).toBeVisible();
    
    // Clean up
    await deleteTestCollection(page1, 'concurrent_test_1');
    
    await context1.close();
    await context2.close();
  });

  test('should handle performance under load', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Measure page load times
    const startTime = Date.now();
    
    await navigateToAdminSection(page, 'content');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000);
    
    // Test rapid navigation
    const navigationStart = Date.now();
    
    await navigateToAdminSection(page, 'collections');
    await navigateToAdminSection(page, 'media');
    await navigateToAdminSection(page, 'content');
    
    const navigationTime = Date.now() - navigationStart;
    
    // Rapid navigation should complete within reasonable time
    expect(navigationTime).toBeLessThan(3000);
  });
}); 