import type { Locator, Page } from '@playwright/test';

export interface AddressInput {
  label: string;
  fullName: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

export class AccountPage {
  readonly sidebarName: Locator;
  readonly sidebarEmail: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly saveProfileButton: Locator;
  readonly marketingToggle: Locator;
  readonly addressCards: Locator;
  readonly addAddressButton: Locator;
  readonly addressDialog: Locator;
  readonly saveAddressButton: Locator;
  readonly confirmDeleteAddressButton: Locator;
  readonly downloadDataButton: Locator;
  readonly deleteAccountButton: Locator;

  constructor(readonly page: Page) {
    this.sidebarName = page.getByTestId('account-sidebar-name');
    this.sidebarEmail = page.getByTestId('account-sidebar-email');
    this.firstName = page.getByTestId('profile-first-name');
    this.lastName = page.getByTestId('profile-last-name');
    this.saveProfileButton = page.getByTestId('profile-save');
    this.marketingToggle = page.getByTestId('marketing-toggle');
    this.addressCards = page.getByTestId('address-list').getByTestId('address-card');
    this.addAddressButton = page.getByTestId('address-add');
    this.addressDialog = page.getByTestId('address-dialog');
    this.saveAddressButton = page.getByTestId('address-save');
    this.confirmDeleteAddressButton = page.getByTestId('address-delete-confirm');
    this.downloadDataButton = page.getByTestId('privacy-download');
    this.deleteAccountButton = page.getByTestId('privacy-delete-open');
  }

  async gotoProfile(): Promise<void> {
    await this.page.goto('/account');
  }

  async gotoAddresses(): Promise<void> {
    await this.page.goto('/account/addresses');
  }

  async gotoPrivacy(): Promise<void> {
    await this.page.goto('/account/privacy');
  }

  async marketingOptedIn(): Promise<boolean> {
    return (await this.marketingToggle.getAttribute('aria-checked')) === 'true';
  }

  addressError(field: string): Locator {
    return this.page.getByTestId(`address-error-${field}`);
  }

  addressCard(label: string): Locator {
    return this.addressCards.filter({
      has: this.page.getByTestId('address-label').getByText(label, { exact: true }),
    });
  }

  async fillAddress(address: Partial<AddressInput>): Promise<void> {
    const dialog = this.addressDialog;
    const fields: [keyof AddressInput, string][] = [
      ['label', 'address-input-label'],
      ['fullName', 'address-input-full-name'],
      ['line1', 'address-input-line1'],
      ['city', 'address-input-city'],
      ['zip', 'address-input-zip'],
      ['phone', 'address-input-phone'],
    ];
    for (const [key, testId] of fields) {
      const value = address[key];
      if (value !== undefined) await dialog.getByTestId(testId).fill(value);
    }
    if (address.state) await dialog.getByTestId('address-input-state').selectOption(address.state);
  }
}
