import { test as base } from '@playwright/test';
import { CookieBanner } from '../components/cookie-banner';
import { SiteFooter } from '../components/site-footer';
import { HomePage } from '../pages/home-page';
import { ProductListPage } from '../pages/product-list-page';
import { ProductPage } from '../pages/product-page';
import { RegisterPage } from '../pages/register-page';
import { AccountPage } from '../pages/account-page';
import { CartPage } from '../pages/cart-page';
import { SellerOrdersPage } from '../pages/seller-orders-page';
import { CheckoutPage } from '../pages/checkout-page';
import { ShopPage } from '../pages/shop-page';

interface PageObjects {
  checkoutPage: CheckoutPage;
  shopPage: ShopPage;
  accountPage: AccountPage;
  cartPage: CartPage;
  sellerOrdersPage: SellerOrdersPage;
  cookieBanner: CookieBanner;
  siteFooter: SiteFooter;
  homePage: HomePage;
  productListPage: ProductListPage;
  productPage: ProductPage;
  registerPage: RegisterPage;
}

interface Options {
  // Consent specs set this to false.
  autoDismissCookieBanner: boolean;
}

export const test = base.extend<PageObjects & Options>({
  autoDismissCookieBanner: [true, { option: true }],

  page: async ({ page, autoDismissCookieBanner }, use) => {
    if (autoDismissCookieBanner) {
      // BUG-003: reject is not remembered, so the banner comes back on every navigation.
      const banner = new CookieBanner(page);
      await page.addLocatorHandler(banner.root, async () => {
        await banner.rejectButton.click();
      });
    }
    await use(page);
  },
  cookieBanner: async ({ page }, use) => {
    await use(new CookieBanner(page));
  },
  siteFooter: async ({ page }, use) => {
    await use(new SiteFooter(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productListPage: async ({ page }, use) => {
    await use(new ProductListPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  sellerOrdersPage: async ({ page }, use) => {
    await use(new SellerOrdersPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  shopPage: async ({ page }, use) => {
    await use(new ShopPage(page));
  },
});

export { expect } from '@playwright/test';
