import { test, expect } from '@playwright/test';

test('meta is correct', async ({ page }) => {
  await page.goto("/");

await expect(page.getByText('SonicJs')).toBeVisible();
  await expect(page).toHaveTitle('SonicJs Home');
});