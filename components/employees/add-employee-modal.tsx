'use client'

import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { addEmployee } from '@/lib/redux/slices/employeeSlice'
import { CreateEmployeePayload } from '@/types/employee'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'

interface AddEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
}

const POSITIONS = [
  'Senior Software Engineer',
  'Software Engineer',
  'Junior Developer',
  'Product Manager',
  'Marketing Manager',
  'Sales Executive',
  'HR Specialist',
  'Financial Analyst',
  'Operations Manager',
  'UI/UX Designer',
]

export function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps) {
  const dispatch = useAppDispatch()
  const { departments } = useAppSelector((state) => state.employee)

  // Dialog keyboard behaviour: focus trap, Escape, scroll lock, focus restore.
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogA11y({ open: isOpen, containerRef: dialogRef, onClose })

  const [formData, setFormData] = useState({
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
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.email || !formData.employeeCode) {
      setError('Please fill in all required fields')
      return
    }

    const selectedDept = formData.departmentId || departments[0]?._id
    if (!selectedDept) {
      setError('Please select or create a department first')
      return
    }

    const salaryNum = formData.salary ? parseFloat(formData.salary) : undefined

    setLoading(true)
    try {
      const payload: CreateEmployeePayload = {
        name: formData.name,
        email: formData.email,
        employeeCode: formData.employeeCode,
        departmentId: selectedDept,
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
        setFormData({
          name: '',
          email: '',
          employeeCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
          departmentId: '',
          position: POSITIONS[0] || 'Software Engineer',
          joiningDate: new Date().toISOString().split('T')[0],
          salary: '',
          employmentType: 'full-time',
          phone: '',
        })
      } else {
        setError(result.payload || 'Failed to add employee')
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
            Add New Employee
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/60 press transition-colors hover:bg-white/50 hover:text-foreground dark:hover:bg-white/5"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl border danger-panel p-3 text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
              <Input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address *
              </label>
              <Input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Employee Code *
              </label>
              <Input
                type="text"
                name="employeeCode"
                placeholder="EMP-0001"
                value={formData.employeeCode}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Department *</label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                className="w-full h-10 rounded-xl border edge bg-white/80 px-3 text-sm text-foreground shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-2 ring-brand focus:border-brand dark:edge dark:surface-70"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Position</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full h-10 rounded-xl border edge bg-white/80 px-3 text-sm text-foreground shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-2 ring-brand focus:border-brand dark:edge dark:surface-70"
              >
                {POSITIONS.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Salary</label>
              <Input
                type="number"
                name="salary"
                placeholder="50000"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Joining Date</label>
              <Input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Employment Type
              </label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full h-10 rounded-xl border edge bg-white/80 px-3 text-sm text-foreground shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-2 ring-brand focus:border-brand dark:edge dark:surface-70"
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
              <Input
                type="tel"
                name="phone"
                placeholder="+1-234-567-8900"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-5 border-t edge">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 brand text-white border edge"
            >
              {loading ? 'Adding…' : 'Add Employee'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
