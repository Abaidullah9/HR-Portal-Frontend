'use client'

import { CalendarClock, Check, X } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { DataTable, DataTableSkeleton, type ColumnDef, type ServerPagination } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/state-panel'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { LeaveRequest } from '@/types/leave'

const badgeVariant = (status: string) => {
  if (status === 'approved') return 'success' as const
  if (status === 'rejected') return 'destructive' as const
  return 'warning' as const
}

const employeeName = (employee: LeaveRequest['employeeId']) =>
  typeof employee === 'object' && employee !== null ? employee.name : 'Employee'

const StatusBadge = ({ status }: { status: string }) => (
  <Badge variant={badgeVariant(status)} className="capitalize">
    {status}
  </Badge>
)

interface ApproveRejectProps {
  request: LeaveRequest
  busy: boolean
  onStatusChange: (request: LeaveRequest, status: 'approved' | 'rejected') => void
}

/** Approve/reject pair, shared by the table row and the card. */
function ApproveReject({ request, busy, onStatusChange }: ApproveRejectProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 success-text pointer-coarse:min-h-11 pointer-coarse:min-w-11 hover:success-panel"
        disabled={busy}
        onClick={() => onStatusChange(request, 'approved')}
        title="Approve"
        aria-label={`Approve leave for ${employeeName(request.employeeId)}`}
      >
        <Check size={16} />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 danger-text pointer-coarse:min-h-11 pointer-coarse:min-w-11 hover:danger-panel"
        disabled={busy}
        onClick={() => onStatusChange(request, 'rejected')}
        title="Reject"
        aria-label={`Reject leave for ${employeeName(request.employeeId)}`}
      >
        <X size={16} />
      </Button>
    </div>
  )
}

interface LeaveTableProps {
  pagination?: ServerPagination
  requests: LeaveRequest[]
  loading: boolean
  busyId: string | null
  canApprove: boolean
  onStatusChange: (request: LeaveRequest, status: 'approved' | 'rejected') => void
  onRequestLeave: () => void
}

export function LeaveTable({
  pagination,
  requests,
  loading,
  busyId,
  canApprove,
  onStatusChange,
  onRequestLeave,
}: LeaveTableProps) {
  const columns: ColumnDef<LeaveRequest>[] = [
    {
      header: 'Employee',
      accessor: 'employeeId',
      render: (_employee, row) => employeeName(row.employeeId),
      sortValue: (row) => employeeName(row.employeeId),
    },
    {
      header: 'Leave type',
      accessor: 'leaveType',
      render: (type) => <span className="capitalize">{type}</span>,
    },
    {
      header: 'From',
      accessor: 'fromDate',
      render: (from) => formatDate(from),
      className: 'text-foreground/65 text-sm',
    },
    {
      header: 'To',
      accessor: 'toDate',
      render: (to) => formatDate(to),
      className: 'text-foreground/65 text-sm',
    },
    {
      header: 'Reason',
      accessor: 'reasonForLeave',
      className: 'text-foreground/60 text-sm max-w-44 truncate block',
    },
    {
      header: 'Status',
      accessor: 'leaveStatus',
      render: (status) => <StatusBadge status={status} />,
    },
  ]

  if (canApprove) {
    columns.push({
      header: 'Actions',
      accessor: '_id',
      sortable: false,
      className: 'text-right',
      render: (_id, row) =>
        row.leaveStatus === 'pending' ? (
          <ApproveReject request={row} busy={busyId === row._id} onStatusChange={onStatusChange} />
        ) : null,
    })
  }

  return (
    <div className="panel overflow-hidden">
      {loading && requests.length === 0 ? (
        <div role="status" aria-busy="true">
          <span className="sr-only">Loading leave requests</span>
          <DataTableSkeleton rows={5} columns={7} />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No leave requests yet"
          description="Requests appear here once someone files one. Book your own time off to get started."
          action={
            <Button onClick={onRequestLeave} className="gap-2 brand text-white border edge">
              Request leave
            </Button>
          }
        />
      ) : (
        <DataTable<LeaveRequest>
          caption="Employee leave requests"
          pagination={pagination}
          columns={columns}
          data={requests}
          cardsBelow="xl"
          renderCard={(request) => (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{employeeName(request.employeeId)}</p>
                  <p className="text-xs text-foreground/65 capitalize">{request.leaveType} leave</p>
                </div>
                <StatusBadge status={request.leaveStatus} />
              </div>
              <p className="text-sm text-foreground/75">
                {formatDate(request.fromDate)} – {formatDate(request.toDate)}
              </p>
              <p className="text-sm text-foreground/60 break-words">{request.reasonForLeave}</p>
              {canApprove && request.leaveStatus === 'pending' && (
                <ApproveReject
                  request={request}
                  busy={busyId === request._id}
                  onStatusChange={onStatusChange}
                />
              )}
            </div>
          )}
        />
      )}
    </div>
  )
}
