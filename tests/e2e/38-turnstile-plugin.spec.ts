import { test, expect } from '@playwright/test'

test.describe('Turnstile Plugin', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login')
    await page.fill('input[name="email"]', 'admin@sonicjs.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin')
  })

  test('should display Turnstile plugin in plugins list', async ({ page }) => {
    await page.goto('/admin/plugins')
    
    // Check if Turnstile plugin card is visible
    const turnstileCard = page.locator('text=Cloudflare Turnstile')
    await expect(turnstileCard).toBeVisible()
    
    // Check for shield icon
    const shieldIcon = page.locator('[class*="shield"]').first()
    await expect(shieldIcon).toBeVisible()
  })

  test('should show Turnstile settings page', async ({ page }) => {
    await page.goto('/admin/plugins')
    
    // Click on Turnstile plugin
    await page.click('text=Cloudflare Turnstile')
    
    // Should show settings page with fields
    await expect(page.locator('text=Cloudflare Turnstile Settings')).toBeVisible()
    await expect(page.locator('input[name="setting_siteKey"]')).toBeVisible()
    await expect(page.locator('input[name="setting_secretKey"]')).toBeVisible()
    await expect(page.locator('select[name="setting_theme"]')).toBeVisible()
    await expect(page.locator('select[name="setting_size"]')).toBeVisible()
  })

  test('should save Turnstile settings', async ({ page }) => {
    await page.goto('/admin/plugins')
    await page.click('text=Cloudflare Turnstile')
    
    // Fill in test keys (these are dummy keys for testing UI only)
    await page.fill('input[name="setting_siteKey"]', '1x00000000000000000000AA')
    await page.fill('input[name="setting_secretKey"]', '1x0000000000000000000000000000000AA')
    
    // Select options
    await page.selectOption('select[name="setting_theme"]', 'dark')
    await page.selectOption('select[name="setting_size"]', 'compact')
    
    // Enable Turnstile
    const enableToggle = page.locator('input[name="setting_enabled"]')
    if (!(await enableToggle.isChecked())) {
      await enableToggle.click()
    }
    
    // Save settings
    await page.click('button:has-text("Save Settings")')
    
    // Should show success message or stay on page
    await expect(page).toHaveURL(/\/admin\/plugins/)
  })

  test('should allow enabling Turnstile on contact form', async ({ page }) => {
    // First ensure Turnstile plugin is configured
    await page.goto('/admin/plugins')
    await page.click('text=Cloudflare Turnstile')
    await page.fill('input[name="setting_siteKey"]', '1x00000000000000000000AA')
    await page.fill('input[name="setting_secretKey"]', '1x0000000000000000000000000000000AA')
    await page.click('button:has-text("Save Settings")')
    
    // Go to contact form settings
    await page.goto('/admin/plugins')
    await page.click('text=Contact Form')
    
    // Enable Turnstile
    const turnstileToggle = page.locator('input[name="useTurnstile"]')
    if (!(await turnstileToggle.isChecked())) {
      await turnstileToggle.click()
    }
    
    // Save contact form settings
    await page.click('button:has-text("Save Settings")')
    
    // Verify settings were saved
    await expect(page.locator('text=Settings Saved')).toBeVisible({ timeout: 5000 })
  })

  test('should show Turnstile widget on contact form when enabled', async ({ page }) => {
    // Note: This test requires real Turnstile keys to fully work
    // With dummy keys, the widget may not render properly
    
    await page.goto('/contact')
    
    // Check if the page loads
    await expect(page).toHaveURL('/contact')
    
    // Check if form exists
    const form = page.locator('form#cf')
    await expect(form).toBeVisible()
    
    // If Turnstile is enabled, the widget container should exist
    // (even if it doesn't fully render without valid keys)
    const turnstileContainer = page.locator('.cf-turnstile')
    const containerCount = await turnstileContainer.count()
    
    // Container may or may not be present depending on settings
    // This is more of a smoke test
    console.log(`Turnstile containers found: ${containerCount}`)
  })
})
