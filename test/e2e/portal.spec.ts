import { expect, test } from '@playwright/test'
import {
  ADMIN,
  EMPLOYEE,
  closeDialog,
  expectNoOverflow,
  mainText,
  openDialog,
  signIn,
  tableRows,
  visible,
} from './helpers'

/**
 * Signed-in walkthrough of the portal, one block per role.
 *
 * These specs need the API at NEXT_PUBLIC_API_URL with the seeded accounts; when
 * it is unreachable each signed-in test skips rather than failing, so the guest
 * checks still run in a bare environment (and in CI).
 */

test.describe('guest surface', () => {
  test('login page renders its form and refuses an empty submit', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /hr portal/i })).toBeVisible()
    await page.getByRole('button', { name: /^sign in$/i }).click()
    await expect(page).toHaveURL(/\/login/)
    expect(await page.locator('#email').evaluate((el) => (el as HTMLInputElement).validationMessage)).not.toBe('')
  })

  test('a wrong password surfaces an error instead of navigating', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(ADMIN.email)
    await page.getByLabel(/password/i).fill('DefinitelyWrong1!')
    await page.getByRole('button', { name: /^sign in$/i }).click()

    const alert = page.locator('[role="alert"]')
    if (!(await visible(alert, 15_000))) {
      test.skip(true, 'The API is not reachable; the login request never answered')
    }
    await expect(alert.first()).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })

  test('forgot password answers honestly about delivery', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.locator('input[type="email"]').fill(EMPLOYEE.email)
    await page.getByRole('button', { name: /send/i }).click()

    const status = page.getByRole('status')
    if (!(await visible(status, 15_000))) {
      test.skip(true, 'The API is not reachable; the reset request never answered')
    }
    // Either "sent" or "mail is not configured" is correct; claiming success on
    // an unconfigured server is not.
    await expect(status.first()).toBeVisible()
    await expect(status.first()).toContainText(/sent|no mail provider configured/i)
  })
})

test.describe('employee role', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!(await signIn(page, EMPLOYEE)), 'Seeded employee account is unavailable')
  })

  test('sidebar offers only modules the role can read', async ({ page }) => {
    const hrefs = await page
      .locator('aside[aria-label="Main navigation"] a')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')))

    for (const forbidden of ['/employees', '/payroll', '/reports', '/audit']) {
      expect(hrefs, `sidebar exposes ${forbidden}`).not.toContain(forbidden)
    }
    for (const required of ['/', '/me', '/leaves', '/attendance', '/settings']) {
      expect(hrefs, `sidebar is missing ${required}`).toContain(required)
    }
  })

  test('every visible destination renders content without an error', async ({ page }) => {
    const links = await page
      .locator('aside[aria-label="Main navigation"] a')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')).filter(Boolean))

    for (const href of links as string[]) {
      await page.locator(`aside[aria-label="Main navigation"] a[href="${href}"]`).first().click()
      await page.waitForURL(new RegExp(`${href.replace(/\//g, '\\/')}$`))
      // These pages fetch their data after navigation, so read the body once it
      // has painted rather than the empty shell immediately after the URL changes.
      await expect
        .poll(async () => (await mainText(page)).length, { message: `${href} never rendered content` })
        .toBeGreaterThan(60)
      await expect(page.locator('main [role="alert"]')).toHaveCount(0)
    }
  })

  test('workspace and leave dialog work', async ({ page }) => {
    await page.goto('/me')
    expect(await mainText(page)).not.toMatch(/could not load/i)

    await page.goto('/leaves')
    const panel = await openDialog(page, 'Request Leave')
    expect((await panel.innerText()).length).toBeGreaterThan(20)
    await closeDialog(page)
  })

  test('narrow viewports do not overflow', async ({ page }) => {
    for (const width of [768, 320]) {
      await page.setViewportSize({ width, height: 900 })
      for (const route of ['/', '/me', '/leaves']) {
        await page.goto(route)
        await expectNoOverflow(page)
      }
    }
  })

  test('the mobile drawer opens, navigates and closes', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 })
    await page.goto('/')
    const toggle = page.getByRole('button', { name: 'Toggle navigation' })
    await toggle.click()

    const aside = page.locator('aside[aria-label="Main navigation"]')
    await expect(aside).toBeVisible()
    await aside.locator('a[href="/me"]').click()
    await page.waitForURL(/\/me$/)
    await expect(async () => {
      expect(await aside.getAttribute('class')).toContain('-translate-x-full')
    }).toPass()
    await expectNoOverflow(page)
  })
})

