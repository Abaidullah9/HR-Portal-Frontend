export const APP_NAME = 'HR Portal'

/** Page titles for the document title and the route-level focus target. */
export const ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/me': 'My workspace',
  '/employees': 'Employees',
  '/attendance': 'Attendance',
  '/leaves': 'Leave',
  '/payroll': 'Payroll',
  '/recruitment': 'Recruitment',
  '/performance': 'Performance',
  '/organization': 'Organization',
  '/organization/chart': 'Organization chart',
  '/reports': 'Reports',
  '/audit': 'Audit trail',
  '/settings': 'Settings',
  '/settings/roles': 'Roles and permissions',
  '/login': 'Sign in',
  '/signup': 'Sign up',
}

export const titleForPath = (pathname: string): string => {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]
  if (/^\/employees\/[^/]+$/.test(pathname)) return 'Employee profile'
  return 'Page not found'
}
