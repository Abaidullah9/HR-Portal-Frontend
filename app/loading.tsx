import { DataTableSkeleton } from '@/components/common/data-table'

/** Shown while a route segment streams in. */
export default function Loading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="flex min-h-screen items-center justify-center px-6"
    >
      <span className="sr-only">Loading page</span>
      <div className="panel w-full max-w-3xl overflow-hidden">
        <DataTableSkeleton rows={4} columns={3} />
      </div>
    </div>
  )
}
