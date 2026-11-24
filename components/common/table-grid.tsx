'use client'

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SortState } from '@/lib/table-sort'
import type { ColumnDef } from './table-types'

interface TableGridProps<T> {
  columns: ColumnDef<T>[]
  rows: T[]
  caption?: string
  /** Accessors whose column can be sorted. */
  sortable: Set<string>
  sort: SortState | null
  onSort: (accessor: string) => void
}

/** The table itself: paging and sorting state belong to the caller. */
export function TableGrid<T extends Record<string, any>>({
  columns,
  rows,
  caption,
  sortable,
  sort,
  onSort,
}: TableGridProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-lg border-collapse">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => {
              const key = String(column.accessor)
              const isSorted = sort?.accessor === key
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
                  {sortable.has(key) ? (
                    <button
                      type="button"
                      onClick={() => onSort(key)}
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
          {rows.map((row, rowIndex) => (
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
  )
}
