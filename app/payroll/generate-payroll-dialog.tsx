'use client'

import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'
import { generatePayrollPeriod, type PayrollPeriodResult } from '@/lib/api/insights'

const monthBounds = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const iso = (date: Date) => date.toISOString().slice(0, 10)
  return { start: iso(start), end: iso(end) }
}

interface GeneratePayrollDialogProps {
  onClose: () => void
  onGenerated: (result: PayrollPeriodResult) => void
}

export function GeneratePayrollDialog({ onClose, onGenerated }: GeneratePayrollDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogA11y({ open: true, containerRef: dialogRef, onClose })

  const bounds = monthBounds()
  const [start, setStart] = useState(bounds.start)
  const [end, setEnd] = useState(bounds.end)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!start || !end) {
      setError('Choose both the start and end of the period')
      return
    }
    if (new Date(end) < new Date(start)) {
      setError('The period end must be after its start')
      return
    }

    setBusy(true)
    try {
      const result = await generatePayrollPeriod(start, end)
      onGenerated(result)
      onClose()
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not generate the period')
    } finally {
      setBusy(false)
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
        aria-labelledby="generate-payroll-title"
        className="w-full max-w-md rounded-2xl border edge bg-white/95 p-6 shadow-2xl shadow-black/10 backdrop-blur-xl dark:edge dark:surface-95"
      >
        <div className="mb-5 flex items-center justify-between border-b edge pb-4">
          <h2 id="generate-payroll-title" className="text-xl font-bold text-foreground">
            Generate payroll
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground/65 press pointer-coarse:min-h-11 pointer-coarse:min-w-11 transition-colors hover:bg-white/50 hover:text-foreground dark:hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-4 text-sm text-foreground/65">
          Creates a pending record for every active employee with a salary on file. Employees
          already paid in this period are skipped, so running it twice is safe.
        </p>

        {error && (
          <div role="alert" className="mb-4 rounded-xl border danger-panel p-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="period-start" className="mb-2 block text-sm font-medium text-foreground">
              Period start
            </label>
            <Input
              id="period-start"
              type="date"
              value={start}
              onChange={(event) => setStart(event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="period-end" className="mb-2 block text-sm font-medium text-foreground">
              Period end
            </label>
            <Input
              id="period-end"
              type="date"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
            />
          </div>

          <div className="flex gap-3 border-t edge pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={busy} className="flex-1 brand text-white border edge">
              {busy ? 'Generating…' : 'Generate'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
