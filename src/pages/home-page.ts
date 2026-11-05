import type { Locator, Page } from '@playwright/test';
import { type ProductCard, toProductCards } from '../components/product-card';

export class HomePage {
  readonly dealsSection: Locator;
  readonly dealCards: Locator;
  readonly newArrivalsSection: Locator;
  readonly newArrivalCards: Locator;

  constructor(readonly page: Page) {
    this.dealsSection = page.getByTestId('deals-section');
    this.dealCards = this.dealsSection.getByTestId('product-card');
    this.newArrivalsSection = page.getByTestId('new-arrivals-section');
    this.newArrivalCards = this.newArrivalsSection.getByTestId('product-card');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async deals(): Promise<ProductCard[]> {
    return toProductCards(this.dealCards);
  }
}
