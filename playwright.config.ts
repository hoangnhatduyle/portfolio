import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}/portfolio/`,
    trace: 'retain-on-failure',
  },
  webServer: {
    // Tests run against the production build, the same artifact that ships to GitHub Pages.
    command: `npm run build && npx astro preview --port ${PORT} --host 127.0.0.1 --ignore-lock`,
    url: `http://127.0.0.1:${PORT}/portfolio/`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
