import { Target } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { DataTableSkeleton } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/state-panel'

interface Goal {
  goalName: string
  goalCompletionRate: number
  completionStatus: string
  deadline?: string
}

interface GoalPanelProps {
  goals: Goal[]
  goalsCompleted: number
  loading: boolean
}

const goalVariant = (status: string) => {
  if (status === 'completed') return 'success' as const
  if (status === 'in_progress') return 'info' as const
  return 'warning' as const
}

const goalLabel = (status: string) =>
  status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)

export function GoalPanel({ goals, goalsCompleted, loading }: GoalPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Performance Goals</h3>
          <p className="mt-1 text-sm text-foreground/60">
            {goals.length > 0
              ? `${goalsCompleted} of ${goals.length} goals completed`
              : 'Goals will appear once your appraisal includes them'}
          </p>
        </div>
      </div>

      {loading && goals.length === 0 ? (
        <div className="panel overflow-hidden" role="status" aria-busy="true">
          <span className="sr-only">Loading goals</span>
          <DataTableSkeleton rows={3} columns={3} />
        </div>
      ) : goals.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={Target}
            title="No goals set yet"
            description="Goals are agreed with your manager during appraisal. Nothing is assigned to you right now."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((goal, idx) => (
            <div
              key={`${goal.goalName}-${idx}`}
              className="group flex items-start gap-4 overflow-hidden rounded-2xl border edge bg-white/70 p-5 shadow-md shadow-black/5 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:edge dark:surface-85"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{goal.goalName}</p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex-1 max-w-[220px]">
                    <div className="h-2 overflow-hidden rounded-full bg-foreground/10 dark:bg-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 group-hover:scale-x-105 ${
                          goal.completionStatus === 'completed'
                            ? 'bg-[rgb(var(--success-rgb))]'
                            : 'brand'
                        }`}
                        style={{ width: `${goal.goalCompletionRate}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {goal.goalCompletionRate}%
                  </span>
                  {goal.deadline && (
                    <span className="text-xs text-foreground/65">
                      {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <Badge variant={goalVariant(goal.completionStatus)} className="shrink-0">
                {goalLabel(goal.completionStatus)}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
