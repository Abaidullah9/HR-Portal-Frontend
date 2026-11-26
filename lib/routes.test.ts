import { describe, expect, it } from 'vitest'
import { titleForPath } from './routes'

describe('titleForPath', () => {
  it('names the nested organization and settings screens', () => {
    expect(titleForPath('/organization/chart')).toBe('Organization chart')
    expect(titleForPath('/settings/roles')).toBe('Roles and permissions')
  })

  it('names an employee detail page instead of calling it missing', () => {
    expect(titleForPath('/employees/6b07dbd6b83fa0bd0e2d65de')).toBe('Employee profile')
  })

  it('still reports an unknown route as missing', () => {
    expect(titleForPath('/does-not-exist')).toBe('Page not found')
  })
})
