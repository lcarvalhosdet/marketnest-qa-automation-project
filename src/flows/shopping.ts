import { expect, type Page } from '@playwright/test';
import { waitForHydration } from '../components/hydration';
import { categories } from '../data/categories';
import type { ProductListPage } from '../pages/product-list-page';
import type { ProductPage } from '../pages/product-page';

export interface ListedProduct {
  id: string;
  name: string;
  shop: string;
  price: number;
}

export async function findProduct<T>(
  productListPage: ProductListPage,
  productPage: ProductPage,
  inspect: (product: { id: string; name: string }) => Promise<T | undefined>,
): Promise<T | undefined> {
  for (const category of categories) {
    await productListPage.goto({ category });
    for (const product of await productListPage.listedProducts()) {
      await productPage.goto(product.id);
      const found = await inspect(product);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

export async function ownShopName(page: Page): Promise<string | undefined> {
  await page.goto('/seller');
  const name = page.getByTestId('seller-shop-name');
  return (await name.isVisible()) ? (await name.innerText()).trim() : undefined;
}

export async function buyableProducts(
  page: Page,
  productListPage: ProductListPage,
): Promise<ListedProduct[]> {
  const ownShop = await ownShopName(page);
  const products: ListedProduct[] = [];
  await productListPage.goto({ inStock: true });
  do {
    for (const card of await productListPage.cards()) {
      if (await card.outOfStockBadge.isVisible()) continue;
      const shop = (await card.shopName.innerText()).trim();
      if (shop === ownShop) continue;
      products.push({
        id: await card.productId(),
        name: (await card.title.innerText()).trim(),
        shop,
        price: (await card.readPricing()).price,
      });
    }
  } while (await productListPage.gotoNextPage());
  return products.sort((a, b) => a.price - b.price);
}

export async function addToCart(productPage: ProductPage): Promise<void> {
  const response = await clickAddToCart(productPage);
  expect(
    response.ok(),
    `the item is added (HTTP ${response.status()}: ${(await response.text()).slice(0, 200)})`,
  ).toBe(true);
}

export async function clickAddToCart(productPage: ProductPage) {
  await waitForHydration(productPage.addToCartButton);
  const added = productPage.page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/cart/items') && response.request().method() === 'POST',
  );
  await productPage.addToCartButton.click();
  return added;
}

export async function addProduct(productPage: ProductPage, productId: string): Promise<void> {
  await productPage.goto(productId);
  await addToCart(productPage);
}
