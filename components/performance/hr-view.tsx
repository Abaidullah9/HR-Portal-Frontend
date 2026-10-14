'use client'

import { Badge } from '@/components/common/badge'
import { StatCard } from '@/components/common/stat-card'
import { DataTable } from '@/components/common/data-table'
import { useAppSelector } from '@/lib/redux/store'
import { BarChart3, Users, TrendingUp, Zap } from 'lucide-react'
import { PerformanceCycle } from '@/types/performance'

const resolveName = (v: string | { _id: string; name?: string } | undefined) =>
  typeof v === 'object' && v !== null ? v.name || 'Unknown' : 'Unknown'

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function HRView() {
  const { cycles, appraisals, loading } = useAppSelector((state) => state.performance)

  const totalCompleted = appraisals.filter((a) => a.status === 'completed').length
  const totalPending = appraisals.length - totalCompleted
  const ratedAppraisals = appraisals.filter((a) => a.overallRating != null)
  const orgAvg =
    ratedAppraisals.length > 0
      ? (
          ratedAppraisals.reduce((sum, a) => sum + (a.overallRating || 0), 0) /
          ratedAppraisals.length
        ).toFixed(1)
      : '--'

  const stats = [
    { title: 'Appraisal Cycles', value: `${cycles.length}`, icon: Zap },
    {
      title: 'Appraisals Completed',
      value: `${totalCompleted}`,
      icon: TrendingUp,
    },
    { title: 'Appraisals Pending', value: `${totalPending}`, icon: Users },
    { title: 'Org Avg Rating', value: orgAvg, icon: BarChart3 },
  ]

  const rows = cycles.map((cycle) => {
    const cycleAppraisals = appraisals.filter(
      (a) =>
        (typeof a.cycleId === 'object' && a.cycleId !== null ? a.cycleId._id : a.cycleId) ===
        cycle._id,
    )
    const completed = cycleAppraisals.filter((a) => a.status === 'completed').length
    return {
      _id: cycle._id,
      name: cycle.name,
      period: `${new Date(cycle.startDate).toLocaleDateString()} — ${new Date(cycle.endDate).toLocaleDateString()}`,
      status: cycle.status,
      total: cycleAppraisals.length,
      completed,
      pending: cycleAppraisals.length - completed,
      daysLeft: cycle.status === 'active' ? daysUntil(cycle.endDate) : 0,
    }
  })

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Performance Management Hub</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Manage appraisal cycles and organizational performance
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Cycles */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Appraisal Cycles</h3>
          <p className="mt-1 text-sm text-foreground/60">
            All performance cycles and their completion status
          </p>
        </div>

        {loading && cycles.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border edge bg-white/70 p-8 text-sm text-foreground/65 backdrop-blur-md dark:edge dark:surface-85">
            Loading performance cycles…
          </div>
        ) : cycles.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-2xl border edge bg-white/70 p-8 text-sm text-foreground/65 backdrop-blur-md dark:edge dark:surface-85">
            No appraisal cycles created yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {rows.map((cycle) => {
              const completionRate = cycle.total > 0 ? (cycle.completed / cycle.total) * 100 : 0
              return (
                <div
                  key={cycle._id}
                  className="group overflow-hidden rounded-2xl border edge bg-white/70 p-6 shadow-md shadow-black/5 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:edge dark:surface-85"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div>
                      <h4 className="font-semibold text-lg text-foreground">{cycle.name}</h4>
                      <p className="text-sm text-foreground/65">{cycle.period}</p>
                    </div>
                    <Badge
                      variant={
                        cycle.status === 'active'
                          ? 'info'
                          : cycle.status === 'completed'
                            ? 'success'
                            : 'warning'
                      }
                      className="text-xs"
                    >
                      {cycle.status === 'active' ? (
                        <>
                          <Zap size={12} className="mr-1 brand-text" />
                          Active
                          {cycle.daysLeft > 0 ? ` · ${cycle.daysLeft}d left` : ''}
                        </>
                      ) : (
                        cycle.status.charAt(0).toUpperCase() + cycle.status.slice(1)
                      )}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-foreground/65">Appraisals</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">{cycle.total}</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/65">Completed</p>
                      <p className="mt-1 text-2xl font-bold success-text">
                        {cycle.completed}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/65">Pending</p>
                      <p className="mt-1 text-2xl font-bold warning-text dark:warning-text">
                        {cycle.pending}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/65">Completion</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">
                        {completionRate.toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-foreground/10 dark:bg-white/5">
                    <div
                      className="h-full rounded-full brand transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Appraisal records */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Appraisal Records</h3>
          <p className="mt-1 text-sm text-foreground/60">
            Individual appraisal status across the organization
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border edge bg-white/70 shadow-xl shadow-black/5 backdrop-blur-md dark:edge dark:surface-85">
          {loading && appraisals.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-foreground/65">
              Loading appraisals…
            </div>
          ) : appraisals.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-foreground/65">
              No appraisal records found.
            </div>
          ) : (
            <DataTable
              columns={[
                {
                  header: 'Employee',
                  accessor: 'employee',
                  render: (_v, row) => row.employee,
                  className: 'font-medium',
                },
                {
                  header: 'Rating',
                  accessor: 'rating',
                  className: 'text-center font-bold text-foreground',
                },
                {
                  header: 'Review Date',
                  accessor: 'reviewDate',
                  className: 'text-foreground/65 text-sm',
                },
                {
                  header: 'Status',
                  accessor: 'status',
                  render: (status) => (
                    <Badge
                      variant={status === 'completed' ? 'success' : 'warning'}
                      className="text-xs"
                    >
                      {status === 'completed' ? 'Completed' : 'Pending'}
                    </Badge>
                  ),
                },
              ]}
              data={appraisals.map((a) => ({
                employee: resolveName(a.employeeId),
                rating: a.overallRating != null ? `${a.overallRating}` : '--',
                reviewDate: a.reviewDate ? new Date(a.reviewDate).toLocaleDateString() : '--',
                status: a.status,
              }))}
            />
          )}
        </div>
      </div>
    </div>
  )
}
