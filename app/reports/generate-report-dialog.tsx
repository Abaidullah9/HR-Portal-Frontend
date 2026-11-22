'use client'

import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppDispatch } from '@/lib/redux/store'
import { generateReport } from '@/lib/redux/slices/reportSlice'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'

/**
 * Mounted only while open: the form starts empty each time, and the dialog's
 * focus trap is set up while the content actually exists.
 */
export function GenerateReportDialog({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch()
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogA11y({ open: true, containerRef: dialogRef, onClose })

  const [reportName, setReportName] = useState('')
  const [category, setCategory] = useState('attendance')
  const [generating, setGenerating] = useState(false)
  const [modalError, setModalError] = useState('')

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportName.trim()) return

    setGenerating(true)
    setModalError('')

    try {
      const result = await dispatch(generateReport({ reportName, category }))

      if (generateReport.fulfilled.match(result)) {
        onClose()
        setReportName('')
      } else {
        setModalError(result.payload || 'Failed to generate report')
      }
    } catch {
      setModalError('An error occurred while generating the report')
    } finally {
      setGenerating(false)
    }
  }

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
        aria-labelledby="generate-report-title"
        className="w-full max-w-md rounded-2xl border edge bg-white/95 p-6 shadow-2xl shadow-black/10 backdrop-blur-xl dark:edge dark:surface-95"
      >
        <div className="mb-6 border-b edge pb-6 flex items-center justify-between">
          <h2 id="generate-report-title" className="text-xl font-bold text-foreground">
            Generate New Report
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

        {modalError && (
          <div role="alert" className="mb-4 rounded-xl border danger-panel p-3 text-sm backdrop-blur-sm">
            {modalError}
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label
              htmlFor="report-name"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Report Name
            </label>
            <Input
              id="report-name"
              type="text"
              placeholder="e.g. Q4 Attendance Summary"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="report-category"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Category
            </label>
            <select
              id="report-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 rounded-xl border edge bg-white/80 px-3 text-sm text-foreground shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 ring-brand focus:border-brand dark:edge dark:surface-70"
            >
              <option value="attendance">Attendance</option>
              <option value="payroll">Payroll</option>
              <option value="performance">Performance</option>
              <option value="recruitment">Recruitment</option>
            </select>
          </div>

          <div className="flex gap-3 pt-5 border-t edge">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={generating}
              className="flex-1 brand text-white border edge"
            >
              {generating ? 'Generating…' : 'Generate'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
