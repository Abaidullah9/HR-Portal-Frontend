'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { compareValues, nextSortState, type SortState } from '@/lib/table-sort'
import { TablePager } from './table-pager'

export { DataTableSkeleton } from './data-table-skeleton'

export interface ColumnDef<T> {
  header: string
  accessor: keyof T
  render?: (value: any, row: T) => React.ReactNode
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

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  /** Announced by screen readers; the table has no visible title of its own. */
  caption?: string
  /** Window the rows into pages of this size. Omit to show them all. */
  pageSize?: number
  /** Rows are already one page from the API; paging is a fetch, not a slice. */
  pagination?: ServerPagination
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  caption,
  pageSize,
  pagination,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState | null>(null)
  const [page, setPage] = useState(0)
  const serverPaged = Boolean(pagination)

  // A column is sortable when it knows how to produce a comparable value, or
  // when its raw values are already primitive. Server pages are not sorted:
  // sorting one page would claim an order the dataset does not have.
  const sortableColumns = useMemo(() => {
    const set = new Set<string>()
    if (serverPaged) return set
    for (const column of columns) {
      // A column with no header text has no name to announce for its sort
      // control, so it stays unsorted (an actions column, for example).
      if (!column.header.trim() || column.sortable === false) continue
      if (column.sortValue) {
        set.add(String(column.accessor))
        continue
      }
      const sample = data.find((row) => row[column.accessor] != null)?.[column.accessor]
      const type = typeof sample
      if (type === 'string' || type === 'number' || type === 'boolean') {
        set.add(String(column.accessor))
      }
    }
    return set
  }, [columns, data, serverPaged])

  const sorted = useMemo(() => {
    if (!sort) return data
    const column = columns.find((item) => String(item.accessor) === sort.accessor)
    if (!column) return data
    const read = (row: T) => (column.sortValue ? column.sortValue(row) : row[column.accessor])
    const factor = sort.direction === 'asc' ? 1 : -1
    return [...data].sort((a, b) => factor * compareValues(read(a), read(b)))
  }, [columns, data, sort])

  const localPageCount = pageSize ? Math.ceil(sorted.length / pageSize) : 1
  const pageCount = Math.max(1, serverPaged ? pagination!.pageCount : localPageCount)
  const currentPage = Math.min(serverPaged ? pagination!.page : page, pageCount - 1)
  const visible = serverPaged
    ? data
    : pageSize
      ? sorted.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
      : sorted

  const pagerSize = serverPaged ? pagination!.pageSize : pageSize
  const pager = pagerSize && (serverPaged || sorted.length > pagerSize) ? (
    <TablePager
      page={currentPage}
      pageCount={pageCount}
      total={serverPaged ? pagination!.total : sorted.length}
      pageSize={pagerSize}
      onPageChange={serverPaged ? pagination!.onPageChange : setPage}
    />
  ) : null

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-lg border-collapse">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr>
              {columns.map((column) => {
                const key = String(column.accessor)
                const isSorted = sort?.accessor === key
                const sortable = sortableColumns.has(key)
                return (
                  <th
                    key={key}
                    scope="col"
                    aria-sort={
                      isSorted
                        ? sort?.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    className="whitespace-nowrap px-4 py-4 text-left text-sm font-semibold text-foreground/80"
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSort(nextSortState(sort, key))
                          setPage(0)
                        }}
                        className="inline-flex min-h-6 items-center gap-1.5 rounded-md text-left font-semibold hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        {column.header}
                        {isSorted ? (
                          sort?.direction === 'asc' ? (
                            <ArrowUp size={13} aria-hidden="true" />
                          ) : (
                            <ArrowDown size={13} aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown size={13} aria-hidden="true" className="text-foreground/30" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, rowIndex) => (
              <tr
                key={row._id ? String(row._id) : rowIndex}
                className={cn(
                  'group transition-colors duration-150 motion-reduce:transition-none',
                  'border-b edge last:border-0',
                  'hover:bg-white/40 dark:hover:bg-white/5',
                  rowIndex % 2 === 1 && 'bg-white/[0.12] dark:bg-white/[0.02]',
                )}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.accessor)}
                    className={cn(
                      // break-words, not wrap-anywhere: overflow-wrap: anywhere also
                      // shrinks a column's min-content width, which stacks short labels
                      // one character per line once the table gets tight.
                      'break-words px-4 py-4 text-sm text-foreground',
                      column.className,
                    )}
                  >
                    {column.render ? column.render(row[column.accessor], row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pager}
    </div>
  )
}
