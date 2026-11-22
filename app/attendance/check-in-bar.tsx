'use client'

import { useState } from 'react'
import { CheckCircle, LogIn, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { dayKey, formatTime, recordEmployeeId, todayKey } from '@/lib/attendance'
import type { AttendanceRecord } from '@/types/attendance'
import type { Employee } from '@/types/employee'

interface CheckInBarProps {
  employees: Employee[]
  records: AttendanceRecord[]
  busy: boolean
  onCheckIn: (employeeId: string) => void
  onCheckOut: (recordId: string) => void
}

/**
 * Logs a real arrival or departure for a named employee. The previous version
 * checked in whichever employee happened to be first in the list, which wrote
 * misleading records.
 */
export function CheckInBar({
  employees,
  records,
  busy,
  onCheckIn,
  onCheckOut,
}: CheckInBarProps) {
  const [employeeId, setEmployeeId] = useState('')

  const today = todayKey()
  const todaysRecord = employeeId
    ? records.find(
        (record) => recordEmployeeId(record) === employeeId && dayKey(record.date) === today,
      )
    : undefined

  const stage = !employeeId
    ? 'idle'
    : !todaysRecord
      ? 'not-checked-in'
      : !todaysRecord.checkOut
        ? 'checked-in'
        : 'checked-out'

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[16rem] flex-1">
          <label
            htmlFor="attendance-employee"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Employee
          </label>
          <select
            id="attendance-employee"
            value={employeeId}
            onChange={(event) => setEmployeeId(event.target.value)}
            disabled={employees.length === 0}
            className="h-10 w-full rounded-xl border edge bg-white/80 px-3 text-sm text-foreground shadow-sm backdrop-blur-md focus:border-brand focus:outline-none focus:ring-2 ring-brand dark:edge dark:surface-70"
          >
            <option value="">
              {employees.length === 0 ? 'No employees available' : 'Select an employee'}
            </option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.name} ({employee.employeeCode})
              </option>
            ))}
          </select>
        </div>

        {stage === 'not-checked-in' && (
          <Button
            type="button"
            onClick={() => onCheckIn(employeeId)}
            disabled={busy}
            className="gap-2 brand text-white border edge"
          >
            <LogIn size={16} aria-hidden="true" />
            {busy ? 'Saving…' : 'Check in'}
          </Button>
        )}

        {stage === 'checked-in' && todaysRecord && (
          <Button
            type="button"
            onClick={() => onCheckOut(todaysRecord._id)}
            disabled={busy}
            className="gap-2 brand text-white border edge"
          >
            <LogOut size={16} aria-hidden="true" />
            {busy ? 'Saving…' : 'Check out'}
          </Button>
        )}

        {stage === 'idle' && (
          <Button type="button" disabled className="gap-2">
            <LogIn size={16} aria-hidden="true" />
            Check in
          </Button>
        )}

        {stage === 'checked-out' && todaysRecord && (
          <p className="flex items-center gap-2 text-sm text-foreground/70">
            <CheckCircle size={16} className="success-text" aria-hidden="true" />
            Checked out at {formatTime(todaysRecord.checkOut)}
          </p>
        )}
      </div>

      <p aria-live="polite" className="mt-3 text-sm text-foreground/65">
        {stage === 'idle' && 'Choose an employee to log their arrival for today.'}
        {stage === 'not-checked-in' && 'No arrival logged for this employee today.'}
        {stage === 'checked-in' &&
          todaysRecord &&
          `Checked in at ${formatTime(todaysRecord.checkIn)}.`}
        {stage === 'checked-out' && 'This employee is already checked out for today.'}
      </p>
    </div>
  )
}
