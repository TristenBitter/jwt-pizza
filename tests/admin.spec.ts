import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';

/* =============================================================================
   ADMIN DASHBOARD TESTS (List / Filter / Paginate / Delete)
============================================================================= */

// Helper to log in as an admin account (assuming you have one)
async function loginAsAdmin(page: Page) {
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('admin@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
}

test('adminDashboard: list, filter, paginate, and delete user', async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole('link', { name: /Admin Dashboard/i }).click();

  // Basic list should appear
  await expect(page.getByRole('heading', { name: /Users/i })).toBeVisible();

  // Filter by name
  await page.getByPlaceholder('Filter by name').fill('Kai');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('table')).toContainText(/Kai/i);

  // Test pagination buttons
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('table')).toBeVisible();

  // Delete the first listed user if exists (skip self)
  const rows = page.getByRole('row');
  const rowCount = await rows.count();
  if (rowCount > 1) {
    await rows.nth(1).getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByRole('alert')).toContainText(/deleted/i);
  }
});