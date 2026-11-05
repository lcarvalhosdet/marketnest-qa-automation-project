import { waitForHydration } from '../../src/components/hydration';
import { expect, test } from '../../src/fixtures';

test.describe('Sign-up form privacy', { tag: ['@gdpr', '@registration'] }, () => {
  test.beforeEach(async ({ registerPage }) => {
    await registerPage.goto();
  });

  test(
    'marketing emails are opt-in: the box starts unticked',
    {
      tag: '@known-bug',
      annotation: {
        type: 'issue',
        description: 'BUG-004: "Email me offers and product news" is ticked by default',
      },
    },
    async ({ registerPage }) => {
      await expect(registerPage.marketingOptIn).not.toBeChecked();
    },
  );

  test('the Terms and Privacy Policy box starts unticked', async ({ registerPage }) => {
    await expect(registerPage.acceptTerms).not.toBeChecked();
  });

  test('cannot sign up without accepting the Terms and Privacy Policy', async ({
    registerPage,
  }) => {
    await registerPage.submitButton.click();
    await expect(registerPage.acceptTermsError).toBeVisible();
    for (const field of ['first-name', 'last-name', 'email', 'password', 'confirm-password']) {
      await expect
        .soft(registerPage.page.getByTestId(`register-${field}-error`), `error under ${field}`)
        .not.toBeEmpty();
    }
    await expect(registerPage.page).toHaveURL(/\/register$/);
  });

  test(
    'an invalid email address is refused before anything is sent',
    {
      tag: '@known-bug',
      annotation: {
        type: 'issue',
        description: 'BUG-024: the sign-up form accepts an email address without "@"',
      },
    },
    async ({ page, registerPage }) => {
      const sent: string[] = [];
      page.on('request', (request) => {
        if (request.method() !== 'GET') sent.push(request.url());
      });
      await waitForHydration(registerPage.submitButton);
      await registerPage.email.fill('not-an-email');
      await registerPage.submitButton.click();
      await expect(page.getByTestId('register-email-error')).toHaveText(/valid email/i);
      expect(sent, 'nothing is sent').toEqual([]);
    },
  );

  test(
    'the Terms and Privacy Policy links open existing pages',
    {
      tag: '@known-bug',
      annotation: {
        type: 'issue',
        description: 'BUG-006: the Terms of Service page does not exist (404)',
      },
    },
    async ({ registerPage, request }) => {
      for (const [name, link] of [
        ['Terms of Service', registerPage.termsLink],
        ['Privacy Policy', registerPage.privacyLink],
      ] as const) {
        await test.step(name, async () => {
          await expect(link, `${name}: is a link`).toHaveAttribute('href', /^\//);
          const href = (await link.getAttribute('href')) ?? '';
          const response = await request.get(href);
          expect.soft(response.status(), `${name}: ${href} opens`).toBe(200);
        });
      }
    },
  );
});
