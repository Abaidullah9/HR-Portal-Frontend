'use client'

import { CalendarX, SearchX } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import {
  DataTable,
  DataTableSkeleton,
  type ColumnDef,
  type ServerPagination,
} from '@/components/common/data-table'
import { EmptyState } from '@/components/common/state-panel'
import { Button } from '@/components/ui/button'
import { dayKey, formatTime, isLate } from '@/lib/attendance'
import { formatDate } from '@/lib/utils'
import type { AttendanceRecord } from '@/types/attendance'

const buildColumns = (lateAfter: string): ColumnDef<AttendanceRecord>[] => [
  {
    header: 'Employee',
    accessor: 'employeeId',
    render: (employee) =>
      typeof employee === 'object' && employee !== null ? employee.name : 'Unknown employee',
    sortValue: (row) =>
      typeof row.employeeId === 'object' && row.employeeId !== null ? row.employeeId.name : '',
  },
  {
    header: 'Date',
    accessor: 'date',
    render: (date) => formatDate(date),
    className: 'text-foreground/65 text-sm',
    sortValue: (row) => dayKey(row.date),
  },
  {
    header: 'Check-in',
    accessor: 'checkIn',
    render: (checkIn) => formatTime(checkIn),
    sortValue: (row) => row.checkIn ?? '',
  },
  {
    header: 'Check-out',
    accessor: 'checkOut',
    render: (checkOut) => formatTime(checkOut),
    sortValue: (row) => row.checkOut ?? '',
  },
  {
    header: 'Status',
    accessor: 'status',
    render: (_status, row) => {
      if (!row.checkIn) return <Badge variant="destructive">Absent</Badge>
      if (isLate(row.checkIn, lateAfter)) return <Badge variant="warning">Late</Badge>
      return <Badge variant="success">Present</Badge>
    },
    sortValue: (row) =>
      row.checkIn ? (isLate(row.checkIn, lateAfter) ? 'late' : 'present') : 'absent',
  },
]

interface AttendanceTableProps {
  records: AttendanceRecord[]
  loading: boolean
  pagination?: ServerPagination
  filtered: boolean
  /** Late threshold from the organization policy, e.g. "09:15". */
  lateAfter: string
  onClearFilter: () => void
}

export function AttendanceTable({
  records,
  loading,
  pagination,
  filtered,
  lateAfter,
  onClearFilter,
}: AttendanceTableProps) {
  const columns = buildColumns(lateAfter)

  if (loading && records.length === 0) {
    return (
      <div role="status" aria-busy="true" className="panel overflow-hidden">
        <span className="sr-only">Loading attendance records</span>
        <DataTableSkeleton rows={5} columns={5} />
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="panel overflow-hidden">
        <EmptyState
          icon={filtered ? SearchX : CalendarX}
          title={filtered ? 'Nothing logged on that day' : 'No attendance logged yet'}
          description={
            filtered
              ? 'Pick another date, or clear the filter to see every record.'
              : 'Use the check-in panel above to log the first arrival for today.'
          }
          action={
            filtered ? (
              <Button variant="outline" size="sm" onClick={onClearFilter}>
                Clear date filter
              </Button>
            ) : undefined
          }
        />
      </div>
    )
  }

  return (
    <div className="panel overflow-hidden">
      <DataTable<AttendanceRecord>
        caption="Attendance records"
        pagination={pagination}
        columns={columns}
        data={records}
      />
    </div>
  )
}
