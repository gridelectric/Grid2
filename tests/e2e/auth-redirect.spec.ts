import { expect, test } from '@playwright/test';

test('root route redirects to login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
});

test('admin portal route requires authentication', async ({ page }) => {
  await page.goto('/admin/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});

test('legacy onboarding routes redirect to login with removal reason', async ({ page }) => {
  await page.goto('/welcome');
  await expect(page).toHaveURL(/\/login\?reason=onboarding-removed$/);
});

test('legacy subcontractor route is not directly accessible when unauthenticated', async ({ page }) => {
  await page.goto('/subcontractor/time');
  await expect(page).toHaveURL(/\/login$/);
});
