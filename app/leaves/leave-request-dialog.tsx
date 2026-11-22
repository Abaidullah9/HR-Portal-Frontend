'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { createLeaveRequest } from '@/lib/redux/slices/leaveSlice'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'
import { fetchOwnEmployee } from '@/lib/api/insights'
import type { Employee } from '@/types/employee'
import { LeaveRequestFields, type LeaveFormValues } from './leave-request-fields'

/** Inclusive day count, or null when the range is invalid. */
const requestedDays = (from: string, to: string): number | null => {
  const start = new Date(from).getTime()
  const end = new Date(to).getTime()
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null
  return Math.floor((end - start) / 86_400_000) + 1
}

const blankForm = (): LeaveFormValues => ({
  employeeId: '',
  leaveType: 'vacation',
  fromDate: new Date().toISOString().split('T')[0],
  toDate: new Date().toISOString().split('T')[0],
  reasonForLeave: '',
})

interface LeaveRequestDialogProps {
  employees: Employee[]
  onClose: () => void
}

/**
 * Mounted only while open, so the form resets each time it is reopened and the
 * dialog's focus trap starts from a clean state.
 */
export function LeaveRequestDialog({ employees, onClose }: LeaveRequestDialogProps) {
  const dispatch = useAppDispatch()
  const { balances } = useAppSelector((state) => state.leaves)
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogA11y({ open: true, containerRef: dialogRef, onClose })

  const [formData, setFormData] = useState(blankForm)
  const [modalError, setModalError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [ownEmployee, setOwnEmployee] = useState<Employee | null>(null)

  // Roles without read_Employee cannot list the directory, so they book leave
  // against their own linked employee record instead.
  useEffect(() => {
    if (employees.length > 0) return
    let cancelled = false
    void fetchOwnEmployee<Employee>()
      .then((employee) => !cancelled && setOwnEmployee(employee))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [employees.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError('')

    const empId = formData.employeeId || employees[0]?._id || ownEmployee?._id
    if (!empId) {
      setModalError('No employee selected')
      return
    }

    if (!formData.reasonForLeave.trim()) {
      setModalError('Please provide a reason for leave')
      return
    }

    // Spend the allowance the balances panel displays: a request longer than the
    // remaining days cannot be approved anyway.
    const days = requestedDays(formData.fromDate, formData.toDate)
    if (days === null) {
      setModalError('Choose an end date on or after the start date')
      return
    }
    const balance = balances.find((item) => item.leaveType === formData.leaveType)
    if (balance && days > balance.remaining) {
      setModalError(
        `Only ${balance.remaining} ${
          balance.remaining === 1 ? 'day' : 'days'
        } of ${formData.leaveType} leave remain, but this request is ${days} ${
          days === 1 ? 'day' : 'days'
        }.`,
      )
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
        onClose()
        setFormData(blankForm())
      } else {
        setModalError(result.payload || 'Failed to submit leave request')
      }
    } catch {
      setModalError('An error occurred while submitting')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
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
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/65 press pointer-coarse:min-h-11 pointer-coarse:min-w-11 transition-colors hover:bg-white/50 hover:text-foreground dark:hover:bg-white/5"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {modalError && (
          <div role="alert" className="mb-4 rounded-xl border danger-panel p-3 text-sm backdrop-blur-sm">
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <LeaveRequestFields
            formData={formData}
            employees={employees.length > 0 ? employees : ownEmployee ? [ownEmployee] : []}
            onChange={(patch) => setFormData((prev) => ({ ...prev, ...patch }))}
          />

          <div className="flex gap-3 pt-4 border-t edge">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
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
  )
}
