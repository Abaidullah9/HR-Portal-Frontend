'use client'

import { Banknote } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { DataTable, DataTableSkeleton, type ColumnDef, type ServerPagination } from '@/components/common/data-table'
import { TablePager } from '@/components/common/table-pager'
import { EmptyState } from '@/components/common/state-panel'
import { Button } from '@/components/ui/button'
import { cn, formatDate } from '@/lib/utils'
import type { EmployeePayroll } from '@/types/payroll'

const employeeName = (employee: EmployeePayroll['employeeId']) =>
  typeof employee === 'object' && employee !== null && 'name' in employee
    ? employee.name
    : 'Unknown employee'

const statusBadge = (status: string) => {
  if (status === 'completed') return <Badge variant="success">Completed</Badge>
  if (status === 'failed') return <Badge variant="destructive">Failed</Badge>
  return <Badge variant="warning">Pending</Badge>
}

const money = (value: number | string) => `$${Number(value).toLocaleString()}`

interface PayrollTableProps {
  pagination?: ServerPagination
  records: EmployeePayroll[]
  loading: boolean
  markingId: string | null
  canMarkPaid: boolean
  onMarkPaid: (id: string) => void
  onViewPayslip: (id: string) => void
}

interface RowActionsProps {
  record: EmployeePayroll
  markingId: string | null
  canMarkPaid: boolean
  onMarkPaid: (id: string) => void
  onViewPayslip: (id: string) => void
  className?: string
}

function RowActions({
  record,
  markingId,
  canMarkPaid,
  onMarkPaid,
  onViewPayslip,
  className,
}: RowActionsProps) {
  const id = record._id as string
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button type="button" size="sm" variant="outline" onClick={() => onViewPayslip(id)} className="text-xs">
        Payslip
      </Button>
      {canMarkPaid && record.status === 'pending' && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={markingId === id}
          onClick={() => onMarkPaid(id)}
          className="text-xs"
        >
          {markingId === id ? 'Saving…' : 'Mark paid'}
        </Button>
      )}
    </div>
  )
}

export function PayrollTable({
  pagination,
  records,
  loading,
  markingId,
  canMarkPaid,
  onMarkPaid,
  onViewPayslip,
}: PayrollTableProps) {
  const columns: ColumnDef<EmployeePayroll>[] = [
    {
      header: 'Employee',
      accessor: 'employeeId',
      render: (_employee, row) => employeeName(row.employeeId),
      sortValue: (row) => employeeName(row.employeeId),
    },
    {
      header: 'Base salary',
      accessor: 'baseSalary',
      render: (value) => money(value),
    },
    {
      header: 'Net pay',
      accessor: 'netPay',
      render: (value) => <span className="font-semibold text-foreground">{money(value)}</span>,
    },
    {
      header: 'Period start',
      accessor: 'payPeriodStart',
      render: (date) => formatDate(date),
      className: 'text-foreground/65 text-sm whitespace-nowrap',
    },
    {
      header: 'Payment method',
      accessor: 'paymentMethod',
      render: (method) => <span className="capitalize">{method}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (status) => statusBadge(status),
    },
  ]

  columns.push({
    header: 'Actions',
    accessor: '_id',
    sortable: false,
    className: 'text-right',
    render: (id, row) => (
      <RowActions
        record={row}
        markingId={markingId}
        canMarkPaid={canMarkPaid}
        onMarkPaid={onMarkPaid}
        onViewPayslip={onViewPayslip}
        className="justify-end"
      />
    ),
  })

  if (loading && records.length === 0) {
    return (
      <div className="panel overflow-hidden" role="status" aria-busy="true">
        <span className="sr-only">Loading payroll records</span>
        <DataTableSkeleton rows={5} columns={7} />
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="panel overflow-hidden">
        <EmptyState
          icon={Banknote}
          title="No payroll records yet"
          description="Once salaries are processed for a pay period, the records and their payment status appear here."
        />
      </div>
    )
  }

  return (
    <div className="panel overflow-hidden">
      {/* Narrow screens show cards: a six-column table would put the status and
          actions behind a horizontal scroll. */}
      <ul className="divide-y edge md:hidden">
        {records.map((record) => (
          <li key={record._id as string} className="space-y-3 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{employeeName(record.employeeId)}</p>
                <p className="text-xs text-foreground/65">
                  {formatDate(record.payPeriodStart)} ·{' '}
                  <span className="capitalize">{record.paymentMethod}</span>
                </p>
              </div>
              {statusBadge(record.status)}
            </div>
            <dl className="flex items-baseline justify-between gap-3 text-sm">
              <dt className="text-foreground/65">Net pay</dt>
              <dd className="font-semibold text-foreground">{money(record.netPay)}</dd>
            </dl>
            <RowActions
              record={record}
              markingId={markingId}
              canMarkPaid={canMarkPaid}
              onMarkPaid={onMarkPaid}
              onViewPayslip={onViewPayslip}
              className="justify-end"
            />
          </li>
        ))}
      </ul>
      {pagination && (
        <div className="md:hidden">
          <TablePager
            page={pagination.page}
            pageCount={pagination.pageCount}
            total={pagination.total}
            pageSize={pagination.pageSize}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
      <div className="hidden md:block">
        <DataTable<EmployeePayroll>
          caption="Payroll records"
          pagination={pagination}
          columns={columns}
          data={records}
        />
      </div>
    </div>
  )
}
