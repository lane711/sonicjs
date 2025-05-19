import { test, expect } from '@playwright/test';

export const adminCredentials = {
  email: "demo@demo.com",
  password: "sonicjs!",
};

test('meta is correct', async ({ page }) => {
  await page.goto("/");

await expect(page.getByText('SonicJs')).toBeVisible();
  await expect(page).toHaveTitle('SonicJs Home');
});