'use client'

import { useRef, useState } from 'react'
import { UserPlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { createCandidate } from '@/lib/redux/slices/recruitmentSlice'
import { useToast } from '@/components/common/toast'

/** Adds a candidate to a posting's pipeline. */
export function AddCandidateDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { jobPostings } = useAppSelector((state) => state.recruitment)
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogA11y({ open: isOpen, containerRef: dialogRef, onClose })

  const [jobPostingId, setJobPostingId] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [source, setSource] = useState('Careers page')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!jobPostingId) {
      setError('Choose the job posting this person applied to')
      return
    }

    setLoading(true)
    try {
      const result = await dispatch(
        createCandidate({
          jobPostingId,
          name: name.trim(),
          email: email.trim(),
          source,
          ...(phone.trim() ? { phone: phone.trim() } : {}),
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        }),
      )
      if (createCandidate.fulfilled.match(result)) {
        toast(`${result.payload.name} added to the pipeline`)
        setName('')
        setEmail('')
        setPhone('')
        setNotes('')
        onClose()
      } else {
        setError((result.payload as string) ?? 'Could not add the candidate')
      }
    } finally {
      setLoading(false)
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
        aria-labelledby="candidate-dialog-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border edge bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:surface-95"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="candidate-dialog-title" className="text-xl font-bold">
            Add candidate
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground/60 hover:bg-foreground/5"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="candidate-posting" className="mb-1 block text-sm font-medium">
              Job posting
            </label>
            <select
              id="candidate-posting"
              value={jobPostingId}
              onChange={(event) => setJobPostingId(event.target.value)}
              required
              className="h-10 w-full rounded-xl border edge bg-white/80 px-3 text-sm"
            >
              <option value="">Select a posting…</option>
              {jobPostings.map((posting) => (
                <option key={posting._id} value={posting._id}>
                  {posting.position}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="candidate-name" className="mb-1 block text-sm font-medium">
              Full name
            </label>
            <Input
              id="candidate-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="candidate-email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <Input
                id="candidate-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="candidate-phone" className="mb-1 block text-sm font-medium">
                Phone (optional)
              </label>
              <Input
                id="candidate-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="candidate-source" className="mb-1 block text-sm font-medium">
              Source
            </label>
            <Input
              id="candidate-source"
              value={source}
              onChange={(event) => setSource(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="candidate-notes" className="mb-1 block text-sm font-medium">
              Notes (optional)
            </label>
            <textarea
              id="candidate-notes"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full rounded-xl border edge bg-white/80 p-2 text-sm"
            />
          </div>

          {error && (
            <div role="alert" className="rounded-xl border danger-panel p-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t edge pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <UserPlus size={16} />
              {loading ? 'Adding…' : 'Add candidate'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
