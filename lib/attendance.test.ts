import { describe, it, expect } from 'vitest'
import { dayKey, formatTime, isLate, recordEmployeeId, todayKey } from './attendance'

describe('todayKey', () => {
  it('uses the local calendar day', () => {
    expect(todayKey(new Date(2026, 4, 9, 23, 30))).toBe('2026-05-09')
    expect(todayKey(new Date(2026, 4, 9, 0, 5))).toBe('2026-05-09')
  })
})

describe('dayKey', () => {
  it('reduces a timestamp to its local day', () => {
    expect(dayKey(new Date(2026, 4, 9, 15, 0).toISOString())).toBe('2026-05-09')
  })

  it('returns empty for missing values', () => {
    expect(dayKey(undefined)).toBe('')
  })
})

describe('isLate', () => {
  it('counts arrivals after 09:15 as late', () => {
    expect(isLate(new Date(2026, 4, 9, 9, 15).toISOString())).toBe(false)
    expect(isLate(new Date(2026, 4, 9, 9, 16).toISOString())).toBe(true)
    expect(isLate(new Date(2026, 4, 9, 8, 40).toISOString())).toBe(false)
  })

  it('is false without a check-in', () => {
    expect(isLate(undefined)).toBe(false)
    expect(isLate('not-a-date')).toBe(false)
  })
})

describe('formatTime', () => {
  it('shows a dash for missing values', () => {
    expect(formatTime(undefined)).toBe('--')
  })
})

describe('recordEmployeeId', () => {
  it('reads an id from a populated or plain employee field', () => {
    expect(
      recordEmployeeId({
        _id: 'a1',
        date: '2026-05-09',
        employeeId: { _id: 'e9', employeeCode: 'E9', name: 'A', email: 'a@b.c', position: 'Dev', departmentId: '', joinDate: '', isActive: true } as never,
      }),
    ).toBe('e9')
    expect(recordEmployeeId({ _id: 'a1', date: '2026-05-09', employeeId: 'e7' })).toBe('e7')
  })
})
