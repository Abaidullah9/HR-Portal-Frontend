'use client'

import { Badge } from '@/components/common/badge'
import { StatCard } from '@/components/common/stat-card'
import { DataTable } from '@/components/common/data-table'
import { useAppSelector } from '@/lib/redux/store'
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Appraisal } from '@/types/performance'

const resolveId = (v: string | { _id: string } | undefined) =>
  typeof v === 'object' && v !== null ? v._id : v

const resolveName = (v: string | { _id: string; name?: string } | undefined) =>
  typeof v === 'object' && v !== null ? v.name || 'Unknown' : 'Unknown'

interface TeamRow {
  _id: string
  employee: string
  appraiser: string
  rating: string
  reviewDate: string
  status: 'pending' | 'completed'
}

export function ManagerView() {
  const { user } = useAppSelector((state) => state.auth)
  const { appraisals, loading } = useAppSelector((state) => state.performance)

  const managerId = user?._id

  const teamAppraisals = managerId
    ? appraisals.filter((a) => resolveId(a.appraiserId) === managerId)
    : appraisals
  const visibleAppraisals = teamAppraisals.length > 0 ? teamAppraisals : appraisals

  const completed = visibleAppraisals.filter((a) => a.status === 'completed')
  const pending = visibleAppraisals.filter((a) => a.status === 'pending')
  const ratedAppraisals = completed.filter((a) => a.overallRating != null)
  const avgRating =
    ratedAppraisals.length > 0
      ? (
          ratedAppraisals.reduce((sum, a) => sum + (a.overallRating || 0), 0) /
          ratedAppraisals.length
        ).toFixed(1)
      : '--'

  const stats = [
    { title: 'Team Appraisals', value: `${visibleAppraisals.length}`, icon: Users },
    {
      title: 'Appraisals Completed',
      value: `${completed.length}`,
      icon: CheckCircle,
    },
    { title: 'Pending Review', value: `${pending.length}`, icon: Clock },
    { title: 'Team Avg Rating', value: avgRating, icon: AlertCircle },
  ]

  const rows: TeamRow[] = visibleAppraisals.map((a) => ({
    _id: a._id,
    employee: resolveName(a.employeeId),
    appraiser: resolveName(a.appraiserId),
    rating: a.overallRating != null ? `${a.overallRating}` : '--',
    reviewDate: a.reviewDate ? new Date(a.reviewDate).toLocaleDateString() : '--',
    status: a.status,
  }))

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Manage Team Performance</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Appraisals you are responsible for reviewing
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Pending alert */}
      {pending.length > 0 && (
        <div className="group overflow-hidden rounded-2xl border warning-panel p-5 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl warning-panel warning-text"
            >
              <AlertCircle size={18} strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground">Pending Appraisals</h3>
              <p className="text-sm text-foreground/60 mt-1">
                You have {pending.length} appraisal
                {pending.length === 1 ? '' : 's'} awaiting review
              </p>
              <div className="mt-3 space-y-2">
                {pending.slice(0, 5).map((a) => (
                  <div key={a._id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{resolveName(a.employeeId)}</span>
                    <Badge variant="warning" className="text-xs">
                      {a.reviewDate
                        ? `Due ${new Date(a.reviewDate).toLocaleDateString()}`
                        : 'Unscheduled'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team appraisals */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Team Appraisals</h3>
          <p className="mt-1 text-sm text-foreground/60">Review status for each appraisal cycle</p>
        </div>

        <div className="overflow-hidden rounded-2xl border edge bg-white/70 shadow-xl shadow-black/5 backdrop-blur-md dark:edge dark:surface-85">
          {loading && rows.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-foreground/65">
              Loading appraisals…
            </div>
          ) : rows.length > 0 ? (
            <DataTable<TeamRow>
              columns={[
                {
                  header: 'Employee',
                  accessor: 'employee',
                  className: 'font-medium',
                },
                {
                  header: 'Appraiser',
                  accessor: 'appraiser',
                  className: 'text-foreground/65 text-sm',
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
              data={rows}
            />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-foreground/65">
              No appraisals found. Appraisals appear here once a performance cycle includes your
              team.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
