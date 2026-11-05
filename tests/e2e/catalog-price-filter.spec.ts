import { categories } from '../../src/data/categories';
import { expect, test } from '../../src/fixtures';
import { formatPrice } from '../../src/utils/pricing';

test.describe(
  'Catalog price filter',
  {
    tag: ['@catalog', '@known-bug'],
    annotation: {
      type: 'issue',
      description: 'BUG-011: the maximum price filter leaves out products at exactly that price',
    },
  },
  () => {
    test('includes products priced exactly at the minimum and the maximum', async ({
      productListPage,
    }) => {
      test.slow();

      for (const category of categories) {
        await test.step(category, async () => {
          await productListPage.goto({ category });
          await expect
            .soft(productListPage.productCards, `${category} lists products`)
            .not.toHaveCount(0);
          const products = await Promise.all(
            (await productListPage.cards()).map(async (card) => ({
              product: await card.describe(),
              id: await card.productId(),
              price: (await card.readPricing()).price,
            })),
          );
          if (products.length === 0) return;

          const cheapest = products.reduce((a, b) => (b.price < a.price ? b : a));
          const dearest = products.reduce((a, b) => (b.price > a.price ? b : a));

          await productListPage.goto({ category, minPrice: cheapest.price });
          expect
            .soft(
              (await productListPage.listedProducts()).map((p) => p.id),
              `min ${formatPrice(cheapest.price)} includes ${cheapest.product}`,
            )
            .toContain(cheapest.id);

          await productListPage.goto({ category, maxPrice: dearest.price });
          expect
            .soft(
              (await productListPage.listedProducts()).map((p) => p.id),
              `max ${formatPrice(dearest.price)} includes ${dearest.product}`,
            )
            .toContain(dearest.id);
        });
      }
    });
  },
);
