import { test, expect } from '../fixtures';
import { NO_SESSION, PASSWORD, USERS } from '../data/test-data';

// Login tests must start logged out, so they ignore the saved session.
test.use({ storageState: NO_SESSION });

test.describe('Login', () => {
  test('valid user is redirected to the products page', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard, PASSWORD);
    await inventoryPage.expectLoaded();
  });

  test('locked-out user sees an error and stays on the login page', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.lockedOut, PASSWORD);
    await loginPage.expectError('Sorry, this user has been locked out.');
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('wrong password is rejected', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USERS.standard, 'wrong_password');
    await loginPage.expectError('Username and password do not match');
  });

  test('protected page redirects a guest to login', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');
    await loginPage.expectError("You can only access '/inventory.html' when you are logged in.");
    await expect(loginPage.loginButton).toBeVisible();
  });
});
