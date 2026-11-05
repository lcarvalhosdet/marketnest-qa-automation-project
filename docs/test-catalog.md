# Test catalog

Generated with `npx playwright test --list`.

Status: ✓ pass today. ✘ BUG-xxx = fails until fixed (`@known-bug`). Some tests skip when the shared
catalog does not have the data they need (e.g. no out-of-stock product).

**124 tests** in 32 files.

## Browser tests, guest (`tests/e2e/`, project `chromium`, also firefox/webkit)

78 tests.

### `e2e/accessibility.spec.ts`

| Test                                                                       | Status    |
| -------------------------------------------------------------------------- | --------- |
| Accessibility › / has no serious accessibility violations                  | ✘ BUG-025 |
| Accessibility › /products has no serious accessibility violations          | ✘ BUG-025 |
| Accessibility › /products?onSale=1 has no serious accessibility violations | ✘ BUG-025 |
| Accessibility › /help has no serious accessibility violations              | ✓         |
| Accessibility › /register has no serious accessibility violations          | ✘ BUG-025 |
| Accessibility › /login has no serious accessibility violations             | ✘ BUG-025 |
| Accessibility › /cart has no serious accessibility violations              | ✘ BUG-025 |

### `e2e/account-access.spec.ts`

| Test                                                            | Status |
| --------------------------------------------------------------- | ------ |
| Signed-out access › /account sends a guest to sign in           | ✓      |
| Signed-out access › /account/addresses sends a guest to sign in | ✓      |
| Signed-out access › /account/privacy sends a guest to sign in   | ✓      |
| Signed-out access › /orders sends a guest to sign in            | ✓      |
| Signed-out access › /checkout sends a guest to sign in          | ✓      |
| Signed-out access › the data export API refuses a guest         | ✓      |

### `e2e/catalog-filters.spec.ts`

| Test                                                                                  | Status |
| ------------------------------------------------------------------------------------- | ------ |
| Catalog filters › "4 stars & up" lists only products rated 4 or more                  | ✓      |
| Catalog filters › "In stock" lists no out-of-stock product                            | ✓      |
| Catalog filters › "Deals" lists only products with an original price                  | ✓      |
| Catalog filters › a price range lists only products inside it                         | ✓      |
| Catalog filters › a minimum above the maximum finds nothing                           | ✓      |
| Catalog filters › "Top rated" orders products from the best rating down, across pages | ✓      |

### `e2e/catalog-pagination.spec.ts`

| Test                                                                                    | Status |
| --------------------------------------------------------------------------------------- | ------ |
| Catalog pages and counts › every product appears once and the summary matches each page | ✓      |
| Catalog pages and counts › category counts match the category results                   | ✓      |

### `e2e/catalog-price-filter.spec.ts`

| Test                                                                                   | Status    |
| -------------------------------------------------------------------------------------- | --------- |
| Catalog price filter › includes products priced exactly at the minimum and the maximum | ✘ BUG-011 |

### `e2e/catalog-sorting.spec.ts`

| Test                                                                                      | Status    |
| ----------------------------------------------------------------------------------------- | --------- |
| Catalog sorting by price › "Price: low to high" orders every product by its current price | ✘ BUG-008 |
| Catalog sorting by price › "Price: high to low" orders every product by its current price | ✘ BUG-008 |

### `e2e/cookie-consent.spec.ts`

| Test                                                                        | Status    |
| --------------------------------------------------------------------------- | --------- |
| Cookie consent › loads nothing from other sites before consent  | ✓         |
| Cookie consent › stores no cookies or local data before consent | ✓         |
| Cookie consent › offers both choices on the first layer, side by side       | ✓         |
| Cookie consent › "Reject non-essential" is remembered on the next pages     | ✘ BUG-003 |
| Cookie consent › "Reject non-essential" sets no optional cookies            | ✓         |
| Cookie consent › "Accept all" is remembered on the next pages               | ✓         |

### `e2e/delivery-estimate.spec.ts`

| Test                                                                  | Status    |
| --------------------------------------------------------------------- | --------- |
| Delivery estimate › product page shows arrival dates in business days | ✘ BUG-013 |

### `e2e/discount-badge.spec.ts`

| Test                                                                            | Status    |
| ------------------------------------------------------------------------------- | --------- |
| Discount badge › deals page: every badge matches the real discount              | ✘ BUG-001 |
| Discount badge › home page deals section: every badge matches the real discount | ✘ BUG-001 |
| Discount badge › product page: badge and savings match the real discount        | ✘ BUG-001 |

### `e2e/legal-pages.spec.ts`

| Test                                                                            | Status    |
| ------------------------------------------------------------------------------- | --------- |
| Footer links › every footer link opens an existing page                         | ✘ BUG-006 |
| Footer links › the Legal column links to the Privacy, Terms and Cookie policies | ✓         |

### `e2e/load-time.spec.ts`

