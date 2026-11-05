import type { Locator, Page } from '@playwright/test';

export class SiteFooter {
  readonly root: Locator;
  readonly links: Locator;

  constructor(readonly page: Page) {
    this.root = page.getByRole('contentinfo');
    this.links = this.root.getByRole('link');
  }

  async readLinks(): Promise<{ text: string; href: string }[]> {
    return Promise.all(
      (await this.links.all()).map(async (link) => ({
        text: (await link.innerText()).trim(),
        href: (await link.getAttribute('href')) ?? '',
      })),
    );
  }
}
