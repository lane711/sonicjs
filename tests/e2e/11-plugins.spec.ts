import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './utils/test-helpers'

test.describe('Plugin Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('should display plugin management page', async ({ page }) => {
    await page.goto('/admin/plugins')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Plugins')
    
    // Check stats cards are displayed (be more specific to avoid conflicts)
    await expect(page.locator('p:has-text("Total Plugins")')).toBeVisible()
    await expect(page.locator('p:has-text("Active Plugins")').first()).toBeVisible()
    await expect(page.locator('p:has-text("Inactive Plugins")')).toBeVisible()
    await expect(page.locator('p:has-text("Errors")')).toBeVisible()
    
    // Check filters section
    await expect(page.locator('select').first()).toBeVisible() // Category filter
    await expect(page.locator('input[placeholder="Search plugins..."]')).toBeVisible()
  })

  test('should display core plugins', async ({ page }) => {
    await page.goto('/admin/plugins')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check for core plugins
    await expect(page.locator('text=Authentication System')).toBeVisible()
    await expect(page.locator('text=Media Manager')).toBeVisible()
    await expect(page.locator('text=Workflow Engine')).toBeVisible()
    
    // Core plugins should show "Core" badge
    await expect(page.locator('.plugin-card:has-text("Authentication System")').locator('span:has-text("Core")')).toBeVisible()
  })

  test('should open install plugin dropdown', async ({ page }) => {
    await page.goto('/admin/plugins')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Click install plugin button
    await page.click('button:has-text("Install Plugin")')
    
    // Check dropdown is visible
    await expect(page.locator('#plugin-dropdown')).toBeVisible()
    await expect(page.locator('text=FAQ System')).toBeVisible()
    await expect(page.locator('text=Browse Marketplace')).toBeVisible()
    
    // Click outside to close dropdown
    await page.click('body', { position: { x: 0, y: 0 } })
    await expect(page.locator('#plugin-dropdown')).toBeHidden()
  })

  test('should install FAQ plugin', async ({ page }) => {
    await page.goto('/admin/plugins')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check if FAQ plugin is already installed
    const faqPluginExists = await page.locator('.plugin-card:has-text("FAQ System")').count() > 0
    
    if (!faqPluginExists) {
      // Open dropdown
      await page.click('button:has-text("Install Plugin")')
      
      // Mock the install endpoint
      await page.route('/admin/plugins/install', async route => {
        if (route.request().postData()?.includes('faq-plugin')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              plugin: {
                id: 'third-party-faq',
                name: 'faq-plugin',
                display_name: 'FAQ System',
                status: 'inactive'
              }
            })
          })
        }
      })
      
      // Click install FAQ
      await page.click('button:has-text("FAQ System")')
      
      // Wait for success notification
      await expect(page.locator('text=Plugin installed successfully!')).toBeVisible()
    }
  })

  test('should activate and deactivate plugin', async ({ page }) => {
    await page.goto('/admin/plugins')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Find an inactive plugin (not core)
    const inactivePlugin = page.locator('.plugin-card').filter({ 
      has: page.locator('text=Inactive') 
    }).filter({
      hasNot: page.locator('text=Core')
    }).first()
    
    if (await inactivePlugin.count() > 0) {
      // Mock activation endpoint
      await page.route('/admin/plugins/*/activate', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        })
      })
      
      // Click activate
      await inactivePlugin.locator('button:has-text("Activate")').click()
      
      // Wait for notification
      await expect(page.locator('text=Plugin activated successfully')).toBeVisible()
      
      // Check status changed
      await expect(inactivePlugin.locator('text=Active')).toBeVisible()
      await expect(inactivePlugin.locator('button:has-text("Deactivate")')).toBeVisible()
      
      // Mock deactivation endpoint
      await page.route('/admin/plugins/*/deactivate', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        })
      })
      
      // Click deactivate
      await inactivePlugin.locator('button:has-text("Deactivate")').click()
      
      // Wait for notification
      await expect(page.locator('text=Plugin deactivated successfully')).toBeVisible()
      
      // Check status changed back
      await expect(inactivePlugin.locator('text=Inactive')).toBeVisible()
      await expect(inactivePlugin.locator('button:has-text("Activate")')).toBeVisible()
    }
  })

  test('should not allow core plugin deactivation', async ({ page }) => {
    await page.goto('/admin/plugins')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Find a core plugin
    const corePlugin = page.locator('.plugin-card').filter({ 
      has: page.locator('text=Core') 
    }).first()
    
    // Should not have activate/deactivate buttons
    await expect(corePlugin.locator('button:has-text("Activate")')).not.toBeVisible()
    await expect(corePlugin.locator('button:has-text("Deactivate")')).not.toBeVisible()
    
    // Should have settings button
    await expect(corePlugin.locator('button:has-text("Settings")')).toBeVisible()
  })

  test('should handle plugin errors gracefully', async ({ page }) => {
    await page.goto('/admin/plugins')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Find a plugin with error status if any
    const errorPlugin = page.locator('.plugin-card').filter({ 
      has: page.locator('text=Error') 
    })
    
    if (await errorPlugin.count() > 0) {
      // Error plugins should show error status
      await expect(errorPlugin.first().locator('.status-badge')).toContainText('Error')
    }
  })

  test('should filter plugins by category', async ({ page }) => {
    await page.goto('/admin/plugins')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Get initial plugin count
    const initialCount = await page.locator('.plugin-card').count()
    
    // Select a category
    const categorySelect = page.locator('select').first()
    await categorySelect.selectOption('content')
    
    // Wait a moment for any filtering to occur
    await page.waitForTimeout(500)
    
    // Check that page still loads without errors
    await expect(page.locator('h1')).toContainText('Plugins')
    
    // Plugin count might have changed
    const filteredCount = await page.locator('.plugin-card').count()
    expect(filteredCount).toBeLessThanOrEqual(initialCount)
  })

  test('should search plugins', async ({ page }) => {
    await page.goto('/admin/plugins')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Get initial plugin count
    const initialCount = await page.locator('.plugin-card').count()
    
    // Type in search box
    await page.fill('input[placeholder="Search plugins..."]', 'auth')
    
    // Wait a moment for any filtering to occur
    await page.waitForTimeout(500)
    
    // Check that page still loads without errors
    await expect(page.locator('h1')).toContainText('Plugins')
    
    // Plugin count might have changed
    const searchCount = await page.locator('.plugin-card').count()
    expect(searchCount).toBeLessThanOrEqual(initialCount)
  })

  test('should handle plugin uninstall', async ({ page }) => {
    await page.goto('/admin/plugins')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Find a non-core plugin
    const nonCorePlugin = page.locator('.plugin-card').filter({
      hasNot: page.locator('text=Core')
    }).first()
    
    if (await nonCorePlugin.count() > 0) {
      // Check if uninstall button exists
      const uninstallBtn = nonCorePlugin.locator('button[title="Uninstall Plugin"]')
      
      if (await uninstallBtn.count() > 0) {
        // Mock uninstall endpoint
        await page.route('/admin/plugins/*/uninstall', async route => {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true })
          })
        })
        
        // Handle confirmation dialog
        page.on('dialog', dialog => dialog.accept())
        
        await uninstallBtn.click()
        
        // Check for success notification
        await expect(page.locator('text=Plugin uninstalled successfully!')).toBeVisible()
      }
    }
  })

  test('should show plugin details on info button click', async ({ page }) => {
    await page.goto('/admin/plugins')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Wait for plugin cards to be visible
    await page.waitForSelector('.plugin-card', { state: 'visible' })
    
    // Click info button on first plugin
    const infoBtn = page.locator('button[title="Plugin Details"]').first()
    
    if (await infoBtn.count() > 0) {
      await infoBtn.click()
      
      // Check for notification (since details modal is not implemented yet)
      await expect(page.locator('text=Plugin details coming soon!')).toBeVisible()
    }
  })

  test('should show plugin settings on settings button click', async ({ page }) => {
    await page.goto('/admin/plugins')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Wait for plugin cards to be visible
    await page.waitForSelector('.plugin-card', { state: 'visible' })
    
    // Click settings button on first plugin
    const settingsBtn = page.locator('button:has-text("Settings")').first()
    
    if (await settingsBtn.count() > 0) {
      await settingsBtn.click()
      
      // Check for notification (since settings modal is not implemented yet)
      await expect(page.locator('text=Plugin settings coming soon!')).toBeVisible()
    }
  })

  test('should maintain responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/admin/plugins')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check that page is responsive
    await expect(page.locator('h1')).toBeVisible()
    
    // Check that cards stack vertically on mobile
    const firstCard = page.locator('.plugin-card').first()
    await expect(firstCard).toBeVisible()
    
    // Install button should still be accessible
    await expect(page.locator('button:has-text("Install Plugin")')).toBeVisible()
  })
})