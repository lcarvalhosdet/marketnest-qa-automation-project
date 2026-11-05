import type { BrowserContext } from '@playwright/test';
import { CookieBanner } from '../../src/components/cookie-banner';
import { expect, test } from '../../src/fixtures';

test.use({ autoDismissCookieBanner: false });

// Set by Cloudflare hosting, not by the app.
const infrastructureCookies = new Set(['__cf_bm']);

async function appCookies(context: BrowserContext) {
  return (await context.cookies()).filter((cookie) => !infrastructureCookies.has(cookie.name));
}

test.describe('Cookie consent', { tag: ['@gdpr', '@cookies'] }, () => {
  test('loads nothing from other sites before consent', async ({ page, baseURL }) => {
    const appHost = new URL(baseURL ?? '').host;
    const thirdParty: string[] = [];
    page.on('request', (request) => {
      const host = new URL(request.url()).host;
      if (host && host !== appHost) thirdParty.push(request.url());
    });

    for (const path of ['/', '/products', '/help', '/register', '/login']) {
      await test.step(path, async () => {
        await page.goto(path);
        await page.waitForLoadState('load');
      });
    }
    expect(thirdParty, 'no requests to other hosts (analytics, ads, fonts...)').toEqual([]);
  });

  test('stores no cookies or local data before consent', async ({
    page,
    context,
    homePage,
    cookieBanner,
  }) => {
    await homePage.goto();
    await expect(cookieBanner.root, 'asks for consent on the first visit').toBeVisible();

    expect.soft(await appCookies(context), 'no cookies before a choice').toEqual([]);
    expect
      .soft(await page.evaluate(() => Object.keys(localStorage)), 'no localStorage entries')
      .toEqual([]);
  });

  test('offers both choices on the first layer, side by side', async ({
    homePage,
    cookieBanner,
  }) => {
    await homePage.goto();
    await expect.soft(cookieBanner.rejectButton).toBeVisible();
    await expect.soft(cookieBanner.acceptButton).toBeVisible();
    await expect.soft(cookieBanner.policyLink).toHaveAttribute('href', '/help#cookies');
  });

  test(
    '"Reject non-essential" is remembered on the next pages',
    {
      tag: '@known-bug',
      annotation: {
        type: 'issue',
        description: 'BUG-003: the choice "Reject non-essential" is not remembered',
      },
    },
    async ({ page, homePage, productListPage, cookieBanner }) => {
      await homePage.goto();
      await cookieBanner.rejectButton.click();
      await expect(cookieBanner.root, 'banner closes after the choice').toBeHidden();

      await test.step('next page', async () => {
        await productListPage.goto();
        await expect.soft(cookieBanner.root, 'does not ask again on /products').toBeHidden();
      });

      await test.step('reload', async () => {
        await page.reload();
        await expect.soft(cookieBanner.root, 'does not ask again after a reload').toBeHidden();
      });
    },
  );

  test('"Reject non-essential" sets no optional cookies', async ({
    context,
    homePage,
    productListPage,
    cookieBanner,
  }) => {
    await homePage.goto();
    await cookieBanner.rejectButton.click();
    await productListPage.goto();

    for (const cookie of await appCookies(context)) {
      expect
        .soft(cookie.name, `cookie "${cookie.name}" is essential`)
        .toBe(CookieBanner.consentCookie);
      expect.soft(cookie.value, 'consent cookie records a rejection').not.toBe('accepted');
    }
  });

  test('"Accept all" is remembered on the next pages', async ({
    page,
    context,
    homePage,
    productListPage,
    cookieBanner,
  }) => {
    await homePage.goto();
    await cookieBanner.acceptButton.click();
    await expect(cookieBanner.root, 'banner closes after the choice').toBeHidden();

    const consent = (await appCookies(context)).find((c) => c.name === CookieBanner.consentCookie);
    expect.soft(consent?.value, 'choice stored in the consent cookie').toBe('accepted');

    await productListPage.goto();
    await expect.soft(cookieBanner.root, 'does not ask again on /products').toBeHidden();
    await page.reload();
    await expect.soft(cookieBanner.root, 'does not ask again after a reload').toBeHidden();
  });
});
