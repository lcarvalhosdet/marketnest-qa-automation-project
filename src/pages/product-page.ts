import type { Locator, Page, Response } from '@playwright/test';
import { toProductCards } from '../components/product-card';
import {
  type DisplayedPricing,
  parseDiscountBadge,
  parseOptional,
  parsePrice,
} from '../utils/pricing';

export interface ProductPagePricing extends DisplayedPricing {
  savings?: number;
}

export interface ArrivalDates {
  standard: string;
  express: string;
}

export class ProductPage {
  readonly title: Locator;
  readonly notFound: Locator;
  readonly price: Locator;
  readonly compareAtPrice: Locator;
  readonly discountBadge: Locator;
  readonly savings: Locator;
  readonly stockStatus: Locator;
  readonly variantPicker: Locator;
  readonly variantOptions: Locator;
  readonly selectedVariant: Locator;
  readonly addToCartButton: Locator;
  readonly quantityInput: Locator;
  readonly quantityIncrease: Locator;
  readonly quantityDecrease: Locator;
  readonly reviewAuthors: Locator;
  readonly standardDelivery: Locator;
  readonly expressDelivery: Locator;
  readonly relatedProducts: Locator;
  readonly relatedProductCards: Locator;

  constructor(readonly page: Page) {
    this.title = page.getByTestId('product-title');
    this.notFound = page.getByTestId('product-not-found');
    this.price = page.getByTestId('product-price');
    this.compareAtPrice = page.getByTestId('product-compare-price');
    this.discountBadge = page.getByTestId('product-discount-badge');
    this.savings = page.getByTestId('product-savings');
    this.stockStatus = page.getByTestId('stock-status');
    this.variantPicker = page.getByTestId('variant-picker');
    this.variantOptions = this.variantPicker.getByTestId(/^variant-option-/);
    this.selectedVariant = page.getByTestId('selected-variant');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.quantityInput = page.getByTestId('qty-input');
    this.quantityIncrease = page.getByTestId('qty-increase');
    this.quantityDecrease = page.getByTestId('qty-decrease');
    this.reviewAuthors = page.getByTestId('review-list').getByTestId('review-author');
    this.standardDelivery = page.getByTestId('delivery-standard');
    this.expressDelivery = page.getByTestId('delivery-express');
    this.relatedProducts = page.getByTestId('related-products');
    this.relatedProductCards = this.relatedProducts.getByTestId('product-card');
  }

  async goto(productId: string): Promise<Response | null> {
    return this.page.goto(`/products/${productId}`);
  }

  async readPricing(): Promise<ProductPagePricing> {
    const [price, compareAtPrice, discountBadge, savings] = await Promise.all([
      this.price.innerText(),
      this.compareAtPrice.allInnerTexts(),
      this.discountBadge.allInnerTexts(),
      this.savings.allInnerTexts(),
    ]);
    return {
      price: parsePrice(price),
      compareAtPrice: parseOptional(compareAtPrice, parsePrice),
      discountPercent: parseOptional(discountBadge, parseDiscountBadge),
      savings: parseOptional(savings, parsePrice),
    };
  }

  async readArrivalDates(): Promise<ArrivalDates> {
    const arrival = async (line: Locator) => {
      const text = await line.innerText();
      const match = /arrives by\s+(.+)$/.exec(text.trim());
      if (!match?.[1]) throw new Error(`No arrival date in "${text}"`);
      return match[1].trim();
    };
    return {
      standard: await arrival(this.standardDelivery),
      express: await arrival(this.expressDelivery),
    };
  }

  async relatedProductIds(): Promise<string[]> {
    const cards = await toProductCards(this.relatedProductCards);
    return Promise.all(cards.map((card) => card.productId()));
  }
}
