import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './utils/test-helpers'

test.describe('Database Table Viewer — Search & JSON Browser @database', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('table viewer loads and shows search bar', async ({ page }) => {
    await page.goto('/admin/database-tools/tables/documents')
    await expect(page.locator('#searchInput')).toBeVisible()
    await expect(page.locator('#searchInput')).toHaveAttribute('placeholder', /search/i)
  })

  test('search filters rows via URL param', async ({ page }) => {
    await page.goto('/admin/database-tools/tables/documents?search=blog')
    // Shows filtered badge
    await expect(page.locator('text=blog').first()).toBeVisible()
    // Search input pre-filled
    const input = page.locator('#searchInput')
    await expect(input).toHaveValue('blog')
  })

  test('pressing Enter in search navigates with search param', async ({ page }) => {
    await page.goto('/admin/database-tools/tables/documents')
    await page.locator('#searchInput').fill('test')
    await page.locator('#searchInput').press('Enter')
    await expect(page).toHaveURL(/search=test/)
  })

  test('Search button navigates with search param', async ({ page }) => {
    await page.goto('/admin/database-tools/tables/documents')
    await page.locator('#searchInput').fill('hello')
    // Exact match: JSON cells can render buttons whose accessible name contains "Search".
    await page.getByRole('button', { name: 'Search', exact: true }).click()
    await expect(page).toHaveURL(/search=hello/)
  })

  test('clear search button removes search param', async ({ page }) => {
    await page.goto('/admin/database-tools/tables/documents?search=blog')
    const clearBtn = page.locator('button[title="Clear search"]')
    await expect(clearBtn).toBeVisible()
    await clearBtn.click()
    await expect(page).not.toHaveURL(/search=/)
  })

  test('empty search shows all rows without filter', async ({ page }) => {
    await page.goto('/admin/database-tools/tables/documents')
    const input = page.locator('#searchInput')
    await expect(input).toHaveValue('')
    // No "Filtered:" badge visible
    await expect(page.locator('text=Filtered:')).not.toBeVisible()
  })

  test('JSON modal closes on backdrop click', async ({ page }) => {
    await page.goto('/admin/database-tools/tables/documents')
    const jsonBtn = page.locator('button.text-indigo-600, button.text-indigo-400').first()
    if (await jsonBtn.count() === 0) { test.skip(); return }
    await jsonBtn.click()
    await expect(page.locator('#jsonModal')).not.toHaveClass(/hidden/)
    // Click backdrop (outside modal panel)
    await page.mouse.click(10, 10)
    await expect(page.locator('#jsonModal')).toHaveClass(/hidden/)
  })

  test('JSON modal closes on Escape key', async ({ page }) => {
    await page.goto('/admin/database-tools/tables/documents')
    const jsonBtn = page.locator('button.text-indigo-600, button.text-indigo-400').first()
    if (await jsonBtn.count() === 0) { test.skip(); return }
    await jsonBtn.click()
    await page.keyboard.press('Escape')
    await expect(page.locator('#jsonModal')).toHaveClass(/hidden/)
  })

  test('search preserved across page navigation', async ({ page }) => {
    await page.goto('/admin/database-tools/tables/documents?search=doc&pageSize=5')
    // The `sm:hidden` Previous/Next pair is invisible at desktop width; the visible control is the
    // desktop pagination nav, whose Next button is labelled by an sr-only span.
    const pagination = page.locator('nav[aria-label="Pagination"]')
    if (await pagination.count() > 0) {
      const nextBtn = pagination.getByRole('button', { name: 'Next' })
      await expect(nextBtn).toBeEnabled()
      await nextBtn.click()
      await expect(page).toHaveURL(/search=doc/)
      await expect(page).toHaveURL(/page=2/)
    }
  })

  test('search preserved when changing page size', async ({ page }) => {
    await page.goto('/admin/database-tools/tables/documents?search=doc')
    await page.locator('#pageSize').selectOption('50')
    await expect(page).toHaveURL(/search=doc/)
  })

  test('search preserved when sorting columns', async ({ page }) => {
    await page.goto('/admin/database-tools/tables/documents?search=doc')
    const firstHeader = page.locator('thead th').first()
    await firstHeader.click()
    await expect(page).toHaveURL(/search=doc/)
  })
})
