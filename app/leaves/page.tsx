'use client'

import { useEffect, useRef, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { Badge } from '@/components/common/badge'
import { DataTable } from '@/components/common/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Check, X, Calendar } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import {
  fetchLeaveRequests,
  fetchLeaveBalances,
  createLeaveRequest,
  approveRejectLeave,
} from '@/lib/redux/slices/leaveSlice'
import { fetchEmployees } from '@/lib/redux/slices/employeeSlice'
import { LeaveRequest } from '@/types/leave'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'

export default function LeavesPage() {
  const dispatch = useAppDispatch()
  const { requests, balances, loading, error } = useAppSelector((state) => state.leaves)
  const { employees } = useAppSelector((state) => state.employee)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'vacation',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    reasonForLeave: '',
  })
  const [modalError, setModalError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchLeaveRequests())
    dispatch(fetchLeaveBalances())
    dispatch(fetchEmployees())
  }, [dispatch])

  // Dialog keyboard behaviour: focus trap, Escape, scroll lock, focus restore.
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogA11y({
    open: isModalOpen,
    containerRef: dialogRef,
    onClose: () => setIsModalOpen(false),
  })

  const handleStatusChange = async (id: string, leaveStatus: 'approved' | 'rejected') => {
    let rejectionReason: string | undefined
    if (leaveStatus === 'rejected') {
      const reason = window.prompt('Rejection reason:')
      if (!reason?.trim()) return
      rejectionReason = reason.trim()
    }
    await dispatch(approveRejectLeave({ _id: id, leaveStatus, rejectionReason }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError('')

    const empId = formData.employeeId || employees[0]?._id
    if (!empId) {
      setModalError('No employee selected')
      return
    }

    if (!formData.reasonForLeave.trim()) {
      setModalError('Please provide a reason for leave')
      return
    }

    setSubmitting(true)
    try {
      const result = await dispatch(
        createLeaveRequest({
          employeeId: empId,
          leaveType: formData.leaveType,
          fromDate: formData.fromDate,
          toDate: formData.toDate,
          reasonForLeave: formData.reasonForLeave,
        }),
      )

      if (createLeaveRequest.fulfilled.match(result)) {
        setIsModalOpen(false)
        setFormData({
          employeeId: '',
          leaveType: 'vacation',
          fromDate: new Date().toISOString().split('T')[0],
          toDate: new Date().toISOString().split('T')[0],
          reasonForLeave: '',
        })
      } else {
        setModalError(result.payload || 'Failed to submit leave request')
      }
    } catch {
      setModalError('An error occurred while submitting')
    } finally {
      setSubmitting(false)
    }
  }

  const getBadgeVariant = (status: string) => {
    if (status === 'approved') return 'success'
    if (status === 'rejected') return 'destructive'
    return 'warning'
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

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
          <div className="rounded-2xl border danger-panel p-6 text-sm backdrop-blur-md">
            {error}
          </div>
        )}

        {/* Leave balances */}
        {balances.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3">
            {balances.map((b) => (
              <div
                key={b._id}
                className="group flex flex-col gap-3 rounded-2xl border edge bg-white/70 p-5 shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:edge dark:surface-85"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground capitalize">
                    {b.leaveType} Leave
                  </span>
                  <Calendar
                    size={16}
                    className="text-foreground/60 transition-colors group-hover:text-foreground/70"
                  />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">{b.remaining}</span>
                  <span className="text-sm text-foreground/65">days remaining</span>
                </div>
                <div className="flex justify-between border-t edge pt-3 text-xs text-foreground/60 dark:edge">
                  <span>Allocated: {b.totalAllocated}</span>
                  <span>Used: {b.used}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leave requests table */}
        <div className="overflow-hidden rounded-2xl border edge bg-white/70 shadow-xl shadow-black/5 backdrop-blur-md dark:edge dark:surface-85">
          {loading && requests.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-foreground/65">
              Loading leave requests…
            </div>
          ) : requests.length > 0 ? (
            <DataTable<LeaveRequest>
              columns={[
                {
                  header: 'Employee',
                  accessor: 'employeeId',
                  render: (emp) =>
                    typeof emp === 'object' && emp !== null ? emp.name : 'Employee',
                },
                {
                  header: 'Leave Type',
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
                  className: 'text-foreground/60 text-sm max-w-[180px] truncate block',
                },
                {
                  header: 'Status',
                  accessor: 'leaveStatus',
                  render: (status) => (
                    <Badge variant={getBadgeVariant(status)}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  ),
                },
                {
                  header: 'Actions',
                  accessor: '_id',
                  render: (id, row) =>
                    row.leaveStatus === 'pending' ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 success-text hover:success-panel"
                          onClick={() => handleStatusChange(id as string, 'approved')}
                          title="Approve"
                        >
                          <Check size={16} />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 danger-text hover:danger-panel"
                          onClick={() => handleStatusChange(id as string, 'rejected')}
                          title="Reject"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ) : null,
                  className: 'text-right',
                },
              ]}
              data={requests}
            />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-sm text-foreground/65">
              <p>No leave requests found.</p>
              <p className="mt-1 text-xs">Click &quot;Request Leave&quot; to apply.</p>
            </div>
          )}
        </div>
      </div>

      {/* Request leave modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-leave-title"
            className="w-full max-w-lg rounded-2xl border edge bg-white/95 p-6 shadow-2xl shadow-black/10 backdrop-blur-xl dark:edge dark:surface-95"
          >
            <div className="mb-5 flex items-center justify-between border-b edge pb-4">
              <h2 id="request-leave-title" className="text-xl font-bold text-foreground">
                Request Leave
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/65 press transition-colors hover:bg-white/50 hover:text-foreground dark:hover:bg-white/5"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 rounded-xl border danger-panel p-3 text-sm backdrop-blur-sm">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full h-10 rounded-xl border edge bg-white/80 px-3 text-sm text-foreground shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-2 ring-brand focus:border-brand dark:edge dark:surface-70"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Leave Type</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full h-10 rounded-xl border edge bg-white/80 px-3 text-sm text-foreground shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-2 ring-brand focus:border-brand dark:edge dark:surface-70"
                >
                  <option value="vacation">Vacation</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                  <option value="maternity">Maternity / Paternity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    From Date
                  </label>
                  <Input
                    type="date"
                    value={formData.fromDate}
                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">To Date</label>
                  <Input
                    type="date"
                    value={formData.toDate}
                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reason for Leave
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Annual family vacation"
                  value={formData.reasonForLeave}
                  onChange={(e) => setFormData({ ...formData, reasonForLeave: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4 border-t edge">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 brand text-white border edge"
                >
                  {submitting ? 'Submitting…' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
