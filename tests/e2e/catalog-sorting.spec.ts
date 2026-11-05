import { expect, test } from '../../src/fixtures';
import { formatPrice } from '../../src/utils/pricing';

const priceSorts = [
  {
    sort: 'price-asc',
    label: 'low to high',
    inOrder: (prev: number, next: number) => next >= prev,
  },
  {
    sort: 'price-desc',
    label: 'high to low',
    inOrder: (prev: number, next: number) => next <= prev,
  },
] as const;

test.describe(
  'Catalog sorting by price',
  {
    tag: ['@catalog', '@known-bug'],
    annotation: {
      type: 'issue',
      description: 'BUG-008: price sorting uses the original price instead of the current price',
    },
  },
  () => {
    for (const { sort, label, inOrder } of priceSorts) {
      test(`"Price: ${label}" orders every product by its current price`, async ({
        productListPage,
      }) => {
        await productListPage.goto({ sort });
        await expect(productListPage.productCards, 'catalog lists products').not.toHaveCount(0);

        let previous: { product: string; price: number } | undefined;
        let pageNumber = 1;
        do {
          for (const card of await productListPage.cards()) {
            const product = await card.describe();
            const { price } = await card.readPricing();
            const before = previous;

            await test.step(`page ${pageNumber}: ${product}`, () => {
              if (!before) return;
              expect
                .soft(
                  inOrder(before.price, price),
                  `${product} (${formatPrice(price)}) comes after ${before.product} (${formatPrice(before.price)})`,
                )
                .toBe(true);
            });

            previous = { product, price };
          }
          pageNumber++;
        } while (await productListPage.gotoNextPage());
      });
    }
  },
);
