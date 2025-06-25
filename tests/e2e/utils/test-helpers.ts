import { Page, expect } from '@playwright/test';

// Default admin credentials for testing
export const ADMIN_CREDENTIALS = {
  email: 'admin@sonicjs.com',
  password: 'admin123'
};

// Test data
export const TEST_DATA = {
  collection: {
    name: 'test_collection',
    displayName: 'Test Collection',
    description: 'Test collection for E2E testing'
  },
  content: {
    title: 'Test Blog Post',
    content: '<h1>Test Content</h1><p>This is test content for E2E testing.</p>',
    excerpt: 'Test excerpt for blog post',
    tags: ['test', 'e2e', 'playwright']
  },
  user: {
    email: 'testuser@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    password: 'testpass123'
  }
};

/**
 * Ensure admin user exists (for testing)
 */
export async function ensureAdminUserExists(page: Page) {
  try {
    await page.request.post('/auth/seed-admin');
  } catch (error) {
    // Admin might already exist, ignore errors
  }
}

/**
 * Login as admin user
 */
export async function loginAsAdmin(page: Page) {
  // Ensure admin user exists first
  await ensureAdminUserExists(page);
  
  await page.goto('/auth/login');
  await page.fill('[name="email"]', ADMIN_CREDENTIALS.email);
  await page.fill('[name="password"]', ADMIN_CREDENTIALS.password);
  await page.click('button[type="submit"]');
  
  // Wait for HTMX response and success message
  await expect(page.locator('#form-response .bg-green-100')).toBeVisible();
  
  // Wait for JavaScript redirect to admin dashboard (up to 3 seconds)
  await page.waitForURL('/admin', { timeout: 3000 });
  await expect(page.locator('h1').first()).toContainText('SonicJS AI Admin');
}

/**
 * Navigate to a specific admin section
 */
export async function navigateToAdminSection(page: Page, section: 'collections' | 'content' | 'media' | 'users') {
  await page.click(`a[href="/admin/${section}"]`);
  await page.waitForURL(`/admin/${section}`);
}

/**
 * Create a test collection
 */
export async function createTestCollection(page: Page, collectionData = TEST_DATA.collection) {
  await navigateToAdminSection(page, 'collections');
  await page.click('a[href="/admin/collections/new"]');
  
  await page.fill('[name="name"]', collectionData.name);
  await page.fill('[name="displayName"]', collectionData.displayName);
  await page.fill('[name="description"]', collectionData.description);
  
  await page.click('button[type="submit"]');
  
  // Wait for success message or redirect
  await expect(page.locator('.bg-green-100')).toBeVisible();
}

/**
 * Delete a test collection
 */
export async function deleteTestCollection(page: Page, collectionName: string) {
  await navigateToAdminSection(page, 'collections');
  
  // Find the collection row and click edit
  const collectionRow = page.locator('tr').filter({ hasText: collectionName });
  await collectionRow.locator('a').filter({ hasText: 'Edit' }).click();
  
  // Click delete button
  await page.locator('button').filter({ hasText: 'Delete Collection' }).click();
  
  // Confirm deletion
  page.on('dialog', dialog => dialog.accept());
  
  // Wait for redirect back to collections list
  await page.waitForURL('/admin/collections');
}

/**
 * Upload a test file
 */
export async function uploadTestFile(page: Page, fileName: string = 'test-image.jpg') {
  await navigateToAdminSection(page, 'media');
  await page.locator('button').filter({ hasText: 'Upload Files' }).click();
  
  // Create a test file buffer (1x1 pixel JPEG)
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
  
  // Set the file to upload
  await page.setInputFiles('#file-input', {
    name: fileName,
    mimeType: 'image/jpeg',
    buffer: testImageBuffer
  });
  
  await page.click('button[type="submit"]');
  
  // Wait for upload completion
  await expect(page.locator('#upload-results')).toContainText('successful');
}

/**
 * Wait for HTMX request to complete
 */
export async function waitForHTMX(page: Page) {
  await page.waitForFunction(() => {
    // @ts-ignore
    return window.htmx && !window.htmx.isProcessing();
  });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.goto('/admin', { waitUntil: 'networkidle' });
    // Check if we're still on admin page or redirected to login
    const currentUrl = page.url();
    if (currentUrl.includes('/auth/login')) {
      return false;
    }
    // Check for the first h1 to see if it contains admin text
    const title = await page.locator('h1').first().textContent();
    return title?.includes('SonicJS AI Admin') || false;
  } catch {
    return false;
  }
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
  await page.goto('/auth/logout');
  await page.waitForURL(/\/auth\/login/);
}

/**
 * Clear test data
 */
export async function clearTestData(page: Page) {
  // This would typically connect to the database and clean up test data
  // For now, we'll implement basic cleanup through the UI
  try {
    await loginAsAdmin(page);
    
    // Try to delete test collection if it exists
    try {
      await deleteTestCollection(page, TEST_DATA.collection.name);
    } catch {
      // Collection might not exist, ignore
    }
    
    await logout(page);
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Check API health
 */
export async function checkAPIHealth(page: Page) {
  const response = await page.request.get('/health');
  expect(response.ok()).toBeTruthy();
  const health = await response.json();
  expect(health.status).toBe('running');
  return health;
} 