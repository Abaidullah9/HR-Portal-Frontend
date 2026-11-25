'use client'

import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'
import { dayKey } from '@/lib/attendance'
import { formatDate } from '@/lib/utils'
import type { AttendanceRecord, UpdateAttendancePayload } from '@/types/attendance'

const employeeName = (record: AttendanceRecord) =>
  typeof record.employeeId === 'object' && record.employeeId !== null
    ? record.employeeId.name
    : 'Employee'

/** "HH:MM" in local time, the value a time input expects. */
const clock = (value?: string): string => {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`
}

/** The stored instant for a time on the record's own calendar day. */
const instant = (day: string, time: string): string | undefined => {
  if (!time) return undefined
  const parsed = new Date(`${day}T${time}`)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
}

interface CorrectionDialogProps {
  record: AttendanceRecord
  submitting: boolean
  onClose: () => void
  onSubmit: (payload: UpdateAttendancePayload) => void
}

export function CorrectionDialog({ record, submitting, onClose, onSubmit }: CorrectionDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogA11y({ open: true, containerRef: dialogRef, onClose })

  const [checkIn, setCheckIn] = useState(clock(record.checkIn))
  const [checkOut, setCheckOut] = useState(clock(record.checkOut))
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const day = dayKey(record.date)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!note.trim()) {
      setError('Add a note explaining the correction')
      return
    }
    const checkInAt = instant(day, checkIn)
    const checkOutAt = instant(day, checkOut)
    if (!checkInAt && !checkOutAt) {
      setError('Set a check-in or check-out time')
      return
    }
    if (checkInAt && checkOutAt && new Date(checkOutAt) <= new Date(checkInAt)) {
      setError('Check-out must be after check-in')
      return
    }

    onSubmit({
      ...(checkInAt ? { checkIn: checkInAt } : {}),
      ...(checkOutAt ? { checkOut: checkOutAt } : {}),
      regularizationNote: note.trim(),
    })
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
        aria-labelledby="correction-title"
        className="w-full max-w-md rounded-2xl border edge bg-white/95 p-6 shadow-2xl shadow-black/10 backdrop-blur-xl dark:edge dark:surface-95"
      >
        <div className="mb-5 flex items-center justify-between border-b edge pb-4">
          <h2 id="correction-title" className="text-xl font-bold text-foreground">
            Correct attendance
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

        <p className="mb-4 text-sm text-foreground/70">
          {employeeName(record)} · {formatDate(record.date)}
        </p>

        {error && (
          <div role="alert" className="mb-4 rounded-xl border danger-panel p-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="correction-in" className="text-sm font-medium text-foreground">
                Check-in
              </label>
              <Input
                id="correction-in"
                type="time"
                value={checkIn}
                onChange={(event) => setCheckIn(event.target.value)}
                className="mt-1 w-full"
              />
            </div>
            <div>
              <label htmlFor="correction-out" className="text-sm font-medium text-foreground">
                Check-out
              </label>
              <Input
                id="correction-out"
                type="time"
                value={checkOut}
                onChange={(event) => setCheckOut(event.target.value)}
                className="mt-1 w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="correction-note" className="text-sm font-medium text-foreground">
              Reason
            </label>
            <textarea
              id="correction-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              required
              rows={3}
              placeholder="Badge reader was down, approved by the line manager…"
              className="mt-1 w-full rounded-lg border edge bg-transparent p-3 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
            <p className="mt-1 text-xs text-foreground/55">
              The note is stored with the record and shows in the audit trail.
            </p>
          </div>

          <div className="flex gap-3 border-t edge pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 brand text-white border edge"
            >
              {submitting ? 'Saving…' : 'Save correction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
