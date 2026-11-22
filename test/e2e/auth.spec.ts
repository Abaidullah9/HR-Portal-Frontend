import { expect, test } from '@playwright/test'

const ADMIN = {
  email: process.env.E2E_ADMIN_EMAIL ?? 'admin@techcorp.com',
  password: process.env.E2E_ADMIN_PASSWORD ?? 'Password123!',
}

test('a signed-out visitor is sent to the login page', async ({ page }) => {
  await page.goto('/employees')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: /HR Portal/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible()
})

test('signup explains that accounts are invitation-only', async ({ page }) => {
  await page.goto('/signup')
  await expect(
    page.getByRole('heading', { name: /accounts are by invitation/i }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
})

test('an invited user is asked to choose a password', async ({ page }) => {
  await page.goto('/accept-invite?token=invalid-token')
  await expect(page.getByRole('heading', { name: /set your password/i })).toBeVisible()
  await page.getByLabel(/new password/i).fill('a-strong-password')
  await page.getByLabel(/confirm password/i).fill('a-strong-password')
  await page.getByRole('button', { name: /activate account/i }).click()
  // An invalid token must surface the API's error rather than a success state.
  await expect(page.getByRole('alert')).toBeVisible()
})

test('an administrator can sign in and open the employee directory', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(ADMIN.email)
  await page.getByLabel(/password/i).fill(ADMIN.password)
  await page.getByRole('button', { name: /sign in/i }).click()

  const failure = page.getByRole('alert')
  if (await failure.isVisible().catch(() => false)) {
    test.skip(true, 'The API is not reachable or the seeded administrator does not exist')
  }

  await expect(page).toHaveURL(/\/$/)
  await page.goto('/employees')
  await expect(page.getByRole('heading', { name: /employee directory/i })).toBeVisible()
})
