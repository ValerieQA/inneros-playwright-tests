/**
 * Test data in one place.
 * saucedemo.com is a public demo shop; these are its published demo accounts, not real secrets.
 * For a real application, read them from environment variables / GitHub Secrets instead.
 */
export const PASSWORD = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export const USERS = {
  standard: process.env.SAUCE_USER ?? 'standard_user',
  lockedOut: 'locked_out_user',
  problem: 'problem_user',
} as const;

export const AUTH_FILE = 'playwright/.auth/standard_user.json';

export const PRODUCTS = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltTShirt: 'Sauce Labs Bolt T-Shirt',
} as const;

export const CUSTOMER = {
  firstName: 'Test',
  lastName: 'Customer',
  postalCode: '10001',
} as const;

/** Clean (logged-out) state for tests that must start without the saved session. */
export const NO_SESSION = { cookies: [], origins: [] };
