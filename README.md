# MarketNest - test automation

Playwright + TypeScript tests for the [MarketNest](https://qa-marketplace-app-b9mpo.ondigitalocean.app/) QA challenge app.

## Setup

Node.js 22.13+.

```bash
npm ci
npx playwright install --with-deps
npm test
npm run report
```

| Command | What it does |
| --- | --- |
| `npm test` | Unit + Chromium e2e |
| `npm run test:unit` | Helpers only |
| `npm run test:account` | Signed-in specs (needs saved session) |
| `npm run test:gdpr` | `@gdpr` tags |
| `npm run test:cross-browser` | Chromium, Firefox, WebKit |
| `npm run test:headed` / `test:ui` | Visible browser / Playwright UI |
| `npm run lint` / `typecheck` / `format` | Checks |

Skip open-bug tests: `npm test -- --grep-invert @known-bug`.

## Signed-in tests

`tests/account/` reuses a session file (git-ignored). Save it once:

```bash
npx playwright codegen --save-storage=playwright/.auth/user.json https://qa-marketplace-app-b9mpo.ondigitalocean.app/login
```

Sign in, close the browser, then `npm run test:account`. Cart tests empty the cart before/after. No order is placed.

## Layout

- `src/pages`, `src/components`, `src/fixtures`: page objects and shared `test`
- `src/utils`: price/delivery/catalog helpers (`tests/unit`)
- `tests/e2e`: guest browser specs
- `tests/account`: signed-in specs
- `docs/`: QA cycle notes, bug write-ups, PDF export, screenshots in `docs/evidence/`

The demo catalog is shared. Tests read products from the page instead of hard-coded ids.

## Notes

- Prefer `getByTestId()`. Specs assert. Page objects read the UI.
- Money uses integer cents.
- Open bugs keep failing (`@known-bug` + issue annotation) until fixed.
- Cookie banner is auto-dismissed unless a consent test turns that off.
- Override the app with `BASE_URL` (see `.env.example`).

CI (`.github/workflows/playwright.yml`) runs lint, typecheck, format check and `npm test` on `main` / PRs.

## Known bugs

QA cycle: [docs/qa-cycle-2026-11-04.md](docs/qa-cycle-2026-11-04.md). Full write-ups: [docs/bug-reports.md](docs/bug-reports.md) (also [docs/bugs.pdf](docs/bugs.pdf)). Screenshots: [docs/evidence/](docs/evidence/).

| ID | Severity | Bug | Where | Automated |
| --- | --- | --- | --- | --- |
| BUG-001 | High | Discount badge uses sale price in the denominator | Deals / product page | `discount-badge.spec.ts` |
| BUG-002 | Low | Related products include the current product | Product page | `related-products.spec.ts` |
| BUG-003 | High | "Reject non-essential" is not remembered | Cookie banner | `cookie-consent.spec.ts` |
| BUG-004 | Critical | Marketing opt-in is pre-ticked at sign-up | Register | `registration-privacy.spec.ts` |
| BUG-005 | High | No way to change cookie consent later | Cookie Policy | - |
| BUG-006 | High | Terms of Service link is 404 | Register / footer | `registration-privacy.spec.ts`, `legal-pages.spec.ts` |
| BUG-007 | High | Privacy Policy missing art. 13 info | Help | - |
| BUG-008 | Medium | Price sort uses original price | Catalog | `catalog-sorting.spec.ts` |
| BUG-009 | High | Search 500 on `+ ( ) [ * ? \` | Search | `search.spec.ts` |
| BUG-010 | Medium | Search lists a product that 404s | Search | `search.spec.ts` |
| BUG-011 | Low | Max price filter excludes the max | Catalog | `catalog-price-filter.spec.ts` |
| BUG-012 | Critical | Paid option: page shows base, cart charges more | Product / cart | `product-variants.spec.ts`, `cart.spec.ts` |
| BUG-013 | Medium | Delivery dates use calendar days | Product page | `delivery-estimate.spec.ts` |
| BUG-014 | Low | Long title pushes price out of the card | Home deals | `product-card-layout.spec.ts` |
| BUG-015 | Medium | Missing security headers | All pages | `security-headers.spec.ts` |
| BUG-016 | Medium | Intermittent 30-60s hangs | Any page | `load-time.spec.ts` (partial) |
| BUG-017 | High | Data export omits addresses and orders | Account privacy | `data-export.spec.ts` |
| BUG-018 | High | Marketplace fee over 10% | Seller hub | `seller-earnings.spec.ts` |
| BUG-019 | High | Tax ignores promo discount | Cart / checkout | `cart.spec.ts` |
| BUG-020 | Low | Typo "Shiping address" | Checkout | - |
| BUG-021 | Medium | Re-add does not raise quantity | Cart | `cart.spec.ts` |
| BUG-022 | High | Express charged $14.99, labelled $9.99 | Checkout | `checkout.spec.ts` |
| BUG-023 | Medium | Promo stays below its minimum | Cart | `cart.spec.ts` |
| BUG-024 | Medium | Sign-up accepts email without `@` | Register | `registration-privacy.spec.ts` |
| BUG-025 | Medium | Low contrast on buttons / compare price | Most pages | `accessibility.spec.ts` |
