import { categories } from '../../src/data/categories';
import { expect, test } from '../../src/fixtures';

test.describe(
  '"You might also like"',
  {
    tag: ['@recommendations', '@known-bug'],
    annotation: {
      type: 'issue',
      description: 'BUG-002: "You might also like" lists the product being viewed',
    },
  },
  () => {
    for (const category of categories) {
      test(`${category}: never recommends the product being viewed`, async ({
        productListPage,
        productPage,
      }) => {
        await productListPage.goto({ category });
        await expect(productListPage.productCards, `${category} lists products`).not.toHaveCount(0);

        for (const { id, name } of await productListPage.listedProducts()) {
          const product = `${id} ${name}`;

          await test.step(product, async () => {
            await productPage.goto(id);
            await expect
              .soft(productPage.relatedProducts, `${product}: shows recommendations`)
              .toBeVisible();
            expect
              .soft(await productPage.relatedProductIds(), `${product}: recommends other products`)
              .not.toContain(id);
          });
        }
      });
    }
  },
);
