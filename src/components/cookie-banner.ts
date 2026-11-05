import type { Locator, Page } from '@playwright/test';

export class CookieBanner {
  static readonly consentCookie = 'mp_consent';

  readonly root: Locator;
  readonly policyLink: Locator;
  readonly rejectButton: Locator;
  readonly acceptButton: Locator;

  constructor(readonly page: Page) {
    this.root = page.getByTestId('cookie-banner');
    this.policyLink = page.getByTestId('cookie-policy-link');
    this.rejectButton = page.getByTestId('cookie-reject');
    this.acceptButton = page.getByTestId('cookie-accept');
  }
}
