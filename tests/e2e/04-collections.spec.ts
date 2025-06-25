import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateToAdminSection, createTestCollection, deleteTestCollection, TEST_DATA } from './utils/test-helpers';

test.describe('Collections Management', () => {
    test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToAdminSection(page, 'collections');
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Only clean up if the test might have created a collection
    const needsCleanup = [
      'should create a new collection',
      'should prevent duplicate collection names', 
      'should edit an existing collection'
    ].some(name => testInfo.title.includes(name));
    
    if (needsCleanup) {
      try {
        await deleteTestCollection(page, TEST_DATA.collection.name);
      } catch (error) {
        // Silently ignore cleanup errors
      }
    }
  });

  test('should display collections list', async ({ page }) => {
    await expect(page.locator('h1').first()).toContainText('Collections');
    await expect(page.locator('table')).toBeVisible();
    
    // Should show default blog_posts collection
    await expect(page.locator('tr').filter({ hasText: 'blog_posts' })).toBeVisible();
  });

  test('should create a new collection', async ({ page }) => {
    await page.click('a[href="/admin/collections/new"]');
    
    // Fill form
    await page.fill('[name="name"]', TEST_DATA.collection.name);
    await page.fill('[name="displayName"]', TEST_DATA.collection.displayName);
    await page.fill('[name="description"]', TEST_DATA.collection.description);
    
    await page.click('button[type="submit"]');
    
    // Wait for HTMX response and success message
    await expect(page.locator('#form-messages .bg-green-100')).toBeVisible({ timeout: 10000 });
    
    // Should redirect to collections list (JavaScript redirect with 1.5s delay)
    await page.waitForURL('/admin/collections', { timeout: 15000 });
    
    // Should show the new collection in the list
    await expect(page.locator('tr').filter({ hasText: TEST_DATA.collection.name })).toBeVisible();
  });

  test('should validate collection name format', async ({ page }) => {
    await page.click('a[href="/admin/collections/new"]');
    
    // Wait for form to load
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('[name="name"]')).toBeVisible();
    
    // Try invalid name with spaces and uppercase
    await page.fill('[name="name"]', 'Invalid Collection Name');
    await page.fill('[name="displayName"]', 'Invalid Collection');
    
    await page.click('button[type="submit"]');
    
    // Should show validation error in form messages (try different selectors)
    try {
      await expect(page.locator('#form-messages .bg-red-100')).toBeVisible({ timeout: 5000 });
    } catch {
      // If that fails, check if any error message appears anywhere
      await expect(page.locator('.bg-red-100')).toBeVisible({ timeout: 2000 });
    }
    
    // Should contain validation message about format
    await expect(page.getByText('Collection name must contain only lowercase letters, numbers, and underscores')).toBeVisible({ timeout: 5000 });
  });

  test('should prevent duplicate collection names', async ({ page }) => {
    // First, create a collection
    await createTestCollection(page);
    
    // Try to create another with same name
    await page.click('a[href="/admin/collections/new"]');
    await page.fill('[name="name"]', TEST_DATA.collection.name);
    await page.fill('[name="displayName"]', 'Another Collection');
    
    await page.click('button[type="submit"]');
    
    // Should show error about duplicate name
    await expect(page.locator('#form-messages .bg-red-100')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#form-messages')).toContainText('already exists');
  });

  test('should edit an existing collection', async ({ page }) => {
    // Create test collection first
    await createTestCollection(page);
    
    // Navigate back to collections list and edit
    await navigateToAdminSection(page, 'collections');
    
    const collectionRow = page.locator('tr').filter({ hasText: TEST_DATA.collection.name });
    await collectionRow.locator('a').filter({ hasText: 'Edit' }).click();
    
    // Update display name
    await page.fill('[name="displayName"]', 'Updated Test Collection');
    await page.click('button[type="submit"]');
    
    // Should show success message in form messages area  
    await expect(page.locator('#form-messages .bg-green-100')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#form-messages')).toContainText('updated successfully');
  });

  test('should delete a collection', async ({ page }) => {
    // Create test collection first
    await createTestCollection(page);
    
    // Navigate to edit page and delete
    await navigateToAdminSection(page, 'collections');
    
    const collectionRow = page.locator('tr').filter({ hasText: TEST_DATA.collection.name });
    await collectionRow.locator('a').filter({ hasText: 'Edit' }).click();
    
    // Set up dialog handler before clicking delete
    page.on('dialog', dialog => dialog.accept());
    
    await page.locator('button').filter({ hasText: 'Delete Collection' }).click();
    
    // Should redirect to collections list  
    await page.waitForURL('/admin/collections', { timeout: 15000 });
    
    // Collection should no longer be visible
    await expect(page.locator('tr').filter({ hasText: TEST_DATA.collection.name })).not.toBeVisible();
  });

  test('should show collection actions', async ({ page }) => {
    // Find existing collection row
    const collectionRow = page.locator('tr').filter({ hasText: 'blog_posts' });
    
    // Should have Edit and Content links
    await expect(collectionRow.locator('a').filter({ hasText: 'Edit' })).toBeVisible();
    await expect(collectionRow.locator('a').filter({ hasText: 'Content' })).toBeVisible();
  });

  test('should navigate to collection content', async ({ page }) => {
    const collectionRow = page.locator('tr').filter({ hasText: 'blog_posts' });
    await collectionRow.locator('a').filter({ hasText: 'Content' }).click();
    
    // Should navigate to content page filtered by collection
    await expect(page).toHaveURL(/\/admin\/collections\/.*\/content/);
  });
}); 