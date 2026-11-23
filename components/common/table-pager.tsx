'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface TablePagerProps {
  page: number
  pageCount: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

/** Client-side pager: the whole list is already loaded, so this only moves a window. */
export function TablePager({ page, pageCount, total, pageSize, onPageChange }: TablePagerProps) {
  const from = total === 0 ? 0 : page * pageSize + 1
  const to = Math.min(total, (page + 1) * pageSize)

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t edge px-4 py-3 sm:px-6"
    >
      <p className="text-xs text-foreground/65" aria-live="polite">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className="gap-1"
        >
          <ChevronLeft size={15} aria-hidden="true" />
          Previous
        </Button>
        <span className="whitespace-nowrap text-xs tabular-nums text-foreground/65">
          <span className="sr-only">Page </span>
          {page + 1} / {pageCount}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= pageCount - 1}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="gap-1"
        >
          Next
          <ChevronRight size={15} aria-hidden="true" />
        </Button>
      </div>
    </nav>
  )
}
