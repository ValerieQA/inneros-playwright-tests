import { defineConfig, devices } from '@playwright/test';

/**
 * Central configuration: every default (base URL, retries, workers, timeouts,
 * artifacts, browsers) lives here so tests stay short and environment-agnostic.
 */
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',

  // Run tests inside each file in parallel too, not just files against each other.
  fullyParallel: true,
  // A stray test.only must never reach CI.
  forbidOnly: isCI,
  // Environment-safe retries: CI only. A test that passes on retry is reported as "flaky".
  retries: isCI ? 2 : 0,
  // Parallel workers: 2 on GitHub runners (2 vCPU), all cores locally.
  workers: isCI ? 2 : undefined,

  // Whole-test timeout and assertion timeout (auto-waiting web-first assertions).
  timeout: 30_000,
  expect: {
    timeout: 7_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01, // tolerate anti-aliasing noise, catch real layout shifts
      animations: 'disabled',
      caret: 'hide',
    },
  },

  reporter: isCI
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'on-failure' }]],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    headless: true,
    // saucedemo marks elements with data-test="...", so getByTestId() uses that attribute.
    testIdAttribute: 'data-test',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    // Debug artifacts only when something goes wrong.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // 1. Logs in once and saves the session (storageState) for all other tests.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    // 2. Main browser. Visual baselines are recorded here only.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/standard_user.json' },
      dependencies: ['setup'],
    },

    // 3. Cross-browser check of the same functional flows (visual tests are skipped here).
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: 'playwright/.auth/standard_user.json' },
      dependencies: ['setup'],
      testIgnore: /visual\//,
    },
  ],
});
