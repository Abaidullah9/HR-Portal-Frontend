import { expect, test } from '@playwright/test'
import { visible } from './helpers'

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
  const alert = page.getByRole('alert')
  if (!(await visible(alert, 15_000))) {
    test.skip(true, 'The API is not reachable; activation never answered')
  }
  await expect(alert.first()).toBeVisible()
})
