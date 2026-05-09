import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  // 1 retry in CI to handle transient Dexie/IndexedDB init race; 0 locally.
  retries: process.env['CI'] ? 1 : 0,
  workers: 1,
  reporter: 'html',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    // Reuse running dev server locally for faster DX; always start fresh in CI.
    reuseExistingServer: !process.env['CI'],
    timeout: 60_000,
  },
});
