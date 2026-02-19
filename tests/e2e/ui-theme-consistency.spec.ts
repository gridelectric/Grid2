import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { ADMIN_THEME_ROUTES } from './theme-routes';

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

function hasCredentials(email?: string, password?: string): email is string {
  return Boolean(email && password);
}

async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

  await page.getByLabel('Email').fill(adminEmail!);
  await page.getByLabel('Password').fill(adminPassword!);
  await page.getByRole('button', { name: /^sign in$/i }).click();

  await page.waitForURL(
    (url) => url.pathname.startsWith('/admin') || url.pathname === '/set-password' || url.pathname === '/login',
    { timeout: 30_000 },
  );
  await expect(page).toHaveURL(/\/admin\//);
}

test.describe('admin storm theme consistency', () => {
  test.beforeEach(async ({ browserName }) => {
    test.skip(browserName !== 'chromium', 'Theme consistency checks run in chromium only.');
  });

  test('@admin-theme admin routes preserve storm card theme and contrast controls', async ({ page }) => {
    test.skip(
      !hasCredentials(adminEmail, adminPassword),
      'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run admin theme checks.',
    );

    await loginAsAdmin(page);

    for (const route of ADMIN_THEME_ROUTES) {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');

      await expect(page.locator('.storm-card, .storm-surface').first()).toBeVisible();

      if (route.requiresContrastButton) {
        await expect(page.locator('button.storm-contrast-button').first()).toBeVisible();
      }

      if (route.requiresContrastField) {
        await expect(page.locator('.storm-contrast-field').first()).toBeVisible();
      }
    }
  });
});
