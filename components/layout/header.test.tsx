import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { Provider } from 'react-redux'
import { makeStore } from '@/lib/redux/store'
import { Header } from './header'

// The account menu pushes to the router on sign out; nothing here navigates.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}))

/**
 * The two dropdowns must be mutually exclusive: only one panel is ever open,
 * and each trigger advertises that with aria-expanded. These tests pin that
 * behaviour down, including the outside-click dismissal.
 */
const renderHeader = () => {
  // The bell fetches pending leave requests on mount. A promise that never
  // settles keeps the test free of network traffic and act() churn.
  vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))

  render(
    <Provider store={makeStore()}>
      <Header onToggleSidebar={() => {}} />
    </Provider>,
  )

  return {
    bell: screen.getByRole('button', { name: /notifications/i }),
    account: screen.getByRole('button', { name: 'Account menu' }),
  }
}

const notificationsPanel = () => screen.queryByRole('menu', { name: 'Notifications' })
const accountPanel = () => screen.queryByRole('menu', { name: 'Account' })

beforeEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Header menus', () => {
  it('starts closed and reports aria-expanded=false on both triggers', () => {
    const { bell, account } = renderHeader()

    expect(bell).toHaveAttribute('aria-expanded', 'false')
    expect(account).toHaveAttribute('aria-expanded', 'false')
    expect(notificationsPanel()).toBeNull()
    expect(accountPanel()).toBeNull()
  })

  it('opens the notification panel from the bell', () => {
    const { bell } = renderHeader()

    fireEvent.click(bell)

    expect(notificationsPanel()).not.toBeNull()
    expect(bell).toHaveAttribute('aria-expanded', 'true')
  })

  it('opening the bell closes the account panel', () => {
    const { bell, account } = renderHeader()

    fireEvent.click(account)
    expect(accountPanel()).not.toBeNull()

    fireEvent.click(bell)

    expect(accountPanel()).toBeNull()
    expect(notificationsPanel()).not.toBeNull()
    expect(account).toHaveAttribute('aria-expanded', 'false')
    expect(bell).toHaveAttribute('aria-expanded', 'true')
  })

  it('opening the account panel closes the notification panel', () => {
    const { bell, account } = renderHeader()

    fireEvent.click(bell)
    expect(notificationsPanel()).not.toBeNull()

    fireEvent.click(account)

    expect(notificationsPanel()).toBeNull()
    expect(accountPanel()).not.toBeNull()
    expect(bell).toHaveAttribute('aria-expanded', 'false')
    expect(account).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes the notification panel on a click outside it', () => {
    const { bell } = renderHeader()

    fireEvent.click(bell)
    expect(notificationsPanel()).not.toBeNull()

    fireEvent.mouseDown(document.body)

    expect(notificationsPanel()).toBeNull()
    expect(bell).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the account panel on a click outside it', () => {
    const { account } = renderHeader()

    fireEvent.click(account)
    expect(accountPanel()).not.toBeNull()

    fireEvent.mouseDown(document.body)

    expect(accountPanel()).toBeNull()
    expect(account).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps the panel open when the click lands inside it', () => {
    const { bell } = renderHeader()

    fireEvent.click(bell)
    fireEvent.mouseDown(notificationsPanel()!)

    expect(notificationsPanel()).not.toBeNull()
    expect(bell).toHaveAttribute('aria-expanded', 'true')
  })
})
