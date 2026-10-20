import { expect, test, type Page } from './fixtures'
import { ensureAdminUserExists, loginAsAdmin } from './utils/test-helpers'

async function resolvePageBlocksCollectionKey(page: Page): Promise<string> {
  await page.goto('/admin/content/new')
  await page.waitForLoadState('networkidle', { timeout: 15000 })

  const e2eTestLink = page
    .locator('a[href^="/admin/content/new?collection="]')
    .filter({ hasText: 'E2E Test' })
    .first()

  await expect(e2eTestLink).toBeVisible({ timeout: 10000 })
  const href = await e2eTestLink.getAttribute('href')
  const match = href?.match(/[?&]collection=([^&]+)/)
  return match?.[1] || 'e2e_test'
}

async function gotoPageBlocksNewForm(page: Page) {
  const collectionKey = await resolvePageBlocksCollectionKey(page)
  await page.goto('/admin/content/new?collection=' + encodeURIComponent(collectionKey))
  await page.waitForLoadState('networkidle', { timeout: 15000 })
  const titleField = page.locator('input[name="title"]').first()
  if (await titleField.count()) {
    await expect(titleField).toBeVisible({ timeout: 10000 })
    return collectionKey
  }

  const e2eTestLink = page
    .locator('a[href^="/admin/content/new?collection="]')
    .filter({ hasText: 'E2E Test' })
    .first()
  if (await e2eTestLink.count()) {
    await e2eTestLink.click()
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    await expect(page.locator('input[name="title"]').first()).toBeVisible({ timeout: 10000 })
    return collectionKey
  }

  await expect(page.locator('form#content-form')).toBeVisible({ timeout: 10000 })
  return collectionKey
}

async function saveAndCaptureEditUrl(page: Page): Promise<string> {
  await page.click('button[name="action"][value="save"]')
  // A new-document save answers the HTMX request with `HX-Redirect: /admin/content/<id>/edit`,
  // and htmx sets location *after* that response — networkidle can therefore resolve while the
  // URL is still /admin/content/new. Wait for the edit URL instead of racing it.
  await page
    .waitForURL(/\/admin\/content\/[^/]+\/edit/, { timeout: 15000 })
    // An edit-page save is a PUT that stays put, so no navigation is expected there.
    .catch(() => {})
  await page.waitForLoadState('networkidle', { timeout: 15000 })
  const currentUrl = page.url()
  if (/\/admin\/content\/[^/]+\/edit/.test(currentUrl)) {
    return currentUrl
  }

  // Fallback for environments that may not auto-redirect after save.
  const editLink = page.locator('a[href*="/admin/content/"][href*="/edit"]').first()
  await expect(editLink).toBeVisible({ timeout: 10000 })
  const href = await editLink.getAttribute('href')
  if (!href) {
    throw new Error('Could not resolve edit URL after saving content')
  }
  await page.goto(href)
  await page.waitForLoadState('networkidle', { timeout: 15000 })
  await expect(page.locator('form#content-form')).toBeVisible()
  return page.url()
}

