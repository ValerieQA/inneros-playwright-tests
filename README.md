# Playwright E-commerce Test Framework

[![Playwright Tests](https://github.com/ValerieQA/inneros-playwright-tests/actions/workflows/playwright.yml/badge.svg?branch=ecommerce-framework)](https://github.com/ValerieQA/inneros-playwright-tests/actions/workflows/playwright.yml?query=branch%3Aecommerce-framework)

> This project lives on the `ecommerce-framework` branch of the repository. The `main` branch holds a different, smaller course project.

A modular Playwright + TypeScript test framework for the business-critical flows of an online shop: **login, cart and checkout**.
System under test: [saucedemo.com](https://www.saucedemo.com), a public demo store built for test automation practice.

Capstone project for the Coursera course on advanced Playwright.

## What is covered

| Area | Tests |
|---|---|
| **Login** (`tests/login`) | valid login → products page · locked-out user gets an error · wrong password rejected · guest is redirected away from a protected page |
| **Cart** (`tests/cart`) | adding products updates the badge and cart page · removing a product updates the count · two users in separate browser contexts have isolated carts |
| **Checkout** (`tests/checkout`) | full order: cart → customer info → overview with correct item total → **order confirmation** · required-field validation |
| **Visual regression** (`tests/visual`) | `toHaveScreenshot()` on the cart summary component and on the order confirmation page |

21 test runs in total: functional flows in **Chromium and Firefox**, visual checks in Chromium.

## Advanced Playwright features used

- **Page Object Model** (`pages/`) + **custom fixtures** (`tests/fixtures.ts`): tests ask for `loginPage`, `inventoryPage`, … and read like user journeys.
- **storageState reuse**: `tests/auth.setup.ts` logs in once; cart and checkout tests start authenticated (`dependencies: ['setup']` in the config).
- **Browser contexts**: a cart test runs two users at the same time in isolated contexts.
- **Semantic and custom locators**: `getByRole`, `getByPlaceholder`, and `getByTestId` mapped to the site's `data-test` attribute via `testIdAttribute`.
- **Scoped interactions**: every product card has an identical "Add to cart" button, so we locate the card by product name and click the button *inside* it (`InventoryPage.productCard()`).
- **Auto-waiting + web-first assertions**: no fixed sleeps anywhere; `expect(...)` retries until the UI is ready.
- **Visual regression**: component-level and page-level screenshots with a small tolerance, animations disabled.

## Prerequisites

- Node.js 18+ (20 recommended) and npm
- Git
- No accounts or secrets are needed: saucedemo's demo users (`standard_user`, password `secret_sauce`) are public. They can be overridden with the `SAUCE_USER` / `SAUCE_PASSWORD` environment variables.

## Setup

```bash
git clone -b ecommerce-framework https://github.com/ValerieQA/inneros-playwright-tests.git playwright-ecommerce-framework
cd playwright-ecommerce-framework
npm ci
npx playwright install --with-deps
```

## Running tests

```bash
npm test                    # everything: Chromium + Firefox, parallel
npm run test:login          # one area: test:login / test:cart / test:checkout / test:visual
npx playwright test --project=chromium      # one browser
npm run test:headed         # watch the browser
npm run test:ui             # Playwright UI mode: pick, run and time-travel through tests
npm run report              # open the last HTML report
```

## Debugging and re-running failures

```bash
npm run test:last-failed                     # re-run only the tests that failed last time
npx playwright test tests/cart --debug       # step through with the Playwright Inspector
npx playwright show-trace test-results/<test-folder>/trace.zip   # open a trace
```

- Failed tests keep a **screenshot** and a **video**; a test that is **retried** also records a **trace** (`trace: 'on-first-retry'`).
- Traces can also be opened without installing anything: drag `trace.zip` onto https://trace.playwright.dev (the file stays in your browser).
- In CI, a test that passes only on retry is marked **flaky** in the report: treat it as a bug to fix, not as green.

## Configuration (`playwright.config.ts`)

| Setting | Value | Why |
|---|---|---|
| `baseURL` | `https://www.saucedemo.com` (or `BASE_URL`) | tests use short paths like `/inventory.html` |
| `headless` | `true` | fast and CI-friendly; use `--headed` to watch |
| `fullyParallel` / `workers` | on / 2 in CI | parallel execution |
| `retries` | 2 in CI, 0 locally | environment-safe retries; flakiness stays visible |
| `timeout` / `actionTimeout` / `expect.timeout` | 30 s / 10 s / 7 s | fail fast with a clear message |
| `trace` / `screenshot` / `video` | on first retry / only on failure / retain on failure | debug artifacts only when needed |
| `testIdAttribute` | `data-test` | matches the attribute used by the app |
| `projects` | `setup` → `chromium`, `firefox` | log in once, then run in two browsers |

## CI/CD (GitHub Actions)

| Workflow | Trigger | What it does |
|---|---|---|
| `playwright.yml` | push and pull request to `main` or `ecommerce-framework`, manual | installs dependencies and browsers, runs all tests, uploads the HTML report (and traces/screenshots/videos on failure) |
| `update-snapshots.yml` | manual | records visual baselines on Linux and commits them |
| `playwright-docker.yml` | manual | runs the suite inside the official Playwright Docker image |

**Where to see results:** repository → **Actions** → choose a run → **Artifacts** → download `playwright-report` and open `index.html` (or run `npx playwright show-report <folder>`).

## Visual baselines

Screenshots depend on fonts and rendering, so baselines are recorded in the same Linux environment the CI uses, not on a Mac or Windows laptop.

- First CI run: missing baselines are recorded automatically (`--update-snapshots=missing`), so the run doesn't fail.
- To store or refresh the baselines: **Actions → "Update visual baselines" → Run workflow**. It commits the new `.png` files to `tests/visual/visual.spec.ts-snapshots/`.
- After an **intentional** UI change, run that workflow again and review the image diff in the pull request like any code change. Never approve new baselines without looking at them.

## Docker

```bash
docker build -t playwright-ecommerce .
docker run --rm -e CI=true playwright-ecommerce
```

The image `mcr.microsoft.com/playwright:v1.65.0-noble` already contains all browsers and system libraries, so the environment is identical on every machine. Its version must match `@playwright/test` in `package.json`.

## Project structure

```
├── .github/workflows/      CI: tests, visual baselines, Docker
├── pages/                  Page Objects (locators + actions, no assertions about business rules)
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── tests/
│   ├── auth.setup.ts       logs in once, saves storageState
│   ├── fixtures.ts         custom fixtures exposing the page objects
│   ├── data/test-data.ts   users, products, customer data
│   ├── login/  cart/  checkout/  visual/
├── playwright.config.ts
├── Dockerfile
└── package.json
```

## Adding a new test

1. Put new locators and actions into the matching page object in `pages/` (or create a new one and register it in `tests/fixtures.ts`).
2. Write the test in the right folder and keep it at the "user journey" level: actions through page objects, `expect` for outcomes.
3. Prefer `getByRole` / `getByPlaceholder` / `getByTestId`; scope repeated elements inside their container.
4. Run `npm test` locally and open a pull request: CI must be green before merging.
