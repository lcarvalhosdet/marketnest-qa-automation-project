import type { Locator, Page, Response } from '@playwright/test';
import { type ProductCard, toProductCards } from '../components/product-card';
import { parseResultsSummary, type ResultsSummary } from '../utils/catalog';

export interface CatalogFilters {
  q?: string;
  onSale?: boolean;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  sort?: string;
}

export class ProductListPage {
  readonly heading: Locator;
  readonly resultsSummary: Locator;
  readonly productCards: Locator;
  readonly nextPageLink: Locator;

  categoryCount(slug: string): Locator {
    return this.page.getByTestId(`category-count-${slug}`);
  }

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.resultsSummary = page.getByTestId('results-summary');
    this.productCards = page.getByTestId('product-grid').getByTestId('product-card');
    this.nextPageLink = page.getByTestId('pagination-next');
  }

  async goto(filters: CatalogFilters = {}): Promise<Response | null> {
    const query = new URLSearchParams();
    if (filters.q !== undefined) query.set('q', filters.q);
    if (filters.onSale) query.set('onSale', '1');
    if (filters.category) query.set('category', filters.category);
    if (filters.minPrice !== undefined) query.set('min', toDollars(filters.minPrice));
    if (filters.maxPrice !== undefined) query.set('max', toDollars(filters.maxPrice));
    if (filters.rating !== undefined) query.set('rating', String(filters.rating));
    if (filters.inStock) query.set('inStock', '1');
    if (filters.sort) query.set('sort', filters.sort);
    const search = query.toString();
    return this.page.goto(search ? `/products?${search}` : '/products');
  }

  async gotoNextPage(): Promise<boolean> {
    const href = (await this.nextPageLink.count())
      ? await this.nextPageLink.getAttribute('href')
      : null;
    if (!href) return false;
    await this.page.goto(href);
    return true;
  }

  async readSummary(): Promise<ResultsSummary> {
    return parseResultsSummary(await this.resultsSummary.innerText());
  }

  async cards(): Promise<ProductCard[]> {
    return toProductCards(this.productCards);
  }

  async listedProducts(): Promise<{ id: string; name: string }[]> {
    return Promise.all(
      (await this.cards()).map(async (card) => ({
        id: await card.productId(),
        name: await card.title.innerText(),
      })),
    );
  }
}

function toDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}
