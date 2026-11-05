import { expect, test } from '../../src/fixtures';

const REVIEWER = /^(\p{Lu}[\p{L}'’-]+ \p{Lu}\.|Deleted user)$/u;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/;

test.describe('Personal data on public pages', { tag: ['@gdpr', '@privacy'] }, () => {
  test('reviews show only the first name and last initial', async ({
    productListPage,
    productPage,
  }) => {
    test.slow(); // opens every product of the first catalog page
    await productListPage.goto({ sort: 'rating' });
    let reviewsSeen = 0;

    for (const { id, name } of await productListPage.listedProducts()) {
      await productPage.goto(id);
      const authors = await productPage.reviewAuthors.allInnerTexts();
      if (authors.length === 0) continue;
      reviewsSeen += authors.length;

      await test.step(`${id} ${name}`, () => {
        for (const author of authors) {
          expect.soft(author.trim(), `${id}: reviewer "${author}"`).toMatch(REVIEWER);
        }
      });
    }
    expect(reviewsSeen, 'some reviews were checked').toBeGreaterThan(0);
  });

  test('shop pages show no email address or phone number', async ({ page, homePage }) => {
    await homePage.goto();
    const shopLinks = await page
      .getByTestId('shops-section')
      .getByTestId('shop-card')
      .evaluateAll((cards) =>
        cards.map((card) => (card.closest('a') ?? card.querySelector('a'))?.getAttribute('href')),
      );
    const shops = shopLinks.filter((href): href is string => !!href);
    expect(shops, 'home page lists shops').not.toHaveLength(0);

    for (const shop of shops) {
      await test.step(shop, async () => {
        await page.goto(shop);
        const html = await page.content();
        expect.soft(html.match(EMAIL)?.[0], `${shop}: no email in the page`).toBeUndefined();
        await expect
          .soft(page.locator('a[href^="mailto:"], a[href^="tel:"]'), `${shop}: no contact links`)
          .toHaveCount(0);
      });
    }
  });
});
