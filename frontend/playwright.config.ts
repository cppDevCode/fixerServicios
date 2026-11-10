import { defineConfig, devices } from '@playwright/test';

const FRONTEND_PORT = process.env.PLAYWRIGHT_PORT || '5174';
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'pnpm --dir ../backend run dev',
      url: 'http://localhost:3000/api/v1/health',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `pnpm run dev -- --port ${FRONTEND_PORT} --strictPort`,
      url: FRONTEND_URL,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
