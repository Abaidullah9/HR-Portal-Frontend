'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

const labelClass = 'block text-sm font-medium text-foreground mb-2'

const LEAVE_TYPES = [
  { value: 'vacation', label: 'Vacation' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal Leave' },
  { value: 'maternity', label: 'Maternity / Paternity' },
]

export function LeaveRequestFields({ formData, onChange, employees }: LeaveRequestFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="leave-employee" className={labelClass}>
          Employee
        </label>
        <Select
          items={employees.map((emp) => ({
            value: emp._id,
            label: `${emp.name} (${emp.employeeCode})`,
          }))}
          value={formData.employeeId || null}
          onValueChange={(value) => onChange({ employeeId: value ?? '' })}
        >
          <SelectTrigger id="leave-employee" className="h-10 w-full">
            <SelectValue placeholder="Select Employee" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((emp) => (
              <SelectItem key={emp._id} value={emp._id}>
                {emp.name} ({emp.employeeCode})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="leave-type" className={labelClass}>
          Leave Type
        </label>
        <Select
          items={LEAVE_TYPES}
          value={formData.leaveType}
          onValueChange={(value) => onChange({ leaveType: value ?? 'vacation' })}
        >
          <SelectTrigger id="leave-type" className="h-10 w-full">
            <SelectValue placeholder="Select leave type" />
          </SelectTrigger>
          <SelectContent>
            {LEAVE_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
