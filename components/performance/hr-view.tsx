'use client'

import { BarChart3, TrendingUp, Users, Zap } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { StatCard } from '@/components/common/stat-card'
import { DataTable, DataTableSkeleton } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/state-panel'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { fetchAppraisals } from '@/lib/redux/slices/performanceSlice'
import { CycleList, type CycleRow } from './cycle-list'
import { ReviewWorkflow } from './review-workflow'

const resolveName = (v: string | { _id: string; name?: string } | undefined) =>
  typeof v === 'object' && v !== null ? v.name || 'Unknown' : 'Unknown'

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function HRView() {
  const dispatch = useAppDispatch()
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
    { title: 'Appraisals Completed', value: `${totalCompleted}`, icon: TrendingUp },
    { title: 'Appraisals Pending', value: `${totalPending}`, icon: Users },
    { title: 'Org Avg Rating', value: orgAvg, icon: BarChart3 },
  ]

  const rows: CycleRow[] = cycles.map((cycle) => {
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

      <CycleList rows={rows} loading={loading} />

      <section aria-labelledby="review-actions-heading" className="space-y-4">
        <div>
          <h3 id="review-actions-heading" className="text-xl font-semibold text-foreground">
            Review actions
          </h3>
          <p className="mt-1 text-sm text-foreground/60">
            Each appraisal offers the one action its stage allows: submit the manager review,
            calibrate the rating, then lock it once complete.
          </p>
        </div>
        <ReviewWorkflow
          appraisals={appraisals}
          canManage
          onChanged={() => void dispatch(fetchAppraisals())}
        />
      </section>

      {/* Appraisal records */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Appraisal Records</h3>
          <p className="mt-1 text-sm text-foreground/60">
            Individual appraisal status across the organization
          </p>
        </div>

        <div className="panel overflow-hidden">
          {loading && appraisals.length === 0 ? (
            <div role="status" aria-busy="true">
              <span className="sr-only">Loading appraisals</span>
              <DataTableSkeleton rows={5} columns={4} />
            </div>
          ) : appraisals.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No appraisals recorded"
              description="Appraisals appear here once a cycle is running and reviewers submit their ratings."
            />
          ) : (
            <DataTable
              caption="Appraisal records across the organization"
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
