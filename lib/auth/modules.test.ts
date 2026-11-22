import { describe, it, expect } from 'vitest'
import { canView, type SidebarModule } from './roles'
import type { AuthUser } from '@/types/auth'

/**
 * Module visibility is derived from the seeded read permission lists in
 * `HR Portal Backend/src/utils/seed.ts` (roles at lines 221-224). Employee, for
 * instance, receives only LeaveRequest, Feedback, Document and Attendance, and
 * HR receives no Attendance module at all.
 */
const MODULES: SidebarModule[] = [
  'employees',
  'attendance',
  'leaves',
  'payroll',
  'recruitment',
  'performance',
  'organization',
  'reports',
  'audit',
]

const withRole = (roleName: string) =>
  ({
    _id: '1',
    name: 'Test',
    email: 't@example.com',
    roleId: { _id: 'r1', roleName },
    isActive: true,
  }) as AuthUser

const visible = (roleName: string) =>
  MODULES.filter((module) => canView(withRole(roleName), module))

describe('module visibility for the seeded roles', () => {
  it('shows Admin every gated module', () => {
    expect(visible('Admin')).toEqual(MODULES)
  })

  it('shows HR the employee, leave, payroll, recruitment and report modules', () => {
    expect(visible('HR')).toEqual(['employees', 'leaves', 'payroll', 'recruitment', 'reports'])
  })

  it('shows Manager no payroll, recruitment, report or organization module', () => {
    expect(visible('Manager')).toEqual(['employees', 'attendance', 'leaves', 'performance'])
  })

  it('shows Employee only attendance and leave, which is what it can read', () => {
    expect(visible('Employee')).toEqual(['attendance', 'leaves'])
  })

  it('matches the lowercased names the server compares', () => {
    expect(canView(withRole('employee'), 'payroll')).toBe(false)
    expect(canView(withRole('employee'), 'leaves')).toBe(true)
    expect(canView(withRole('hr'), 'attendance')).toBe(false)
  })
})

describe('module visibility edge cases', () => {
  it('keeps navigation available while the role is still unresolved', () => {
    // Transient: the session refresh will populate the role. Hiding everything
    // here would flash an almost-empty rail and break every deep link.
    const unresolved = { _id: '1', name: 'T', email: 't@x.com', roleId: '6512a1f4c0d3b2a1f4c0d3b2' } as AuthUser
    expect(canView(unresolved, 'payroll')).toBe(true)
    expect(canView(null, 'employees')).toBe(true)
  })

  it('hides every gated module from an unrecognised role', () => {
    expect(visible('Contractor')).toEqual([])
  })
})
