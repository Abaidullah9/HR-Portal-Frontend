'use client'

import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { createDepartment, fetchDepartments } from '@/lib/redux/slices/employeeSlice'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'
import { useToast } from '@/components/common/toast'

const labelClass = 'block text-sm font-medium text-foreground mb-2'

/**
 * Creates the department that employees are filed under. Without one the
 * employee form cannot be submitted, so this is reachable from the directory.
 */
export function AddDepartmentDialog({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch()
  const { departments } = useAppSelector((state) => state.employee)
  const toast = useToast()

  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogA11y({
    open: true,
    containerRef: dialogRef,
    onClose,
    initialFocusSelector: '#department-name',
  })

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Give the department a name.')
      return
    }
    if (departments.some((dept) => dept.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('A department with that name already exists.')
      return
    }

    setError('')
    setSaving(true)
    try {
      const result = await dispatch(
        createDepartment({ name: trimmed, description: description.trim() || undefined }),
      )
      if (createDepartment.fulfilled.match(result)) {
        toast(`Department “${trimmed}” created`)
        await dispatch(fetchDepartments())
        onClose()
      } else {
        setError(result.payload || 'Failed to create department')
      }
    } catch {
      setError('An error occurred while creating the department')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-department-title"
        className="w-full max-w-md rounded-2xl border edge bg-white/95 p-6 shadow-2xl shadow-black/10 backdrop-blur-xl dark:edge dark:surface-95"
      >
        <div className="mb-5 flex items-center justify-between border-b edge pb-4">
          <h2 id="add-department-title" className="text-xl font-bold text-foreground">
            Add Department
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

        {error && (
          <div role="alert" className="mb-4 rounded-xl border danger-panel p-3 text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="department-name" className={labelClass}>
              Name
            </label>
            <Input
              id="department-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Engineering"
              required
            />
          </div>

          <div>
            <label htmlFor="department-description" className={labelClass}>
              Description <span className="text-foreground/50">(optional)</span>
            </label>
            <Input
              id="department-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What this team does"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t edge">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 brand text-white border edge"
            >
              {saving ? 'Creating…' : 'Create department'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
