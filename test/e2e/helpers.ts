import { expect, type Locator, type Page } from '@playwright/test'

export const ADMIN = {
  email: process.env.E2E_ADMIN_EMAIL ?? 'admin@techcorp.com',
  password: process.env.E2E_ADMIN_PASSWORD ?? 'Password123!',
}

export const EMPLOYEE = {
  email: process.env.E2E_EMPLOYEE_EMAIL ?? 'employee@techcorp.com',
  password: process.env.E2E_EMPLOYEE_PASSWORD ?? 'Password123!',
}

export const dialog = (page: Page) => page.locator('[role="dialog"]').first()

/** True when the locator appears in time; false lets a spec skip instead of fail. */
export async function visible(locator: Locator, timeout = 10_000): Promise<boolean> {
  return locator
    .first()
    .waitFor({ state: 'visible', timeout })
    .then(() => true)
    .catch(() => false)
}

/**
 * Signs in with seeded credentials. Returns false when the API is unreachable or
 * the account does not exist, so a signed-in test can skip instead of reporting
 * an application failure for a missing environment.
 */
export async function signIn(
  page: Page,
  account: { email: string; password: string },
): Promise<boolean> {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(account.email)
  await page.getByLabel(/password/i).fill(account.password)
  await page.getByRole('button', { name: /^sign in$/i }).click()

  // Race the dashboard against an inline error: waiting only for the URL makes
  // every skipped test pay the full navigation timeout, and checking visibility
  // immediately after the click races the request.
  const signedIn = await Promise.race([
    page.waitForURL(/\/$/, { timeout: 15_000 }).then(() => true).catch(() => false),
    page
      .locator('[role="alert"]')
      .filter({ hasText: /\S/ })
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 })
      .then(() => false)
      .catch(() => false),
  ])

  if (!signedIn) return false

  // The shell, not just the URL, has to be ready before a test reads the
  // sidebar or clicks a trigger.
  await expect(page.locator('aside[aria-label="Main navigation"]')).toBeVisible()

  // The "what's new" announcement opens once per browser context and would
  // intercept every click behind its overlay.
  const gotIt = page.getByRole('button', { name: 'Got it' })
  if (await visible(gotIt.first(), 5_000)) {
    await gotIt.first().click()
    await expect(gotIt.first()).toBeHidden()
  }

  return true
}

export async function openDialog(page: Page, name: string | RegExp) {
  await page.getByRole('button', { name }).first().click()
  await dialog(page).waitFor({ state: 'visible' })
  return dialog(page)
}

export async function closeDialog(page: Page) {
  await page.keyboard.press('Escape')
  await expect(dialog(page)).toBeHidden()
}

/** Horizontal overflow is the failure mode narrow viewports hit first. */
export async function expectNoOverflow(page: Page) {
  const { innerWidth, scrollWidth } = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(scrollWidth, `page overflows ${scrollWidth - innerWidth}px at ${innerWidth}px`).toBeLessThanOrEqual(
    innerWidth + 1,
  )
}

export const mainText = (page: Page) =>
  page.evaluate(() => (document.querySelector('main')?.innerText ?? '').trim())

export const tableRows = (page: Page) => page.locator('main table tbody tr').count()
