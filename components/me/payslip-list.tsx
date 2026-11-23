import { Banknote, Download } from 'lucide-react'
import { DataTableSkeleton } from '@/components/common/data-table'
import { EmptyState, ErrorState } from '@/components/common/state-panel'
import { Button } from '@/components/ui/button'
import { downloadPayslip, type Payslip } from '@/lib/api/payroll'
import { formatDate, toSentenceCase } from '@/lib/utils'

interface PayslipListProps {
  payslips: Payslip[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function PayslipList({ payslips, loading, error, onRetry }: PayslipListProps) {
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
        <ul className="space-y-3">
          {payslips.map((slip) => (
            <li key={slip.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium text-foreground">
                  {formatDate(slip.periodStart)} – {formatDate(slip.periodEnd)}
                </p>
                <p className="text-sm text-foreground/65">
                  Net pay{' '}
                  {slip.netPay.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  {slip.status ? ` · ${toSentenceCase(slip.status)}` : ''}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => downloadPayslip(slip)}
              >
                <Download size={15} aria-hidden="true" />
                Payslip
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
