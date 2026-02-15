import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const contractorEmail = process.env.E2E_CONTRACTOR_EMAIL;
const contractorPassword = process.env.E2E_CONTRACTOR_PASSWORD;

function hasCredentials(email?: string, password?: string): email is string {
  return Boolean(email && password);
}

async function loginAndVerifyLanding(options: {
  email: string;
  password: string;
  expectedLanding: RegExp;
  page: Page;
  roleLabel: 'admin' | 'contractor';
}) {
  const { email, password, expectedLanding, page, roleLabel } = options;

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /^sign in$/i }).click();

  await page.waitForURL(
    (url) =>
      url.pathname.startsWith('/admin')
      || url.pathname.startsWith('/contractor')
      || url.pathname === '/set-password'
      || url.pathname === '/login',
    { timeout: 30_000 },
  );

  const pathname = new URL(page.url()).pathname;

  if (pathname === '/set-password') {
    throw new Error(`E2E ${roleLabel} account is flagged for password reset. Update credentials and rerun.`);
  }

  if (pathname === '/login') {
    throw new Error(`E2E ${roleLabel} login failed. Verify E2E credential env vars.`);
  }

  await expect(page).toHaveURL(expectedLanding);
  await expect(page.getByRole('button', { name: /open operations summary/i })).toBeVisible();
}

test.describe('authenticated portal flow smoke', () => {
  test.beforeEach(async ({ browserName }) => {
    test.skip(browserName !== 'chromium', 'Authenticated flow smoke runs in chromium only.');
  });

  test('admin flow: login -> dashboard -> storms -> tickets', async ({ page }) => {
    test.skip(
      !hasCredentials(adminEmail, adminPassword),
      'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run authenticated admin flow.',
    );

    await loginAndVerifyLanding({
      email: adminEmail!,
      password: adminPassword!,
      expectedLanding: /\/admin\/dashboard$/,
      page,
      roleLabel: 'admin',
    });

    await page.goto('/admin/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    await page.goto('/admin/storms');
    await expect(page.getByRole('heading', { name: 'Storm Events' })).toBeVisible();

    await page.goto('/tickets');
    await expect(page.getByRole('heading', { name: 'Ticket Management' })).toBeVisible();
  });

  test('contractor flow: login -> time -> tickets -> expenses', async ({ page }) => {
    test.skip(
      !hasCredentials(contractorEmail, contractorPassword),
      'Set E2E_CONTRACTOR_EMAIL and E2E_CONTRACTOR_PASSWORD to run authenticated contractor flow.',
    );

    await loginAndVerifyLanding({
      email: contractorEmail!,
      password: contractorPassword!,
      expectedLanding: /\/contractor\/time$/,
      page,
      roleLabel: 'contractor',
    });

    await page.goto('/contractor/time');
    await expect(page.getByRole('heading', { name: 'Time Tracking' })).toBeVisible();

    await page.goto('/tickets');
    await expect(page.getByRole('heading', { name: 'My Tickets' })).toBeVisible();

    await page.goto('/contractor/expenses');
    await expect(page.getByRole('heading', { name: 'Expenses' })).toBeVisible();
  });
});
