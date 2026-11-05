import { waitForHydration } from '../../src/components/hydration';
import { hasSavedSession, missingSessionMessage } from '../../src/data/auth';
import { expect, test } from '../../src/fixtures';

test.describe('Marketing preference', { tag: ['@gdpr', '@account'] }, () => {
  test.skip(!hasSavedSession(), missingSessionMessage);

  test('the marketing switch is saved in both directions', async ({ page, accountPage }) => {
    await accountPage.gotoProfile();
    const initial = await accountPage.marketingOptedIn();

    for (const expected of [!initial, initial]) {
      await test.step(expected ? 'turn on' : 'turn off', async () => {
        const saved = page.waitForResponse(
          (response) =>
            response.url().endsWith('/api/account') && response.request().method() === 'PATCH',
        );
        await waitForHydration(accountPage.marketingToggle);
        await accountPage.marketingToggle.click();
        expect((await saved).ok(), 'the choice is saved').toBe(true);
        await expect(accountPage.marketingToggle).toHaveAttribute('aria-checked', String(expected));
        await page.reload();
        await expect
          .soft(accountPage.marketingToggle, 'choice kept after a reload')
          .toHaveAttribute('aria-checked', String(expected));
      });
    }
  });
});
