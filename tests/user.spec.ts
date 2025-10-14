import { test, expect } from 'playwright-test-coverage';

/* ------------------------- Helper function for random emails ------------------------- */
function randomEmail(prefix = 'user') {
  return `${prefix}${Math.floor(Math.random() * 100000)}@jwt.com`;
}

/* =============================================================================
   UPDATE USER TESTS (Diner Dashboard)
============================================================================= */

test('updateUser: can register and reach diner dashboard', async ({ page }) => {
  const email = randomEmail();
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: /pd/i }).click();
  await expect(page.getByRole('main')).toContainText('pizza diner');
});

test('updateUser: open and close edit dialog', async ({ page }) => {
  const email = randomEmail();
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: /pd/i }).click();

  // Open edit dialog
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');

  // Close it again
  await page.getByRole('button', { name: 'Update' }).click();
  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });
  await expect(page.getByRole('main')).toContainText('pizza diner');
});

test('updateUser: edit name and persist after re-login', async ({ page }) => {
  const email = randomEmail();
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: /pd/i }).click();

  // Edit dialog: change name
  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('textbox').first().fill('pizza dinerx');
  await page.getByRole('button', { name: 'Update' }).click();
  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  // Confirm new name in UI
  await expect(page.getByRole('main')).toContainText('pizza dinerx');

  // Log out and back in to confirm persistence
  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: /pd/i }).click();

  // Expect persisted update
  await expect(page.getByRole('main')).toContainText('pizza dinerx');
});


