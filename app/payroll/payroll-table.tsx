'use client'

import { Banknote } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { DataTable, DataTableSkeleton, type ColumnDef, type ServerPagination } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/state-panel'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
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
      render: (value) => `$${Number(value).toLocaleString()}`,
    },
    {
      header: 'Net pay',
      accessor: 'netPay',
      render: (value) => (
        <span className="font-semibold text-foreground">${Number(value).toLocaleString()}</span>
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
  ]

  columns.push({
    header: 'Actions',
    accessor: '_id',
    sortable: false,
    className: 'text-right',
    render: (id, row) => (
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onViewPayslip(id as string)}
          className="text-xs"
        >
          Payslip
        </Button>
        {canMarkPaid && row.status === 'pending' && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={markingId === id}
            onClick={() => onMarkPaid(id as string)}
            className="text-xs"
          >
            {markingId === id ? 'Saving…' : 'Mark paid'}
          </Button>
        )}
      </div>
    ),
  })

  return (
    <div className="panel overflow-hidden">
      {loading && records.length === 0 ? (
        <div role="status" aria-busy="true">
          <span className="sr-only">Loading payroll records</span>
          <DataTableSkeleton rows={5} columns={7} />
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
        />
      )}
    </div>
  )
}
