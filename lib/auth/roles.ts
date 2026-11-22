import type { AuthUser } from '@/types/auth'

export type Capability =
  | 'manageEmployees'
  | 'managePayroll'
  | 'approveLeave'
  | 'manageRecruitment'

/** Sidebar destinations whose reads are permission-gated on the server. */
export type SidebarModule =
  | 'employees'
  | 'attendance'
  | 'leaves'
  | 'payroll'
  | 'recruitment'
  | 'performance'
  | 'organization'
  | 'reports'
  | 'audit'

type SeededRole = 'admin' | 'hr' | 'manager' | 'employee'

/** The server action each capability needs, from the seed's action names. */
const CAPABILITY_ACTION: Record<Capability, string> = {
  manageEmployees: 'create_Employee',
  managePayroll: 'update_PayrollStatus',
  approveLeave: 'approveReject_LeaveRequest',
  manageRecruitment: 'create_JobPosting',
}

/** The read action each destination needs; every list route is authorized on it. */
const MODULE_ACTION: Record<SidebarModule, string> = {
  employees: 'read_Employee',
  attendance: 'read_Attendance',
  leaves: 'read_LeaveRequest',
  payroll: 'read_Payroll',
  recruitment: 'read_JobPosting',
  performance: 'read_Appraisal',
  organization: 'read_OrganizationSetting',
  reports: 'read_Report',
  audit: 'read_Role',
}

const ALL_MODULES = Object.keys(MODULE_ACTION) as SidebarModule[]

/**
 * Fallback for sessions whose payload carries no action list. The four role
 * names are the ones the backend seeds (`HR Portal Backend/src/utils/seed.ts`
 * lines 221-224: Admin, HR, Manager, Employee); the grants mirror the action
 * modules each seeded role receives there. The server still authorises every
 * request (`src/middlewares/authorize.middleware.ts`), so this only decides
 * what is worth showing.
 *
 * - Admin: every action.
 * - HR: Employee, Candidate, LeaveRequest, LeaveBalance, Document, JobPosting,
 *   Interview, Report, User, Payroll.
 * - Manager: Employee, Department, Attendance, Appraisal, Feedback, Team,
 *   LeaveRequest, PerformanceCycle — no payroll, no recruitment.
 * - Employee: LeaveRequest (without approveReject), Feedback, Document,
 *   Attendance — no management capability.
 */
const SEEDED_ROLE_GRANTS: Record<SeededRole, readonly Capability[]> = {
  admin: ['manageEmployees', 'managePayroll', 'approveLeave', 'manageRecruitment'],
  hr: ['manageEmployees', 'managePayroll', 'approveLeave', 'manageRecruitment'],
  manager: ['manageEmployees', 'approveLeave'],
  employee: [],
}

const ROLE_MODULES: Record<SeededRole, readonly SidebarModule[]> = {
  admin: ALL_MODULES,
  hr: ['employees', 'leaves', 'payroll', 'recruitment', 'reports'],
  manager: ['employees', 'attendance', 'leaves', 'performance'],
  employee: ['attendance', 'leaves'],
}

/**
 * Fallback for role names that wrap one of the seeded words, e.g. a custom role
 * created through `POST /roles` called "HR Admin" or "Sales Manager". Ordered:
 * the first matching word decides.
 */
const ROLE_PATTERNS: { pattern: RegExp; role: SeededRole }[] = [
  { pattern: /\bhr\b|\bhuman resources?\b/, role: 'hr' },
  { pattern: /\badmin(?:istrator)?\b/, role: 'admin' },
  { pattern: /\bmanager\b|\bsupervisor\b|\bteam lead\b|\bhead\b/, role: 'manager' },
  { pattern: /\bemployee\b|\bstaff\b|\bintern\b/, role: 'employee' },
]

const roleObject = (user: AuthUser | null | undefined) => {
  const role = user?.roleId
  return role && typeof role === 'object' ? role : null
}

/**
 * The concrete permission names the signed-in user holds, when the payload
 * carries them; null when it does not, so the role-name tables are the only
 * signal available.
 *
 * An empty array is authoritative: that role genuinely holds no permissions.
 * An array of ids without names is not — it means the populate did not happen,
 * and denying everything on that basis would lock out real users.
 */
function grantedActions(user: AuthUser | null | undefined): Set<string> | null {
  const role = roleObject(user)
  if (!role || !Array.isArray(role.actions)) return null

  const names = role.actions
    .map((action) => action?.actionName)
    .filter((name): name is string => typeof name === 'string' && name.length > 0)

  if (names.length === 0 && role.actions.length > 0) return null
  return new Set(names)
}

const normalizeRole = (name: string) => name.trim().toLowerCase().replace(/\s+/g, ' ')

function resolveRole(name: string): SeededRole | null {
  const key = normalizeRole(name)
  if (key in SEEDED_ROLE_GRANTS) return key as SeededRole
  return ROLE_PATTERNS.find(({ pattern }) => pattern.test(key))?.role ?? null
}

/** Role names arrive either as a populated object or, before `/users/me`, as a bare id. */
export function roleNameOf(user: AuthUser | null | undefined): string | null {
  const role = roleObject(user)
  if (role && typeof role.roleName === 'string') {
    const name = role.roleName.trim()
    if (name) return name
  }
  if (typeof user?.role === 'string' && user.role.trim()) return user.role.trim()
  return null
}

/**
 * Decides which write actions the UI offers. The action list wins when present;
 * otherwise the role name is used, and an unknown or missing role grants nothing
 * so a viewer is never handed a delete it cannot perform.
 */
export function can(user: AuthUser | null | undefined, capability: Capability): boolean {
  const actions = grantedActions(user)
  if (actions) return actions.has(CAPABILITY_ACTION[capability])

  const role = roleNameOf(user)
  if (!role) return false
  const resolved = resolveRole(role)
  if (!resolved) return false
  return SEEDED_ROLE_GRANTS[resolved].includes(capability)
}

/**
 * Whether to show a destination in the navigation.
 *
 * Unlike `can`, an unresolved role (no action list and no name yet) returns
 * true: that state is transient while the session refresh resolves, navigation
 * is reversible, and the pages behind the links report their own errors. An
 * unrecognised role name returns false, because it is terminal.
 */
export function canView(
  user: AuthUser | null | undefined,
  module: SidebarModule,
): boolean {
  const actions = grantedActions(user)
  if (actions) return actions.has(MODULE_ACTION[module])

  const role = roleNameOf(user)
  if (!role) return true
  const resolved = resolveRole(role)
  if (!resolved) return false
  return ROLE_MODULES[resolved].includes(module)
}
