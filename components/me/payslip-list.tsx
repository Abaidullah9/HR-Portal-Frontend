import { Banknote, Download } from 'lucide-react'
import { DataTableSkeleton } from '@/components/common/data-table'
import { EmptyState, ErrorState } from '@/components/common/state-panel'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { downloadMyPayslip, type Payslip } from '@/lib/api/payroll'
import { formatDate, formatMoney, toSentenceCase } from '@/lib/utils'

interface PayslipListProps {
  payslips: Payslip[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function PayslipList({ payslips, loading, error, onRetry }: PayslipListProps) {
  const [downloadError, setDownloadError] = useState('')
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const download = async (slip: Payslip) => {
    setDownloadError('')
    setDownloadingId(slip.id)
    try {
      await downloadMyPayslip(slip)
    } catch (problem) {
      setDownloadError(problem instanceof Error ? problem.message : 'Could not download the payslip')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <section aria-labelledby="my-payslips-heading" className="space-y-4">
      <h2 id="my-payslips-heading" className="flex items-center gap-2 text-lg font-semibold">
        <Banknote size={18} aria-hidden="true" />
        Payslips
      </h2>

      {error ? (
        <div className="panel">
          <ErrorState title="Couldn't load your payslips" description={error} onRetry={onRetry} />
        </div>
      ) : loading ? (
        <div className="panel overflow-hidden">
          <div role="status" aria-busy="true">
            <span className="sr-only">Loading your payslips</span>
            <DataTableSkeleton rows={2} columns={3} />
          </div>
        </div>
      ) : payslips.length === 0 ? (
        <div className="panel overflow-hidden">
          <EmptyState
            icon={Banknote}
            title="No payslips yet"
            description="Payslips appear here once payroll is generated for a period."
          />
        </div>
      ) : (
        <div className="space-y-3">
        {downloadError && (
          <p role="alert" className="text-sm danger-text">
            {downloadError}
          </p>
        )}
        <ul className="space-y-3">
          {payslips.map((slip) => (
            <li key={slip.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium text-foreground">
                  {formatDate(slip.periodStart)} – {formatDate(slip.periodEnd)}
                </p>
                <p className="text-sm text-foreground/65">
                  Net pay {formatMoney(slip.netPay, slip.currency)}
                  {slip.status ? ` · ${toSentenceCase(slip.status)}` : ''}
                </p>
                {slip.payslipNumber && (
                  <p className="mt-1 font-mono text-xs tabular-nums text-foreground/60">
                    Payslip {slip.payslipNumber}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={downloadingId === slip.id}
                onClick={() => void download(slip)}
              >
                <Download size={15} aria-hidden="true" />
                {downloadingId === slip.id ? 'Preparing…' : 'Payslip PDF'}
              </Button>
            </li>
          ))}
        </ul>
        </div>
      )}
    </section>
  )
}
