import { expect, test } from '../../src/fixtures';

const privatePages = ['/account', '/account/addresses', '/account/privacy', '/orders', '/checkout'];

test.describe('Signed-out access', { tag: ['@gdpr', '@security'] }, () => {
  for (const path of privatePages) {
    test(`${path} sends a guest to sign in`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(path)}$`));
    });
  }

  test('the data export API refuses a guest', async ({ request }) => {
    const response = await request.get('/api/account/export');
    expect(response.status()).toBe(401);
    expect(await response.text(), 'no personal data in the answer').not.toContain('"profile"');
  });
});
