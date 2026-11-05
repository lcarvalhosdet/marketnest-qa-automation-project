import { hasSavedSession, missingSessionMessage } from '../../src/data/auth';
import { expect, test } from '../../src/fixtures';

test.describe('Download my data', { tag: ['@gdpr', '@account'] }, () => {
  test.skip(!hasSavedSession(), missingSessionMessage);

  test(
    'contains every kind of data the Privacy Policy lists',
    {
      tag: '@known-bug',
      annotation: {
        type: 'issue',
        description: 'BUG-017: the data export leaves out saved addresses and orders',
      },
    },
    async ({ request, accountPage }) => {
      const response = await request.get('/api/account/export');
      expect(response.status(), 'export is available').toBe(200);
      const data: Record<string, unknown> = await response.json();

      for (const section of ['profile', 'addresses', 'orders', 'reviews']) {
        await test.step(section, () => {
          expect.soft(Object.keys(data), `export has "${section}"`).toContain(section);
        });
      }

      await test.step('every saved address is exported', async () => {
        await accountPage.gotoAddresses();
        const saved = await accountPage.addressCards.count();
        const exported = Array.isArray(data.addresses) ? data.addresses.length : 0;
        expect.soft(exported, `${saved} saved address(es) in the export`).toBe(saved);
      });
    },
  );

  test('the exported profile and marketing choice match the account', async ({
    request,
    accountPage,
  }) => {
    await accountPage.gotoProfile();
    const email = (await accountPage.sidebarEmail.innerText()).trim();
    const optedIn = await accountPage.marketingOptedIn();

    const data = await (await request.get('/api/account/export')).json();
    expect.soft(data.profile?.email, 'profile email').toBe(email);
    expect.soft(data.marketingConsent?.emailOffers, 'marketing choice').toBe(optedIn);
  });

  test('is sent as a private download', async ({ request }) => {
    const response = await request.get('/api/account/export');
    const headers = response.headers();
    expect.soft(headers['content-disposition'], 'downloads as a file').toMatch(/^attachment;/);
    expect.soft(headers['content-type'], 'is JSON').toMatch(/application\/json/);
    expect.soft(headers['cache-control'], 'is never cached').toMatch(/no-store/);
  });
});
