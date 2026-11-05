import { categories } from '../../src/data/categories';
import { expect, test } from '../../src/fixtures';
import { parseCount } from '../../src/utils/catalog';

test.describe('Catalog pages and counts', { tag: '@catalog' }, () => {
  test('every product appears once and the summary matches each page', async ({
    productListPage,
  }) => {
    await productListPage.goto();
    const seen = new Map<string, number>();
    let total: number | undefined;
    let page = 1;
    do {
      const summary = await productListPage.readSummary();
      const ids = (await productListPage.listedProducts()).map((p) => p.id);
      total = summary.total;

      await test.step(`page ${page}: ${summary.from}-${summary.to} of ${summary.total}`, () => {
        expect
          .soft(ids.length, 'cards on the page match the range')
          .toBe(summary.to - summary.from + 1);
        for (const id of ids) {
          expect.soft(seen.get(id), `${id} is not on an earlier page`).toBeUndefined();
          seen.set(id, page);
        }
      });
      page++;
    } while (await productListPage.gotoNextPage());

    expect(seen.size, 'all products of the total are listed').toBe(total);
  });

  test('category counts match the category results', async ({
    page,
    homePage,
    productListPage,
  }) => {
    test.slow(); // the home page plus one catalog page per category
    await homePage.goto();
    const tiles = new Map<string, number>();
    for (const slug of categories) {
      tiles.set(slug, parseCount(await page.getByTestId(`category-tile-${slug}`).innerText()));
    }

    for (const slug of categories) {
      await test.step(slug, async () => {
        await productListPage.goto({ category: slug });
        const { total } = await productListPage.readSummary();
        const sidebar = parseCount(await productListPage.categoryCount(slug).innerText());
        expect.soft(sidebar, `${slug}: sidebar count`).toBe(total);
        expect.soft(tiles.get(slug), `${slug}: home page tile`).toBe(total);
      });
    }
  });
});
