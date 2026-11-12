import { test, expect } from '../fixtures';
import { PASSWORD, PRODUCTS, USERS } from '../data/test-data';
import { LoginPage } from '../../pages/LoginPage';
import { InventoryPage } from '../../pages/InventoryPage';

// These tests reuse the saved session (storageState) — no login steps here.
test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.expectLoaded();
  });

  test('adding products updates the cart badge and the cart page', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(PRODUCTS.backpack);
    await inventoryPage.expectCartCount(1);
    await inventoryPage.addToCart(PRODUCTS.bikeLight);
    await inventoryPage.expectCartCount(2);

    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    await cartPage.expectItems([PRODUCTS.backpack, PRODUCTS.bikeLight]);
  });

  test('removing a product updates the count', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(PRODUCTS.backpack);
    await inventoryPage.addToCart(PRODUCTS.boltTShirt);
    await inventoryPage.expectCartCount(2);

    await inventoryPage.removeFromCart(PRODUCTS.backpack);
    await inventoryPage.expectCartCount(1);
    // Scoped check: only the Backpack card switched back to "Add to cart".
    await expect(
      inventoryPage.productCard(PRODUCTS.backpack).getByRole('button', { name: 'Add to cart' }),
    ).toBeVisible();
  });

  test('carts of two users in separate browser contexts stay isolated', async ({ browser }) => {
    // Two independent browser contexts = two users at the same time, each with their own cookies/storage.
    const contextA = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const contextB = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const userA = await contextA.newPage();
    const userB = await contextB.newPage();

    for (const [page, user] of [[userA, USERS.standard], [userB, USERS.problem]] as const) {
      const login = new LoginPage(page);
      await login.goto();
      await login.login(user, PASSWORD);
      await new InventoryPage(page).expectLoaded();
    }

    const inventoryA = new InventoryPage(userA);
    const inventoryB = new InventoryPage(userB);
    await inventoryA.addToCart(PRODUCTS.backpack);
    await inventoryA.expectCartCount(1);
    await inventoryB.expectCartCount(0); // user B's cart is untouched

    await contextA.close();
    await contextB.close();
  });
});
