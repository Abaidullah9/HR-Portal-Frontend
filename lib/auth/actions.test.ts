import { describe, it, expect } from 'vitest'
import { can, canView } from './roles'
import type { AuthUser } from '@/types/auth'

/**
 * These action names are the ones `HR Portal Backend/src/utils/seed.ts` assigns
 * to each seeded role (see the module lists around lines 200-224). GET /users/me
 * now populates `roleId.actions`, so the client gates on exactly what the server
 * will allow instead of inferring it from the role label.
 */
const userWith = (roleName: string, names: string[]) =>
  ({
    _id: 'u1',
    name: 'Test',
    email: 't@example.com',
    roleId: {
      _id: 'r1',
      roleName,
      actions: names.map((actionName) => ({ _id: actionName, actionName })),
    },
    isActive: true,
  }) as AuthUser

const ADMIN_ACTIONS = [
  'read_Employee',
  'create_Employee',
  'delete_Employee',
  'read_Attendance',
  'read_LeaveRequest',
  'approveReject_LeaveRequest',
  'read_Payroll',
  'update_PayrollStatus',
  'read_JobPosting',
  'create_JobPosting',
  'read_Appraisal',
  'read_OrganizationSetting',
  'read_Report',
]

const HR_ACTIONS = [
  'read_Employee',
  'create_Employee',
  'delete_Employee',
  'read_LeaveRequest',
  'approveReject_LeaveRequest',
  'read_Payroll',
  'update_PayrollStatus',
  'read_JobPosting',
  'create_JobPosting',
  'read_Report',
]

const MANAGER_ACTIONS = [
  'read_Employee',
  'create_Employee',
  'delete_Employee',
  'read_Department',
  'read_Attendance',
  'read_LeaveRequest',
  'approveReject_LeaveRequest',
  'read_Appraisal',
]

const EMPLOYEE_ACTIONS = [
  'read_LeaveRequest',
  'create_LeaveRequest',
  'read_Attendance',
  'create_Attendance',
]

describe('gating from the action list', () => {
  it('grants Admin every capability and module', () => {
    const admin = userWith('Admin', ADMIN_ACTIONS)
    expect(can(admin, 'manageEmployees')).toBe(true)
    expect(can(admin, 'managePayroll')).toBe(true)
    expect(can(admin, 'approveLeave')).toBe(true)
    expect(can(admin, 'manageRecruitment')).toBe(true)
    expect(canView(admin, 'organization')).toBe(true)
  })

  it('gives HR payroll and recruitment but not attendance or performance', () => {
    const hr = userWith('HR', HR_ACTIONS)
    expect(can(hr, 'managePayroll')).toBe(true)
    expect(can(hr, 'manageRecruitment')).toBe(true)
    expect(canView(hr, 'attendance')).toBe(false)
    expect(canView(hr, 'performance')).toBe(false)
  })

  it('withholds payroll and recruitment from Manager', () => {
    const manager = userWith('Manager', MANAGER_ACTIONS)
    expect(can(manager, 'approveLeave')).toBe(true)
    expect(can(manager, 'managePayroll')).toBe(false)
    expect(can(manager, 'manageRecruitment')).toBe(false)
    expect(canView(manager, 'performance')).toBe(true)
  })

  it('withholds every write capability from Employee', () => {
    const employee = userWith('Employee', EMPLOYEE_ACTIONS)
    expect(can(employee, 'approveLeave')).toBe(false)
    expect(can(employee, 'manageEmployees')).toBe(false)
    expect(canView(employee, 'leaves')).toBe(true)
    expect(canView(employee, 'payroll')).toBe(false)
  })

  it('follows the actions even when the role is renamed or custom', () => {
    // A name none of the patterns know, with an explicit grant list.
    const custom = userWith('Regional Lead', ['read_Employee', 'read_LeaveRequest'])
    expect(can(custom, 'manageEmployees')).toBe(false)
    expect(canView(custom, 'employees')).toBe(true)
    expect(canView(custom, 'leaves')).toBe(true)
    expect(canView(custom, 'reports')).toBe(false)
  })

  it('honours a custom role with a destructively-named but narrow action set', () => {
    const auditor = userWith('Auditor', ['read_Payroll', 'read_Report'])
    expect(can(auditor, 'managePayroll')).toBe(false)
    expect(canView(auditor, 'payroll')).toBe(true)
    expect(canView(auditor, 'employees')).toBe(false)
  })

  it('treats an empty action list as authoritative, not as missing', () => {
    // A custom role with no permissions must not inherit Manager's grants just
    // because of its name.
    const emptyManager = userWith('Manager', [])
    expect(can(emptyManager, 'approveLeave')).toBe(false)
    expect(canView(emptyManager, 'employees')).toBe(false)

    const emptyAdmin = userWith('Admin', [])
    expect(can(emptyAdmin, 'managePayroll')).toBe(false)
    expect(canView(emptyAdmin, 'audit')).toBe(false)
  })

  it('falls back to the role name when the action ids were not populated', () => {
    // An array of bare ids means the populate did not happen; denying every
    // user on that basis would lock out real roles.
    const unpopulated = {
      _id: 'u3',
      name: 'Unpopulated',
      email: 'u@example.com',
      roleId: { _id: 'r3', roleName: 'HR', actions: [{ _id: 'a1' }, { _id: 'a2' }] },
      isActive: true,
    } as unknown as AuthUser
    expect(can(unpopulated, 'managePayroll')).toBe(true)
    expect(canView(unpopulated, 'attendance')).toBe(false)
  })

  it('uses the plain role string when roleId is not populated at all', () => {
    const plain = {
      _id: 'u4',
      name: 'Plain',
      email: 'p@example.com',
      roleId: '6512a1f4c0d3b2a1f4c0d3b2',
      role: 'Employee',
      isActive: true,
    } as AuthUser
    expect(can(plain, 'manageEmployees')).toBe(false)
    expect(canView(plain, 'payroll')).toBe(false)
    expect(canView(plain, 'leaves')).toBe(true)
  })

  it('gates the audit trail on read_Role', () => {
    expect(canView(userWith('Admin', ['read_Role']), 'audit')).toBe(true)
    expect(canView(userWith('Auditor', ['read_Report']), 'audit')).toBe(false)
  })

  it('falls back to the role name when no actions are present', () => {
    const legacy = {
      _id: 'u2',
      name: 'Legacy',
      email: 'l@example.com',
      roleId: { _id: 'r2', roleName: 'HR' },
      isActive: true,
    } as AuthUser
    expect(can(legacy, 'managePayroll')).toBe(true)
    expect(canView(legacy, 'attendance')).toBe(false)
  })
})
