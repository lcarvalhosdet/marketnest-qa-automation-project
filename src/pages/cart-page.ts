import { expect, type Locator, type Page } from '@playwright/test';
import { waitForHydration } from '../components/hydration';
import { parseOptional, parsePrice } from '../utils/pricing';

export interface CartSummary {
  subtotal: number;
  discount?: number;
  shipping: number;
  tax: number;
  total: number;
}

export class CartPage {
  readonly lines: Locator;
  readonly emptyState: Locator;
  readonly couponInput: Locator;
  readonly couponApply: Locator;
  readonly couponError: Locator;
  readonly couponApplied: Locator;
  readonly couponRemove: Locator;
  readonly checkoutButton: Locator;

  constructor(readonly page: Page) {
    this.lines = page.getByTestId('cart-line');
    this.emptyState = page.getByTestId('cart-empty');
    this.couponInput = page.getByTestId('coupon-input');
    this.couponApply = page.getByTestId('coupon-apply');
    this.couponError = page.getByTestId('coupon-error');
    this.couponApplied = page.getByTestId('coupon-applied');
    this.couponRemove = page.getByTestId('coupon-remove');
    this.checkoutButton = page.getByTestId('checkout-button');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart');
  }

  async applyCoupon(code: string): Promise<void> {
    await waitForHydration(this.couponApply);
    await this.couponInput.fill(code);
    const answered = this.page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/cart/coupon') && response.request().method() === 'POST',
    );
    await this.couponApply.click();
    await answered;
    await expect(this.couponApplied.or(this.couponError)).toBeVisible({ timeout: 20_000 });
  }

  async lineUnitPrices(): Promise<number[]> {
    const labels = await this.lines.getByTestId('cart-line-unit-price').allInnerTexts();
    return labels.map(parsePrice);
  }

  async changeQuantity(direction: 'increase' | 'decrease'): Promise<void> {
    const line = this.lines.first();
    const quantity = line.getByTestId('cart-qty-input');
    const expected = Number(await quantity.inputValue()) + (direction === 'increase' ? 1 : -1);
    const button = line.getByTestId(`cart-qty-${direction}`);
    await waitForHydration(button);
    const saved = this.page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/cart/items') && response.request().method() === 'PATCH',
    );
    await button.click();
    expect((await saved).ok(), 'the new quantity is saved').toBe(true);
    await expect(quantity).toHaveValue(String(expected), { timeout: 20_000 });
  }

  async removeFirstLine(): Promise<void> {
    const before = await this.lines.count();
    const remove = this.lines.first().getByTestId('cart-line-remove');
    await waitForHydration(remove);
    await remove.click();
    await expect(this.lines).toHaveCount(before - 1, { timeout: 20_000 });
  }

  async removeCoupon(): Promise<void> {
    await waitForHydration(this.couponRemove);
    await this.couponRemove.click();
    await this.couponApplied.waitFor({ state: 'detached', timeout: 20_000 });
  }

  async lineQuantities(): Promise<number[]> {
    const inputs = await this.lines.getByTestId('cart-qty-input').all();
    return Promise.all(inputs.map(async (input) => Number(await input.inputValue())));
  }

  async readSummary(): Promise<CartSummary> {
    const text = (testId: string) => this.page.getByTestId(testId).allInnerTexts();
    const [subtotal, discount, shipping, tax, total] = await Promise.all([
      text('cart-subtotal'),
      text('cart-discount'),
      text('cart-shipping'),
      text('cart-tax'),
      text('cart-total'),
    ]);
    const amount = (labels: string[]) => parsePrice(labels[0] ?? '');
    return {
      subtotal: amount(subtotal),
      discount: parseOptional(discount, parsePrice),
      shipping: /free/i.test(shipping[0] ?? '') ? 0 : amount(shipping),
      tax: amount(tax),
      total: amount(total),
    };
  }

  async empty(): Promise<void> {
    await this.goto();
    await waitForHydration(this.page.getByTestId('cart-browse').or(this.checkoutButton));
    if (await this.couponRemove.isVisible()) {
      await this.couponRemove.click();
      await this.couponRemove.waitFor({ state: 'detached' });
    }
    while ((await this.lines.count()) > 0) {
      const before = await this.lines.count();
      const remove = this.lines.first().getByTestId('cart-line-remove');
      await waitForHydration(remove);
      await remove.click();
      await this.page.waitForFunction(
        (n) => document.querySelectorAll('[data-testid="cart-line"]').length < n,
        before,
      );
    }
  }
}
