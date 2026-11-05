# Bug reports

## Release assessment

**Recommendation: no-go.**

- **App:** https://qa-marketplace-app-b9mpo.ondigitalocean.app
- **Cycle:** Nov 4-5, 2026
- **Browsers:** Chromium desktop (1280x720) and iPhone 13 viewport. Locale en-US, time zone America/New_York. Firefox/WebKit not run this cycle.
- **How:** manual exploration + Playwright. Signed-in findings used a test account with a fake address. No order placed.

| Severity | Count |
| --- | --- |
| Critical | 2 |
| High | 10 |
| Medium | 9 |
| Low | 4 |
| **Total** | **25** |

Main blockers: consent / privacy gaps (BUG-003 to BUG-007, BUG-017), wrong money on options / tax / fee / Express (BUG-012, BUG-018, BUG-019, BUG-022), search 500 on common characters (BUG-009).

## BUG-001

**Title:** Wrong discount percentage on sale badges

**Description:**

On every product on sale, the badge percentage is (original - price) / price
instead of (original - price) / original. The "You save" amount on the product
page is correct; only the percentage is overstated. Example: Canvas Weekender
Bag $95 / $140 shows -47% instead of -32%. Worst case seen: a book at $10 / $20
shows -100%.

**Steps to reproduce:**

1. Open /products?onSale=1
2. On any card, compare the badge with the two prices
3. Check the home page Deals section and the product page as well

**Actual result:**

Badge = (original - price) / price; every badge overstates the discount.

**Expected result:**

Badge = (original - price) / original, rounded (Help -> Shopping).

**Severity:** High

**Flow:** Automated - tests/e2e/discount-badge.spec.ts

**Evidence:** docs/evidence/BUG-001-discount-badges.png

---

## BUG-002

**Title:** "You might also like" recommends the product being viewed

**Description:**

In the related-products section on the product page, the first card is the
product the shopper is already looking at.

**Steps to reproduce:**

1. Open /products/p115 (or any product)
2. Scroll to "You might also like"
3. Look at the first card

**Actual result:**

The product being viewed appears as the first recommendation.

**Expected result:**

The list shows other products only.

**Severity:** Low

**Flow:** Automated - tests/e2e/related-products.spec.ts

**Evidence:** docs/evidence/BUG-002-related-self.png

---

## BUG-003

**Title:** GDPR: "Reject non-essential" is not remembered and the banner returns

**Description:**

After rejecting non-essential cookies, no cookie or storage entry is written.
The banner returns on the next page, after a reload, and after client-side
navigation. "Accept all" is stored for 12 months in the mp_consent cookie. The
Cookie Policy says the choice is remembered for 12 months.

**Steps to reproduce:**

1. Open / in a fresh browser
2. Click "Reject non-essential"
3. Open /products (or reload)

**Actual result:**

The banner returns. Only visitors who accept have their choice persisted.

**Expected result:**

The banner does not come back after "Reject non-essential".

**Severity:** High

**Flow:** Automated - tests/e2e/cookie-consent.spec.ts

**Evidence:** docs/evidence/BUG-003-reject-banner-returns.png

---

## BUG-004

**Title:** GDPR: marketing emails are pre-ticked at sign-up

**Description:**

"Email me offers and product news" starts ticked, so every new account is opted
in to marketing unless the user notices and unticks it. The Privacy Policy says
marketing is opt-in only if the user ticks the box. Pre-ticked consent is not
valid under GDPR.

**Steps to reproduce:**

1. Open /register
2. Look at the second checkbox (marketing)

**Actual result:**

The box is ticked when the page opens.

**Expected result:**

The marketing box starts unticked.

**Severity:** Critical

**Flow:** Automated - tests/e2e/registration-privacy.spec.ts

**Evidence:** docs/evidence/BUG-004-marketing-preticked.png

---

## BUG-005

**Title:** GDPR: cookie consent cannot be changed or withdrawn

**Description:**

Once "Accept all" is clicked, the banner never returns and there is no "Cookie
settings" control. The Cookie Policy tells users to clear site cookies in the
browser, which also signs them out.

**Steps to reproduce:**

1. Click "Accept all"
2. Look in the footer or Cookie Policy for a way to turn analytics off

**Actual result:**

No control exists; only clearing browser cookies works.

**Expected result:**

A control reopens the choice at any time.

**Severity:** High

**Flow:** Manual - the control does not exist yet (nothing to target with a data-testid)

**Evidence:** docs/evidence/BUG-005-no-withdraw-control.png

---

## BUG-006

**Title:** GDPR / legal: Terms of Service page does not exist (404)

**Description:**

The "Terms of Service" link (sign-up and footer) points to /terms, which returns
404. Sign-up requires agreeing to the Terms and Privacy Policy. Checkout says the
same. Accounts are created against terms that are not published.

