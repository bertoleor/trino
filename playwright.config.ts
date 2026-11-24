import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [['html'], ['list']],
  workers: process.env.CI ? 1 : 4,
  timeout: 120_000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    viewport: { width: 1920, height: 1080 },
    // Security & accessibility
    screenshot: 'only-on-failure',
    colorScheme: 'light',
  },
  projects: [
    {
      name: 'Chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        headless: process.env.CI === 'true',
      },
    },
    {
      name: 'Firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        headless: process.env.CI === 'true',
      },
    },
    {
      name: 'WebKit',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
        headless: process.env.CI === 'true',
      },
    },
  ],
})
