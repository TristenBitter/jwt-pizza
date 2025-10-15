import { test, expect } from 'playwright-test-coverage';

// Simple diagnostic test to see what's happening
test('DIAGNOSTIC: Can we even load the homepage?', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/JWT Pizza/i);
  console.log('✓ Homepage loads');
});

test('DIAGNOSTIC: Can we register a user?', async ({ page }) => {
  const email = `test${Date.now()}@test.com`;
  
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  
  console.log('✓ Clicked register link');
  
  await page.getByRole('textbox', { name: /full name/i }).fill('Test User');
  await page.getByRole('textbox', { name: /email/i }).fill(email);
  await page.getByRole('textbox', { name: /password/i }).fill('password');
  
  console.log('✓ Filled form');
  
  await page.getByRole('button', { name: 'Register' }).click();
  
  console.log('✓ Clicked register button');
  
  // Wait up to 10 seconds to see where we land
  await page.waitForTimeout(2000);
  
  const currentUrl = page.url();
  console.log('Current URL after registration:', currentUrl);
  
  // Take a screenshot to see what we got
  await page.screenshot({ path: 'diagnostic-after-register.png' });
  
  // Check if we can see a logout link (indicates successful login)
  const logoutLink = page.getByRole('link', { name: /logout/i });
  const isVisible = await logoutLink.isVisible().catch(() => false);
  console.log('Logout link visible?', isVisible);
});

test('DIAGNOSTIC: Can we login with a@jwt.com?', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Login' }).click();
  
  await page.getByRole('textbox', { name: /email/i }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: /password/i }).fill('admin');
  
  console.log('✓ Filled login form');
  
  await page.getByRole('button', { name: 'Login' }).click();
  
  console.log('✓ Clicked login button');
  
  // Wait to see what happens
  await page.waitForTimeout(2000);
  
  const currentUrl = page.url();
  console.log('Current URL after login:', currentUrl);
  
  await page.screenshot({ path: 'diagnostic-after-admin-login.png' });
  
  // Check for error messages
  const pageText = await page.textContent('body');
  console.log('Page contains "error"?', pageText?.toLowerCase().includes('error'));
  console.log('Page contains "invalid"?', pageText?.toLowerCase().includes('invalid'));
  
  // Check if we can see admin-specific elements
  const adminLink = page.getByRole('link', { name: /admin/i });
  const isAdminVisible = await adminLink.isVisible().catch(() => false);
  console.log('Admin link visible?', isAdminVisible);
});