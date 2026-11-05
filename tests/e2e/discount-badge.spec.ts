import { expect, test } from '../../src/fixtures';
import type { ProductPagePricing } from '../../src/pages/product-page';
import {
  type DisplayedPricing,
  expectedBadgePercent,
  formatPrice,
  percentOff,
} from '../../src/utils/pricing';

test.describe(
  'Discount badge',
  {
    tag: ['@deals', '@known-bug'],
    annotation: {
      type: 'issue',
      description: 'BUG-001: the badge is calculated over the sale price, not the original price',
    },
  },
  () => {
    test('deals page: every badge matches the real discount', async ({ productListPage }) => {
      await productListPage.goto({ onSale: true });
      await expect(productListPage.productCards, 'deals page lists products').not.toHaveCount(0);

      for (const card of await productListPage.cards()) {
        const product = await card.describe();
        const pricing = await card.readPricing();

        await test.step(product, () => expectBadgeToMatchRealDiscount(product, pricing));
      }
    });

    test('home page deals section: every badge matches the real discount', async ({ homePage }) => {
      await homePage.goto();
      await expect(homePage.dealCards, 'home page shows deals').not.toHaveCount(0);

      for (const card of await homePage.deals()) {
        const product = await card.describe();
        const pricing = await card.readPricing();

        await test.step(product, () => expectBadgeToMatchRealDiscount(product, pricing));
      }
    });

    test('product page: badge and savings match the real discount', async ({
      productListPage,
      productPage,
    }) => {
      await productListPage.goto({ onSale: true });
      await expect(productListPage.productCards, 'deals page lists products').not.toHaveCount(0);

      for (const { id, name } of await productListPage.listedProducts()) {
        const product = `${id} ${name}`;

        await test.step(product, async () => {
          await productPage.goto(id);
          const pricing = await productPage.readPricing();
          expectBadgeToMatchRealDiscount(product, pricing);
          expectSavingsToMatch(product, pricing);
        });
      }
    });
  },
);

function expectBadgeToMatchRealDiscount(product: string, pricing: DisplayedPricing): void {
  const { price, compareAtPrice, discountPercent } = pricing;
  expect.soft(compareAtPrice, `${product}: shows the original price`).toBeDefined();
  expect.soft(discountPercent, `${product}: shows a discount badge`).toBeDefined();
  if (compareAtPrice === undefined || discountPercent === undefined) return;

  const realDiscount = percentOff(price, compareAtPrice).toFixed(1);
  expect
    .soft(
      discountPercent,
      `${product}: ${formatPrice(price)} instead of ${formatPrice(compareAtPrice)} is ${realDiscount}% off`,
    )
    .toBe(expectedBadgePercent(price, compareAtPrice));
}

function expectSavingsToMatch(product: string, pricing: ProductPagePricing): void {
  const { price, compareAtPrice, savings } = pricing;
  if (compareAtPrice === undefined) return;

  expect
    .soft(
      savings,
      `${product}: "You save" equals ${formatPrice(compareAtPrice)} - ${formatPrice(price)} (in cents)`,
    )
    .toBe(compareAtPrice - price);
}
