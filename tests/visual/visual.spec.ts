import { test, expect } from '../fixtures';
import { CUSTOMER, PRODUCTS } from '../data/test-data';

/**
 * Visual regression: functional tests prove the elements exist; these prove they LOOK right.
 * Baselines live in tests/visual/visual.spec.ts-snapshots/ and are recorded in the CI Linux
 * environment (see README → "Visual baselines"), so fonts and rendering match on every run.
 * Runs in Chromium only (see playwright.config.ts) to keep one baseline per screen.
 */
test.describe('Visual regression', () => {
  test('cart summary layout', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(PRODUCTS.backpack);
    await inventoryPage.addToCart(PRODUCTS.bikeLight);
    await inventoryPage.openCart();
    await cartPage.expectLoaded();
    // Component-level screenshot: only the cart list, not the whole page.
    await expect(cartPage.cartList).toHaveScreenshot('cart-summary.png');
  });

  test('order confirmation page', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(PRODUCTS.backpack);
    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation(CUSTOMER);
    await checkoutPage.finish();
    await checkoutPage.expectOrderConfirmed();
    await expect(page).toHaveScreenshot('checkout-complete.png', { fullPage: true });
  });
});
