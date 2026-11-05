import { expect, type Locator } from '@playwright/test';

// SSR HTML is clickable before React attaches handlers. Clicks in that window are dropped.
export async function waitForHydration(control: Locator): Promise<void> {
  await expect
    .poll(
      () => control.evaluate((el) => Object.keys(el).some((key) => key.startsWith('__reactProps'))),
      { message: 'page is interactive', timeout: 15_000 },
    )
    .toBe(true);
}
