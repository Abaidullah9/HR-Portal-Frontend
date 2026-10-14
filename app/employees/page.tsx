'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { Badge } from '@/components/common/badge'
import { DataTable } from '@/components/common/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Trash2, X } from 'lucide-react'
import { AddEmployeeModal } from '@/components/employees/add-employee-modal'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { fetchEmployees, fetchDepartments, deleteEmployee } from '@/lib/redux/slices/employeeSlice'
import { Employee } from '@/types/employee'

export default function EmployeesPage() {
  const dispatch = useAppDispatch()
  const { employees, loading, error } = useAppSelector((state) => state.employee)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchEmployees())
    dispatch(fetchDepartments())
  }, [dispatch])

  const filteredEmployees = employees.filter((emp: Employee) => {
    const deptName =
      typeof emp.departmentId === 'object' && emp.departmentId !== null
        ? emp.departmentId.name
        : emp.departmentId || ''
    return (
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deptName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleDelete = async (id: string) => {
    await dispatch(deleteEmployee(id))
    setShowDeleteConfirm(null)
  }

  const statusVariant = (isActive: boolean) => (isActive ? 'success' : 'destructive')

  if (error) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-7xl space-y-6">
          <SectionHeader
            title="Employee Directory"
            description="Manage and view all employees in your organization"
          />
          <div className="rounded-2xl border danger-panel p-6 text-sm backdrop-blur-md">
            {error}
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-10">
        {/* Header */}
        <SectionHeader
          title="Employee Directory"
          description="Manage and view all employees in your organization"
          action={
            <Button
              onClick={() => setIsModalOpen(true)}
              className="gap-2 brand text-white border edge"
            >
              <Plus size={18} />
              Add Employee
            </Button>
          }
        />

        {/* Search */}
        <div className="flex max-w-xl">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/60 transition-colors hover:text-foreground/70"
            />
            <Input
              placeholder="Search by name, email, or department..."
              className="pl-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table panel */}
        <div className="overflow-hidden rounded-2xl border edge bg-white/70 shadow-xl shadow-black/5 backdrop-blur-md dark:edge dark:surface-85">
          {loading && employees.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-foreground/65">
              Loading employees…
            </div>
          ) : filteredEmployees.length > 0 ? (
            <>
              <DataTable<Employee>
                columns={[
                  {
                    header: 'Code',
                    accessor: 'employeeCode',
                    className: 'font-mono text-xs text-foreground/60',
                  },
                  {
                    header: 'Name',
                    accessor: 'name',
                    className: 'font-semibold',
                  },
                  {
                    header: 'Email',
                    accessor: 'email',
                    className: 'text-foreground/60 text-sm',
                  },
                  {
                    header: 'Department',
                    accessor: 'departmentId',
                    render: (dept) =>
                      typeof dept === 'object' && dept !== null ? dept.name : dept || 'General',
                  },
                  {
                    header: 'Position',
                    accessor: 'position',
                  },
                  {
                    header: 'Status',
                    accessor: 'isActive',
                    render: (isActive) => (
                      <Badge variant={statusVariant(Boolean(isActive))}>
                        {isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    ),
                  },
                  {
                    header: '',
                    accessor: '_id',
                    render: (id) => (
                      <div className="flex justify-end">
                        <div className="relative">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8 text-foreground/60 hover:danger-text hover:danger-panel dark:text-foreground/65 dark:hover:danger-text"
                            onClick={() => setShowDeleteConfirm(id as string)}
                          >
                            <Trash2 size={15} />
                          </Button>
                          {showDeleteConfirm === id && (
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
                                  onClick={() => setShowDeleteConfirm(null)}
                                  className="flex-1"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(id as string)}
                                  className="flex-1"
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                    className: 'text-right',
                  },
                ]}
                data={filteredEmployees}
              />
            </>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-sm text-foreground/65">
              <p className="mb-4">No employees found.</p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="gap-2 brand text-white border edge"
              >
                <Plus size={18} />
                Add First Employee
              </Button>
            </div>
          )}
        </div>

        {filteredEmployees.length > 0 && (
          <p className="flex items-center justify-between text-sm text-foreground/65">
            <span>
              Showing {filteredEmployees.length} of {employees.length} employees
            </span>
          </p>
        )}
      </div>

      <AddEmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </AppLayout>
  )
}
