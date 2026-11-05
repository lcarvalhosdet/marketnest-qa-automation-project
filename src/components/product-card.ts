import type { Locator } from '@playwright/test';
import {
  type DisplayedPricing,
  parseDiscountBadge,
  parseOptional,
  parsePrice,
} from '../utils/pricing';

export class ProductCard {
  readonly title: Locator;
  readonly shopName: Locator;
  readonly price: Locator;
  readonly compareAtPrice: Locator;
  readonly discountBadge: Locator;
  readonly outOfStockBadge: Locator;
  readonly rating: Locator;

  constructor(readonly root: Locator) {
    this.rating = root.locator('[aria-label$="out of 5 stars"]');
    this.title = root.getByTestId('product-card-title');
    this.shopName = root.getByTestId('product-card-shop');
    this.price = root.getByTestId('product-card-price');
    this.compareAtPrice = root.getByTestId('product-card-compare-price');
    this.discountBadge = root.getByTestId('discount-badge');
    this.outOfStockBadge = root.getByTestId('out-of-stock-badge');
  }

  async productId(): Promise<string> {
    const id = await this.root.getAttribute('data-product-id');
    if (!id) throw new Error('Product card has no data-product-id attribute');
    return id;
  }

  async describe(): Promise<string> {
    return `${await this.productId()} ${await this.title.innerText()}`;
  }

  async readPricing(): Promise<DisplayedPricing> {
    const [price, compareAtPrice, discountBadge] = await Promise.all([
      this.price.innerText(),
      this.compareAtPrice.allInnerTexts(),
      this.discountBadge.allInnerTexts(),
    ]);
    return {
      price: parsePrice(price),
      compareAtPrice: parseOptional(compareAtPrice, parsePrice),
      discountPercent: parseOptional(discountBadge, parseDiscountBadge),
    };
  }
}

export async function toProductCards(cards: Locator): Promise<ProductCard[]> {
  return (await cards.all()).map((card) => new ProductCard(card));
}
