'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle, DollarSign, Download, Plus, TrendingUp } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { StatCard } from '@/components/common/stat-card'
import { AccessDenied } from '@/components/common/access-denied'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/common/toast'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { roleNameOf } from '@/lib/auth/roles'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { fetchPayroll, updatePayrollStatus } from '@/lib/redux/slices/payrollSlice'
import { downloadCsv, toCsv } from '@/lib/csv'
import { PAGE_SIZE, PICKER_LIMIT } from '@/lib/api/page'
import { fetchPayrollSummary, type PayrollSummary } from '@/lib/api/insights'
import { GeneratePayrollDialog } from './generate-payroll-dialog'
import { PayslipDialog } from './payslip-dialog'
import { PayrollTable } from './payroll-table'
import { PayrollRunsPanel } from './payroll-runs-panel'

export default function PayrollPage() {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { can, canView } = usePermissions()
  const { user } = useAppSelector((state) => state.auth)
  const { records, loading, error, pagination } = useAppSelector((state) => state.payroll)
  const [page, setPage] = useState(0)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [summary, setSummary] = useState<PayrollSummary | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [payslipId, setPayslipId] = useState<string | null>(null)
  const [runsKey, setRunsKey] = useState(0)

  const loadSummary = useCallback(async () => {
    try {
      setSummary(await fetchPayrollSummary())
      setSummaryError(null)
    } catch (problem) {
      setSummaryError(problem instanceof Error ? problem.message : 'Could not load totals')
    }
  }, [])

  const roleReady = Boolean(user && roleNameOf(user))
  const canRead = canView('payroll')

  useEffect(() => {
    if (roleReady && canRead) {
      void dispatch(fetchPayroll({ page: page + 1, limit: PAGE_SIZE }))
    }
  }, [dispatch, page, roleReady, canRead])

  useEffect(() => {
    if (roleReady && canRead) void loadSummary()
  }, [loadSummary, roleReady, canRead])

  // Totals come from the API so they cover every record, not just this page.
  const stats = [
    {
      title: 'Total net payroll',
      value: summary ? `$${summary.totalNetPay.toLocaleString()}` : '--',
      icon: DollarSign,
    },
    {
      title: 'Records',
      value: summary ? summary.totalRecords.toString() : '--',
      icon: TrendingUp,
    },
    {
      title: 'Processed rate',
      value: summary ? `${summary.processedRate}%` : '--',
      icon: CheckCircle,
    },
  ]

  const handleMarkCompleted = async (id: string) => {
    setMarkingId(id)
    try {
      const result = await dispatch(updatePayrollStatus({ id, status: 'completed' }))
      if (updatePayrollStatus.fulfilled.match(result)) toast('Marked as paid')
      else toast('Could not update that record', 'error')
    } finally {
      setMarkingId(null)
      setRunsKey((key) => key + 1)
      await loadSummary()
    }
  }

  // The export covers the whole ledger, not the visible page, so it asks for the
  // API's largest allowed limit rather than reusing the paged rows.
  const exportCsv = async () => {
    const result = await dispatch(fetchPayroll({ page: 1, limit: PICKER_LIMIT }))
    if (!fetchPayroll.fulfilled.match(result)) {
      toast('Could not load records to export', 'error')
      return
    }

    const all = result.payload.data
    const rows: (string | number)[][] = [
      ['Employee', 'Base salary', 'Net pay', 'Period start', 'Payment method', 'Status'],
      ...all.map((record) => [
        typeof record.employeeId === 'object' &&
        record.employeeId !== null &&
        'name' in record.employeeId
          ? record.employeeId.name
          : 'Unknown',
        record.baseSalary ?? '',
        record.netPay ?? '',
        record.payPeriodStart ?? '',
        record.paymentMethod ?? '',
        record.status ?? '',
      ]),
    ]
    downloadCsv(`payroll-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows))
    toast(`Exported ${all.length} record${all.length === 1 ? '' : 's'}`)

    // The thunk just loaded the whole ledger over this page; restore it.
    await dispatch(fetchPayroll({ page: page + 1, limit: PAGE_SIZE }))
  }

  if (roleReady && !canRead) {
    return (
      <AppLayout>
        <div className="space-y-10">
          <SectionHeader
            title="Payroll management"
            description="Manage salaries, allowances, deductions and payment statuses"
          />
          <AccessDenied area="payroll" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-10">
        <SectionHeader
          title="Payroll management"
          description="Manage salaries, allowances, deductions and payment statuses"
          action={
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={exportCsv}
                disabled={pagination.total === 0}
                variant="outline"
                className="gap-2"
              >
                <Download size={18} />
                Export CSV
              </Button>
              {can('managePayroll') && (
                <Button
                  onClick={() => setGenerating(true)}
                  className="gap-2 brand text-white border edge"
                >
                  <Plus size={18} />
                  Generate period
                </Button>
              )}
            </div>
          }
        />

        {(error ?? summaryError) && (
          <div role="alert" className="rounded-2xl border danger-panel p-6 text-sm backdrop-blur-md">
            {error ?? summaryError}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <PayrollTable
          records={records}
          loading={loading}
          markingId={markingId}
          canMarkPaid={can('managePayroll')}
          onMarkPaid={handleMarkCompleted}
          onViewPayslip={setPayslipId}
          pagination={{
            page,
            pageCount: pagination.totalPages,
            total: pagination.total,
            pageSize: PAGE_SIZE,
            onPageChange: setPage,
          }}
        />

        {can('managePayroll') && <PayrollRunsPanel refreshKey={runsKey} />}
      </div>

      {payslipId && <PayslipDialog recordId={payslipId} onClose={() => setPayslipId(null)} />}

      {generating && (
        <GeneratePayrollDialog
          onClose={() => setGenerating(false)}
          onGenerated={async (result) => {
            toast(
              result.created > 0
                ? `Created ${result.created} payroll record${result.created === 1 ? '' : 's'}${
                    result.skipped > 0 ? `, skipped ${result.skipped}` : ''
                  }`
                : 'No new records: employees are already paid for this period or have no salary on file',
              result.created > 0 ? 'success' : 'error',
            )
            setPage(0)
            setRunsKey((key) => key + 1)
            await dispatch(fetchPayroll({ page: 1, limit: PAGE_SIZE }))
            await loadSummary()
          }}
        />
      )}
    </AppLayout>
  )
}
