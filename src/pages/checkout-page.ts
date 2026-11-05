import type { Locator, Page } from '@playwright/test';
import { parsePrice } from '../utils/pricing';

export interface CheckoutSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export class CheckoutPage {
  readonly savedAddressOptions: Locator;
  readonly standardOption: Locator;
  readonly standardPrice: Locator;
  readonly expressOption: Locator;
  readonly expressPrice: Locator;
  readonly cardInputs: Locator;
  readonly placeOrderButton: Locator;

  constructor(readonly page: Page) {
    this.savedAddressOptions = page.getByTestId('address-option');
    this.standardOption = page.getByTestId('shipping-standard');
    this.standardPrice = page.getByTestId('shipping-standard-price');
    this.expressOption = page.getByTestId('shipping-express');
    this.expressPrice = page.getByTestId('shipping-express-price');
    this.cardInputs = page
      .getByTestId('section-payment')
      .getByTestId(/^card-(number|name|expiry|cvc)$/);
    this.placeOrderButton = page.getByTestId('place-order');
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout');
  }

  async readSummary(): Promise<CheckoutSummary> {
    const read = async (testId: string) => this.page.getByTestId(testId).innerText();
    const shipping = await read('checkout-shipping');
    return {
      subtotal: parsePrice(await read('checkout-subtotal')),
      shipping: /free/i.test(shipping) ? 0 : parsePrice(shipping),
      tax: parsePrice(await read('checkout-tax')),
      total: parsePrice(await read('checkout-total')),
    };
  }
}

export function parseShippingPrice(label: string): number {
  return /free/i.test(label) ? 0 : parsePrice(label);
}
