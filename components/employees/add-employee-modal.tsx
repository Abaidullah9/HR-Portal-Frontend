'use client'

import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { addEmployee } from '@/lib/redux/slices/employeeSlice'
import { CreateEmployeePayload } from '@/types/employee'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'
import {
  EmployeeFormFields,
  EMPLOYEE_FIELD_IDS,
  POSITIONS,
  type EmployeeField,
} from './employee-form-fields'

interface AddEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const blankForm = () => ({
  name: '',
  email: '',
  employeeCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
  departmentId: '',
  position: POSITIONS[0] || 'Software Engineer',
  joiningDate: new Date().toISOString().split('T')[0],
  salary: '',
  employmentType: 'full-time' as const,
  phone: '',
})

export function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps) {
  const dispatch = useAppDispatch()
  const { departments } = useAppSelector((state) => state.employee)

  // Dialog keyboard behaviour: focus trap, Escape, scroll lock, focus restore.
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogA11y({ open: isOpen, containerRef: dialogRef, onClose })

  const [formData, setFormData] = useState(blankForm)
  const [errors, setErrors] = useState<Partial<Record<EmployeeField, string>>>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const clearFieldError = (name: EmployeeField) => {
    // A corrected field should stop shouting immediately.
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    clearFieldError(name as EmployeeField)
  }

  const handleSelectChange = (
    name: 'departmentId' | 'position' | 'employmentType',
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === 'departmentId') clearFieldError(name)
  }

  const validate = (): Partial<Record<EmployeeField, string>> => {
    const next: Partial<Record<EmployeeField, string>> = {}

    if (!formData.name.trim()) next.name = 'Enter the employee’s full name'
    if (!formData.email.trim()) {
      next.email = 'Enter an email address'
    } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
      next.email = 'Enter a valid email address, like name@company.com'
    }
    if (!formData.employeeCode.trim()) {
      next.employeeCode = 'Enter an employee code, like EMP-0001'
    }
    if (!formData.departmentId && !departments[0]?._id) {
      next.departmentId = 'Create a department before adding employees'
    }
    if (formData.salary) {
      const salary = Number(formData.salary)
      if (!Number.isFinite(salary) || salary < 0) {
        next.salary = 'Enter a salary of 0 or more'
      }
    }

    return next
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const fieldErrors = validate()
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) {
      const firstField = Object.keys(fieldErrors)[0] as EmployeeField
      document.getElementById(EMPLOYEE_FIELD_IDS[firstField])?.focus()
      return
    }

    const departmentId = formData.departmentId || departments[0]?._id
    if (!departmentId) return

    const salaryNum = formData.salary ? parseFloat(formData.salary) : undefined

    setLoading(true)
    try {
      const payload: CreateEmployeePayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        employeeCode: formData.employeeCode.trim(),
        departmentId,
        position: formData.position,
        joiningDate: formData.joiningDate || new Date().toISOString(),
        employmentType: formData.employmentType,
        salary: salaryNum,
        phone: formData.phone || undefined,
        isActive: true,
      }

      const result = await dispatch(addEmployee(payload))
      if (addEmployee.fulfilled.match(result)) {
        onClose()
        setFormData(blankForm())
        setErrors({})
      } else {
        setError(typeof result.payload === 'string' ? result.payload : 'Failed to add employee')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add employee')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

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
        aria-labelledby="add-employee-title"
        className="w-full max-w-2xl overflow-y-auto rounded-2xl border edge bg-white/95 p-6 shadow-2xl shadow-black/10 backdrop-blur-xl dark:edge dark:surface-95"
      >
        {/* Header */}
        <div className="mb-6 border-b edge pb-6 flex items-center justify-between">
          <h2 id="add-employee-title" className="text-xl font-bold text-foreground">
            Add new employee
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/60 press pointer-coarse:min-h-11 pointer-coarse:min-w-11 transition-colors hover:bg-white/50 hover:text-foreground dark:hover:bg-white/5"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && (
            <div role="alert" className="rounded-xl border danger-panel p-3 text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          <EmployeeFormFields
            formData={formData}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
            departments={departments}
            errors={errors}
          />

          {/* Buttons */}
          <div className="flex gap-3 pt-5 border-t edge">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 brand text-white border edge">
              {loading ? 'Adding…' : 'Add employee'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