**Steps to reproduce:**

1. Open /register and click "Terms of Service"
   (or use the footer link)

**Actual result:**

404 "This page could not be found".

**Expected result:**

The Terms of Service page opens with its content.

**Severity:** High

**Flow:** Automated - tests/e2e/registration-privacy.spec.ts, tests/e2e/legal-pages.spec.ts

**Evidence:** docs/evidence/BUG-006-terms-404.png

---

## BUG-007

**Title:** GDPR: Privacy Policy is missing required information

**Description:**

Help -> Privacy Policy lists what is stored and four rights (access/portability,
correction, erasure, marketing opt-out), but it omits the controller and contact,
legal bases, recipients, transfers, retention periods, restriction/objection/
withdrawal, and the right to complain to a supervisory authority.

**Steps to reproduce:**

1. Open Help -> Privacy Policy (/help#privacy)
2. Compare the content with GDPR art. 13 requirements

**Actual result:**

The page only covers part of what is required. Several points are still missing.

**Expected result:**

A complete notice covering controller, purposes, legal bases, recipients,
retention, all rights, and the right to complain to an authority.

**Severity:** High

**Flow:** Manual - needs legal review, not a text match

**Evidence:** docs/evidence/BUG-007-privacy-policy.png

---

## BUG-008

**Title:** Price sorting uses the original price of products on sale

**Description:**

With "Price: low to high" / "high to low", sale items are ordered by their
struck-through original price, not by the price the shopper pays.

**Steps to reproduce:**

1. Open /products?sort=price-asc
2. Read the current prices across the pages

**Actual result:**

Sale products are placed by their original (compare-at) price.

**Expected result:**

Products ordered by the selling price.

**Severity:** Medium

**Flow:** Automated - tests/e2e/catalog-sorting.spec.ts

**Evidence:** docs/evidence/BUG-008-price-sort.png

---

## BUG-009

**Title:** Search returns HTTP 500 for common characters (+ ( ) [ * ? \)

**Description:**

Queries containing those characters hit an error page with status 500. Example:
searching "C++" cannot find "C++ Programming...".

**Steps to reproduce:**

1. In the header search, search for c++
2. Observe the response

**Actual result:**

HTTP 500 error page.

**Expected result:**

Results, or "No products found".

**Severity:** High

**Flow:** Automated - tests/e2e/search.spec.ts

**Evidence:** docs/evidence/BUG-009-search-500.png

---

## BUG-010

**Title:** Search lists a product whose page cannot be opened (404)

**Description:**

Searches such as "garden", "smart" or "sensor" return "Smart Soil Moisture
Sensor" (p149). It is not in the catalog, and /products/p149 says "We couldn't
find that product".

**Steps to reproduce:**

1. Search for "sensor"
2. Open the first result

**Actual result:**

The result opens a 404 product page.

**Expected result:**

Search shows only published catalog products with a working page.

**Severity:** Medium

**Flow:** Automated - tests/e2e/search.spec.ts

**Evidence:** docs/evidence/BUG-010-search-404-product.png

---

## BUG-011

**Title:** The maximum price filter excludes products priced exactly at the maximum

**Description:**

The minimum is inclusive. The maximum is not. Max $50 leaves out the Pour-Over
Coffee Set at $50.00. Max $27 leaves out the Pruning Shears at $27.00.

**Steps to reproduce:**

1. Open /products?category=garden&max=27
2. Check whether the $27.00 product appears

**Actual result:**

Products priced exactly at the maximum are left out.

**Expected result:**

Both minimum and maximum limits are inclusive.

**Severity:** Low

**Flow:** Automated - tests/e2e/catalog-price-filter.spec.ts

**Evidence:** docs/evidence/BUG-011-max-price-filter.png

---

## BUG-012

**Title:** An option that costs extra: page shows the base price, cart charges more

**Description:**

Help -> Shopping says the price updates when an option that costs extra is chosen.
The product page keeps the base price; the cart and checkout charge the higher
one. Example: Aurora Wireless Earbuds with "Wireless charging case +$20" -> $79.99
on the page, $99.99 in the cart.

**Steps to reproduce:**

1. Open /products/p101
2. Choose "Wireless charging case" (price stays $79.99)
3. Add to cart and open /cart

**Actual result:**

The page shows the base price. Cart and checkout charge the higher amount.

**Expected result:**

The product page price updates with the surcharge; the cart matches what was shown.

**Severity:** Critical

**Flow:** Automated - tests/e2e/product-variants.spec.ts, tests/account/cart.spec.ts

**Evidence:** docs/evidence/BUG-012-cart-higher-price.png, docs/evidence/BUG-012-variant-base-price.png

---

## BUG-013

**Title:** Delivery estimates count calendar days and can fall on weekends

**Description:**

Help -> Shipping: Standard 5 and Express 2 business days, starting the day after
the order, with no weekend delivery. The product page shows calendar-day dates
(Express can land on a Saturday). Checkout uses business days, so the two places
promise different dates for the same order.

**Steps to reproduce:**

1. Open any product page
2. Compare the Standard/Express "arrives by" dates with a business-day calendar

**Actual result:**

Calendar-day dates. Express can fall on a weekend. The dates diverge from checkout.

**Expected result:**

Arrival dates in business days, never on Saturday or Sunday.

**Severity:** Medium

**Flow:** Automated - tests/e2e/delivery-estimate.spec.ts

**Evidence:** docs/evidence/BUG-013-delivery-dates.png

---

## BUG-014

**Title:** A long product title pushes the price out of the card

**Description:**

On the card for "4K Action Camera with Waterproof Case, Dual Touch Screens,
Electronic Image Stabilization and 64 GB Memory Card Bundle for Travel Vlogging"
(multi-line title), the price is drawn about 23 px below the card border and
overlaps the next section at 1280 px wide.

**Steps to reproduce:**

1. Open / at desktop width
2. Look at the first Deals card

**Actual result:**

The price sits outside the card and overlaps content below.

**Expected result:**

The card grows or the title is truncated so the price stays inside the card.

**Severity:** Low

**Flow:** Automated - tests/e2e/product-card-layout.spec.ts

**Evidence:** docs/evidence/BUG-014-price-outside-card.png

---

## BUG-015

**Title:** Pages are served without security headers

**Description:**

HTML responses omit Strict-Transport-Security, Content-Security-Policy,
X-Content-Type-Options and Referrer-Policy, and send X-Powered-By: Next.js. The
mp_consent cookie is also set without the Secure flag.

**Steps to reproduce:**

1. curl -sI https://qa-marketplace-app-b9mpo.ondigitalocean.app/register
2. Inspect the headers (also on / and /login)

**Actual result:**

Headers missing. X-Powered-By exposed. mp_consent without Secure.

**Expected result:**

Standard security headers present. No X-Powered-By. Cookie marked Secure.

**Severity:** Medium

**Flow:** Automated - tests/e2e/security-headers.spec.ts

**Evidence:** docs/evidence/BUG-015-security-headers.png

---

## BUG-016

**Title:** Some page loads hang for 30 to 60 seconds

**Description:**

Intermittent (~1 in 50 navigations): the page does not finish within 30 s (seen
on /, /privacy, price filters). The same URL then loads in under a second. May be
hosting rather than the app; needs server logs.

**Steps to reproduce:**

1. Navigate the main pages repeatedly
2. Watch for occasional 30-60 s hangs

**Actual result:**

Intermittent long hangs.

**Expected result:**

Pages load in a few seconds consistently.

**Severity:** Medium

**Flow:** Partial automation - tests/e2e/load-time.spec.ts (5 s timeout; fails when the hang occurs)

**Evidence:** none (intermittent hang, no visual trigger)

---

## BUG-017

**Title:** GDPR: "Download my data" leaves out addresses and orders

**Description:**

The Privacy Policy promises a JSON file with profile, saved addresses, orders and
reviews. /api/account/export returns exportedAt, profile, marketingConsent,
reviews and shop - with no addresses or orders.

**Steps to reproduce:**

1. While signed in, save an address under Account -> Addresses
2. Use "Download my data" under Privacy & data
3. Open the JSON file

**Actual result:**

No addresses or orders in the export.

**Expected result:**

File includes profile, addresses, orders and reviews.

**Severity:** High

**Flow:** Automated - tests/account/data-export.spec.ts

**Evidence:** docs/evidence/BUG-017-download-my-data.png, docs/evidence/BUG-017-export-json.png

---

## BUG-018

**Title:** The marketplace fee is more than 10%

**Description:**

Help -> Selling: a 10% fee on item sales only. On order #9998 with a $50.00 item
subtotal, the fee shows -$5.50 and the seller earns $44.50 (11%, or 10% of $55).

**Steps to reproduce:**

1. Signed in as a seller, open Seller hub -> Orders
2. Read the earnings block of any order

**Actual result:**

Fee $5.50 on $50.00; earn $44.50.

**Expected result:**

Fee = 10% of the item subtotal (e.g. $5.00 on $50.00; earn $45.00).

**Severity:** High

**Flow:** Automated - tests/account/seller-earnings.spec.ts

**Evidence:** docs/evidence/BUG-018-seller-fee.png

---

## BUG-019

**Title:** Sales tax ignores the discount

**Description:**

Help -> Payments & tax: 8% on the item subtotal after any discount. With WELCOME10
on $99.99, expected tax is $7.20 / total $97.19. The app keeps tax at $8.00 (8% of
the pre-discount subtotal) and total $97.99.

**Steps to reproduce:**

1. Add a product to the cart
2. Apply WELCOME10
3. Compare tax with 8% of the discounted subtotal

**Actual result:**

Tax is calculated on the subtotal before the discount.

**Expected result:**

Tax = 8% of the subtotal after the discount.

**Severity:** High

**Flow:** Automated - tests/account/cart.spec.ts

**Evidence:** docs/evidence/BUG-019-tax-ignores-discount.png

---

## BUG-020

**Title:** Typo "Shiping address" at checkout

**Description:**

The heading of checkout step 1 reads "Shiping address" instead of "Shipping
address".

**Steps to reproduce:**

1. Signed in, go to checkout with items in the cart
2. Read the step 1 heading

**Actual result:**

"Shiping address"

**Expected result:**

"Shipping address"

**Severity:** Low

**Flow:** Manual

**Evidence:** docs/evidence/BUG-020-shiping-typo.png

---

## BUG-021

**Title:** Adding a product that is already in the cart does not raise its quantity

**Description:**

A second "Add to cart" for the same product: POST /api/cart/items answers 201,
but the cart keeps quantity 1 and the header count does not change. No message is
shown to the shopper.

**Steps to reproduce:**

1. Add /products/p104 to the cart
2. Reload the product page
3. Click "Add to cart" again
4. Open the cart

**Actual result:**

Quantity stays 1. No feedback.

**Expected result:**

Quantity increases (or a clear message if it cannot).

**Severity:** Medium

**Flow:** Automated - tests/account/cart.spec.ts

**Evidence:** docs/evidence/BUG-021-quantity-not-raised.png

---

## BUG-022

**Title:** Express shipping is charged $14.99, labelled $9.99

**Description:**

Help -> Shipping and the Express option label say $9.99. The checkout summary
charges $14.99 for Express, regardless of cart value.

**Steps to reproduce:**

1. Put any product in the cart
2. Open checkout
3. Choose Express
4. Read the summary

**Actual result:**

Shipping (Express) $14.99

**Expected result:**

Shipping (Express) $9.99

**Severity:** High

**Flow:** Automated - tests/account/checkout.spec.ts

**Evidence:** docs/evidence/BUG-022-express-1499.png

---

## BUG-023

**Title:** A promo code stays after the subtotal drops below its minimum

**Description:**

Help -> Coupons: if the subtotal drops below the code's minimum, the code should
be removed. With TAKE5 (min $30): 3x$14 = $42 with -$5; lowering to 2x$14 = $28
keeps the $5 discount (after reload and on checkout).

**Steps to reproduce:**

1. Build a cart of at least $30 with one product
2. Apply TAKE5
3. Lower the quantity until the subtotal is under $30
4. Check the discount in the cart and at checkout

**Actual result:**

The discount stays applied below the minimum.

**Expected result:**

The code is removed when the subtotal falls below its minimum.

**Severity:** Medium

**Flow:** Automated - tests/account/cart.spec.ts

**Evidence:** docs/evidence/BUG-023-promo-below-minimum.png

---

## BUG-024

**Title:** The sign-up form accepts an email address without "@"

**Description:**

The form turns off the browser's own check (novalidate) and its own check lets
"not-an-email" through: every other empty field shows an error; the email shows
none. Whether the server refuses it was not checked (that needs the password
fields filled in).

**Steps to reproduce:**

1. Open /register
2. Type not-an-email in Email
3. Click "Create account"

**Actual result:**

No error on the email field; other empty fields fail as usual.

**Expected result:**

Error "Enter a valid email address." under the email field.

**Severity:** Medium

**Flow:** Automated - tests/e2e/registration-privacy.spec.ts

**Evidence:** docs/evidence/BUG-024-invalid-email.png

---

## BUG-025

**Title:** Primary buttons and original prices have too little contrast (WCAG AA)

**Description:**

axe-core: green primary buttons (white on #009966) ~3.65:1; struck-through
original price (#90a1b9, 12 px) ~2.63:1. WCAG 2.1 AA requires at least 4.5:1.
Affects /, /products, Deals, /register, /login, /cart. /help passes.

**Steps to reproduce:**

1. Open /, /products, /register, /login or /cart
2. Run an axe audit (or check contrast on green buttons and struck-through prices)

**Actual result:**

Buttons ~3.65:1; original prices ~2.63:1.

**Expected result:**

Text contrast of at least 4.5:1.

**Severity:** Medium

**Flow:** Automated - tests/e2e/accessibility.spec.ts

**Evidence:** docs/evidence/BUG-025-contrast.png
