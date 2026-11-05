import type { Locator, Page } from '@playwright/test';

export class RegisterPage {
  readonly form: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly confirmPassword: Locator;
  readonly acceptTerms: Locator;
  readonly acceptTermsError: Locator;
  readonly marketingOptIn: Locator;
  readonly submitButton: Locator;
  readonly termsLink: Locator;
  readonly privacyLink: Locator;

  constructor(readonly page: Page) {
    this.form = page.getByTestId('register-form');
    this.firstName = page.getByTestId('register-first-name');
    this.lastName = page.getByTestId('register-last-name');
    this.email = page.getByTestId('register-email');
    this.password = page.getByTestId('register-password');
    this.confirmPassword = page.getByTestId('register-confirm-password');
    this.acceptTerms = page.getByTestId('register-accept-terms');
    this.acceptTermsError = page.getByTestId('register-accept-terms-error');
    this.marketingOptIn = page.getByTestId('register-marketing');
    this.submitButton = page.getByTestId('register-submit');
    this.termsLink = this.form.getByRole('link', { name: 'Terms of Service' });
    this.privacyLink = this.form.getByRole('link', { name: 'Privacy Policy' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/register');
  }
}
