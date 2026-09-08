'use client'

import { useEffect, useState } from 'react'
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

  const handleStatusChange = async (id: string, leaveStatus: 'approved' | 'rejected') => {
    await dispatch(approveRejectLeave({ _id: id, leaveStatus }))
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
        })
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
      return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <SectionHeader
          title="Leave Management"
          description="Manage and track employee leave requests and balances"
          action={
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus size={18} />
              Request Leave
            </Button>
          }
        />

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Leave Balances Cards */}
        {balances.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {balances.map((b) => (
              <div key={b._id} className="bg-card border border-border rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold capitalize">{b.leaveType} Leave</span>
                  <Calendar size={18} className="text-muted-foreground" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{b.remaining}</span>
                  <span className="text-sm text-muted-foreground">days remaining</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex justify-between border-t border-border/50 pt-2">
                  <span>Allocated: {b.totalAllocated}</span>
                  <span>Used: {b.used}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leave Requests Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading && requests.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Loading leave requests...</div>
          ) : requests.length > 0 ? (
            <DataTable<LeaveRequest>
              columns={[
                {
                  header: 'Employee',
                  accessor: 'employeeId',
                  render: (emp) => (typeof emp === 'object' && emp !== null ? emp.name : 'Employee'),
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
                },
                {
                  header: 'To',
                  accessor: 'toDate',
                  render: (to) => formatDate(to),
                },
                {
                  header: 'Reason',
                  accessor: 'reasonForLeave',
                  className: 'text-muted-foreground text-sm max-w-xs truncate',
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
                  render: (id, row) => (
                    row.leaveStatus === 'pending' ? (
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 text-green-600 hover:bg-green-50 p-0"
                          onClick={() => handleStatusChange(id as string, 'approved')}
                          title="Approve"
                        >
                          <Check size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 p-0"
                          onClick={() => handleStatusChange(id as string, 'rejected')}
                          title="Reject"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ) : null
                  ),
                  className: 'text-right',
                },
              ]}
              data={requests}
            />
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No leave requests found. Click &quot;Request Leave&quot; to apply.
            </div>
          )}
        </div>
      </div>

      {/* Leave Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl max-w-lg w-full border border-border p-6">
            <h2 className="text-xl font-bold mb-4">Request Leave</h2>
            {modalError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-2 rounded-lg text-sm mb-4">
                {modalError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm"
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
                <label className="block text-sm font-medium mb-1">Leave Type</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm"
                >
                  <option value="vacation">Vacation</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                  <option value="maternity">Maternity/Paternity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">From Date</label>
                  <Input
                    type="date"
                    value={formData.fromDate}
                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">To Date</label>
                  <Input
                    type="date"
                    value={formData.toDate}
                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reason for Leave</label>
                <Input
                  type="text"
                  placeholder="e.g. Annual family vacation"
                  value={formData.reasonForLeave}
                  onChange={(e) => setFormData({ ...formData, reasonForLeave: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
