import { devices } from '@playwright/test';
import { expect, test } from '../../src/fixtures';

const { viewport, userAgent, deviceScaleFactor, isMobile, hasTouch } = devices['Pixel 7'];
const pages = ['/', '/products', '/help', '/register', '/login', '/cart'];

test.describe('Mobile layout', { tag: '@mobile' }, () => {
  test.use({
    viewport,
    userAgent,
    deviceScaleFactor,
    isMobile,
    hasTouch,
    autoDismissCookieBanner: false,
  });

  for (const path of pages) {
    test(`${path} fits the screen width`, async ({ page }) => {
      await page.goto(path);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth, `${path}: no sideways scrolling`).toBeLessThanOrEqual(clientWidth);
    });
  }

  test('the cookie banner fits on screen and its buttons can be tapped', async ({
    homePage,
    cookieBanner,
  }) => {
    await homePage.goto();
    await expect(cookieBanner.root).toBeInViewport();
    await expect(cookieBanner.rejectButton).toBeInViewport();
    await expect(cookieBanner.acceptButton).toBeInViewport();
    await cookieBanner.rejectButton.tap();
    await expect(cookieBanner.root).toBeHidden();
  });

  test('"Add to cart" is not covered once the banner is closed', async ({
    page,
    productListPage,
    productPage,
    cookieBanner,
  }) => {
    await productListPage.goto({ inStock: true });
    const [first] = await productListPage.listedProducts();
    expect(first, 'catalog lists a product').toBeDefined();
    if (!first) return;

    await productPage.goto(first.id);
    await cookieBanner.rejectButton.tap();
    await expect(cookieBanner.root).toBeHidden();
    await productPage.addToCartButton.scrollIntoViewIfNeeded();

    const onTop = await productPage.addToCartButton.evaluate((button) => {
      const box = button.getBoundingClientRect();
      const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
      return !!hit && button.contains(hit);
    });
    expect(onTop, '"Add to cart" receives the tap').toBe(true);
    await expect(page.getByTestId('nav-cart'), 'cart icon visible in the header').toBeInViewport();
  });
});
