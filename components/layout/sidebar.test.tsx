import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Provider } from 'react-redux'
import { makeStore } from '@/lib/redux/store'
import { setCredentials } from '@/lib/redux/slices/authSlice'
import type { AuthUser } from '@/types/auth'
import { Sidebar } from './sidebar'

vi.mock('next/navigation', () => ({ usePathname: () => '/' }))

const makeUser = (roleName: string) =>
  ({
    _id: 'u1',
    name: 'Test User',
    email: 'test@techcorp.com',
    roleId: { _id: 'r1', roleName },
    isActive: true,
  }) as AuthUser

const renderSidebar = (roleName: string) => {
  const store = makeStore()
  store.dispatch(setCredentials({ user: makeUser(roleName) }))
  render(
    <Provider store={store}>
      <Sidebar />
    </Provider>,
  )
}

beforeEach(() => {
  cleanup()
})

describe('Sidebar module visibility', () => {
  it('hides Payroll and Reports from an Employee, who would get a 403', () => {
    renderSidebar('Employee')
    expect(screen.queryByRole('link', { name: /payroll/i })).toBeNull()
    expect(screen.queryByRole('link', { name: /reports/i })).toBeNull()
    expect(screen.queryByRole('link', { name: /employees/i })).toBeNull()
  })

  it('keeps the destinations an Employee can read', () => {
    renderSidebar('Employee')
    expect(screen.getByRole('link', { name: /attendance/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /leave/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /settings/i })).toBeTruthy()
  })

  it('shows Payroll to HR but not Attendance, which HR has no module for', () => {
    renderSidebar('HR')
    expect(screen.getByRole('link', { name: /payroll/i })).toBeTruthy()
    expect(screen.queryByRole('link', { name: /attendance/i })).toBeNull()
  })

  it('shows Manager performance and attendance but no payroll', () => {
    renderSidebar('Manager')
    expect(screen.getByRole('link', { name: /performance/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /attendance/i })).toBeTruthy()
    expect(screen.queryByRole('link', { name: /payroll/i })).toBeNull()
  })

  it('shows Admin every module', () => {
    renderSidebar('Admin')
    for (const label of [/employees/i, /attendance/i, /payroll/i, /recruitment/i, /reports/i]) {
      expect(screen.getByRole('link', { name: label })).toBeTruthy()
    }
  })
})
