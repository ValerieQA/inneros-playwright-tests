import { test, expect } from '../fixtures';
import { CUSTOMER, PRODUCTS } from '../data/test-data';

test.describe('Checkout', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.expectLoaded();
  });

  test('user completes an order and sees the confirmation', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addToCart(PRODUCTS.backpack);
    await inventoryPage.addToCart(PRODUCTS.bikeLight);
    await inventoryPage.openCart();
    await cartPage.expectItems([PRODUCTS.backpack, PRODUCTS.bikeLight]);

    await cartPage.checkout();
    await checkoutPage.fillInformation(CUSTOMER);
    await checkoutPage.expectOverview(2);
    // $29.99 + $9.99 — the overview must show the correct item total.
    await expect(checkoutPage.itemTotal).toHaveText('Item total: $39.98');

    await checkoutPage.finish();
    await checkoutPage.expectOrderConfirmed();
    // After the order the cart is empty again.
    await inventoryPage.expectCartCount(0);
  });

  test('checkout requires customer information', async ({ inventoryPage, cartPage, checkoutPage }) => {
    await inventoryPage.addToCart(PRODUCTS.backpack);
    await inventoryPage.openCart();
    await cartPage.checkout();

    await checkoutPage.continueButton.click(); // submit the empty form
    await expect(checkoutPage.error).toContainText('First Name is required');
    await expect(checkoutPage.title).toHaveText('Checkout: Your Information');
  });
});
