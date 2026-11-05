import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { authFile } from './src/data/auth';

const envFile = join(__dirname, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL || 'https://qa-marketplace-app-b9mpo.ondigitalocean.app',
    testIdAttribute: 'data-testid',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'unit', testDir: './tests/unit' },

    { name: 'chromium', testDir: './tests/e2e', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testDir: './tests/e2e', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testDir: './tests/e2e', use: { ...devices['Desktop Safari'] } },

    {
      name: 'account',
      testDir: './tests/account',
      fullyParallel: false,
      timeout: 90_000,
      use: { ...devices['Desktop Chrome'], storageState: authFile },
    },
  ],
});