| Test                                         | Status    |
| -------------------------------------------- | --------- |
| Load time › main pages load within 5 seconds | ✘ BUG-016 |

### `e2e/mobile-layout.spec.ts`

| Test                                                                           | Status |
| ------------------------------------------------------------------------------ | ------ |
| Mobile layout › / fits the screen width                                        | ✓      |
| Mobile layout › /products fits the screen width                                | ✓      |
| Mobile layout › /help fits the screen width                                    | ✓      |
| Mobile layout › /register fits the screen width                                | ✓      |
| Mobile layout › /login fits the screen width                                   | ✓      |
| Mobile layout › /cart fits the screen width                                    | ✓      |
| Mobile layout › the cookie banner fits on screen and its buttons can be tapped | ✓      |
| Mobile layout › "Add to cart" is not covered once the banner is closed         | ✓      |

### `e2e/product-card-layout.spec.ts`

| Test                                                                        | Status    |
| --------------------------------------------------------------------------- | --------- |
| Product card layout › home page: every card shows its price inside the card | ✘ BUG-014 |

### `e2e/product-variants.spec.ts`

| Test                                                                     | Status    |
| ------------------------------------------------------------------------ | --------- |
| Product options › the price includes the extra cost of the chosen option | ✘ BUG-012 |

### `e2e/public-data-privacy.spec.ts`

| Test                                                                              | Status |
| --------------------------------------------------------------------------------- | ------ |
| Personal data on public pages › reviews show only the first name and last initial | ✓      |
| Personal data on public pages › shop pages show no email address or phone number  | ✓      |

### `e2e/registration-privacy.spec.ts`

| Test                                                                                 | Status    |
| ------------------------------------------------------------------------------------ | --------- |
| Sign-up form privacy › marketing emails are opt-in: the box starts unticked          | ✘ BUG-004 |
| Sign-up form privacy › the Terms and Privacy Policy box starts unticked              | ✓         |
| Sign-up form privacy › cannot sign up without accepting the Terms and Privacy Policy | ✓         |
| Sign-up form privacy › an invalid email address is refused before anything is sent   | ✘ BUG-024 |
| Sign-up form privacy › the Terms and Privacy Policy links open existing pages        | ✘ BUG-006 |

### `e2e/related-products.spec.ts`

| Test                                                                               | Status    |
| ---------------------------------------------------------------------------------- | --------- |
| "You might also like" › electronics: never recommends the product being viewed     | ✘ BUG-002 |
| "You might also like" › home-kitchen: never recommends the product being viewed    | ✘ BUG-002 |
| "You might also like" › fashion: never recommends the product being viewed         | ✘ BUG-002 |
| "You might also like" › sports-outdoors: never recommends the product being viewed | ✘ BUG-002 |
| "You might also like" › books: never recommends the product being viewed           | ✘ BUG-002 |
| "You might also like" › toys-games: never recommends the product being viewed      | ✘ BUG-002 |
| "You might also like" › beauty: never recommends the product being viewed          | ✘ BUG-002 |
| "You might also like" › garden: never recommends the product being viewed          | ✘ BUG-002 |

### `e2e/search-behaviour.spec.ts`

| Test                                                                    | Status |
| ----------------------------------------------------------------------- | ------ |
| Search behaviour › finds a product by its title words in any order      | ✓      |
| Search behaviour › is not case-sensitive                                | ✓      |
| Search behaviour › finds products by shop name, and only from that shop | ✓      |
| Search behaviour › a search with no match says so                       | ✓      |
| Search behaviour › an empty search lists the whole catalog              | ✓      |

### `e2e/search.spec.ts`

| Test                                                                    | Status    |
| ----------------------------------------------------------------------- | --------- |
| Search › terms with special characters show results instead of an error | ✘ BUG-009 |
| Search › every result opens its product page                            | ✘ BUG-010 |

### `e2e/security-headers.spec.ts`

| Test                                                                      | Status    |
| ------------------------------------------------------------------------- | --------- |
| Security headers › / is served with the standard security headers         | ✘ BUG-015 |
| Security headers › /login is served with the standard security headers    | ✘ BUG-015 |
| Security headers › /register is served with the standard security headers | ✘ BUG-015 |

### `e2e/shop-page.spec.ts`

| Test                                                                           | Status |
| ------------------------------------------------------------------------------ | ------ |
| Shop pages › each shop page lists only its own products, and the count matches | ✓      |
| Shop pages › an unknown shop shows "not found" with status 404                 | ✓      |
| Shop pages › an unknown product shows "not found" with status 404              | ✓      |

### `e2e/stock.spec.ts`

| Test                                                                         | Status |
| ---------------------------------------------------------------------------- | ------ |
| Stock limits › an out-of-stock product can be seen but not added to the cart | ✓      |
| Stock limits › a sold-out option cannot be chosen                            | ✓      |
| Stock limits › the quantity cannot go above the items left                   | ✓      |

