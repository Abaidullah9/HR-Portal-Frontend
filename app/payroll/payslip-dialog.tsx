'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'
import { downloadPayslip, fetchPayslip, type Payslip } from '@/lib/api/payroll'
import { formatDate, formatMoney } from '@/lib/utils'

interface PayslipDialogProps {
  recordId: string
  onClose: () => void
}

export function PayslipDialog({ recordId, onClose }: PayslipDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogA11y({ open: true, containerRef: dialogRef, onClose })

  const [payslip, setPayslip] = useState<Payslip | null>(null)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    let active = true
    void fetchPayslip(recordId)
      .then((result) => {
        if (active) setPayslip(result)
      })
      .catch((problem) => {
        if (active) setError(problem instanceof Error ? problem.message : 'Could not load payslip')
      })
    return () => {
      active = false
    }
  }, [recordId])

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
        aria-labelledby="payslip-title"
        className="w-full max-w-lg rounded-2xl border edge bg-white/95 p-6 shadow-2xl shadow-black/10 backdrop-blur-xl dark:edge dark:surface-95"
      >
        <div className="mb-5 flex items-center justify-between border-b edge pb-4">
          <h2 id="payslip-title" className="text-xl font-bold text-foreground">
            Payslip
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

        {error ? (
          <div role="alert" className="rounded-xl border danger-panel p-3 text-sm">
            {error}
          </div>
        ) : !payslip ? (
          <div role="status" aria-busy="true" className="space-y-3">
            <span className="sr-only">Loading payslip</span>
            <div className="h-4 w-2/3 animate-pulse rounded bg-foreground/10" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-foreground/10" />
            <div className="h-24 animate-pulse rounded bg-foreground/10" />
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="font-semibold text-foreground">{payslip.employee.name}</p>
              <p className="text-sm text-foreground/65">
                {payslip.employee.code ? `${payslip.employee.code} · ` : ''}
                {formatDate(payslip.periodStart)} – {formatDate(payslip.periodEnd)} ·{' '}
                <span className="capitalize">{payslip.paymentMethod}</span>
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/55">
                  Earnings
                </h3>
                <dl className="space-y-1.5 text-sm">
                  {payslip.earnings.map((line, index) => (
                    <div key={`${line.label}-${index}`} className="flex justify-between gap-3">
                      <dt className="capitalize text-foreground/75">{line.label}</dt>
                      <dd className="tabular-nums text-foreground">{formatMoney(line.amount)}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/55">
                  Deductions
                </h3>
                {payslip.deductions.length === 0 ? (
                  <p className="text-sm text-foreground/65">None</p>
                ) : (
                  <dl className="space-y-1.5 text-sm">
                    {payslip.deductions.map((line, index) => (
                      <div key={`${line.label}-${index}`} className="flex justify-between gap-3">
                        <dt className="capitalize text-foreground/75">{line.label}</dt>
                        <dd className="tabular-nums text-foreground">{formatMoney(line.amount)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>

            <div className="space-y-1.5 border-t edge pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/65">Gross pay</span>
                <span className="tabular-nums text-foreground">{formatMoney(payslip.grossPay)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/65">Total deductions</span>
                <span className="tabular-nums text-foreground">{formatMoney(payslip.totalDeductions)}</span>
              </div>
              <div className="flex justify-between pt-2 text-base font-semibold">
                <span>Net pay</span>
                <span className="tabular-nums">{formatMoney(payslip.netPay)}</span>
              </div>
            </div>

            <div className="flex gap-3 border-t edge pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
              <Button
                type="button"
                disabled={downloading}
                onClick={async () => {
                  setDownloading(true)
                  setError('')
                  try {
                    await downloadPayslip(payslip)
                  } catch (problem) {
                    setError(
                      problem instanceof Error ? problem.message : 'Could not download the payslip',
                    )
                  } finally {
                    setDownloading(false)
                  }
                }}
                className="flex-1 brand text-white border edge gap-2"
              >
                <Download size={16} />
                {downloading ? 'Preparing…' : 'Download PDF'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
