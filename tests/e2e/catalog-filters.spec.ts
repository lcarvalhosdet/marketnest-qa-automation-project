import type { ProductCard } from '../../src/components/product-card';
import { expect, test } from '../../src/fixtures';
import type { CatalogFilters, ProductListPage } from '../../src/pages/product-list-page';
import { parseStarRating } from '../../src/utils/catalog';
import { formatPrice } from '../../src/utils/pricing';

async function forEveryResult(
  productListPage: ProductListPage,
  filters: CatalogFilters,
  check: (card: ProductCard, product: string) => Promise<void>,
): Promise<number> {
  await productListPage.goto(filters);
  let checked = 0;
  do {
    for (const card of await productListPage.cards()) {
      const product = await card.describe();
      await test.step(product, () => check(card, product));
      checked++;
    }
  } while (await productListPage.gotoNextPage());
  return checked;
}

test.describe('Catalog filters', { tag: '@catalog' }, () => {
  test('"4 stars & up" lists only products rated 4 or more', async ({ productListPage }) => {
    const checked = await forEveryResult(productListPage, { rating: 4 }, async (card, product) => {
      const rating = parseStarRating((await card.rating.getAttribute('aria-label')) ?? '');
      expect.soft(rating, `${product}: rated 4 or more`).toBeGreaterThanOrEqual(4);
    });
    expect(checked, 'filter returns products').toBeGreaterThan(0);
  });

  test('"In stock" lists no out-of-stock product', async ({ productListPage }) => {
    const checked = await forEveryResult(
      productListPage,
      { inStock: true },
      async (card, product) => {
        await expect.soft(card.outOfStockBadge, `${product}: in stock`).toBeHidden();
      },
    );
    expect(checked, 'filter returns products').toBeGreaterThan(0);
  });

  test('"Deals" lists only products with an original price', async ({ productListPage }) => {
    const checked = await forEveryResult(
      productListPage,
      { onSale: true },
      async (card, product) => {
        const { compareAtPrice } = await card.readPricing();
        expect.soft(compareAtPrice, `${product}: shows an original price`).toBeDefined();
      },
    );
    expect(checked, 'filter returns products').toBeGreaterThan(0);
  });

  test('a price range lists only products inside it', async ({ productListPage }) => {
    const [min, max] = [2_000, 5_000];
    const checked = await forEveryResult(
      productListPage,
      { minPrice: min, maxPrice: max },
      async (card, product) => {
        const { price } = await card.readPricing();
        expect
          .soft(price, `${product}: ${formatPrice(price)} ≥ ${formatPrice(min)}`)
          .toBeGreaterThanOrEqual(min);
        expect
          .soft(price, `${product}: ${formatPrice(price)} ≤ ${formatPrice(max)}`)
          .toBeLessThanOrEqual(max);
      },
    );
    expect(checked, 'range returns products').toBeGreaterThan(0);
  });

  test('a minimum above the maximum finds nothing', async ({ productListPage }) => {
    await productListPage.goto({ minPrice: 5_000, maxPrice: 2_000 });
    await expect(productListPage.resultsSummary).toHaveText(/no products found/i);
    await expect(productListPage.productCards).toHaveCount(0);
  });

  test('"Top rated" orders products from the best rating down, across pages', async ({
    productListPage,
  }) => {
    let previous: number | undefined;
    await forEveryResult(productListPage, { sort: 'rating' }, async (card, product) => {
      if ((await card.rating.count()) === 0) return;
      const label = (await card.rating.getAttribute('aria-label')) ?? '';
      const rating = parseStarRating(label);
      if (previous !== undefined) {
        expect
          .soft(rating, `${product}: not rated above the product before`)
          .toBeLessThanOrEqual(previous);
      }
      previous = rating;
    });
  });
});
