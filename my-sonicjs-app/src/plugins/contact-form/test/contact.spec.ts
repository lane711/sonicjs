import { test, expect } from '@playwright/test';

test.describe('Contact Form Plugin', () => {

  // TEST 1: Public Form Submission
  test('should allow a guest to send a message', async ({ page }) => {
    // 1. Go to the contact page
    await page.goto('/contact');
    
    // 2. Verify page loads
    await expect(page.locator('h1')).toContainText('Contact');
    
    // 3. Fill out the form
    await page.fill('input[name="name"]', 'Playwright User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="msg"]', 'Automated test message.');
    
    // 4. Submit
    // FIX: We now find the button by its visual text "Send Message"
    await page.getByRole('button', { name: 'Send Message' }).click();
    
    // 5. Verify Success Alert
    const alert = page.locator('#success-alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText('Message sent!');
  });

  // TEST 2: Admin Settings & Map Toggle
  test('should allow admin to enable the Google Map', async ({ page }) => {
    // --- LOGIN LOGIC START ---
    await page.goto('/admin/plugins/contact-form/settings');

    // If redirected to login, fill it out
    if (page.url().includes('/auth/login')) {
      await page.fill('input[name="email"]', 'admin@sonicjs.com'); 
      await page.fill('input[name="password"]', 'sonicjs!');       
      await page.click('button[type="submit"]');
      await page.waitForURL('**/admin/plugins/contact-form/settings');
    }
    // --- LOGIN LOGIC END ---

    // 1. Check the "Enable Map" box
    const checkbox = page.locator('#showMap');
    if (!(await checkbox.isChecked())) {
        await checkbox.check({ force: true });
    }

    // 2. Fill in details
    await page.fill('input[name="mapApiKey"]', 'AIzaFakeKeyForTesting');
    await page.fill('input[name="city"]', 'Baltimore');

    // 3. Save
    // FIX: We find this button by text too, just to be consistent
    await page.getByRole('button', { name: 'Save Settings' }).click();
    await expect(page.locator('#msg')).toBeVisible(); 

    // 4. Verify on Public Page
    await page.goto('/contact');
    
    // 5. Check if Map Iframe exists
    await expect(page.locator('.ratio-16x9')).toBeVisible();
  });
});
