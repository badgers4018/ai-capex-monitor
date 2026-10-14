import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'app/tests/e2e',
  workers: 1,
  retries: 0,
  timeout: 30000,
  reporter: [['list'], ['html', { open: 'never', outputFolder: '.local/playwright-report' }]],
  outputDir: '.local/e2e-results',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'pnpm exec tsx scripts/seed-test.ts && pnpm start',
      url: 'http://127.0.0.1:3001/health',
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command: 'pnpm dev:ui',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
});
