'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { createJobPosting } from '@/lib/redux/slices/recruitmentSlice'
import { fetchDepartments } from '@/lib/redux/slices/employeeSlice'
import type { CreateJobPostingPayload } from '@/types/recruitment'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'
import { JobFormFields, type JobFormValues } from './job-form-fields'

const blankForm: JobFormValues = {
  position: '',
  departmentId: '',
  description: '',
  numberOfOpenings: '1',
  closingDate: '',
}

interface PostJobModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PostJobModal({ isOpen, onClose }: PostJobModalProps) {
  const dispatch = useAppDispatch()
  const { departments } = useAppSelector((state) => state.employee)

  const [formData, setFormData] = useState<JobFormValues>(blankForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setError('')
      if (departments.length === 0) {
        dispatch(fetchDepartments())
      }
    }
  }, [isOpen, dispatch, departments.length])

  const dialogRef = useRef<HTMLDivElement>(null)
  // Dialog keyboard behaviour: focus trap, Escape, scroll lock, focus restore.
  useDialogA11y({
    open: isOpen,
    containerRef: dialogRef,
    onClose,
    initialFocusSelector: '#job-position',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: 'departmentId', value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.position.trim()) {
      setError('Enter a position')
      return
    }
    const departmentId = formData.departmentId || departments[0]?._id
    if (!departmentId) {
      setError('Select a department')
      return
    }
    if (!formData.description.trim()) {
      setError('Enter a description')
      return
    }
    const openings = parseInt(formData.numberOfOpenings, 10)
    if (!Number.isInteger(openings) || openings < 1) {
      setError('Number of openings must be at least 1')
      return
    }

    const payload: CreateJobPostingPayload = {
      position: formData.position.trim(),
      departmentId,
      description: formData.description.trim(),
      numberOfOpenings: openings,
      status: 'open',
      ...(formData.closingDate ? { closingDate: formData.closingDate } : {}),
    }

    setLoading(true)
    try {
      const result = await dispatch(createJobPosting(payload))
      if (createJobPosting.fulfilled.match(result)) {
        onClose()
        setFormData(blankForm)
      } else {
        setError(typeof result.payload === 'string' ? result.payload : 'Could not post the job')
      }
    } catch {
      setError('Could not post the job')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-job-title"
        className="w-full max-w-xl overflow-y-auto rounded-2xl border edge bg-white/95 p-6 shadow-2xl shadow-black/10 backdrop-blur-xl dark:edge dark:surface-95"
      >
        <div className="mb-6 flex items-center justify-between border-b edge pb-6">
          <h2 id="post-job-title" className="text-xl font-bold text-foreground">
            Post a job
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="press flex h-8 w-8 items-center justify-center rounded-lg text-foreground/60 pointer-coarse:min-h-11 pointer-coarse:min-w-11 transition-colors hover:bg-white/50 hover:text-foreground dark:hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-xl border danger-panel p-3 text-sm backdrop-blur-sm"
            >
              {error}
            </div>
          )}

          <JobFormFields
            values={formData}
            departments={departments}
            onChange={handleChange}
            onSelectChange={handleSelectChange}
          />

          <div className="flex gap-3 border-t edge pt-5">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 brand text-white border edge">
              {loading ? 'Posting…' : 'Post job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
