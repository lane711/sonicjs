import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './utils/test-helpers'

test.describe('Content Blocks (Code-Based Collections)', () => {
  test('should allow adding block content in code-based collections', async ({ page }) => {
    await loginAsAdmin(page)

    await page.goto('/admin/content/new')

    const pageBlocksLink = page.locator('a[href^="/admin/content/new?collection="]').filter({ hasText: 'Page Blocks' })
    await expect(pageBlocksLink).toBeVisible()
    await pageBlocksLink.click()

    await page.waitForLoadState('networkidle')
    await expect(page.locator('form#content-form')).toBeVisible()

    await page.fill('input[name="title"]', 'Blocks Page')
    await page.fill('input[name="slug"]', 'blocks-page')

    const blocksField = page.locator('[data-field-name="body"]')
    await expect(blocksField).toBeVisible()

    await blocksField.locator('[data-role="block-type-select"]').selectOption('text')
    await blocksField.locator('[data-action="add-block"]').click()

    const firstBlock = blocksField.locator('.blocks-item').first()
    await firstBlock.locator('[data-block-field="heading"] input').fill('Hello')
    await firstBlock.locator('[data-block-field="body"] textarea').fill('First block body')

    await blocksField.locator('[data-role="block-type-select"]').selectOption('callToAction')
    await blocksField.locator('[data-action="add-block"]').click()

    const secondBlock = blocksField.locator('.blocks-item').nth(1)
    await secondBlock.locator('[data-block-field="title"] input').fill('Get started')
    await secondBlock.locator('[data-block-field="buttonLabel"] input').fill('Sign up')
    await secondBlock.locator('[data-block-field="buttonUrl"] input').fill('https://example.com')

    const dragHandle = secondBlock.locator('[data-action="drag-handle"]')
    await dragHandle.dispatchEvent('pointerdown')
    await secondBlock.dragTo(firstBlock)

    const hiddenValue = await blocksField.locator('input[type="hidden"][name="body"]').inputValue()
    const parsed = JSON.parse(hiddenValue)
    expect(parsed[0].blockType).toBe('callToAction')
    expect(parsed[1].blockType).toBe('text')

    await page.click('button[type="submit"][value="save"]')
    await page.waitForURL(/\/admin\/content\?collection=/)
    await expect(page.locator('table')).toContainText('Blocks Page')
    await expect(page.locator('table')).toContainText('blocks-page')
  })
})
