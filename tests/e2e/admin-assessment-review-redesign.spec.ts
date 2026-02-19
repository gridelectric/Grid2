import { expect, test, type Page } from '@playwright/test';

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

function hasCredentials(email?: string, password?: string): email is string {
  return Boolean(email && password);
}

async function loginAsAdmin(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /^sign in$/i }).click();

  await page.waitForURL(
    (url) =>
      url.pathname.startsWith('/admin')
      || url.pathname === '/set-password'
      || url.pathname === '/login',
    { timeout: 30_000 },
  );

  const pathname = new URL(page.url()).pathname;
  if (pathname === '/set-password') {
    throw new Error('E2E admin account is flagged for password reset.');
  }

  if (pathname === '/login') {
    throw new Error('E2E admin login failed. Verify E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.');
  }
}

test.describe('assessment review redesign', () => {
  test('assessment review redesign baseline visuals and account location', async ({ page }) => {
    test.skip(
      !hasCredentials(adminEmail, adminPassword),
      'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run assessment redesign checks.',
    );

    await loginAsAdmin(page, adminEmail!, adminPassword!);
    await page.goto('/admin/assessment-review');

    await expect(page.getByText('Filter Rail')).toBeVisible();
    await expect(page.getByText('Queue Lane')).toBeVisible();
    await expect(page.getByText('Context Dock')).toBeVisible();
    await expect(page.getByText('Account').first()).toBeVisible();
  });

  test('rework flow requires notes before submit', async ({ page }) => {
    test.skip(
      !hasCredentials(adminEmail, adminPassword),
      'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run assessment redesign checks.',
    );

    await loginAsAdmin(page, adminEmail!, adminPassword!);
    await page.goto('/admin/assessment-review');

    const reworkButton = page.getByRole('button', { name: /^Rework$/ }).first();
    if ((await reworkButton.count()) === 0) {
      test.skip(true, 'No pending assessments available for rework validation.');
    }

    await reworkButton.click();
    await expect(page.getByRole('heading', { name: 'Decision Review' })).toBeVisible();
    await page.getByRole('button', { name: /^Confirm$/ }).click();
    await expect(page.getByText('Rework notes are required.')).toBeVisible();
  });
});
