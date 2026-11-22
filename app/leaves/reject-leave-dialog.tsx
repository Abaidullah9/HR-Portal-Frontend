'use client'

import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'

interface RejectLeaveDialogProps {
  employeeName: string
  busy: boolean
  onCancel: () => void
  onConfirm: (reason: string) => void
}

/**
 * Collects the rejection reason in a real dialog: `window.prompt` blocks the
 * tab, cannot be styled or validated, and is suppressed in some browsers — which
 * silently swallowed the rejection.
 */
export function RejectLeaveDialog({
  employeeName,
  busy,
  onCancel,
  onConfirm,
}: RejectLeaveDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogA11y({
    open: true,
    containerRef: dialogRef,
    onClose: onCancel,
    initialFocusSelector: '#reject-reason',
  })

  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = reason.trim()
    if (!trimmed) {
      setError('Give a reason so the employee knows what to fix.')
      return
    }
    onConfirm(trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onCancel()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-leave-title"
        className="w-full max-w-md rounded-2xl border edge bg-white/95 p-6 shadow-2xl shadow-black/10 backdrop-blur-xl dark:edge dark:surface-95"
      >
        <div className="mb-5 flex items-center justify-between border-b edge pb-4">
          <h2 id="reject-leave-title" className="text-xl font-bold text-foreground">
            Reject leave request
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/60 press pointer-coarse:min-h-11 pointer-coarse:min-w-11 transition-colors hover:bg-white/50 hover:text-foreground dark:hover:bg-white/5"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-foreground/70">
          {employeeName}&rsquo;s request will be rejected. They see the reason you give here.
        </p>

        {error && (
          <div role="alert" className="mt-4 rounded-xl border danger-panel p-3 text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="reject-reason"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Reason
            </label>
            <textarea
              id="reject-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              required
              aria-describedby={error ? 'reject-reason-error' : undefined}
              className="w-full rounded-xl border edge bg-white/80 px-3 py-2 text-sm text-foreground shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 ring-brand focus:border-brand dark:edge dark:surface-70"
            />
            {error && (
              <p id="reject-reason-error" className="mt-1 text-xs danger-text">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t edge">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={busy}
              variant="destructive"
              className="flex-1"
            >
              {busy ? 'Rejecting…' : 'Reject request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
