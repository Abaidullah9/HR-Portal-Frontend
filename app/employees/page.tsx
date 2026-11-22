'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { AddEmployeeModal } from '@/components/employees/add-employee-modal'
import { AddDepartmentDialog } from '@/components/employees/add-department-dialog'
import { ImportEmployeesDialog } from '@/components/employees/import-employees-dialog'
import { InviteUserDialog } from '@/components/employees/invite-user-dialog'
import { DirectoryToolbar } from '@/components/employees/directory-toolbar'
import { useToast } from '@/components/common/toast'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import {
  fetchEmployees,
  fetchDepartments,
  deleteEmployee,
} from '@/lib/redux/slices/employeeSlice'
import { PAGE_SIZE } from '@/lib/api/page'
import { EmployeeTable } from './employee-table'

function EmployeeDirectory() {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { can } = usePermissions()
  const canManage = can('manageEmployees')
  const searchParams = useSearchParams()
  const { employees, loading, error, pagination } = useAppSelector((state) => state.employee)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchDepartments())
  }, [dispatch])

  // The search runs on the server, because a filter applied to one page would
  // only ever find matches that happened to be on that page.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void dispatch(
        fetchEmployees({
          page: page + 1,
          limit: PAGE_SIZE,
          search: searchTerm.trim() || undefined,
        }),
      )
    }, 250)
    return () => window.clearTimeout(timer)
  }, [dispatch, page, searchTerm])

  // The header search links here as /employees?q=…, including while this page is
  // already mounted, so the field follows the query string.
  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchTerm(query)
      setPage(0)
    }
  }, [searchParams])

  const refresh = useCallback(
    () =>
      dispatch(
        fetchEmployees({ page: page + 1, limit: PAGE_SIZE, search: searchTerm.trim() || undefined }),
      ),
    [dispatch, page, searchTerm],
  )

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const result = await dispatch(deleteEmployee(id))
      if (deleteEmployee.fulfilled.match(result)) {
        toast('Employee removed')
        // The row just left this page, so refetch it rather than leave a hole.
        await dispatch(
          fetchEmployees({ page: page + 1, limit: PAGE_SIZE, search: searchTerm.trim() || undefined }),
        )
      } else {
        toast('Could not remove that employee', 'error')
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-10">
        <SectionHeader
          title="Employee Directory"
          description="Manage and view all employees in your organization"
        />

        <DirectoryToolbar
          canManage={canManage}
          searchTerm={searchTerm}
          onSearchChange={(value) => {
            setSearchTerm(value)
            setPage(0)
          }}
          onClearSearch={() => {
            setSearchTerm('')
            setPage(0)
          }}
          onInvite={() => setIsInviteOpen(true)}
          onImport={() => setIsImportOpen(true)}
          onAddDepartment={() => setIsDeptModalOpen(true)}
          onAddEmployee={() => setIsModalOpen(true)}
        />

        {error && (
          <div role="alert" className="rounded-2xl border danger-panel p-6 text-sm backdrop-blur-md">
            {error}
          </div>
        )}

        <EmployeeTable
          employees={employees}
          loading={loading}
          searchTerm={searchTerm}
          deletingId={deletingId}
          canManage={canManage}
          onDelete={handleDelete}
          onAdd={() => setIsModalOpen(true)}
          pagination={{
            page,
            pageCount: pagination.totalPages,
            total: pagination.total,
            pageSize: PAGE_SIZE,
            onPageChange: setPage,
          }}
        />
      </div>

      <AddEmployeeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {isDeptModalOpen && <AddDepartmentDialog onClose={() => setIsDeptModalOpen(false)} />}
      <ImportEmployeesDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImported={(result) => {
          if (result.created.length > 0) {
            toast(`Imported ${result.created.length} employee${result.created.length === 1 ? '' : 's'}`)
            setPage(0)
            void refresh()
          }
        }}
      />
      <InviteUserDialog isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </AppLayout>
  )
}

// useSearchParams needs a Suspense boundary on a statically rendered route.
export default function EmployeesPage() {
  return (
    <Suspense fallback={null}>
      <EmployeeDirectory />
    </Suspense>
  )
}
