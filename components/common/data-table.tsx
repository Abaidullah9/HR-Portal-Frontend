'use client'

import { useMemo, useState } from 'react'
import { compareValues, nextSortState, type SortState } from '@/lib/table-sort'
import { RowCards } from './row-cards'
import { TableGrid } from './table-grid'
import type { CardBreakpoint, ColumnDef, ServerPagination } from './table-types'
import { TablePager } from './table-pager'

export { DataTableSkeleton } from './data-table-skeleton'
export type { CardBreakpoint, ColumnDef, ServerPagination } from './table-types'

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  /** Announced by screen readers; the table has no visible title of its own. */
  caption?: string
  /** Window the rows into pages of this size. Omit to show them all. */
  pageSize?: number
  /** Rows are already one page from the API; paging is a fetch, not a slice. */
  pagination?: ServerPagination
  /**
   * Renders a row as a card below `cardsBelow`, where the columns would
   * otherwise sit behind a horizontal scroll. Omit to always show the table.
   */
  renderCard?: (row: T) => React.ReactNode
  /** Wide tables use the `xl` default; short ones can switch to cards sooner. */
  cardsBelow?: CardBreakpoint
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  caption,
  pageSize,
  pagination,
  renderCard,
  cardsBelow = 'xl',
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
  const pager =
    pagerSize && (serverPaged || sorted.length > pagerSize) ? (
      <TablePager
        page={currentPage}
        pageCount={pageCount}
        total={serverPaged ? pagination!.total : sorted.length}
        pageSize={pagerSize}
        onPageChange={serverPaged ? pagination!.onPageChange : setPage}
      />
    ) : null

  const table = (
    <TableGrid
      columns={columns}
      rows={visible}
      caption={caption}
      sortable={sortableColumns}
      sort={sort}
      onSort={(accessor) => {
        setSort(nextSortState(sort, accessor))
        setPage(0)
      }}
    />
  )

  if (!renderCard) {
    return (
      <>
        {table}
        {pager}
      </>
    )
  }

  return (
    <RowCards below={cardsBelow} pager={pager} table={table}>
      {visible.map((row, index) => (
        <li key={row._id ? String(row._id) : index} className="px-4 py-4">
          {renderCard(row)}
        </li>
      ))}
    </RowCards>
  )
}
