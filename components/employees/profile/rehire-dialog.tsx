'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DepartmentSelectField } from '@/components/employees/department-select-field'
import { RehireResultPanel } from './rehire-result-panel'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { fetchDepartments } from '@/lib/redux/slices/employeeSlice'
import { rehireEmployee, type EmployeeProfileEmployee, type RehireResult } from '@/lib/api/profile'
import { todayKey } from '@/lib/attendance'

const labelClass = 'mb-2 block text-sm font-medium text-foreground'

const departmentIdOf = (employee: EmployeeProfileEmployee) =>
  typeof employee.departmentId === 'object' && employee.departmentId !== null
    ? employee.departmentId._id
    : (employee.departmentId ?? '')

interface RehireDialogProps {
  employee: EmployeeProfileEmployee
  onClose: () => void
  onRehired: () => void
}

/** Restores a leaver without creating a second employee or login record. */
export function RehireDialog({ employee, onClose, onRehired }: RehireDialogProps) {
  const dispatch = useAppDispatch()
  const { departments } = useAppSelector((state) => state.employee)
  const dialogRef = useRef<HTMLDivElement>(null)

  const [joiningDate, setJoiningDate] = useState(todayKey())
  const [position, setPosition] = useState(employee.position)
  const [departmentId, setDepartmentId] = useState(departmentIdOf(employee))
  const [salary, setSalary] = useState(employee.salary ? String(employee.salary) : '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<RehireResult | null>(null)

  useDialogA11y({
    open: true,
    containerRef: dialogRef,
    onClose,
    initialFocusSelector: '#rehire-joining-date',
  })

  useEffect(() => {
    if (departments.length === 0) void dispatch(fetchDepartments())
  }, [departments.length, dispatch])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const amount = salary.trim() === '' ? undefined : Number(salary)
    if (amount !== undefined && (!Number.isFinite(amount) || amount < 0)) {
      setError('Enter a salary of zero or more.')
      return
    }

    setError('')
    setSaving(true)
    try {
      const next = await rehireEmployee(employee._id, {
        joiningDate,
        position: position.trim() || undefined,
        departmentId: departmentId || undefined,
        salary: amount,
      })
      setResult(next)
      onRehired()
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not rehire this employee')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rehire-title"
        className="w-full max-w-lg rounded-2xl border edge surface-95 p-6 shadow-2xl shadow-black/10 backdrop-blur-xl"
      >
        <div className="mb-5 flex items-center justify-between border-b edge pb-4">
          <h2 id="rehire-title" className="text-xl font-bold text-foreground">
            Rehire {employee.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/60 press pointer-coarse:min-h-11 pointer-coarse:min-w-11 transition-colors hover:bg-white/50 hover:text-foreground dark:hover:bg-white/5"
            aria-label="Close rehire dialog"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-xl border danger-panel p-3 text-sm">
            {error}
          </div>
        )}

        {result ? (
          <RehireResultPanel name={employee.name} result={result} onClose={onClose} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-foreground/65">
              This restores the same employee and login, clears the exit date and starts a new
              onboarding checklist. The person must accept a fresh invite to set a password.
            </p>

            <div>
              <label htmlFor="rehire-joining-date" className={labelClass}>
                New joining date
              </label>
              <Input
                id="rehire-joining-date"
                type="date"
                value={joiningDate}
                onChange={(event) => setJoiningDate(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="rehire-position" className={labelClass}>
                Position
              </label>
              <Input
                id="rehire-position"
                value={position}
                onChange={(event) => setPosition(event.target.value)}
                placeholder="e.g. Senior Engineer"
              />
            </div>

            <DepartmentSelectField
              value={departmentId}
              departments={departments}
              onChange={setDepartmentId}
            />

            <div>
              <label htmlFor="rehire-salary" className={labelClass}>
                Monthly salary (PKR)
              </label>
              <Input
                id="rehire-salary"
                type="number"
                min="0"
                step="1000"
                inputMode="decimal"
                value={salary}
                onChange={(event) => setSalary(event.target.value)}
                placeholder="Leave blank to keep the old rate"
              />
              <p className="mt-1 text-xs text-foreground/55">
                A new rate is recorded as effective from the joining date.
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t edge pt-4 sm:flex-row">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="flex-1 brand text-white border edge">
                {saving ? 'Rehiring…' : 'Rehire employee'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
