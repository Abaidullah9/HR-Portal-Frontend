'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SearchX, Trash2, Users } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { DataTable, DataTableSkeleton, type ColumnDef, type ServerPagination } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/state-panel'
import { Button } from '@/components/ui/button'
import type { Employee } from '@/types/employee'

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
        <div className="flex justify-end">
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 text-foreground/60 pointer-coarse:min-h-11 pointer-coarse:min-w-11 hover:danger-text hover:danger-panel dark:text-foreground/65 dark:hover:danger-text"
              onClick={() => setConfirmId(id as string)}
              aria-label="Delete employee"
            >
              <Trash2 size={15} />
            </Button>
            {confirmId === id && (
              <div className="absolute right-0 top-9 z-50 w-56 rounded-2xl border edge bg-white/95 p-4 backdrop-blur-xl shadow-2xl shadow-black/10 dark:edge dark:surface-95">
                <p className="font-semibold text-foreground">Confirm deletion?</p>
                <p className="mt-1 text-sm text-foreground/60">
                  This employee will be permanently removed.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmId(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={deletingId === id}
                    onClick={() => {
                      setConfirmId(null)
                      onDelete(id as string)
                    }}
                    className="flex-1"
                  >
                    {deletingId === id ? 'Deleting…' : 'Delete'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
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
        />
      )}
    </div>
  )
}
