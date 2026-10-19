import { test, expect, type Page } from '@playwright/test'
import {
  loginAsAdmin,
  ensureAdminUserExists,
  ensureWorkflowTablesExist
} from './utils/test-helpers'

// The /admin/plugins filter UI is a checkbox group (`input[name="category"]` /
// `input[name="status"]`) plus a `#search-input` text box. Clearing every filter
// is the equivalent of the old "All Categories" / "All Status" select options.
async function clearFilters(page: Page) {
  // Index over ALL filter checkboxes, not over `:checked` — unchecking one shrinks
  // the `:checked` set and invalidates the remaining nth() locators.
  const boxes = page.locator('input[name="category"], input[name="status"]')
  const total = await boxes.count()
  for (let i = 0; i < total; i++) {
    const cb = boxes.nth(i)
    if (await cb.isChecked()) {
      await cb.uncheck()
    }
  }
  await page.fill('#search-input', '')
}

// Use environment variable for port or default to 8787
const BASE_URL = process.env.BASE_URL || 'http://localhost:8787'

test.describe('Plugin Filters and Search @plugins', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAdminUserExists(page)
    await ensureWorkflowTablesExist(page)
    await loginAsAdmin(page)
    await page.goto(`${BASE_URL}/admin/plugins`)
  })

  test('should have filter controls', async ({ page }) => {
    // Category filter: a checkbox per category
    const categoryFilters = page.locator('input[name="category"]')
    expect(await categoryFilters.count()).toBeGreaterThan(0)
    await expect(page.locator('#category-security')).toBeVisible()

    // Status filter: a checkbox per status
    const statusFilters = page.locator('input[name="status"]')
    expect(await statusFilters.count()).toBeGreaterThan(0)
    await expect(page.locator('#status-active')).toBeVisible()

    // Check for search input
    const searchInput = page.locator('#search-input')
    await expect(searchInput).toBeVisible()
  })

  test('should filter plugins by category', async ({ page }) => {
    // Get total plugin count
    const totalPlugins = await page.locator('.plugin-card').count()

    if (totalPlugins === 0) {
      console.log('No plugins to test filtering - skipping')
      return
    }

    // Select security category
    await page.check('#category-security')
    await page.waitForTimeout(500) // Allow filter to apply

    // Check that only security plugins are visible
    const visiblePlugins = await page.locator('.plugin-card:visible').count()

    // Should have fewer or equal plugins than total
    expect(visiblePlugins).toBeLessThanOrEqual(totalPlugins)

    // Verify all visible plugins have security category
    const visibleCards = await page.locator('.plugin-card:visible').all()
    for (const card of visibleCards) {
      const category = await card.getAttribute('data-category')
      expect(category).toBe('security')
    }

    // Reset filter
    await clearFilters(page)
    await page.waitForTimeout(500)

    // Should show all plugins again
    const resetCount = await page.locator('.plugin-card:visible').count()
    expect(resetCount).toBe(totalPlugins)
  })

  test('should filter plugins by status', async ({ page }) => {
    // Get total plugin count
    const totalPlugins = await page.locator('.plugin-card').count()

    if (totalPlugins === 0) {
      console.log('No plugins to test filtering - skipping')
      return
    }

    // Select active status
    await page.check('#status-active')
    await page.waitForTimeout(500) // Allow filter to apply

    // Check that only active plugins are visible
    const visiblePlugins = await page.locator('.plugin-card:visible').count()

    // Should have fewer or equal plugins than total
    expect(visiblePlugins).toBeLessThanOrEqual(totalPlugins)

    // Verify all visible plugins have active status
    const visibleCards = await page.locator('.plugin-card:visible').all()
    for (const card of visibleCards) {
      const status = await card.getAttribute('data-status')
      expect(status).toBe('active')
    }

    // Try inactive status
    await page.uncheck('#status-active')
    await page.check('#status-inactive')
    await page.waitForTimeout(500)

    const inactivePlugins = await page.locator('.plugin-card:visible').count()

    // Inactive count + active count should equal total (assuming no errors)
    // expect(visiblePlugins + inactivePlugins).toBeLessThanOrEqual(totalPlugins)

    // Reset filter
    await clearFilters(page)
    await page.waitForTimeout(500)

    // Should show all plugins again
    const resetCount = await page.locator('.plugin-card:visible').count()
    expect(resetCount).toBe(totalPlugins)
  })

  test('should search plugins by name', async ({ page }) => {
    // Get total plugin count
    const totalPlugins = await page.locator('.plugin-card').count()

    if (totalPlugins === 0) {
      console.log('No plugins to test search - skipping')
      return
    }

    // Get first plugin name
    const firstCard = page.locator('.plugin-card').first()
    const firstPluginName = await firstCard.getAttribute('data-name')

    if (!firstPluginName) {
      console.log('No plugin name found - skipping')
      return
    }

    // Search for first few characters of the name
    const searchTerm = firstPluginName.substring(0, 4).toLowerCase()
    await page.fill('#search-input', searchTerm)
    await page.waitForTimeout(500) // Allow filter to apply

    // Should show filtered results
    const visiblePlugins = await page.locator('.plugin-card:visible').count()
    expect(visiblePlugins).toBeGreaterThan(0)
    expect(visiblePlugins).toBeLessThanOrEqual(totalPlugins)

    // All visible plugins should match search term
    const visibleCards = await page.locator('.plugin-card:visible').all()
    for (const card of visibleCards) {
      const name = await card.getAttribute('data-name')
      const description = await card.getAttribute('data-description')
      const matchesName = name?.toLowerCase().includes(searchTerm) || false
      const matchesDescription = description?.toLowerCase().includes(searchTerm) || false
      expect(matchesName || matchesDescription).toBe(true)
    }

    // Clear search
    await page.fill('#search-input', '')
    await page.waitForTimeout(500)

    // Should show all plugins again
    const resetCount = await page.locator('.plugin-card:visible').count()
    expect(resetCount).toBe(totalPlugins)
  })

  test('should search plugins by description', async ({ page }) => {
    // Get total plugin count
    const totalPlugins = await page.locator('.plugin-card').count()

    if (totalPlugins === 0) {
      console.log('No plugins to test search - skipping')
      return
    }

    // Search for common word that might be in descriptions
    await page.fill('#search-input', 'management')
    await page.waitForTimeout(500) // Allow filter to apply

    // Should show some results or none
    const visiblePlugins = await page.locator('.plugin-card:visible').count()
    expect(visiblePlugins).toBeGreaterThanOrEqual(0)
    expect(visiblePlugins).toBeLessThanOrEqual(totalPlugins)

    // Clear search
    await page.fill('#search-input', '')
    await page.waitForTimeout(500)
  })

  test('should combine category and status filters', async ({ page }) => {
    // Get total plugin count
    const totalPlugins = await page.locator('.plugin-card').count()

    if (totalPlugins === 0) {
      console.log('No plugins to test filtering - skipping')
      return
    }

    // Select security category AND active status
    await page.check('#category-security')
    await page.check('#status-active')
    await page.waitForTimeout(500) // Allow filter to apply

    // Should show filtered results
    const visiblePlugins = await page.locator('.plugin-card:visible').count()
    expect(visiblePlugins).toBeLessThanOrEqual(totalPlugins)

    // Verify all visible plugins match both filters
    const visibleCards = await page.locator('.plugin-card:visible').all()
    for (const card of visibleCards) {
      const category = await card.getAttribute('data-category')
      const status = await card.getAttribute('data-status')
      expect(category).toBe('security')
      expect(status).toBe('active')
    }

    // Reset filters
    await clearFilters(page)
    await page.waitForTimeout(500)
  })

  test('should combine all three filters', async ({ page }) => {
    // Get total plugin count
    const totalPlugins = await page.locator('.plugin-card').count()

    if (totalPlugins === 0) {
      console.log('No plugins to test filtering - skipping')
      return
    }

    // Apply all three filters
    await page.check('#category-security')
    await page.check('#status-active')
    await page.fill('#search-input', 'auth')
    await page.waitForTimeout(500) // Allow filter to apply

    // Should show highly filtered results (possibly zero)
    const visiblePlugins = await page.locator('.plugin-card:visible').count()
    expect(visiblePlugins).toBeGreaterThanOrEqual(0)
    expect(visiblePlugins).toBeLessThanOrEqual(totalPlugins)

    // If any plugins visible, verify they match all filters
    if (visiblePlugins > 0) {
      const visibleCards = await page.locator('.plugin-card:visible').all()
      for (const card of visibleCards) {
        const category = await card.getAttribute('data-category')
        const status = await card.getAttribute('data-status')
        const name = await card.getAttribute('data-name')
        const description = await card.getAttribute('data-description')

        expect(category).toBe('security')
        expect(status).toBe('active')

        const matchesSearch =
          name?.toLowerCase().includes('auth') ||
          description?.toLowerCase().includes('auth')
        expect(matchesSearch).toBe(true)
      }
    }

    // Reset all filters
    await clearFilters(page)
    await page.waitForTimeout(500)
  })

  test('should show no results message when no plugins match', async ({ page }) => {
    // Get total plugin count
    const totalPlugins = await page.locator('.plugin-card').count()

    if (totalPlugins === 0) {
      console.log('No plugins to test - skipping')
      return
    }

    // Search for something that definitely won't match
    await page.fill('#search-input', 'xyzabc123nonexistent')
    await page.waitForTimeout(500) // Allow filter to apply

    // Should show no plugins
    const visiblePlugins = await page.locator('.plugin-card:visible').count()
    expect(visiblePlugins).toBe(0)

    // Should show "no results" message
    const noResultsMsg = page.locator('#no-results-message')
    await expect(noResultsMsg).toBeVisible()
    await expect(noResultsMsg).toContainText('No plugins found')

    // Clear search
    await page.fill('#search-input', '')
    await page.waitForTimeout(500)

    // No results message should be hidden
    await expect(noResultsMsg).not.toBeVisible()

    // Plugins should be visible again
    const resetCount = await page.locator('.plugin-card:visible').count()
    expect(resetCount).toBe(totalPlugins)
  })

  test('should maintain filter state when toggling plugin status', async ({ page }) => {
    // Apply a filter first. "utilities" contains the Hello World demo plugin, which
    // is safe to toggle (it only contributes a demo page).
    await page.check('#category-utilities')
    await page.waitForTimeout(500)

    const initialCount = await page.locator('.plugin-card:visible').count()
    expect(initialCount).toBeGreaterThan(0)

    // Toggle an installed plugin in the filtered set. Installed cards expose a
    // switch (role="switch"); uninstalled ones only expose an Install button.
    const toggleCard = page.locator('.plugin-card[data-name="Hello World"]')
    await expect(toggleCard).toBeVisible()
    const toggle = toggleCard.locator('button[role="switch"]')
    const wasChecked = (await toggle.getAttribute('aria-checked')) ?? 'true'
    const flipped = wasChecked === 'true' ? 'false' : 'true'

    try {
      await toggle.click()
      await expect(toggle).toHaveAttribute('aria-checked', flipped, { timeout: 10000 })

      // Verify category filter is still applied after the toggle
      await expect(page.locator('#category-utilities')).toBeChecked()
      expect(await page.locator('.plugin-card:visible').count()).toBe(initialCount)
    } finally {
      // Restore the plugin to its original state. This goes through the API rather
      // than a second toggle click because togglePlugin() rebinds button.onclick
      // WITHOUT event.stopPropagation(), so the second click bubbles to the card's
      // openPluginSettings() handler and navigates away (product bug — see report).
      const restoreAction = wasChecked === 'true' ? 'activate' : 'deactivate'
      const res = await page.request.post(`/admin/plugins/hello-world/${restoreAction}`, {
        headers: { 'Content-Type': 'application/json' },
      })
      expect(res.ok()).toBe(true)
    }

    // Reset filter
    await clearFilters(page)
    await page.waitForTimeout(500)
  })

  test('should have correct category options', async ({ page }) => {
    // Each category is a labelled checkbox; the label carries the display name
    // plus a count, e.g. "Security (7)".
    const labels = await page.locator('aside label[for^="category-"]').allTextContents()
    const names = labels.map((l) => l.replace(/\s*\(\d+\)\s*$/, '').trim())

    expect(names).toContain('Content Management')
    expect(names).toContain('Media')
    expect(names).toContain('SEO & Analytics')
    expect(names).toContain('Security')
    expect(names).toContain('Utilities')
    expect(names).toContain('System')
    expect(names).toContain('Development')

    // "All Categories" is now expressed as "no category checked" — every card shows.
    const total = await page.locator('.plugin-card').count()
    expect(await page.locator('input[name="category"]:checked').count()).toBe(0)
    expect(await page.locator('.plugin-card:visible').count()).toBe(total)
  })

  test('should have correct status options', async ({ page }) => {
    // Each status is a labelled checkbox; the label carries the status name plus a count.
    const labels = await page.locator('aside label[for^="status-"]').allTextContents()
    const names = labels.map((l) => l.replace(/\s*\(\d+\)\s*$/, '').trim())

    expect(names).toContain('Active')
    expect(names).toContain('Inactive')
    expect(names).toContain('Error')
    expect(names).toContain('Available to Install')

    // "All Status" is now expressed as "no status checked" — every card shows.
    const total = await page.locator('.plugin-card').count()
    expect(await page.locator('input[name="status"]:checked').count()).toBe(0)
    expect(await page.locator('.plugin-card:visible').count()).toBe(total)
  })
})
