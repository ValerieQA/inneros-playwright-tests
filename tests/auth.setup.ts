import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { AUTH_FILE, PASSWORD, USERS } from './data/test-data';

/**
 * Runs once before the browser projects (see "dependencies" in playwright.config.ts).
 * Logs in through the UI a single time and saves the session, so cart and checkout
 * tests start already authenticated instead of repeating the login flow.
 */
setup('authenticate as standard_user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(USERS.standard, PASSWORD);
  await new InventoryPage(page).expectLoaded();
  await page.context().storageState({ path: AUTH_FILE });
});
