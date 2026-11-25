import type { AttendanceRecord } from '@/types/attendance'

/** Shift start, used to tell on-time arrivals from late ones. */
export const LATE_AFTER = { hour: 9, minute: 15 }

/** Local calendar day as YYYY-MM-DD, matching what <input type="date"> yields. */
export function todayKey(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

export function dayKey(value?: string): string {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 10)
  return todayKey(parsed)
}

/** Minutes since midnight for a stored "HH:MM" policy value. */
export function policyMinutes(lateAfter = '09:15'): number {
  const [hours = LATE_AFTER.hour, minutes = LATE_AFTER.minute] = lateAfter
    .split(':')
    .map(Number)
  return hours * 60 + minutes
}

/** Late is measured against the org policy, which defaults to 09:15. */
export function isLate(checkIn?: string, lateAfter = '09:15'): boolean {
  if (!checkIn) return false
  const at = new Date(checkIn)
  if (Number.isNaN(at.getTime())) return false
  return at.getHours() * 60 + at.getMinutes() > policyMinutes(lateAfter)
}

export function formatTime(value?: string): string {
  if (!value) return '--'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/** The populated employee's name, or a placeholder when only an id came back. */
export function employeeName(record: AttendanceRecord, fallback = 'Unknown employee'): string {
  const { employeeId } = record
  return employeeId && typeof employeeId === 'object' ? employeeId.name : fallback
}

export function recordEmployeeId(record: AttendanceRecord): string {
  const { employeeId } = record
  if (employeeId && typeof employeeId === 'object') return employeeId._id
  return employeeId || ''
}
