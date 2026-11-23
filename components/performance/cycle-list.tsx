import { Layers, Zap } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { DataTableSkeleton } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/state-panel'
import { ProgressBar } from '@/components/common/progress-bar'

export interface CycleRow {
  _id: string
  name: string
  period: string
  status: string
  total: number
  completed: number
  pending: number
  daysLeft: number
}

interface CycleListProps {
  rows: CycleRow[]
  loading: boolean
}

export function CycleList({ rows, loading }: CycleListProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-foreground">Appraisal Cycles</h3>
        <p className="mt-1 text-sm text-foreground/60">
          All performance cycles and their completion status
        </p>
      </div>

      {loading && rows.length === 0 ? (
        <div className="panel overflow-hidden" role="status" aria-busy="true">
          <span className="sr-only">Loading performance cycles</span>
          <DataTableSkeleton rows={3} columns={3} />
        </div>
      ) : rows.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={Layers}
            title="No appraisal cycles yet"
            description="A cycle groups appraisals for a period. Create one to start collecting reviews."
          />
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

                <div className="grid grid-cols-2 gap-4 mb-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-foreground/65">Appraisals</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{cycle.total}</p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground/65">Completed</p>
                    <p className="mt-1 text-2xl font-bold success-text">{cycle.completed}</p>
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

                <ProgressBar
                  value={completionRate}
                  label={`${cycle.name} completion`}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
