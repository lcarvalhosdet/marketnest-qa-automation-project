import { hasSavedSession, missingSessionMessage } from '../../src/data/auth';
import { expect, test } from '../../src/fixtures';
import {
  addProduct,
  addToCart,
  buyableProducts,
  clickAddToCart,
  findProduct,
  ownShopName,
} from '../../src/flows/shopping';
import type { CartSummary } from '../../src/pages/cart-page';
import {
  formatPrice,
  parsePrice,
  parseSurcharge,
  percentDiscount,
  salesTax,
} from '../../src/utils/pricing';

const FREE_SHIPPING_FROM = 5_000;
const STANDARD_SHIPPING = 599;

test.describe('Cart', { tag: ['@cart', '@account'] }, () => {
  test.skip(!hasSavedSession(), missingSessionMessage);
  test.describe.configure({ mode: 'default' });

  test.beforeEach(async ({ cartPage }) => {
    await cartPage.empty();
  });

  test.afterEach(async ({ cartPage }) => {
    await cartPage.empty();
  });

  test(
    'charges the price the product page showed for the chosen option',
    {
      tag: '@known-bug',
      annotation: {
        type: 'issue',
        description: 'BUG-012: an option that costs extra changes the cart price, not the page',
      },
    },
    async ({ productListPage, productPage, cartPage }) => {
      const found = await findProduct(productListPage, productPage, async ({ id, name }) => {
        if (!(await productPage.variantPicker.isVisible())) return undefined;
        if (!(await productPage.addToCartButton.isEnabled())) return undefined;
        for (const [index, option] of (await productPage.variantOptions.all()).entries()) {
          const label = (await option.innerText()).replace(/\s+/g, ' ');
          const soldOut = await option.getByRole('radio').isDisabled();
          if (parseSurcharge(label) > 0 && !soldOut) return { id, name, label, index };
        }
        return undefined;
      });
      test.skip(!found, 'No product with an option that costs extra');
      if (!found) return;

      await productPage.variantOptions.nth(found.index).click();
      const shownPrice = parsePrice(await productPage.price.innerText());
      await addToCart(productPage);

      await cartPage.goto();
      expect(
        await cartPage.lineUnitPrices(),
        `${found.id} ${found.name}, "${found.label}": cart charges ${formatPrice(shownPrice)} like the page`,
      ).toEqual([shownPrice]);
    },
  );

  test(
    'WELCOME10 takes 10% off, and tax is 8% of the discounted subtotal',
    {
      tag: '@known-bug',
      annotation: {
        type: 'issue',
        description: 'BUG-019: tax is calculated before the discount',
      },
    },
    async ({ page, productListPage, productPage, cartPage }) => {
      const [cheapest] = await buyableProducts(page, productListPage);
      test.skip(!cheapest, 'No product the account can buy');
      if (!cheapest) return;
      await addProduct(productPage, cheapest.id);

      await cartPage.goto();
      await cartPage.applyCoupon('welcome10'); // codes aren't case-sensitive
      await expect(cartPage.couponApplied, 'lowercase code is accepted').toBeVisible();

      const summary = await cartPage.readSummary();
      expect
        .soft(summary.discount, `10% of ${formatPrice(summary.subtotal)}`)
        .toBe(percentDiscount(summary.subtotal, 10));
      expectCartMath(summary);
    },
  );

  test('TAKE5 takes $5.00 off from $30.00, and only one code applies at a time', async ({
    page,
    productListPage,
    productPage,
    cartPage,
  }) => {
    const product = (await buyableProducts(page, productListPage)).find(
      (p) => p.price >= 3_000 && p.price < 10_000,
    );
    test.skip(!product, 'No product between $30.00 and $100.00');
    if (!product) return;
    await addProduct(productPage, product.id);
    await cartPage.goto();
    const before = await cartPage.readSummary();

    await cartPage.applyCoupon('TAKE5');
    await expect(cartPage.couponApplied).toBeVisible();
    const withCode = await cartPage.readSummary();
    expect.soft(withCode.discount, 'TAKE5 is $5.00 off').toBe(500);

    await test.step('a second code needs the first one removed', async () => {
      await expect.soft(cartPage.couponInput, 'no box for a second code').toBeHidden();
      await expect.soft(cartPage.couponRemove, 'the applied code can be removed').toBeVisible();
    });

    await test.step('removing the code restores the totals', async () => {
      await cartPage.removeCoupon();
      await expect(cartPage.couponInput).toBeVisible();
      expect.soft(await cartPage.readSummary(), 'same totals as before the code').toEqual(before);
    });
  });

  test('codes below their minimum, or unknown, are refused with a reason', async ({
    page,
    productListPage,
    productPage,
    cartPage,
  }) => {
    const [cheapest] = await buyableProducts(page, productListPage);
    test.skip(!cheapest || cheapest.price >= 3_000, 'Cheapest product already reaches $30.00');
    if (!cheapest) return;
    await addProduct(productPage, cheapest.id);
    await cartPage.goto();

    for (const [code, reason] of [
      ['TAKE5', '$30.00'],
      ['SAVE20', '$100.00'],
      ['NOT-A-CODE-123', "isn't valid"],
    ] as const) {
      await test.step(code, async () => {
        await cartPage.applyCoupon(code);
        await expect.soft(cartPage.couponError, `${code}: says why`).toContainText(reason);
        await expect.soft(cartPage.couponApplied, `${code}: not applied`).toBeHidden();
      });
    }
  });

  test(
    'a code is removed when the subtotal drops below its minimum',
    {
      tag: '@known-bug',
      annotation: {
        type: 'issue',
        description: 'BUG-023: a code stays applied after the subtotal drops below its minimum',
      },
    },
    async ({ page, productListPage, productPage, cartPage }) => {
      const product = (await buyableProducts(page, productListPage)).find(
        (p) => p.price < 3_000 && p.price >= 1_000,
      );
      test.skip(!product, 'No product between $10.00 and $30.00');
      if (!product) return;
      const quantity = Math.ceil(3_000 / product.price);

      await addProduct(productPage, product.id);
      await cartPage.goto();
      for (let i = 1; i < quantity; i++) await cartPage.changeQuantity('increase');
      await cartPage.applyCoupon('TAKE5');
      await expect(cartPage.couponApplied, `TAKE5 applies at ${quantity} items`).toBeVisible();

      await cartPage.changeQuantity('decrease');
      await expect(cartPage.couponApplied, 'TAKE5 is removed below $30.00').toBeHidden({
        timeout: 20_000,
      });
    },
  );

  test('quantity changes update the totals, free shipping starts at $50.00, and the cart is kept', async ({
    page,
    productListPage,
    productPage,
    cartPage,
  }) => {
    const product = (await buyableProducts(page, productListPage)).find(
      (p) => p.price >= 1_000 && p.price < FREE_SHIPPING_FROM,
    );
    test.skip(!product, 'No product between $10.00 and $50.00');
    if (!product) return;

    await addProduct(productPage, product.id);
    await cartPage.goto();
    let quantity = 1;
    await test.step(`1 x ${formatPrice(product.price)}`, async () =>
      expectCartMath(await cartPage.readSummary(), product.price * quantity));

    while (product.price * quantity < FREE_SHIPPING_FROM) {
      await cartPage.changeQuantity('increase');
      quantity++;
      await test.step(`${quantity} x ${formatPrice(product.price)}`, async () =>
        expectCartMath(await cartPage.readSummary(), product.price * quantity));
    }

    await test.step('back down one item', async () => {
      await cartPage.changeQuantity('decrease');
      quantity--;
      expectCartMath(await cartPage.readSummary(), product.price * quantity);
    });

    await test.step('the cart is saved to the account', async () => {
      await page.reload();
      expect(await cartPage.lineQuantities()).toEqual([quantity]);
    });

    await test.step('removing the line empties the cart', async () => {
      await cartPage.removeFirstLine();
      await expect(cartPage.emptyState).toBeVisible();
    });
  });

  test(
    'adding a product that is already in the cart raises its quantity',
    {
      tag: '@known-bug',
      annotation: {
        type: 'issue',
        description: 'BUG-021: adding a product already in the cart does not change the quantity',
      },
    },
    async ({ page, productListPage, productPage, cartPage }) => {
      const [cheapest] = await buyableProducts(page, productListPage);
      test.skip(!cheapest, 'No product the account can buy');
      if (!cheapest) return;
      await addProduct(productPage, cheapest.id);
      await page.reload();
      await addToCart(productPage);

      await cartPage.goto();
      expect(await cartPage.lineQuantities(), 'one line with quantity 2').toEqual([2]);
    },
  );

  test("a shop can't buy its own items", async ({
    page,
    productListPage,
    productPage,
    cartPage,
  }) => {
    const ownShop = await ownShopName(page);
    test.skip(!ownShop, 'The signed-in account has no shop');
    if (!ownShop) return;

    await productListPage.goto({ q: ownShop });
    let ownProduct: string | undefined;
    for (const card of await productListPage.cards()) {
      if ((await card.shopName.innerText()).trim() === ownShop) ownProduct = await card.productId();
    }
    test.skip(!ownProduct, 'The shop has no listed products');
    if (!ownProduct) return;

    await productPage.goto(ownProduct);
    const response = await clickAddToCart(productPage);
    expect.soft(response.status(), 'the server refuses').toBe(403);
    expect.soft(await response.text()).toContain("can't buy items from your own shop");
    await cartPage.goto();
    await expect(cartPage.emptyState, 'nothing was added').toBeVisible();
  });
});

function expectCartMath(summary: CartSummary, expectedSubtotal?: number): void {
  const { subtotal, shipping, tax, total } = summary;
  const discount = summary.discount ?? 0;
  if (expectedSubtotal !== undefined) {
    expect.soft(subtotal, 'subtotal = unit price x quantity').toBe(expectedSubtotal);
  }
  const afterDiscount = subtotal - discount;
  expect
    .soft(shipping, `shipping for ${formatPrice(afterDiscount)} (free from $50.00)`)
    .toBe(afterDiscount >= FREE_SHIPPING_FROM ? 0 : STANDARD_SHIPPING);
  expect
    .soft(tax, `tax = 8% of ${formatPrice(afterDiscount)}, shipping not taxed`)
    .toBe(salesTax(afterDiscount));
  expect
    .soft(total, 'total = subtotal - discount + shipping + tax')
    .toBe(afterDiscount + shipping + salesTax(afterDiscount));
}
