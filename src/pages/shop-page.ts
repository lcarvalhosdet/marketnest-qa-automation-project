import type { Locator, Page, Response } from '@playwright/test';
import { type ProductCard, toProductCards } from '../components/product-card';

export class ShopPage {
  readonly name: Locator;
  readonly productCount: Locator;
  readonly productCards: Locator;
  readonly notFound: Locator;

  constructor(readonly page: Page) {
    this.name = page.getByTestId('shop-name');
    this.productCount = page.getByTestId('shop-product-count');
    this.productCards = page.getByTestId('product-grid').getByTestId('product-card');
    this.notFound = page.getByTestId('shop-not-found');
  }

  async goto(path: string): Promise<Response | null> {
    return this.page.goto(path);
  }

  async cards(): Promise<ProductCard[]> {
    return toProductCards(this.productCards);
  }
}
