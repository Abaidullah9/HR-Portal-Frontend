'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { Badge } from '@/components/common/badge'
import { DataTable } from '@/components/common/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Trash2 } from 'lucide-react'
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
    const deptName = typeof emp.departmentId === 'object' && emp.departmentId !== null 
      ? emp.departmentId.name 
      : (emp.departmentId || '')
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

  const statusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'success' : 'destructive'
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <SectionHeader
          title="Employee Directory"
          description="Manage and view all employees in your organization"
          action={
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus size={18} />
              Add Employee
            </Button>
          }
        />

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search employees by name, email, or department..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading && employees.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Loading employees from server...</div>
          ) : filteredEmployees.length > 0 ? (
            <DataTable<Employee>
              columns={[
                {
                  header: 'Code',
                  accessor: 'employeeCode',
                  className: 'font-mono text-xs text-muted-foreground',
                },
                {
                  header: 'Name',
                  accessor: 'name',
                  className: 'font-semibold',
                },
                {
                  header: 'Email',
                  accessor: 'email',
                  className: 'text-muted-foreground text-sm',
                },
                {
                  header: 'Department',
                  accessor: 'departmentId',
                  render: (dept) => (typeof dept === 'object' && dept !== null ? dept.name : dept || 'General'),
                },
                {
                  header: 'Position',
                  accessor: 'position',
                },
                {
                  header: 'Status',
                  accessor: 'isActive',
                  render: (isActive) => (
                    <Badge variant={statusBadgeVariant(Boolean(isActive))}>
                      {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  ),
                },
                {
                  header: '',
                  accessor: '_id',
                  render: (id) => (
                    <div className="flex gap-1 justify-end">
                      <div className="relative group">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => setShowDeleteConfirm(id as string)}
                        >
                          <Trash2 size={16} />
                        </Button>
                        {showDeleteConfirm === id && (
                          <div className="absolute right-0 top-10 z-50 bg-card border border-border rounded-lg shadow-lg p-3 w-48">
                            <p className="text-sm font-semibold mb-3">Confirm deletion?</p>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
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
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No employees found</p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus size={18} />
                Add First Employee
              </Button>
            </div>
          )}
        </div>

        {/* Pagination info */}
        {filteredEmployees.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Showing {filteredEmployees.length} of {employees.length} employees</p>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </AppLayout>
  )
}
