import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { makeStore } from '@/lib/redux/store'
import { setCredentials } from '@/lib/redux/slices/authSlice'
import type { AuthUser } from '@/types/auth'
import { CommandPalette } from './command-palette'

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

const renderPalette = (roleName: string) => {
  const store = makeStore()
  store.dispatch(
    setCredentials({
      user: {
        _id: 'u1',
        name: 'Test User',
        email: 'test@techcorp.com',
        roleId: { _id: 'r1', roleName },
        isActive: true,
      } as AuthUser,
    }),
  )
  render(
    <Provider store={store}>
      <CommandPalette />
    </Provider>,
  )
}

const openPalette = () => fireEvent.keyDown(window, { key: 'k', ctrlKey: true })

const search = (value: string) => {
  const input = screen.getByRole('combobox', { name: /search pages and people/i })
  fireEvent.change(input, { target: { value } })
  return input
}

beforeEach(() => {
  cleanup()
  pushMock.mockClear()
})

describe('CommandPalette', () => {
  it('stays closed until Ctrl+K', () => {
    renderPalette('HR')
    expect(screen.queryByRole('dialog', { name: 'Jump to' })).toBeNull()
    openPalette()
    expect(screen.getByRole('dialog', { name: 'Jump to' })).toBeTruthy()
  })

  it('navigates to a matching page on Enter', () => {
    renderPalette('HR')
    openPalette()
    const input = search('payroll')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(pushMock).toHaveBeenCalledWith('/payroll')
  })

  it('omits modules the signed-in role cannot open', async () => {
    renderPalette('Employee')
    openPalette()
    search('payroll')
    // The palette briefly reports the server search it just started.
    expect(await screen.findByText(/nothing matches/i)).toBeTruthy()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('finds pages an Employee may open', () => {
    renderPalette('Employee')
    openPalette()
    search('leave')
    expect(screen.getByRole('option', { name: /leave/i })).toBeTruthy()
  })

  it('offers employees to a role that can read the directory', () => {
    renderPalette('HR')
    openPalette()
    // No employees in the store, so only pages match.
    search('employees')
    expect(screen.getByRole('option', { name: /employees/i })).toBeTruthy()
  })
})