test.describe('Collapsible State Persistence @content', () => {
  test.beforeEach(async ({ page }) => {
    await ensureAdminUserExists(page)
    await loginAsAdmin(page)
  })

  // Structured arrays and blocks each ship an inert <template> holding a prototype item, and
  // Playwright's selector engine looks inside template content. Every item/control locator below
  // is therefore anchored with `:scope >` (or `.first()` inside an item) so it cannot match the
  // prototype — an unanchored `.structured-array-item` counts the template copy too.
  test('should persist object/repeater/block collapsed state per document in session', async ({
    page,
  }) => {
    const docATitle = `Test Collapse State A ${Date.now()}`
    const docASlug = `test-collapse-state-a-${Date.now()}`
    const docBTitle = `Test Collapse State B ${Date.now()}`
    const docBSlug = `test-collapse-state-b-${Date.now()}`

    const collectionKey = await resolvePageBlocksCollectionKey(page)

    // Create document A with blocks and repeater items.
    await page.goto('/admin/content/new?collection=' + encodeURIComponent(collectionKey))
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    const formTitle = page.locator('input[name="title"]').first()
    if (!(await formTitle.count())) {
      await gotoPageBlocksNewForm(page)
    }
    await page.fill('input[name="title"]', docATitle)
    await page.fill('input[name="slug"]', docASlug)

    const teamGroup = page.locator('[data-structured-object][data-field-name="team"]').first()
    const teamContent = teamGroup.locator(':scope > .field-group-content')
    await expect(teamContent).toHaveClass(/hidden/)
    await teamGroup.locator(':scope > .field-group-header').click()
    await expect(teamContent).not.toHaveClass(/hidden/)

    const membersField = page.locator('[data-structured-array][data-field-name="team__members"]').first()
    await expect(membersField).toBeVisible()
    const addMember = membersField.locator(':scope > div > [data-action="add-item"]')
    await addMember.click()
    await addMember.click()

    const memberItems = membersField.locator(
      ':scope > [data-structured-array-list] > .structured-array-item'
    )
    await expect(memberItems).toHaveCount(2)
    const memberFields = (index: number) =>
      memberItems.nth(index).locator('[data-array-item-fields]').first()
    await expect(memberFields(0)).not.toHaveClass(/hidden/)
    await expect(memberFields(1)).not.toHaveClass(/hidden/)
    await memberFields(0).locator('input[type="text"]').first().fill('Member One')
    await memberFields(1).locator('input[type="text"]').first().fill('Member Two')
    await memberItems.nth(0).locator('[data-action="toggle-item"]').first().click()
    await expect(memberFields(0)).toHaveClass(/hidden/)
    await expect(memberFields(1)).not.toHaveClass(/hidden/)

    const blocksField = page.locator('[data-blocks-discriminator][data-field-name="body"]')
    await expect(blocksField).toBeVisible()
    const blockTypeSelect = blocksField.locator('[data-role="block-type-select"]').first()
    const addBlock = blocksField.locator('[data-action="add-block"]').first()
    await blockTypeSelect.selectOption('hero')
    await addBlock.click()
    await blockTypeSelect.selectOption('text')
    await addBlock.click()

    const blockItems = blocksField.locator(':scope > [data-blocks-list] > .blocks-item')
    const blockContent = (index: number) =>
      blockItems.nth(index).locator('[data-block-content]').first()
    await expect(blockItems).toHaveCount(2)
    await expect(blockContent(0)).not.toHaveClass(/hidden/)
    await expect(blockContent(1)).not.toHaveClass(/hidden/)
    await blockContent(0).locator('input[type="text"]').first().fill('Hero Heading')
    await blockContent(1).locator('input[type="text"]').first().fill('Text Heading')
    await blockContent(1).locator('textarea').first().fill('Text body content')

    const docAEditUrl = await saveAndCaptureEditUrl(page)

    // Set UI collapse state on the saved edit page (same document path/key).
    await page.goto(docAEditUrl)
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    await expect(page.locator('form#content-form')).toBeVisible()

    const editTeamGroup = page.locator('[data-structured-object][data-field-name="team"]').first()
    const editTeamContent = editTeamGroup.locator(':scope > .field-group-content')
    await expect(editTeamContent).toHaveClass(/hidden/)
    await editTeamGroup.locator(':scope > .field-group-header').click()
    await expect(editTeamContent).not.toHaveClass(/hidden/)

    const editMembersField = page
      .locator('[data-structured-array][data-field-name="team__members"]')
      .first()
    const editMemberItems = editMembersField.locator(
      ':scope > [data-structured-array-list] > .structured-array-item'
    )
    const editMemberFields = (index: number) =>
      editMemberItems.nth(index).locator('[data-array-item-fields]').first()
    await expect(editMemberItems).toHaveCount(2)
    await expect(editMemberFields(0)).toHaveClass(/hidden/)
    await expect(editMemberFields(1)).toHaveClass(/hidden/)
    await editMemberItems.nth(1).locator('[data-action="toggle-item"]').first().click()
    await expect(editMemberFields(1)).not.toHaveClass(/hidden/)

    const editBlocksField = page.locator('[data-blocks-discriminator][data-field-name="body"]')
    const editBlockItems = editBlocksField.locator(':scope > [data-blocks-list] > .blocks-item')
    const editBlockContent = (index: number) =>
      editBlockItems.nth(index).locator('[data-block-content]').first()
    await expect(editBlockItems).toHaveCount(2)
    await expect(editBlockContent(0)).toHaveClass(/hidden/)
    await expect(editBlockContent(1)).toHaveClass(/hidden/)
    await editBlockItems.nth(1).locator('[data-action="toggle-block"]').first().click()
    await expect(editBlockContent(1)).not.toHaveClass(/hidden/)
    await expect(editBlockContent(0)).toHaveClass(/hidden/)
    await expect(editBlockContent(1)).not.toHaveClass(/hidden/)

    // Create document B without toggling grouped fields so defaults are used.
    await page.goto('/admin/content/new?collection=' + encodeURIComponent(collectionKey))
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    const formTitleB = page.locator('input[name="title"]').first()
    if (!(await formTitleB.count())) {
      await gotoPageBlocksNewForm(page)
    }
    await page.fill('input[name="title"]', docBTitle)
    await page.fill('input[name="slug"]', docBSlug)
    const docBEditUrl = await saveAndCaptureEditUrl(page)

    // Return to document A and verify state restoration.
    await page.goto(docAEditUrl)
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    await expect(page.locator('form#content-form')).toBeVisible()
    const restoredTeamGroup = page
      .locator('[data-structured-object][data-field-name="team"]')
      .first()
    const restoredTeamContent = restoredTeamGroup.locator(':scope > .field-group-content')
    await expect(restoredTeamContent).not.toHaveClass(/hidden/)

    const restoredMembers = page.locator(
      '[data-structured-array][data-field-name="team__members"] > [data-structured-array-list] > .structured-array-item'
    )
    const restoredMemberFields = (index: number) =>
      restoredMembers.nth(index).locator('[data-array-item-fields]').first()
    await expect(restoredMembers).toHaveCount(2)
    await expect(restoredMemberFields(0)).toHaveClass(/hidden/)
    await expect(restoredMemberFields(1)).not.toHaveClass(/hidden/)

    const restoredBlocks = page.locator(
      '[data-blocks-discriminator][data-field-name="body"] > [data-blocks-list] > .blocks-item'
    )
    const restoredBlockContent = (index: number) =>
      restoredBlocks.nth(index).locator('[data-block-content]').first()
    await expect(restoredBlocks).toHaveCount(2)
    await expect(restoredBlockContent(0)).toHaveClass(/hidden/)
    await expect(restoredBlockContent(1)).not.toHaveClass(/hidden/)

    // Reorder should keep each item's expanded/collapsed state.
    await restoredMembers.nth(0).locator('[data-action="move-down"]').first().click()
    await expect(restoredMemberFields(0)).not.toHaveClass(/hidden/)
    await expect(restoredMemberFields(1)).toHaveClass(/hidden/)

    await restoredBlocks.nth(0).locator('[data-action="move-down"]').first().click()
    await expect(restoredBlockContent(0)).not.toHaveClass(/hidden/)
    await expect(restoredBlockContent(1)).toHaveClass(/hidden/)

    // Open different document and confirm defaults still apply there.
    await page.goto(docBEditUrl)
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    await expect(page.locator('form#content-form')).toBeVisible()
    const docBTeamGroup = page
      .locator('[data-structured-object][data-field-name="team"]')
      .first()
    await expect(docBTeamGroup.locator(':scope > .field-group-content')).toHaveClass(/hidden/)
  })
})
