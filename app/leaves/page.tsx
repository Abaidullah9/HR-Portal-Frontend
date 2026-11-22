'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/common/toast'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import {
  fetchLeaveRequests,
  fetchLeaveBalances,
  approveRejectLeave,
} from '@/lib/redux/slices/leaveSlice'
import { fetchEmployees } from '@/lib/redux/slices/employeeSlice'
import { PAGE_SIZE, PICKER_LIMIT } from '@/lib/api/page'
import type { LeaveRequest } from '@/types/leave'
import { LeaveBalances } from './leave-balances'
import { LeaveTable } from './leave-table'
import { LeaveRequestDialog } from './leave-request-dialog'
import { RejectLeaveDialog } from './reject-leave-dialog'

export default function LeavesPage() {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { can } = usePermissions()
  const { requests, balances, loading, error, pagination } = useAppSelector(
    (state) => state.leaves,
  )
  const { employees } = useAppSelector((state) => state.employee)
  const [page, setPage] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [rejecting, setRejecting] = useState<LeaveRequest | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    void dispatch(fetchLeaveRequests({ page: page + 1, limit: PAGE_SIZE }))
  }, [dispatch, page])

  useEffect(() => {
    void dispatch(fetchLeaveBalances())
    void dispatch(fetchEmployees({ limit: PICKER_LIMIT }))
  }, [dispatch])

  const decide = async (
    request: LeaveRequest,
    status: 'approved' | 'rejected',
    rejectionReason?: string,
  ) => {
    setBusyId(request._id)
    try {
      const result = await dispatch(
        approveRejectLeave({ _id: request._id, leaveStatus: status, rejectionReason }),
      )
      if (approveRejectLeave.fulfilled.match(result)) {
        toast(status === 'approved' ? 'Leave approved' : 'Leave rejected')
      } else {
        toast('Could not update that request', 'error')
      }
    } finally {
      setBusyId(null)
    }
  }

  const handleStatusChange = (request: LeaveRequest, status: 'approved' | 'rejected') => {
    // Rejection needs a reason the employee will read, so collect it in a dialog
    // rather than a native prompt.
    if (status === 'rejected') {
      setRejecting(request)
      return
    }
    void decide(request, 'approved')
  }

  const employeeName = (request: LeaveRequest) =>
    typeof request.employeeId === 'object' && request.employeeId !== null
      ? request.employeeId.name
      : 'This employee'

  return (
    <AppLayout>
      <div className="space-y-10">
        <SectionHeader
          title="Leave Management"
          description="Manage and track employee leave requests and balances"
          action={
            <Button
              onClick={() => setIsModalOpen(true)}
              className="gap-2 brand text-white border edge"
            >
              <Plus size={18} />
              Request Leave
            </Button>
          }
        />

        {error && (
          <div role="alert" className="rounded-2xl border danger-panel p-6 text-sm backdrop-blur-md">
            {error}
          </div>
        )}

        <LeaveBalances balances={balances} />

        <LeaveTable
          requests={requests}
          loading={loading}
          busyId={busyId}
          canApprove={can('approveLeave')}
          onStatusChange={handleStatusChange}
          onRequestLeave={() => setIsModalOpen(true)}
          pagination={{
            page,
            pageCount: pagination.totalPages,
            total: pagination.total,
            pageSize: PAGE_SIZE,
            onPageChange: setPage,
          }}
        />
      </div>

      {isModalOpen && (
        <LeaveRequestDialog employees={employees} onClose={() => setIsModalOpen(false)} />
      )}

      {rejecting && (
        <RejectLeaveDialog
          employeeName={employeeName(rejecting)}
          busy={busyId === rejecting._id}
          onCancel={() => setRejecting(null)}
          onConfirm={async (reason) => {
            await decide(rejecting, 'rejected', reason)
            setRejecting(null)
          }}
        />
      )}
    </AppLayout>
  )
}
