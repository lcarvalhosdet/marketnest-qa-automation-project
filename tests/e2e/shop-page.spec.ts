import { expect, test } from '../../src/fixtures';
import { parseCount } from '../../src/utils/catalog';

test.describe('Shop pages', { tag: '@shops' }, () => {
  test('each shop page lists only its own products, and the count matches', async ({
    page,
    homePage,
    shopPage,
  }) => {
    await homePage.goto();
    const links = await page
      .getByTestId('shops-section')
      .getByTestId('shop-card')
      .evaluateAll((cards) =>
        cards.map((card) => (card.closest('a') ?? card.querySelector('a'))?.getAttribute('href')),
      );
    const shops = links.filter((href): href is string => !!href);
    expect(shops, 'home page lists shops').not.toHaveLength(0);

    for (const shop of shops) {
      await test.step(shop, async () => {
        await shopPage.goto(shop);
        const name = (await shopPage.name.innerText()).trim();
        const cards = await shopPage.cards();
        expect
          .soft(parseCount(await shopPage.productCount.innerText()), `${name}: product count`)
          .toBe(cards.length);
        for (const card of cards) {
          expect
            .soft(
              (await card.shopName.innerText()).trim(),
              `${await card.describe()}: sold by ${name}`,
            )
            .toBe(name);
        }
      });
    }
  });

  test('an unknown shop shows "not found" with status 404', async ({ shopPage }) => {
    const response = await shopPage.goto('/shops/no-such-shop-e2e');
    expect(response?.status()).toBe(404);
    await expect(shopPage.notFound).toBeVisible();
  });

  test('an unknown product shows "not found" with status 404', async ({ productPage }) => {
    const response = await productPage.goto('no-such-product-e2e');
    expect(response?.status()).toBe(404);
    await expect(productPage.notFound).toBeVisible();
  });
});
