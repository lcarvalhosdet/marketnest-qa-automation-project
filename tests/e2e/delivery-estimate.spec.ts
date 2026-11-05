import { expect, test } from '../../src/fixtures';
import { addBusinessDays, formatArrivalDate, todayIn } from '../../src/utils/delivery';

const deliveryTimes = { standard: 5, express: 2 } as const;
const weekend = /^(Saturday|Sunday)\b/;

test.describe(
  'Delivery estimate',
  {
    tag: ['@product', '@shipping', '@known-bug'],
    annotation: {
      type: 'issue',
      description: 'BUG-013: delivery estimates count calendar days and can fall on a weekend',
    },
  },
  () => {
    test('product page shows arrival dates in business days', async ({
      productListPage,
      productPage,
    }) => {
      await productListPage.goto({ sort: 'newest' });
      const [first] = await productListPage.listedProducts();
      expect(first, 'catalog lists a product').toBeDefined();
      if (!first) return;

      await productPage.goto(first.id);
      const shown = await productPage.readArrivalDates();
      const orderDate = todayIn('America/New_York');

      for (const method of ['standard', 'express'] as const) {
        await test.step(method, () => {
          const expected = formatArrivalDate(addBusinessDays(orderDate, deliveryTimes[method]));
          expect
            .soft(shown[method], `${method}: ${deliveryTimes[method]} business days from today`)
            .toBe(expected);
          expect.soft(shown[method], `${method}: not on a weekend`).not.toMatch(weekend);
        });
      }
    });
  },
);
