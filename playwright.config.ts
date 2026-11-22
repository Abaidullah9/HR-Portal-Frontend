import { defineConfig, devices } from '@playwright/test'

/**
 * Browser smoke tests against a running frontend. The suite starts `next dev`
 * itself; sign-in flows additionally need the API at NEXT_PUBLIC_API_URL with
 * seeded users, and skip themselves when the login form cannot reach it.
 */
export default defineConfig({
  testDir: './test/e2e',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run dev -- -p 3000',
        url: 'http://localhost:3000/login',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
