import { hasSavedSession, missingSessionMessage } from '../../src/data/auth';
import { expect, test } from '../../src/fixtures';
import { formatPrice, marketplaceFee } from '../../src/utils/pricing';

test.describe(
  'Seller earnings',
  {
    tag: ['@seller', '@account', '@known-bug'],
    annotation: {
      type: 'issue',
      description: 'BUG-018: the marketplace fee is more than 10% of the item subtotal',
    },
  },
  () => {
    test.skip(!hasSavedSession(), missingSessionMessage);

    test('every order charges 10% of the item subtotal', async ({ sellerOrdersPage }) => {
      await sellerOrdersPage.goto();
      const orders = await sellerOrdersPage.readEarnings();
      test.skip(orders.length === 0, 'The signed-in account has no seller orders');

      for (const { order, itemSubtotal, fee, earned } of orders) {
        await test.step(order, () => {
          const expectedFee = marketplaceFee(itemSubtotal);
          expect
            .soft(fee, `${order}: fee is 10% of ${formatPrice(itemSubtotal)}`)
            .toBe(expectedFee);
          expect
            .soft(earned, `${order}: seller earns the subtotal minus the fee`)
            .toBe(itemSubtotal - expectedFee);
        });
      }
    });
  },
);
