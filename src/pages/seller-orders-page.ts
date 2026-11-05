import type { Locator, Page } from '@playwright/test';
import { parsePrice } from '../utils/pricing';

export interface SellerOrderEarnings {
  order: string;
  itemSubtotal: number;
  fee: number;
  earned: number;
}

export class SellerOrdersPage {
  readonly orders: Locator;

  constructor(readonly page: Page) {
    this.orders = page.getByTestId('seller-order-row');
  }

  async goto(): Promise<void> {
    await this.page.goto('/seller/orders');
  }

  async readEarnings(): Promise<SellerOrderEarnings[]> {
    return Promise.all(
      (await this.orders.all()).map(async (row) => ({
        order: await row.getByTestId('seller-order-number').innerText(),
        itemSubtotal: parsePrice(await row.getByTestId('order-item-subtotal').innerText()),
        fee: parsePrice(await row.getByTestId('order-fee').innerText()),
        earned: parsePrice(await row.getByTestId('order-earn').innerText()),
      })),
    );
  }
}
