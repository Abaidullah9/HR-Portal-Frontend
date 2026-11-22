'use client'

import { Input } from '@/components/ui/input'
import type { Employee } from '@/types/employee'

export interface LeaveFormValues {
  employeeId: string
  leaveType: string
  fromDate: string
  toDate: string
  reasonForLeave: string
}

interface LeaveRequestFieldsProps {
  formData: LeaveFormValues
  onChange: (patch: Partial<LeaveFormValues>) => void
  employees: Employee[]
}

const selectClass =
  'w-full h-10 rounded-xl border edge bg-white/80 px-3 text-sm text-foreground shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 ring-brand focus:border-brand dark:edge dark:surface-70'

const labelClass = 'block text-sm font-medium text-foreground mb-2'

export function LeaveRequestFields({ formData, onChange, employees }: LeaveRequestFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="leave-employee" className={labelClass}>
          Employee
        </label>
        <select
          id="leave-employee"
          value={formData.employeeId}
          onChange={(e) => onChange({ employeeId: e.target.value })}
          className={selectClass}
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
        <label htmlFor="leave-type" className={labelClass}>
          Leave Type
        </label>
        <select
          id="leave-type"
          value={formData.leaveType}
          onChange={(e) => onChange({ leaveType: e.target.value })}
          className={selectClass}
        >
          <option value="vacation">Vacation</option>
          <option value="sick">Sick Leave</option>
          <option value="personal">Personal Leave</option>
          <option value="maternity">Maternity / Paternity</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="leave-from" className={labelClass}>
            From Date
          </label>
          <Input
            id="leave-from"
            type="date"
            value={formData.fromDate}
            onChange={(e) => onChange({ fromDate: e.target.value })}
            required
          />
        </div>
        <div>
          <label htmlFor="leave-to" className={labelClass}>
            To Date
          </label>
          <Input
            id="leave-to"
            type="date"
            value={formData.toDate}
            onChange={(e) => onChange({ toDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="leave-reason" className={labelClass}>
          Reason for Leave
        </label>
        <Input
          id="leave-reason"
          type="text"
          placeholder="e.g. Annual family vacation"
          value={formData.reasonForLeave}
          onChange={(e) => onChange({ reasonForLeave: e.target.value })}
          required
        />
      </div>
    </>
  )
}