## Browser tests, signed in (`tests/account/`, project `account`, needs a saved session)

21 tests.

### `account/addresses.spec.ts`

| Test                                                             | Status |
| ---------------------------------------------------------------- | ------ |
| Saved addresses › an empty address is refused, field by field    | ✓      |
| Saved addresses › an address can be added, corrected and deleted | ✓      |

### `account/cart.spec.ts`

| Test                                                                                            | Status    |
| ----------------------------------------------------------------------------------------------- | --------- |
| Cart › charges the price the product page showed for the chosen option                          | ✘ BUG-012 |
| Cart › WELCOME10 takes 10% off, and tax is 8% of the discounted subtotal                        | ✘ BUG-019 |
| Cart › TAKE5 takes $5.00 off from $30.00, and only one code applies at a time                   | ✓         |
| Cart › codes below their minimum, or unknown, are refused with a reason                         | ✓         |
| Cart › a code is removed when the subtotal drops below its minimum                              | ✘ BUG-023 |
| Cart › quantity changes update the totals, free shipping starts at $50.00, and the cart is kept | ✓         |
| Cart › adding a product that is already in the cart raises its quantity                         | ✘ BUG-021 |
| Cart › a shop can't buy its own items                                                           | ✓         |

### `account/checkout.spec.ts`

| Test                                                                               | Status    |
| ---------------------------------------------------------------------------------- | --------- |
| Checkout › the default saved address is preselected                                | ✓         |
| Checkout › switching to Express changes only the shipping line, which is not taxed | ✓         |
| Checkout › Express costs $9.99, as its label and the Help page say                 | ✘ BUG-022 |
| Checkout › Standard shipping in the summary matches its label                      | ✓         |
| Checkout › "Place order" with empty card details shows errors and places no order  | ✓         |

### `account/data-export.spec.ts`

| Test                                                                           | Status    |
| ------------------------------------------------------------------------------ | --------- |
| Download my data › contains every kind of data the Privacy Policy lists        | ✘ BUG-017 |
| Download my data › the exported profile and marketing choice match the account | ✓         |
| Download my data › is sent as a private download                               | ✓         |

### `account/marketing-preference.spec.ts`

| Test                                                                    | Status |
| ----------------------------------------------------------------------- | ------ |
| Marketing preference › the marketing switch is saved in both directions | ✓      |

### `account/profile.spec.ts`

| Test                                                         | Status |
| ------------------------------------------------------------ | ------ |
| Profile › the name can be corrected, and the change is saved | ✓      |

### `account/seller-earnings.spec.ts`

| Test                                                           | Status    |
| -------------------------------------------------------------- | --------- |
| Seller earnings › every order charges 10% of the item subtotal | ✘ BUG-018 |

## Unit tests (`tests/unit/`, project `unit`, no browser)

25 tests.

### `unit/catalog.spec.ts`

| Test                                                               | Status |
| ------------------------------------------------------------------ | ------ |
| parseResultsSummary › reads the range and the total                | ✓      |
| parseResultsSummary › reads "No products found" as an empty result | ✓      |
| parseResultsSummary › rejects anything else                        | ✓      |
| other labels › parseStarRating reads the accessible rating         | ✓      |
| other labels › parseCount reads the first number                   | ✓      |

### `unit/delivery.spec.ts`

| Test                                                          | Status |
| ------------------------------------------------------------- | ------ |
| todayIn › returns the calendar date in the given time zone    | ✓      |
| addBusinessDays › counts from the next day and skips weekends | ✓      |
| addBusinessDays › crosses month and year ends                 | ✓      |
| helpers › isWeekend is true only on Saturday and Sunday       | ✓      |
| helpers › formatArrivalDate matches the product page format   | ✓      |

### `unit/pricing.spec.ts`

| Test                                                                     | Status |
| ------------------------------------------------------------------------ | ------ |
| parsePrice › reads a price label into cents                              | ✓      |
| parsePrice › finds the price inside a sentence                           | ✓      |
| parsePrice › rejects labels with no price or more than one               | ✓      |
| parseDiscountBadge › reads the number on the badge                       | ✓      |
| parseDiscountBadge › rejects anything that is not a badge                | ✓      |
| parseSurcharge › reads the extra cost of a variant                       | ✓      |
| parseSurcharge › is zero when the variant costs nothing extra            | ✓      |
| discount math › is relative to the original price, not the sale price    | ✓      |
| discount math › rounds the badge to the nearest whole percent            | ✓      |
| discount math › rejects an original price that is not positive           | ✓      |
| order math › tax is 8% of the subtotal after the discount (Help example) | ✓      |
| order math › rounds tax and discounts to the cent                        | ✓      |
| order math › marketplace fee is 10% of item sales (Help example)         | ✓      |
| helpers › parseOptional returns undefined when the element is missing    | ✓      |
| helpers › formatPrice writes cents as dollars                            | ✓      |
