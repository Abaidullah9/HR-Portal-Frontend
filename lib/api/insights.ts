import type { AttendanceRecord } from '@/types/attendance'
import { apiClient } from './client'
import { emptyPagination, pageQuery } from './page'

export interface AttendanceSummary {
  date: string
  present: number
  late: number
  absent: number
  totalEmployees: number
  checkInRate: number | null
  lateAfter: string
}

export interface DashboardSummary {
  employees?: { total: number; active: number }
  attendance?: { presentToday: number }
  leaves?: { onLeave: number; pending: number }
}

export interface PayrollSummary {
  totalNetPay: number
  totalRecords: number
  completed: number
  pending: number
  processedRate: number
}

export interface PayrollPeriodResult {
  created: number
  skipped: number
  employees: number
}

export interface AuditLogEntry {
  _id: string
  actorName?: string
  action: string
  entity: string
  entityId?: string
  detail?: string
  createdAt: string
}

/**
 * The dashboard cards. Each group is present only when the role may read that
 * module, so the counts never change with the page of the tables.
 */
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const response = await apiClient.get<DashboardSummary>('/dashboard/summary')
  return response.data ?? {}
}

/** Every record for one day, used by the check-in bar rather than the paged table. */
export async function fetchAttendanceForDay(date: string): Promise<AttendanceRecord[]> {
  const response = await apiClient.get<AttendanceRecord[]>(
    `/attendance/date/${encodeURIComponent(date)}`,
  )
  return response.data ?? []
}

/** Totals for the attendance cards, independent of which page of rows is loaded. */
export async function fetchAttendanceSummary(date?: string): Promise<AttendanceSummary> {
  const query = date ? `?date=${encodeURIComponent(date)}` : ''
  const response = await apiClient.get<AttendanceSummary>(`/attendance/summary${query}`)
  if (!response.data) throw new Error('Attendance summary unavailable')
  return response.data
}

export async function fetchPayrollSummary(): Promise<PayrollSummary> {
  const response = await apiClient.get<PayrollSummary>('/payroll/summary')
  if (!response.data) throw new Error('Payroll summary unavailable')
  return response.data
}

export async function generatePayrollPeriod(
  payPeriodStart: string,
  payPeriodEnd: string,
): Promise<PayrollPeriodResult> {
  const response = await apiClient.post<PayrollPeriodResult, { payPeriodStart: string; payPeriodEnd: string }>(
    '/payroll/generate',
    { payPeriodStart, payPeriodEnd },
  )
  if (!response.data) throw new Error('Payroll period was not generated')
  return response.data
}

export async function fetchOwnEmployee<T>(): Promise<T> {
  const response = await apiClient.get<T>('/employees/me')
  if (!response.data) throw new Error('No employee record is linked to your account')
  return response.data
}

export async function fetchAuditLogs(page = 1, limit = 20) {
  const response = await apiClient.get<AuditLogEntry[]>(
    `/audit-logs${pageQuery({ page, limit })}`,
  )
  return {
    entries: response.data ?? [],
    pagination: response.pagination ?? emptyPagination(limit),
  }
}
