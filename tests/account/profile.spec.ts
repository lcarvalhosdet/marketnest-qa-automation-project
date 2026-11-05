import { waitForHydration } from '../../src/components/hydration';
import { hasSavedSession, missingSessionMessage } from '../../src/data/auth';
import { expect, test } from '../../src/fixtures';

test.describe('Profile', { tag: ['@account', '@gdpr'] }, () => {
  test.skip(!hasSavedSession(), missingSessionMessage);

  test('the name can be corrected, and the change is saved', async ({ page, accountPage }) => {
    await accountPage.gotoProfile();
    const original = await accountPage.lastName.inputValue();
    const corrected = `${original}-E2E`;

    const save = async (lastName: string) => {
      await waitForHydration(accountPage.saveProfileButton);
      await accountPage.lastName.fill(lastName);
      const saved = page.waitForResponse(
        (response) =>
          response.url().endsWith('/api/account') && response.request().method() === 'PATCH',
      );
      await accountPage.saveProfileButton.click();
      expect((await saved).ok(), `"${lastName}" is saved`).toBe(true);
      await page.reload();
    };

    try {
      await save(corrected);
      await expect.soft(accountPage.lastName, 'kept after a reload').toHaveValue(corrected);
      await expect
        .soft(accountPage.sidebarName, 'shown in the account menu')
        .toContainText(corrected);
    } finally {
      await save(original);
      await expect(accountPage.lastName, 'original name restored').toHaveValue(original);
    }
  });
});
