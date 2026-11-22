import type { PaginationMeta } from './client'

export type { PaginationMeta }

export interface PageArgs {
  page?: number
  limit?: number
  /** Employees only: matched on the server so paging and filtering agree. */
  search?: string
  /** Attendance only: filters by day before paging. */
  date?: string
}

/** Page size for the tables; pickers ask for the API maximum instead. */
export const PAGE_SIZE = 10

/** The API caps `limit` at 100, which is enough for dropdowns and pickers. */
export const PICKER_LIMIT = 100

export const emptyPagination = (limit = PAGE_SIZE): PaginationMeta => ({
  total: 0,
  page: 1,
  limit,
  totalPages: 1,
})

/** Builds `/path?page=2&limit=10&search=ann`, skipping empty values. */
export function pageQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

/** One page of results plus the totals the pager needs. */
export interface Page<T> {
  data: T[]
  pagination?: PaginationMeta
}
