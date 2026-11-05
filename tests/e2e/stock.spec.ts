import { expect, test } from '../../src/fixtures';
import { findProduct } from '../../src/flows/shopping';

test.describe('Stock limits', { tag: '@product' }, () => {
  test('an out-of-stock product can be seen but not added to the cart', async ({
    productListPage,
    productPage,
  }) => {
    let outOfStock: string | undefined;
    await productListPage.goto();
    do {
      for (const card of await productListPage.cards()) {
        if (await card.outOfStockBadge.isVisible()) outOfStock ??= await card.productId();
      }
    } while (!outOfStock && (await productListPage.gotoNextPage()));
    test.skip(!outOfStock, 'No product is out of stock right now');
    if (!outOfStock) return;

    await productPage.goto(outOfStock);
    await expect.soft(productPage.title, 'page is still available').toBeVisible();
    await expect.soft(productPage.stockStatus).toHaveText(/out of stock/i);
    await expect.soft(productPage.addToCartButton, '"Add to cart" is disabled').toBeDisabled();
    await expect.soft(productPage.quantityIncrease, 'quantity is locked').toBeDisabled();
  });

  test('a sold-out option cannot be chosen', async ({ productListPage, productPage }) => {
    const found = await findProduct(productListPage, productPage, async ({ id }) => {
      for (const option of await productPage.variantOptions.all()) {
        if (await option.getByRole('radio').isDisabled()) {
          return { id, label: (await option.innerText()).replace(/\s+/g, ' ') };
        }
      }
      return undefined;
    });
    test.skip(!found, 'No product has a sold-out option right now');
    if (!found) return;

    const soldOut = productPage.variantOptions.filter({ hasText: found.label.split('(')[0] });
    const before = await productPage.selectedVariant.innerText();
    await soldOut.first().click({ force: true });
    await expect(productPage.selectedVariant, `${found.id}: "${found.label}"`).toHaveText(before);
  });

  test('the quantity cannot go above the items left', async ({ productListPage, productPage }) => {
    const found = await findProduct(productListPage, productPage, async ({ id }) => {
      const left = /Only (\d+) left/i.exec(await productPage.stockStatus.innerText());
      return left?.[1] && (await productPage.addToCartButton.isEnabled())
        ? { id, left: Number(left[1]) }
        : undefined;
    });
    test.skip(!found, 'No product shows "Only N left" right now');
    if (!found) return;

    for (let i = 1; i < found.left; i++) await productPage.quantityIncrease.click();
    await expect(productPage.quantityInput, `${found.id}: up to ${found.left}`).toHaveValue(
      String(found.left),
    );
    await expect(productPage.quantityIncrease, 'no more than what is left').toBeDisabled();
  });
});
