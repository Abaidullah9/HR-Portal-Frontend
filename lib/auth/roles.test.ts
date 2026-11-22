import { describe, it, expect } from 'vitest'
import { can, roleNameOf, type Capability } from './roles'
import type { AuthUser } from '@/types/auth'

/**
 * The role names below are the ones the backend actually seeds —
 * `HR Portal Backend/src/utils/seed.ts` lines 221-224:
 *   { roleName: 'Admin' }, { roleName: 'HR' },
 *   { roleName: 'Manager' }, { roleName: 'Employee' }
 * The server compares them lowercased (`src/middlewares/auth.middleware.ts:82`,
 * `src/utils/helper/ownership.ts:18`), so both casings are asserted.
 */
const SEEDED_ROLES = ['Admin', 'HR', 'Manager', 'Employee'] as const

const user = (roleId: AuthUser['roleId'], role?: string) =>
  ({ _id: '1', name: 'Test', email: 't@example.com', roleId, role, isActive: true }) as AuthUser

const withRole = (roleName: string) => user({ _id: 'r1', roleName })

const CAPABILITIES: Capability[] = [
  'manageEmployees',
  'managePayroll',
  'approveLeave',
  'manageRecruitment',
]

const granted = (roleName: string) =>
  CAPABILITIES.filter((capability) => can(withRole(roleName), capability))

describe('roleNameOf', () => {
  it('reads a populated role object, which is what GET /users/me returns', () => {
    expect(roleNameOf(withRole('HR'))).toBe('HR')
  })

  it('falls back to the plain role string', () => {
    expect(roleNameOf(user('', 'Employee'))).toBe('Employee')
  })

  it('returns null for the bare ObjectId the login response carries', () => {
    expect(roleNameOf(user('6512a1f4c0d3b2a1f4c0d3b2'))).toBeNull()
  })

  it('returns null without a user', () => {
    expect(roleNameOf(null)).toBeNull()
  })
})

describe('seeded roles map to the modules granted in seed.ts', () => {
  it('gives Admin every capability', () => {
    expect(granted('Admin')).toEqual(CAPABILITIES)
  })

  it('gives HR the Employee, Payroll, LeaveRequest and JobPosting modules', () => {
    expect(granted('HR')).toEqual(CAPABILITIES)
  })

  it('gives Manager the Employee and LeaveRequest modules but no payroll or recruitment', () => {
    // seed.ts managerModules excludes Payroll and JobPosting.
    expect(granted('Manager')).toEqual(['manageEmployees', 'approveLeave'])
  })

  it('gives Employee nothing, matching the seed excluding approveReject_LeaveRequest', () => {
    expect(granted('Employee')).toEqual([])
  })

  it('recognises every seeded name in its seeded casing', () => {
    for (const role of SEEDED_ROLES) {
      const capabilities = granted(role)
      expect(capabilities.length > 0 || role === 'Employee').toBe(true)
    }
  })

  it('matches the lowercased names the server compares against', () => {
    expect(granted('admin')).toEqual(CAPABILITIES)
    expect(granted('hr')).toEqual(CAPABILITIES)
    expect(granted('manager')).toEqual(['manageEmployees', 'approveLeave'])
    expect(granted('employee')).toEqual([])
  })

  it('tolerates surrounding and repeated whitespace', () => {
    expect(granted('  HR ')).toEqual(CAPABILITIES)
    expect(granted('Manager  ')).toEqual(['manageEmployees', 'approveLeave'])
  })
})

describe('wrapped role names fall back to the seeded word they contain', () => {
  it('treats "HR Admin" and "Human Resources" as HR', () => {
    expect(granted('HR Admin')).toEqual(CAPABILITIES)
    expect(granted('Human Resources')).toEqual(CAPABILITIES)
  })

  it('treats "Administrator" as Admin', () => {
    expect(granted('Administrator')).toEqual(CAPABILITIES)
  })

  it('treats a titled manager role as Manager', () => {
    expect(granted('Sales Manager')).toEqual(['manageEmployees', 'approveLeave'])
  })
})

describe('unknown roles grant nothing', () => {
  it.each(['Contractor', 'Guest', 'Auditor', 'Payroll Viewer', ''])(
    'offers no write action to "%s"',
    (name) => {
      expect(granted(name)).toEqual([])
    },
  )

  it('grants nothing when the role has not been resolved yet', () => {
    // A freshly logged-in user holds the bare roleId, so gating stays closed
    // until /users/me returns the populated role.
    expect(can(user('6512a1f4c0d3b2a1f4c0d3b2'), 'manageEmployees')).toBe(false)
    expect(can(null, 'manageEmployees')).toBe(false)
    expect(can(null, 'approveLeave')).toBe(false)
  })

  it('never hands a destructive action to an unrecognised role', () => {
    const destructive: Capability[] = ['manageEmployees', 'managePayroll']
    const unknownRoles = ['Contractor', 'Guest', 'Auditor', 'Payroll Viewer', '']
    for (const role of unknownRoles) {
      for (const capability of destructive) {
        expect(can(withRole(role), capability)).toBe(false)
      }
    }
  })
})
