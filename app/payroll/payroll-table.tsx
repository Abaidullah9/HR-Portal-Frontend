'use client'

import { Banknote } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { DataTable, DataTableSkeleton, type ColumnDef, type ServerPagination } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/state-panel'
import { Button } from '@/components/ui/button'
import { formatDate, formatMoney } from '@/lib/utils'
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
}

/** The record's actions, shared by the table row and the card. */
function RowActions({ record, markingId, canMarkPaid, onMarkPaid, onViewPayslip }: RowActionsProps) {
  const id = record._id
  return (
    <div className="flex items-center justify-end gap-2">
      <Button type="button" size="sm" variant="outline" onClick={() => onViewPayslip(id)} className="text-xs">
        Payslip
      </Button>
      {canMarkPaid && record.status === 'pending' && !record.payRunId && (
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
  const actions = { markingId, canMarkPaid, onMarkPaid, onViewPayslip }

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
      render: (value, row) => formatMoney(value, row.currency),
    },
    {
      header: 'Net pay',
      accessor: 'netPay',
      render: (value, row) => (
        <span className="font-semibold text-foreground">{formatMoney(value, row.currency)}</span>
      ),
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
    {
      header: 'Payslip no.',
      accessor: 'payslipNumber',
      sortable: false,
      render: (value) =>
        value ? (
          <span className="font-mono text-xs tabular-nums text-foreground">{value}</span>
        ) : (
          <span className="text-foreground/55">Not issued</span>
        ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      sortable: false,
      className: 'text-right',
      render: (_id, row) => <RowActions record={row} {...actions} />,
    },
  ]

  return (
    <div className="panel overflow-hidden">
      {loading && records.length === 0 ? (
        <div role="status" aria-busy="true">
          <span className="sr-only">Loading payroll records</span>
          <DataTableSkeleton rows={5} columns={8} />
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={Banknote}
          title="No payroll records yet"
          description="Once salaries are processed for a pay period, the records and their payment status appear here."
        />
      ) : (
        <DataTable<EmployeePayroll>
          caption="Payroll records"
          pagination={pagination}
          columns={columns}
          data={records}
          renderCard={(record) => (
            <div className="space-y-3">
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
                <dd className="font-semibold text-foreground">
                  {formatMoney(record.netPay, record.currency)}
                </dd>
              </dl>
              <RowActions record={record} {...actions} />
            </div>
          )}
        />
      )}
    </div>
  )
}
