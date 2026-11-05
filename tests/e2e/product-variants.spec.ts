import { categories } from '../../src/data/categories';
import { expect, test } from '../../src/fixtures';
import { formatPrice, parsePrice, parseSurcharge } from '../../src/utils/pricing';

test.describe(
  'Product options',
  {
    tag: ['@product', '@known-bug'],
    annotation: {
      type: 'issue',
      description: 'BUG-012: choosing an option that costs extra does not change the price',
    },
  },
  () => {
    test('the price includes the extra cost of the chosen option', async ({
      productListPage,
      productPage,
    }) => {
      test.setTimeout(360_000);

      for (const category of categories) {
        await productListPage.goto({ category });
        await expect
          .soft(productListPage.productCards, `${category} lists products`)
          .not.toHaveCount(0);

        for (const { id, name } of await productListPage.listedProducts()) {
          await productPage.goto(id);
          if (!(await productPage.variantPicker.isVisible())) continue;

          const product = `${category}: ${id} ${name}`;

          await test.step(product, async () => {
            const options = await productPage.variantOptions.all();
            const labels = await Promise.all(options.map((option) => option.innerText()));
            const checked = await Promise.all(
              options.map((option) => option.getByRole('radio').isChecked()),
            );
            const initialPrice = parsePrice(await productPage.price.innerText());
            const preselected = labels[checked.indexOf(true)] ?? '';
            const basePrice = initialPrice - parseSurcharge(preselected);

            for (const [index, option] of options.entries()) {
              const label = (labels[index] ?? '').replace(/\s+/g, ' ');
              if (await option.getByRole('radio').isDisabled()) continue; // sold out

              await option.click();
              const expected = basePrice + parseSurcharge(label);
              await expect
                .soft(
                  productPage.price,
                  `${product}, option "${label}": costs ${formatPrice(expected)}`,
                )
                .toHaveText(formatPrice(expected));
            }
          });
        }
      }
    });
  },
);
