import { apiClient } from './client'
import { emptyPagination, pageQuery, PAGE_SIZE, type PaginationMeta } from './page'
import type { AttendanceRecord } from '@/types/attendance'
import type { Appraisal } from '@/types/performance'

export interface MyAttendancePage {
  records: AttendanceRecord[]
  pagination: PaginationMeta
}

/**
 * The caller's own attendance history. The server derives the employee from the
 * session, so this can never be pointed at somebody else's rows.
 */
export async function fetchMyAttendance(page = 1, limit = PAGE_SIZE): Promise<MyAttendancePage> {
  const response = await apiClient.get<AttendanceRecord[]>(
    `/attendance/me${pageQuery({ page, limit })}`,
  )
  return {
    records: response.data ?? [],
    pagination: response.pagination ?? emptyPagination(limit),
  }
}

/** The caller's own appraisals, newest review first. */
export async function fetchMyAppraisals(): Promise<Appraisal[]> {
  const response = await apiClient.get<Appraisal[]>('/appraisals/me')
  return response.data ?? []
}
