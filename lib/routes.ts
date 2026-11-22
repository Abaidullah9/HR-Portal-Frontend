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
  '/reports': 'Reports',
  '/audit': 'Audit trail',
  '/settings': 'Settings',
  '/login': 'Sign in',
  '/signup': 'Sign up',
}

export const titleForPath = (pathname: string): string => ROUTE_TITLES[pathname] ?? 'Page not found'
