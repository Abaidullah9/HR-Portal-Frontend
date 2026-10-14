'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { createJobPosting } from '@/lib/redux/slices/recruitmentSlice'
import { fetchDepartments } from '@/lib/redux/slices/employeeSlice'
import { CreateJobPostingPayload } from '@/types/recruitment'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'

interface PostJobModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PostJobModal({ isOpen, onClose }: PostJobModalProps) {
  const dispatch = useAppDispatch()
  const { departments } = useAppSelector((state) => state.employee)

  const [formData, setFormData] = useState({
    position: '',
    departmentId: '',
    description: '',
    numberOfOpenings: '1',
    closingDate: '',
  })
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
  // Initial focus matches the existing "focus the first field" behaviour.
  useDialogA11y({ open: isOpen, containerRef: dialogRef, onClose, initialFocusSelector: '#job-position' })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.position.trim()) {
      setError('Position is required')
      return
    }
    const departmentId = formData.departmentId || departments[0]?._id
    if (!departmentId) {
      setError('Please select a department')
      return
    }
    if (!formData.description.trim()) {
      setError('Description is required')
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
        setFormData({
          position: '',
          departmentId: '',
          description: '',
          numberOfOpenings: '1',
          closingDate: '',
        })
      } else {
        setError(result.payload || 'Failed to post job')
      }
    } catch {
      setError('Failed to post job')
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
        {/* Header */}
        <div className="mb-6 border-b edge pb-6 flex items-center justify-between">
          <h2 id="post-job-title" className="text-xl font-bold text-foreground">
            Post a Job
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/60 press transition-colors hover:bg-white/50 hover:text-foreground dark:hover:bg-white/5"
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="job-position"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Position *
              </label>
              <Input
                id="job-position"
                type="text"
                name="position"
                placeholder="e.g. Senior Software Engineer"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label
                htmlFor="job-department"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Department *
              </label>
              <select
                id="job-department"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                required
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
              <label
                htmlFor="job-openings"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Openings
              </label>
              <Input
                id="job-openings"
                type="number"
                name="numberOfOpenings"
                min={1}
                value={formData.numberOfOpenings}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="job-closing"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Closing Date
              </label>
              <Input
                id="job-closing"
                type="date"
                name="closingDate"
                value={formData.closingDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="job-description"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Description *
            </label>
            <textarea
              id="job-description"
              name="description"
              rows={4}
              placeholder="Role summary, responsibilities, and requirements..."
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full h-28 rounded-xl border edge bg-white/80 px-3 py-2 text-sm text-foreground placeholder:text-foreground/60 shadow-sm resize-y backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-2 ring-brand focus:border-brand dark:edge dark:surface-70"
            />
          </div>

          <div className="flex gap-3 pt-5 border-t edge">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 brand text-white border edge"
            >
              {loading ? 'Posting…' : 'Post Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
