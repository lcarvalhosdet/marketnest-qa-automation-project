import { expect, test } from '../../src/fixtures';
import type { ProductListPage } from '../../src/pages/product-list-page';

const word = /^[A-Za-z]{4,}$/;

test.describe('Search behaviour', { tag: '@search' }, () => {
  let product: { id: string; name: string; shop: string; words: [string, string] } | undefined;

  test.beforeEach(async ({ productListPage }) => {
    await productListPage.goto();
    for (const card of await productListPage.cards()) {
      const name = (await card.title.innerText()).trim();
      const words = name.split(/\s+/).filter((w) => word.test(w));
      if (words.length >= 2) {
        product = {
          id: await card.productId(),
          name,
          shop: (await card.shopName.innerText()).trim(),
          words: [words[0] ?? '', words[1] ?? ''],
        };
        break;
      }
    }
    expect(product, 'catalog has a product with a two-word title').toBeDefined();
  });

  const resultIds = async (productListPage: ProductListPage, q: string) => {
    await productListPage.goto({ q });
    return (await productListPage.listedProducts()).map((p) => p.id);
  };

  test('finds a product by its title words in any order', async ({ productListPage }) => {
    if (!product) return;
    const [first, second] = product.words;
    for (const q of [`${first} ${second}`, `${second} ${first}`]) {
      await test.step(q, async () => {
        expect
          .soft(await resultIds(productListPage, q), `"${q}" finds ${product?.name}`)
          .toContain(product?.id);
      });
    }
  });

  test('is not case-sensitive', async ({ productListPage }) => {
    if (!product) return;
    for (const q of [product.words[0].toUpperCase(), product.words[0].toLowerCase()]) {
      await test.step(q, async () => {
        expect
          .soft(await resultIds(productListPage, q), `"${q}" finds ${product?.name}`)
          .toContain(product?.id);
      });
    }
  });

  test('finds products by shop name, and only from that shop', async ({ productListPage }) => {
    if (!product) return;
    await productListPage.goto({ q: product.shop });
    const cards = await productListPage.cards();
    expect(cards, `"${product.shop}" finds products`).not.toHaveLength(0);
    expect.soft((await productListPage.listedProducts()).map((p) => p.id)).toContain(product.id);
  });

  test('a search with no match says so', async ({ productListPage }) => {
    await productListPage.goto({ q: 'qqzzxx-no-such-product' });
    await expect(productListPage.resultsSummary).toHaveText(/no products found/i);
    await expect(productListPage.productCards).toHaveCount(0);
  });

  test('an empty search lists the whole catalog', async ({ productListPage }) => {
    await productListPage.goto();
    const all = await productListPage.readSummary();
    await productListPage.goto({ q: '' });
    expect((await productListPage.readSummary()).total).toBe(all.total);
  });
});
