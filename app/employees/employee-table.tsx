'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SearchX, Users } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { DataTable, DataTableSkeleton, type ColumnDef, type ServerPagination } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/state-panel'
import { Button } from '@/components/ui/button'
import type { Employee } from '@/types/employee'
import { DeleteEmployee } from './delete-employee'

const statusVariant = (isActive: boolean): 'success' | 'destructive' =>
  isActive ? 'success' : 'destructive'

const departmentName = (department: Employee['departmentId']) =>
  typeof department === 'object' && department !== null
    ? department.name
    : department || 'General'

interface EmployeeTableProps {
  pagination?: ServerPagination
  employees: Employee[]
  loading: boolean
  searchTerm: string
  deletingId: string | null
  canManage: boolean
  onDelete: (id: string) => void
  onAdd: () => void
}

export function EmployeeTable({
  pagination,
  employees,
  loading,
  searchTerm,
  deletingId,
  canManage,
  onDelete,
  onAdd,
}: EmployeeTableProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const columns: ColumnDef<Employee>[] = [
    {
      header: 'Code',
      accessor: 'employeeCode',
      className: 'font-mono text-xs text-foreground/60',
    },
    {
      header: 'Name',
      accessor: 'name',
      className: 'font-semibold',
      render: (name, row) => (
        <Link href={`/employees/${row._id}`} className="hover:underline">
          {name}
        </Link>
      ),
    },
    { header: 'Email', accessor: 'email', className: 'text-foreground/60 text-sm' },
    {
      header: 'Department',
      accessor: 'departmentId',
      render: (_department, row) => departmentName(row.departmentId),
      sortValue: (row) => departmentName(row.departmentId),
    },
    { header: 'Position', accessor: 'position' },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (isActive) => (
        <Badge variant={statusVariant(Boolean(isActive))}>{isActive ? 'Active' : 'Inactive'}</Badge>
      ),
    },
  ]

  if (canManage) {
    columns.push({
      header: '',
      accessor: '_id',
      className: 'text-right',
      render: (id) => (
        <DeleteEmployee
          id={id as string}
          deletingId={deletingId}
          confirming={confirmId === id}
          onConfirmChange={setConfirmId}
          onDelete={onDelete}
        />
      ),
    })
  }

  return (
    <div className="panel overflow-hidden">
      {loading && employees.length === 0 ? (
        <div role="status" aria-busy="true">
          <span className="sr-only">Loading employees</span>
          <DataTableSkeleton rows={5} columns={7} />
        </div>
      ) : employees.length === 0 ? (
        <EmptyState
          icon={searchTerm ? SearchX : Users}
          title={searchTerm ? `No matches for “${searchTerm}”` : 'No employees yet'}
          description={
            searchTerm
              ? 'Try a different name, email, department or position.'
              : 'Add your first employee to start building the directory.'
          }
          action={
            searchTerm || !canManage ? undefined : (
              <Button onClick={onAdd} className="gap-2 brand text-white border edge">
                Add employee
              </Button>
            )
          }
        />
      ) : (
        <DataTable<Employee>
          caption="Employee directory"
          pagination={pagination}
          columns={columns}
          data={employees}
          cardsBelow="xl"
          renderCard={(employee) => (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/employees/${employee._id}`} className="font-semibold text-foreground hover:underline">
                    {employee.name}
                  </Link>
                  <p className="text-xs font-mono text-foreground/60">{employee.employeeCode}</p>
                </div>
                <Badge variant={statusVariant(Boolean(employee.isActive))}>
                  {employee.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-foreground/75 break-words">
                {departmentName(employee.departmentId)} · {employee.position}
              </p>
              <p className="text-xs text-foreground/60 break-all">{employee.email}</p>
              {canManage && (
                <DeleteEmployee
                  id={employee._id}
                  deletingId={deletingId}
                  confirming={confirmId === employee._id}
                  onConfirmChange={setConfirmId}
                  onDelete={onDelete}
                />
              )}
            </div>
          )}
        />
      )}
    </div>
  )
}
