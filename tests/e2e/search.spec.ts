import { categories } from '../../src/data/categories';
import { expect, test } from '../../src/fixtures';

const specialTerms = ['c++', 'Train Set (52', '[', '*', '?', '\\'];

const broadQueries = categories.map((slug) => slug.split('-')[0] ?? slug);

test.describe('Search', { tag: '@search' }, () => {
  test(
    'terms with special characters show results instead of an error',
    {
      tag: '@known-bug',
      annotation: {
        type: 'issue',
        description: 'BUG-009: searching for "+", "(", "[", "*", "?" or "\\" returns HTTP 500',
      },
    },
    async ({ productListPage }) => {
      for (const q of specialTerms) {
        await test.step(`"${q}"`, async () => {
          const response = await productListPage.goto({ q });
          expect.soft(response?.status(), `"${q}": page loads`).toBe(200);
          await expect
            .soft(productListPage.resultsSummary, `"${q}": shows a summary`)
            .toBeVisible({ timeout: 2_000 });
        });
      }
    },
  );

  test(
    'every result opens its product page',
    {
      tag: '@known-bug',
      annotation: {
        type: 'issue',
        description:
          'BUG-010: search lists products whose page is "We couldn\'t find that product"',
      },
    },
    async ({ productListPage, request }) => {
      test.slow();

      const results = new Map<string, string>();
      for (const q of broadQueries) {
        await productListPage.goto({ q });
        for (const { id, name } of await productListPage.listedProducts()) {
          results.set(id, `${id} ${name} (search "${q}")`);
        }
      }
      expect(results.size, 'searches return products').toBeGreaterThan(0);

      for (const [id, product] of results) {
        await test.step(product, async () => {
          const status = await request.get(`/products/${id}`, { timeout: 15_000 }).then(
            (response) => response.status(),
            () => 'no answer within 15 s',
          );
          expect.soft(status, `${product}: product page opens`).toBe(200);
        });
      }
    },
  );
});
