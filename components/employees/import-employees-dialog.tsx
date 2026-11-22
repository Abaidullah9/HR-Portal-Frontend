'use client'

import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'
import { importEmployees, type ImportResult } from '@/lib/api/profile'
import { IMPORT_HEADER, parseCsv } from '@/lib/employees/import-csv'

interface ImportEmployeesDialogProps {
  isOpen: boolean
  onClose: () => void
  onImported: (result: ImportResult) => void
}

export function ImportEmployeesDialog({ isOpen, onClose, onImported }: ImportEmployeesDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogA11y({ open: isOpen, containerRef: dialogRef, onClose })

  const [text, setText] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setResult(null)

    const parsed = parseCsv(text)
    if (parsed.error) {
      setError(parsed.error)
      return
    }

    setLoading(true)
    try {
      const outcome = await importEmployees(parsed.rows)
      setResult(outcome)
      onImported(outcome)
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'The import failed')
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
        aria-labelledby="import-title"
        className="w-full max-w-2xl overflow-y-auto rounded-2xl border edge bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:surface-95"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="import-title" className="text-xl font-bold">
              Import employees
            </h2>
            <p className="mt-1 text-sm text-foreground/65">
              One person per line. Each row creates an employee and sends an invite — no shared passwords.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-foreground/60 hover:bg-foreground/5"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-2 text-xs text-foreground/60">
          Columns: <code>{IMPORT_HEADER}</code>
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="import-csv" className="mb-1 block text-sm font-medium">
              CSV rows
            </label>
            <textarea
              id="import-csv"
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={8}
              placeholder={`${IMPORT_HEADER}\nAda Lovelace,ada@company.com,Engineering,Engineer,2026-01-05,7000,manager@company.com`}
              className="w-full rounded-xl border edge bg-white/80 p-3 font-mono text-xs text-foreground"
            />
          </div>

          {error && (
            <div role="alert" className="rounded-xl border danger-panel p-3 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div role="status" className="rounded-xl border edge p-4 text-sm">
              <p className="font-medium">
                Created {result.created.length} of {result.total} rows.
              </p>
              {result.failed.length > 0 && (
                <ul className="mt-2 space-y-1 text-foreground/70">
                  {result.failed.map((failure) => (
                    <li key={`${failure.row}-${failure.email ?? ''}`}>
                      Row {failure.row}
                      {failure.email ? ` (${failure.email})` : ''}: {failure.reason}
                    </li>
                  ))}
                </ul>
              )}
              {result.created.some((row) => row.inviteLink) && (
                <details className="mt-3">
                  <summary className="cursor-pointer font-medium">Invite links</summary>
                  <ul className="mt-2 space-y-1 break-all font-mono text-xs">
                    {result.created
                      .filter((row) => row.inviteLink)
                      .map((row) => (
                        <li key={row.employeeId}>{row.inviteLink}</li>
                      ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t edge pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {result ? 'Done' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading || !text.trim()} className="gap-2">
              <Upload size={16} />
              {loading ? 'Importing…' : 'Import rows'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
