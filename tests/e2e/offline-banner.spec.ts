import { expect, test } from '@playwright/test';

test('@offline shows offline queue banner when connectivity drops', async ({ context, page }) => {
  await page.goto('/login');
  await context.setOffline(true);

  await expect(page.getByRole('status')).toContainText(
    'You are offline. Changes will be queued and synced when connection is restored.',
  );

  await context.setOffline(false);
});