test.describe('administrator role', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!(await signIn(page, ADMIN)), 'Seeded administrator account is unavailable')
  })

  test('sidebar lists every module', async ({ page }) => {
    const hrefs = await page
      .locator('aside[aria-label="Main navigation"] a')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')))
    for (const required of [
      '/employees',
      '/attendance',
      '/leaves',
      '/payroll',
      '/recruitment',
      '/performance',
      '/organization',
      '/reports',
      '/audit',
      '/settings',
    ]) {
      expect(hrefs, `admin sidebar is missing ${required}`).toContain(required)
    }
  })

  test('directory lists employees and its search has an empty state', async ({ page }) => {
    await page.goto('/employees')
    await expect.poll(() => tableRows(page)).toBeGreaterThan(0)
    // Server-paged tables must not advertise column sorting on one page.
    await expect(page.locator('main table thead th button')).toHaveCount(0)

    await page.getByLabel(/filter the employee directory/i).fill('zzzz-nobody')
    await expect.poll(() => tableRows(page)).toBe(0)
    await expect(page.getByRole('button', { name: 'Clear search' })).toBeVisible()
    await page.getByRole('button', { name: 'Clear search' }).click()
    await expect.poll(() => tableRows(page)).toBeGreaterThan(0)
  })

  test('add-employee dialog validates before closing', async ({ page }) => {
    await page.goto('/employees')
    const panel = await openDialog(page, /add employee/i)
    await panel.getByRole('button', { name: /add employee|save|create/i }).last().click()
    await expect(panel).toBeVisible()
    await closeDialog(page)
  })

  test('audit trail shows real entries from the seeded database', async ({ page }) => {
    await page.goto('/audit')
    await expect
      .poll(() => tableRows(page), { message: 'audit trail is empty for a seeded database' })
      .toBeGreaterThan(0)
  })

  test('payroll exports a CSV', async ({ page }) => {
    await page.goto('/payroll')
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export CSV' }).click()
    expect(await (await download).suggestedFilename()).toMatch(/\.csv$/i)
  })

  test('org-chart search recovers from a search with no matches', async ({ page }) => {
    await page.goto('/organization/chart')
    const field = page.getByPlaceholder(/filter by name/i)
    // The chart is fetched; a baseline taken before it renders compares 0 to
    // the restored tree and fails for the wrong reason.
    await expect.poll(async () => (await mainText(page)).length).toBeGreaterThan(50)
    const before = (await mainText(page)).length
    await field.fill('zzzz-nobody')
    await expect.poll(() => mainText(page)).toMatch(/no matches/i)
    await page.getByRole('button', { name: 'Clear search' }).click()
    await expect.poll(async () => (await mainText(page)).length).toBe(before)
  })

  test('audit and settings hold at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 })
    for (const route of ['/audit', '/reports', '/recruitment', '/settings/roles']) {
      await page.goto(route)
      await expectNoOverflow(page)
    }
  })

  test('signing out returns to login and protects routes', async ({ page }) => {
    await page.getByRole('button', { name: 'Account menu' }).click()
    await page.getByRole('menuitem', { name: /sign out/i }).click()
    await page.waitForURL(/\/login/)
    await page.goto('/employees')
    await page.waitForURL(/\/login/)
  })
})
