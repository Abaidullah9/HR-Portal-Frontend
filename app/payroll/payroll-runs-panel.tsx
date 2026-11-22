'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download, Lock, RotateCcw, ShieldCheck, Wallet } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState } from '@/components/common/state-panel'
import { useToast } from '@/components/common/toast'
import {
  approvePayrollRun,
  downloadPayrollRun,
  fetchPayrollRuns,
  markPayrollRunPaid,
  reversePayrollRun,
  type PayrollRun,
  type PayrollRunStatus,
} from '@/lib/api/payrollRuns'
import { formatDate, toSentenceCase } from '@/lib/utils'

const variant = (status: PayrollRunStatus) => {
  if (status === 'paid') return 'success' as const
  if (status === 'reversed') return 'destructive' as const
  if (status === 'approved') return 'warning' as const
  return 'default' as const
}

/**
 * Payroll runs: the reviewable batch behind the per-employee records. Drafts can
 * be approved, approved runs marked paid, and a wrong run reversed with a reason.
 */
export function PayrollRunsPanel({ refreshKey = 0 }: { refreshKey?: number }) {
  const toast = useToast()
  const [runs, setRuns] = useState<PayrollRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRuns(await fetchPayrollRuns())
      setError(null)
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not load payroll runs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  const act = async (run: PayrollRun, action: 'approve' | 'pay' | 'reverse') => {
    setBusy(run._id)
    try {
      if (action === 'approve') {
        await approvePayrollRun(run._id)
        toast('Run approved')
      } else if (action === 'pay') {
        await markPayrollRunPaid(run._id)
        toast('Run marked paid')
      } else {
        const reason = window.prompt('Why is this run being reversed?')
        if (!reason?.trim()) return
        await reversePayrollRun(run._id, reason.trim())
        toast('Run reversed')
      }
      await load()
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'That action failed', 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <section aria-labelledby="payroll-runs-heading" className="space-y-4">
      <div>
        <h2 id="payroll-runs-heading" className="text-lg font-semibold">
          Payroll runs
        </h2>
        <p className="text-sm text-foreground/65">
          A run is approved as a batch before it is paid. Reversing a run voids its records.
        </p>
      </div>

      <div className="panel overflow-hidden">
        {loading && runs.length === 0 ? (
          <div role="status" aria-busy="true" className="p-6">
            <span className="sr-only">Loading payroll runs</span>
            <div className="h-4 w-48 animate-pulse rounded bg-foreground/10" />
          </div>
        ) : error ? (
          <ErrorState title="Couldn't load payroll runs" description={error} onRetry={() => void load()} />
        ) : runs.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No payroll runs yet"
            description="Generate a period to create a draft run you can review before paying."
          />
        ) : (
          <ul className="divide-y edge">
            {runs.map((run) => (
              <li key={run._id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-semibold">
                    {formatDate(run.periodStart)} – {formatDate(run.periodEnd)}
                  </p>
                  <p className="text-sm text-foreground/65">
                    {run.employeeCount} employee{run.employeeCount === 1 ? '' : 's'} ·{' '}
                    {run.totalNetPay.toLocaleString()} {run.currency}
                  </p>
                  {run.reversalReason && (
                    <p className="mt-1 text-xs text-foreground/60">Reversed: {run.reversalReason}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={variant(run.status)}>{toSentenceCase(run.status)}</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() =>
                      void downloadPayrollRun(run).catch((problem) =>
                        toast(problem instanceof Error ? problem.message : 'Export failed', 'error'),
                      )
                    }
                  >
                    <Download size={14} /> CSV
                  </Button>
                  {run.status === 'draft' && (
                    <Button
                      size="sm"
                      className="gap-1.5"
                      disabled={busy === run._id}
                      onClick={() => void act(run, 'approve')}
                    >
                      <ShieldCheck size={14} /> Approve
                    </Button>
                  )}
                  {run.status === 'approved' && (
                    <Button
                      size="sm"
                      className="gap-1.5"
                      disabled={busy === run._id}
                      onClick={() => void act(run, 'pay')}
                    >
                      <Lock size={14} /> Mark paid
                    </Button>
                  )}
                  {run.status !== 'reversed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      disabled={busy === run._id}
                      onClick={() => void act(run, 'reverse')}
                    >
                      <RotateCcw size={14} /> Reverse
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
