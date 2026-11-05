import { waitForHydration } from '../../src/components/hydration';
import { hasSavedSession, missingSessionMessage } from '../../src/data/auth';
import { expect, test } from '../../src/fixtures';
import type { Locator } from '@playwright/test';
import type { AccountPage } from '../../src/pages/account-page';

const testAddress = {
  label: `E2E ${Date.now()}`,
  fullName: 'E2E Tester',
  line1: '1 Test Lane',
  city: 'Testville',
  state: 'NY',
  zip: '10001',
  phone: '(212) 555-0100',
};

async function saveAddress(accountPage: AccountPage) {
  await waitForHydration(accountPage.saveAddressButton);
  const answered = accountPage.page.waitForResponse(
    (response) =>
      response.url().includes('/api/account/addresses') && response.request().method() !== 'GET',
  );
  await accountPage.saveAddressButton.click();
  return answered;
}

async function deleteAddress(accountPage: AccountPage, card: Locator): Promise<void> {
  const remove = card.getByTestId('address-delete');
  await waitForHydration(remove);
  await remove.click();
  await accountPage.confirmDeleteAddressButton.click();
}

test.describe('Saved addresses', { tag: ['@account', '@gdpr'] }, () => {
  test.skip(!hasSavedSession(), missingSessionMessage);

  test('an empty address is refused, field by field', async ({ accountPage }) => {
    await accountPage.gotoAddresses();
    const before = await accountPage.addressCards.count();
    await waitForHydration(accountPage.addAddressButton);
    await accountPage.addAddressButton.click();

    const response = await saveAddress(accountPage);
    expect(response.status(), 'the server refuses it').toBe(400);
    for (const field of ['line1', 'city', 'state', 'zip', 'phone']) {
      await expect.soft(accountPage.addressError(field), `error under "${field}"`).toBeVisible();
    }
    await accountPage.page.reload();
    await expect(accountPage.addressCards, 'nothing was saved').toHaveCount(before);
  });

  test.afterEach(async ({ accountPage }) => {
    await accountPage.gotoAddresses();
    const leftovers = accountPage.addressCards.filter({ hasText: 'E2E ' });
    while ((await leftovers.count()) > 0) {
      const before = await leftovers.count();
      await deleteAddress(accountPage, leftovers.first());
      await expect(leftovers).toHaveCount(before - 1, { timeout: 20_000 });
    }
  });

  test('an address can be added, corrected and deleted', async ({ accountPage }) => {
    test.slow(); // three saves, each can take several seconds
    await accountPage.gotoAddresses();
    const card = accountPage.addressCard(testAddress.label);

    await test.step('add', async () => {
      await waitForHydration(accountPage.addAddressButton);
      await accountPage.addAddressButton.click();
      await accountPage.fillAddress(testAddress);
      expect((await saveAddress(accountPage)).ok(), 'saved').toBe(true);
      await expect(card).toContainText(testAddress.line1);
    });

    await test.step('correct the city', async () => {
      const edit = card.getByTestId('address-edit');
      await waitForHydration(edit);
      await edit.click();
      await accountPage.fillAddress({ city: 'Newtown' });
      expect((await saveAddress(accountPage)).ok(), 'saved').toBe(true);
      await accountPage.page.reload();
      await expect(card, 'the correction is kept').toContainText('Newtown');
    });

    await test.step('delete', async () => {
      await deleteAddress(accountPage, card);
      await expect(card, 'the address is gone').toHaveCount(0, { timeout: 20_000 });
    });
  });
});
