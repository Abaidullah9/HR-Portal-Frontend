import { describe, it, expect } from 'vitest'
import { compareValues, nextSortState } from './table-sort'

describe('nextSortState', () => {
  it('starts ascending on a new column', () => {
    expect(nextSortState({ accessor: 'name', direction: 'desc' }, 'email')).toEqual({
      accessor: 'email',
      direction: 'asc',
    })
  })

  it('cycles asc, desc, then unsorted', () => {
    const asc = nextSortState(null, 'name')
    expect(asc).toEqual({ accessor: 'name', direction: 'asc' })
    const desc = nextSortState(asc, 'name')
    expect(desc).toEqual({ accessor: 'name', direction: 'desc' })
    expect(nextSortState(desc, 'name')).toBeNull()
  })
})

describe('compareValues', () => {
  it('compares numbers numerically, not as text', () => {
    expect(compareValues(9, 10)).toBeLessThan(0)
  })

  it('sorts text case-insensitively and numerically inside strings', () => {
    expect(compareValues('alice', 'Bob')).toBeLessThan(0)
    expect(compareValues('EMP-2', 'EMP-10')).toBeLessThan(0)
  })

  it('puts blanks last in either order', () => {
    expect(compareValues(null, 'a')).toBeGreaterThan(0)
    expect(compareValues('a', undefined)).toBeLessThan(0)
    expect(compareValues(null, null)).toBe(0)
  })
})
