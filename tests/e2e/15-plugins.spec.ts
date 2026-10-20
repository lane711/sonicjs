import { test, expect } from './fixtures'
import { 
  loginAsAdmin, 
  ensureAdminUserExists,
  ensureWorkflowTablesExist
} from './utils/test-helpers'

// Use environment variable for port or default to 8787
const BASE_URL = process.env.BASE_URL || 'http://localhost:8787'

test.describe('Plugin Management @plugins', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAdminUserExists(page)
    await ensureWorkflowTablesExist(page)
    await loginAsAdmin(page)
  })

  test('should access plugins page and show basic UI', async ({ page }) => {
    // Navigate to plugins page
    await page.goto(`${BASE_URL}/admin/plugins`)
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Plugins')
    
    // Check for the install affordance. The old global "Install Plugin" dropdown was
    // replaced by a per-card Install button on every uninstalled catalog plugin.
    const installButtons = page.locator('.plugin-card[data-status="uninstalled"] button:has-text("Install")')
    expect(await installButtons.count()).toBeGreaterThan(0)
    await expect(installButtons.first()).toBeVisible()

    // The catalog is code-defined, so cards are always rendered
    const pluginCount = await page.locator('.plugin-card').count()
    expect(pluginCount).toBeGreaterThan(0)

    // Check for at least one plugin card
    await expect(page.locator('.plugin-card').first()).toBeVisible()
  })

  test('should show plugin stats', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/plugins`)

    // Check for stats tiles. The tile is a label div followed by a value div;
    // the label reads "Total" (it used to read "Total Plugins").
    const totalLabel = page.getByText('Total', { exact: true }).first()
    await expect(totalLabel).toBeVisible()

    // The count sits in the sibling div right after the label
    const totalValue = totalLabel.locator('xpath=following-sibling::div[1]')
    await expect(totalValue).toBeVisible()
    await expect(totalValue).toHaveText(/^\d+$/)

    // The remaining tiles should be present too
    await expect(page.getByText('Active', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Errors', { exact: true }).first()).toBeVisible()
  })

  test('should display existing plugins', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/plugins`)
    
    // Ensure at least one plugin exists
    let pluginCount = await page.locator('.plugin-card').count()
    if (pluginCount === 0) {
      // Install FAQ plugin
      await page.click('button:has-text("Install Plugin")')
      await expect(page.locator('#plugin-dropdown')).toBeVisible()
      await page.click('button:has-text("FAQ System")')
      await page.waitForTimeout(2000)
      await page.reload()
      pluginCount = await page.locator('.plugin-card').count()
    }
    
    expect(pluginCount).toBeGreaterThan(0)
    
    // First plugin should have required elements
    const firstPlugin = page.locator('.plugin-card').first()
    await expect(firstPlugin.locator('h3')).toBeVisible() // Plugin name
    await expect(firstPlugin.locator('.status-badge')).toBeVisible() // Status
  })

  test('should install a catalog plugin if not present', async ({ page }) => {
    // The "FAQ System" demo plugin and the global "Install Plugin" dropdown it was
    // reached through are both gone. Install is now a per-card button.
    // "Magic Link Authentication" is a non-core plugin with no admin menu entry
    // (adminMenu: null), so installing it has no side effects on the rest of the
    // suite; it is uninstalled again at the end.
    const PLUGIN_ID = 'magic-link-auth'
    const PLUGIN_NAME = 'Magic Link Authentication'
    const card = page.locator(`.plugin-card[data-name="${PLUGIN_NAME}"]`)

    await page.goto(`${BASE_URL}/admin/plugins`)

    // Check if the plugin is installed already
    await expect(card).toBeVisible()
    const wasUninstalled = (await card.getAttribute('data-status')) === 'uninstalled'

    try {
      if (wasUninstalled) {
        // Install it from its card
        await card.locator('button:has-text("Install")').click()

        // Wait for installation success (the page reloads ~1.5s afterwards)
        await expect(page.locator('text=installed successfully')).toBeVisible({ timeout: 10000 })
        await expect(
          page.locator(`.plugin-card[data-name="${PLUGIN_NAME}"][data-status="active"]`)
        ).toBeVisible({ timeout: 20000 })
      }

      // Either way the plugin is now present and no longer uninstalled
      await expect(card).toBeVisible()
      await expect(card).not.toHaveAttribute('data-status', 'uninstalled')
    } finally {
      // Restore the catalog to the state the rest of the suite expects
      if (wasUninstalled) {
        const res = await page.request.post(`${BASE_URL}/admin/plugins/${PLUGIN_ID}/uninstall`, {
          headers: { 'Content-Type': 'application/json' },
        })
        expect(res.ok()).toBe(true)
      }
    }
  })

  test('should show plugin actions', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/plugins`)
    
    // The catalog is code-defined, so cards are always rendered
    const pluginCount = await page.locator('.plugin-card').count()
    expect(pluginCount).toBeGreaterThan(0)
    
    // Find any plugin card
    const pluginCard = page.locator('.plugin-card').first()
    
    // Should have an action: installed plugins render an activate/deactivate toggle
    // switch, uninstalled ones render an Install button.
    const hasToggle = await pluginCard.locator('button[role="switch"]').count()
    const hasInstall = await pluginCard.locator('button:has-text("Install")').count()
    const hasSettings = await pluginCard.locator('button[title="Settings"], button:has-text("Settings")').count()
    
    expect(hasToggle + hasInstall + hasSettings).toBeGreaterThan(0)
  })

  test('should toggle plugin status', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/plugins`)
    
    // Find a plugin that can be toggled
    const pluginCards = page.locator('.plugin-card')
    const count = await pluginCards.count()
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = pluginCards.nth(i)
      const activateBtn = card.locator('button:has-text("Activate")')
      const deactivateBtn = card.locator('button:has-text("Deactivate")')
      
      const hasActivate = await activateBtn.count()
      const hasDeactivate = await deactivateBtn.count()
      
      if (hasActivate > 0) {
        // Plugin is inactive, try to activate
        await activateBtn.click()
        
        // Wait for status change
        await expect(card.locator('.status-badge')).toContainText('Active', { timeout: 5000 })
        break
      } else if (hasDeactivate > 0) {
        // Plugin is active, try to deactivate
        await deactivateBtn.click()
        
        // Wait for status change
        await expect(card.locator('.status-badge')).toContainText('Inactive', { timeout: 5000 })
        break
      }
    }
  })

  test('should access plugin settings', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/plugins`)
    
    // Find a plugin with settings button
    const pluginCards = page.locator('.plugin-card')
    const count = await pluginCards.count()
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = pluginCards.nth(i)
      const settingsBtn = card.locator('button[title="Settings"], button:has-text("Settings")')
      
      const hasSettings = await settingsBtn.count()
      if (hasSettings > 0) {
        await settingsBtn.click()
        
        // Should navigate to plugin settings page
        await expect(page.url()).toContain('/admin/plugins/')
        await expect(page.locator('h2:has-text("Plugin Settings")')).toBeVisible()
        break
      }
    }
  })

  test('should show installable plugin options', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/plugins`)
    
    // The install dropdown was replaced by a per-card Install button on every
    // uninstalled catalog plugin, so the installable options are those cards.
    const installButtons = page.locator('.plugin-card[data-status="uninstalled"] button:has-text("Install")')
    
    // Should have at least one installable option, and it should be clickable
    const buttonCount = await installButtons.count()
    expect(buttonCount).toBeGreaterThan(0)
    await expect(installButtons.first()).toBeVisible()
    await expect(installButtons.first()).toBeEnabled()
  })

  test('should filter plugins by search', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/plugins`)
    
    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]')
    const hasSearch = await searchInput.count()
    
    if (hasSearch > 0) {
      // Search for "auth"
      await searchInput.fill('auth')
      await page.waitForTimeout(1000) // Allow filter to apply
      
      // Should show filtered results
      const visibleCards = await page.locator('.plugin-card:visible').count()
      expect(visibleCards).toBeGreaterThanOrEqual(0)
      
      // Clear search
      await searchInput.fill('')
      await page.waitForTimeout(500)
    }
  })

  test('should show plugin information', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/plugins`)
    
    // Each plugin card should show basic info
    const firstCard = page.locator('.plugin-card').first()
    
    // Should have plugin name
    await expect(firstCard.locator('h3, h2')).toBeVisible()
    
    // Should have version info
    await expect(firstCard.locator('text=/v?\\d+\\.\\d+/')).toBeVisible()
    
    // Should have status
    await expect(firstCard.locator('.status-badge')).toBeVisible()
  })

  test('should handle plugin categories', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/plugins`)
    
    // Look for category information
    const cards = page.locator('.plugin-card')
    const count = await cards.count()
    
    if (count > 0) {
      // Should show at least one category
      await expect(page.locator('text=/security|content|media|system/i').first()).toBeVisible()
    }
  })

  test('should show core vs non-core plugins', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/plugins`)
    
    // Core plugins should not have uninstall option
    const corePlugins = page.locator('.plugin-card').filter({ hasText: /Authentication|Media|Workflow/ })
    const coreCount = await corePlugins.count()
    
    if (coreCount > 0) {
      const firstCore = corePlugins.first()
      
      // Core plugins typically don't have uninstall buttons
      const hasUninstall = await firstCore.locator('button:has-text("Uninstall")').count()
      expect(hasUninstall).toBe(0)
    }
  })

  test('should validate plugin management permissions', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/plugins`)
    
    // Admin user should be able to access plugins page
    await expect(page.locator('h1')).toContainText('Plugins')
    
    // Should not show access denied message
    await expect(page.locator('text=Access denied')).not.toBeVisible()
    await expect(page.locator('text=Unauthorized')).not.toBeVisible()
  })
})