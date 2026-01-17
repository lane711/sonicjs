import { expect, test } from '@playwright/test'
import { loginAsAdmin } from './utils/test-helpers'

test.describe('Reference Fields', () => {
  test('should allow selecting referenced content', async ({ page }) => {
    await loginAsAdmin(page)

    const timestamp = Date.now()
    const targetTitle = `Reference Target ${timestamp}`
    const targetSlug = `reference-target-${timestamp}`

    await page.goto('/admin/content/new')
    const pageBlocksLink = page
      .locator('a[href^="/admin/content/new?collection="]')
      .filter({ hasText: 'Page Blocks' })
      .first()
    await expect(pageBlocksLink).toBeVisible()
    await pageBlocksLink.click()
    await page.waitForLoadState('networkidle')

    await page.fill('input[name="title"]', targetTitle)
    await page.fill('input[name="slug"]', targetSlug)
    await page.selectOption('select[name="status"]', 'published')
    await page.click('button[type="submit"][value="save"]')
    await page.waitForURL(/\/admin\/content\?collection=/)

    const refTitle = `Reference Host ${timestamp}`
    const refSlug = `reference-host-${timestamp}`

    await page.goto('/admin/content/new')
    const pageBlocksLink2 = page
      .locator('a[href^="/admin/content/new?collection="]')
      .filter({ hasText: 'Page Blocks' })
      .first()
    await expect(pageBlocksLink2).toBeVisible()
    await pageBlocksLink2.click()
    await page.waitForLoadState('networkidle')

    await page.fill('input[name="title"]', refTitle)
    await page.fill('input[name="slug"]', refSlug)

    const referenceField = page.locator('[data-reference-field][data-field-name="featuredPage"]')
    await expect(referenceField).toBeVisible()
    await referenceField.getByRole('button', { name: 'Select reference' }).click()

    const searchInput = page.locator('#reference-search-input')
    await expect(searchInput).toBeVisible()
    await searchInput.fill(targetTitle)

    const optionButton = page.locator('#reference-results button').filter({ hasText: targetTitle }).first()
    await expect(optionButton).toBeVisible()
    await optionButton.click()

    await expect(referenceField.locator('[data-reference-display]')).toContainText(targetTitle)

    await page.click('button[type="submit"][value="save"]')
    await page.waitForURL(/\/admin\/content\?collection=/)
  })
})
