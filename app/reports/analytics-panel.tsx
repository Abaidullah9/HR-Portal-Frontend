'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/common/stat-card'
import { downloadCsv, toCsv } from '@/lib/csv'
import { fetchAnalytics, type AnalyticsSummary } from '@/lib/api/analytics'
import { toSentenceCase } from '@/lib/utils'

const percent = (value: number | null) =>
  value === null ? '--' : `${Math.round(value * 100)}%`

const money = (value: number) => `$${Math.round(value).toLocaleString()}`

/** Horizontal bar with a label and value; the text carries the number, the bar is decoration. */
function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const width = max > 0 ? Math.max((value / max) * 100, 2) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-3 text-sm">
        <span className="capitalize text-foreground/75">{label}</span>
        <span className="tabular-nums font-medium text-foreground">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-foreground/10" aria-hidden="true">
        <div className="h-full rounded-full brand" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

export function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    try {
      setData(await fetchAnalytics())
      setError(false)
    } catch {
      // Analytics is authorised on read_Report; other roles simply see no panel.
      setError(true)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (error || !data) return null

  const departmentMax = Math.max(0, ...data.departments.map((entry) => entry.count))

  const exportSummary = () => {
    const rows: (string | number)[][] = [
      ['Section', 'Label', 'Value'],
      ['Headcount', 'Active', data.headcount.active],
      ['Headcount', 'Inactive', data.headcount.inactive],
      ['Attendance (30 days)', 'Present days', data.attendance.presentDays],
      ['Attendance (30 days)', 'Tracked days', data.attendance.trackedDays],
      ['Attendance (30 days)', 'Rate', percent(data.attendance.rate)],
      ...data.departments.map((entry) => ['Headcount by department', entry.name, entry.count]),
      ...data.leaveByType.map((entry) => ['Leave this year', entry.type, entry.approved]),
      ...data.payrollTrend.map((entry) => ['Payroll by period', entry.period, entry.totalNetPay]),
    ]
    downloadCsv(`workforce-analytics-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows))
  }

  return (
    <section aria-labelledby="analytics-heading" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="analytics-heading" className="flex items-center gap-2 text-lg font-semibold">
          <Users size={18} aria-hidden="true" />
          Workforce analytics
        </h2>
        <Button onClick={exportSummary} variant="outline" className="gap-2">
          <Download size={16} />
          Export analytics
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard title="Active headcount" value={data.headcount.active.toString()} icon={Users} />
        <StatCard
          title="Attendance (30 days)"
          value={percent(data.attendance.rate)}
          icon={Users}
        />
        <StatCard
          title="Payroll this period"
          value={
            data.payrollTrend.length > 0
              ? money(data.payrollTrend[data.payrollTrend.length - 1]!.totalNetPay)
              : '--'
          }
          icon={Users}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="panel space-y-3 p-6">
          <h3 className="text-sm font-semibold text-foreground">Headcount by department</h3>
          {data.departments.length === 0 ? (
            <p className="text-sm text-foreground/65">No active employees yet.</p>
          ) : (
            data.departments.map((entry) => (
              <Bar
                key={entry.name}
                label={entry.name}
                value={entry.count}
                max={departmentMax}
              />
            ))
          )}
        </div>

        <div className="panel space-y-4 p-6">
          <h3 className="text-sm font-semibold text-foreground">Leave this year</h3>
          {data.leaveByType.length === 0 ? (
            <p className="text-sm text-foreground/65">No leave requests this year.</p>
          ) : (
            <dl className="space-y-2 text-sm">
              {data.leaveByType.map((entry) => (
                <div key={entry.type} className="flex justify-between gap-3">
                  <dt className="capitalize text-foreground/75">{toSentenceCase(entry.type)}</dt>
                  <dd className="tabular-nums text-foreground">
                    {entry.approved} approved
                    {entry.pending > 0 ? ` · ${entry.pending} pending` : ''}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <h3 className="pt-2 text-sm font-semibold text-foreground">Payroll by period</h3>
          {data.payrollTrend.length === 0 ? (
            <p className="text-sm text-foreground/65">No payroll records yet.</p>
          ) : (
            <dl className="space-y-2 text-sm">
              {data.payrollTrend.map((entry) => (
                <div key={entry.period} className="flex justify-between gap-3">
                  <dt className="text-foreground/75">{entry.period}</dt>
                  <dd className="tabular-nums text-foreground">{money(entry.totalNetPay)}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </section>
  )
}
