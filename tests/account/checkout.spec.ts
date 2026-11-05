import { waitForHydration } from '../../src/components/hydration';
import { hasSavedSession, missingSessionMessage } from '../../src/data/auth';
import { expect, test } from '../../src/fixtures';
import { addProduct, buyableProducts } from '../../src/flows/shopping';
import { parseShippingPrice } from '../../src/pages/checkout-page';
import { formatPrice } from '../../src/utils/pricing';

const EXPRESS_PRICE = 999;

test.describe('Checkout', { tag: ['@checkout', '@account'] }, () => {
  test.skip(!hasSavedSession(), missingSessionMessage);
  test.describe.configure({ mode: 'default' });

  test.beforeEach(async ({ page, cartPage, productListPage, productPage, checkoutPage }) => {
    await cartPage.empty();
    const [cheapest] = await buyableProducts(page, productListPage);
    test.skip(!cheapest, 'No product the account can buy');
    if (!cheapest) return;
    await addProduct(productPage, cheapest.id);
    await checkoutPage.goto();
    await waitForHydration(checkoutPage.placeOrderButton);
  });

  test.afterEach(async ({ cartPage }) => {
    await cartPage.empty();
  });

  test('the default saved address is preselected', async ({ checkoutPage }) => {
    const saved = await checkoutPage.savedAddressOptions.count();
    test.skip(saved === 0, 'The account has no saved address');
    await expect(checkoutPage.savedAddressOptions.first().getByRole('radio')).toBeChecked();
  });

  test('switching to Express changes only the shipping line, which is not taxed', async ({
    checkoutPage,
  }) => {
    await expect(checkoutPage.standardOption.getByRole('radio')).toBeChecked();
    const standard = await checkoutPage.readSummary();

    await checkoutPage.expressOption.click();
    await expect(checkoutPage.expressOption.getByRole('radio')).toBeChecked();
    const express = await checkoutPage.readSummary();

    expect.soft(express.subtotal, 'same subtotal').toBe(standard.subtotal);
    expect.soft(express.tax, 'same tax: shipping is not taxed').toBe(standard.tax);
    expect
      .soft(express.total - standard.total, 'total changes by the shipping difference')
      .toBe(express.shipping - standard.shipping);
  });

  test(
    'Express costs $9.99, as its label and the Help page say',
    {
      tag: '@known-bug',
      annotation: {
        type: 'issue',
        description: 'BUG-022: checkout charges $14.99 for Express, labelled $9.99',
      },
    },
    async ({ checkoutPage }) => {
      const label = parseShippingPrice(await checkoutPage.expressPrice.innerText());
      expect.soft(label, 'Express label').toBe(EXPRESS_PRICE);

      await checkoutPage.expressOption.click();
      await expect(checkoutPage.expressOption.getByRole('radio')).toBeChecked();
      const { shipping } = await checkoutPage.readSummary();
      expect.soft(shipping, `summary charges the ${formatPrice(label)} shown`).toBe(label);
    },
  );

  test('Standard shipping in the summary matches its label', async ({ checkoutPage }) => {
    const label = parseShippingPrice(await checkoutPage.standardPrice.innerText());
    expect((await checkoutPage.readSummary()).shipping).toBe(label);
  });

  test('"Place order" with empty card details shows errors and places no order', async ({
    page,
    checkoutPage,
  }) => {
    const sent: string[] = [];
    page.on('request', (request) => {
      if (request.method() !== 'GET') sent.push(`${request.method()} ${request.url()}`);
    });

    await checkoutPage.placeOrderButton.click();

    for (const input of await checkoutPage.cardInputs.all()) {
      const field = await input.getAttribute('data-testid');
      await expect
        .soft(input, `${field} is marked invalid`)
        .toHaveAttribute('aria-invalid', 'true');
    }
    await expect(page, 'stays on checkout').toHaveURL(/\/checkout$/);
    expect(sent, 'nothing is sent to the server').toEqual([]);
  });
});
