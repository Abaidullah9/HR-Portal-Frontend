import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { EmployeeTable } from './employee-table'
import type { Employee } from '@/types/employee'

/**
 * The page passes `canManage` from `usePermissions()`, which reads the role
 * grants in `lib/auth/roles.ts`. These tests pin the UI half of that chain: a
 * role without the capability never sees the delete or add affordance.
 */
const employee = {
  _id: 'e1',
  employeeCode: 'EMP-0001',
  name: 'Diana Employee',
  email: 'diana@techcorp.com',
  departmentId: 'Engineering',
  position: 'Senior software engineer',
  isActive: true,
} as unknown as Employee

const renderTable = (canManage: boolean, employees: Employee[] = [employee]) =>
  render(
    <EmployeeTable
      employees={employees}
      loading={false}
      searchTerm=""
      deletingId={null}
      canManage={canManage}
      onDelete={() => {}}
      onAdd={() => {}}
    />,
  )

beforeEach(() => {
  cleanup()
})

describe('EmployeeTable role gating', () => {
  it('offers the delete action when the role can manage employees', () => {
    renderTable(true)
    expect(screen.getByRole('button', { name: 'Delete employee' })).toBeTruthy()
  })

  it('renders no delete action when the role cannot manage employees', () => {
    renderTable(false)
    expect(screen.queryByRole('button', { name: 'Delete employee' })).toBeNull()
  })

  it('still shows the directory rows to a read-only role', () => {
    renderTable(false)
    expect(screen.getByText('Diana Employee')).toBeTruthy()
  })

  it('hides the add action in the empty state for a read-only role', () => {
    renderTable(false, [])
    expect(screen.queryByRole('button', { name: /add employee/i })).toBeNull()
    expect(screen.getByText('No employees yet')).toBeTruthy()
  })

  it('offers the add action in the empty state when the role can manage employees', () => {
    renderTable(true, [])
    expect(screen.getByRole('button', { name: /add employee/i })).toBeTruthy()
  })
})
