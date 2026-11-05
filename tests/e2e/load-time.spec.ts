import { expect, test } from '../../src/fixtures';

const LOAD_BUDGET_MS = 5_000;
const pages = ['/', '/products', '/products?onSale=1', '/help', '/register'];

test.describe(
  'Load time',
  {
    tag: ['@performance', '@known-bug'],
    annotation: {
      type: 'issue',
      description: 'BUG-016: some page loads hang for 30 to 60 seconds (intermittent)',
    },
  },
  () => {
    test('main pages load within 5 seconds', async ({ page }) => {
      test.slow();
      for (const path of pages) {
        await test.step(path, async () => {
          await page.goto(path, { waitUntil: 'load', timeout: 60_000 });
          const loadMs = await page.evaluate(() => {
            const [nav] = performance.getEntriesByType(
              'navigation',
            ) as PerformanceNavigationTiming[];
            return nav ? Math.round(nav.loadEventEnd - nav.startTime) : -1;
          });
          expect
            .soft(loadMs, `${path}: loaded in ${loadMs} ms`)
            .toBeLessThanOrEqual(LOAD_BUDGET_MS);
        });
      }
    });
  },
);
