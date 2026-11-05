import { expect, test } from '../../src/fixtures';

test.describe('Footer links', { tag: ['@gdpr', '@navigation'] }, () => {
  test(
    'every footer link opens an existing page',
    {
      tag: '@known-bug',
      annotation: {
        type: 'issue',
        description: 'BUG-006: the Terms of Service page does not exist (404)',
      },
    },
    async ({ homePage, siteFooter, request }) => {
      await homePage.goto();
      const links = await siteFooter.readLinks();
      expect(links, 'footer has links').not.toHaveLength(0);

      const pages = new Map<string, string>();
      for (const { text, href } of links) {
        const path = href.split('#')[0] || '/';
        pages.set(path, pages.has(path) ? `${pages.get(path)}, ${text}` : text);
      }

      for (const [path, texts] of pages) {
        await test.step(`${path} (${texts})`, async () => {
          const response = await request.get(path, { timeout: 15_000 });
          expect.soft(response.status(), `${texts}: ${path} opens`).toBe(200);
        });
      }
    },
  );

  test('the Legal column links to the Privacy, Terms and Cookie policies', async ({
    homePage,
    siteFooter,
  }) => {
    await homePage.goto();
    const texts = (await siteFooter.readLinks()).map((link) => link.text);
    expect(texts).toEqual(
      expect.arrayContaining(['Privacy Policy', 'Terms of Service', 'Cookie Policy']),
    );
  });
});
