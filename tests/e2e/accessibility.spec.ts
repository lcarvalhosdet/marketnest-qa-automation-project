import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '../../src/fixtures';

const pages = ['/', '/products', '/products?onSale=1', '/help', '/register', '/login', '/cart'];
const lowContrastPages = new Set(pages.filter((path) => path !== '/help'));

test.describe('Accessibility', { tag: '@a11y' }, () => {
  test.use({ autoDismissCookieBanner: false });

  for (const path of pages) {
    const details = lowContrastPages.has(path)
      ? {
          tag: '@known-bug',
          annotation: {
            type: 'issue',
            description: 'BUG-025: primary buttons and original prices have too little contrast',
          },
        }
      : {};
    test(
      `${path} has no serious accessibility violations`,
      details,
      async ({ page, cookieBanner }, testInfo) => {
        await page.goto(path);
        await cookieBanner.rejectButton.click();
        await expect(cookieBanner.root).toBeHidden();

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        await testInfo.attach('axe-results', {
          body: JSON.stringify(results.violations, null, 2),
          contentType: 'application/json',
        });

        const serious = results.violations.filter(
          (v) => v.impact === 'serious' || v.impact === 'critical',
        );
        for (const violation of serious) {
          const targets = violation.nodes.map((node) => node.target.join(' ')).slice(0, 5);
          expect
            .soft(targets, `${violation.impact}: ${violation.id} (${violation.help})`)
            .toEqual([]);
        }
      },
    );
  }
});
