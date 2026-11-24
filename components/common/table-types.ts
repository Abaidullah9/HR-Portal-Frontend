import type { ReactNode } from 'react'

export interface ColumnDef<T> {
  header: string
  accessor: keyof T
  render?: (value: any, row: T) => ReactNode
  className?: string
  /** Supply when the raw value is an object or JSX and cannot be compared. */
  sortValue?: (row: T) => string | number | null | undefined
  /** Set false for action columns, whose values have no meaningful order. */
  sortable?: boolean
}

/** Page state owned by the caller when rows come from the server. */
export interface ServerPagination {
  page: number
  pageCount: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

/** Width at which a table gives way to cards. */
export type CardBreakpoint = 'md' | 'lg' | 'xl'
