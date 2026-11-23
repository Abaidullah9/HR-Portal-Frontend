import { CalendarCheck, ClipboardList } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { DataTable, DataTableSkeleton, type ColumnDef } from '@/components/common/data-table'
import { EmptyState, ErrorState } from '@/components/common/state-panel'
import { dayKey, formatTime } from '@/lib/attendance'
import { formatDate, toSentenceCase } from '@/lib/utils'
import type { AttendanceRecord } from '@/types/attendance'
import type { TablePagerProps } from '@/components/common/table-pager'

const columns: ColumnDef<AttendanceRecord>[] = [
  {
    header: 'Date',
    accessor: 'date',
    render: (date) => formatDate(date),
    sortValue: (row) => dayKey(row.date),
  },
  {
    header: 'Check-in',
    accessor: 'checkIn',
    render: (value) => formatTime(value),
    sortValue: (row) => row.checkIn ?? '',
  },
  {
    header: 'Check-out',
    accessor: 'checkOut',
    render: (value) => formatTime(value),
    sortValue: (row) => row.checkOut ?? '',
  },
  {
    header: 'Status',
    accessor: 'status',
    render: (value) => (
      <Badge>{typeof value === 'string' && value ? toSentenceCase(value) : 'Logged'}</Badge>
    ),
  },
]

interface AttendanceHistoryProps {
  records: AttendanceRecord[]
  loading: boolean
  error: string | null
  onRetry: () => void
  pagination: TablePagerProps
}

export function AttendanceHistory({
  records,
  loading,
  error,
  onRetry,
  pagination,
}: AttendanceHistoryProps) {
  return (
    <section aria-labelledby="my-attendance-heading" className="space-y-4">
      <h2 id="my-attendance-heading" className="flex items-center gap-2 text-lg font-semibold">
        <ClipboardList size={18} aria-hidden="true" />
        Attendance history
      </h2>

      {error ? (
        <div className="panel">
          <ErrorState
            title="Couldn't load your attendance"
            description={error}
            onRetry={onRetry}
          />
        </div>
      ) : (
        <div className="panel overflow-hidden">
          {loading && records.length === 0 ? (
            <div role="status" aria-busy="true">
              <span className="sr-only">Loading your attendance history</span>
              <DataTableSkeleton rows={5} columns={4} />
            </div>
          ) : records.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No attendance recorded yet"
              description="Once you check in, your days show up here with their check-in and check-out times."
            />
          ) : (
            <DataTable<AttendanceRecord>
              caption="Your attendance history"
              columns={columns}
              data={records}
              pagination={pagination}
            />
          )}
        </div>
      )}
    </section>
  )
}
