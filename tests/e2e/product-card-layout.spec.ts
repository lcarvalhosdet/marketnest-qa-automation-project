import { expect, test } from '../../src/fixtures';
import { toProductCards } from '../../src/components/product-card';

test.describe(
  'Product card layout',
  {
    tag: ['@layout', '@known-bug'],
    annotation: {
      type: 'issue',
      description: 'BUG-014: a long product title pushes the price out of the card',
    },
  },
  () => {
    test.use({ autoDismissCookieBanner: false });

    test('home page: every card shows its price inside the card', async ({ homePage }) => {
      await homePage.goto();
      const cards = await toProductCards(homePage.page.getByTestId('product-card'));
      expect(cards, 'home page shows product cards').not.toHaveLength(0);

      for (const card of cards) {
        const product = await card.describe();

        await test.step(product, async () => {
          const [cardBox, priceBox] = await Promise.all([
            card.root.boundingBox(),
            card.price.boundingBox(),
          ]);
          expect.soft(cardBox && priceBox, `${product}: card and price are visible`).toBeTruthy();
          if (!cardBox || !priceBox) return;
          expect
            .soft(priceBox.y + priceBox.height, `${product}: price ends inside the card`)
            .toBeLessThanOrEqual(cardBox.y + cardBox.height);
        });
      }
    });
  },
);
