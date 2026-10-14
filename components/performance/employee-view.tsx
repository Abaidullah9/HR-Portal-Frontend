'use client'

import { Badge } from '@/components/common/badge'
import { StatCard } from '@/components/common/stat-card'
import { useAppSelector } from '@/lib/redux/store'
import { Award, TrendingUp, MessageSquare } from 'lucide-react'

export function EmployeeView() {
  const { user } = useAppSelector((state) => state.auth)
  const { appraisals, feedback, loading } = useAppSelector((state) => state.performance)

  const userId = user?._id
  const resolveId = (v: string | { _id: string } | undefined) =>
    typeof v === 'object' && v !== null ? v._id : v

  const myAppraisal = appraisals.find((a) => resolveId(a.employeeId) === userId) ?? null

  const myFeedback = feedback.filter((f) => resolveId(f.targetEmployeeId) === userId)

  const goals = myAppraisal?.goals ?? []
  const skills = myAppraisal?.skillsRating ?? []
  const goalsCompleted = goals.filter((g) => g.completionStatus === 'completed').length

  const metrics = [
    {
      title: 'Overall Rating',
      value: myAppraisal?.overallRating != null ? `${myAppraisal.overallRating}` : '--',
      icon: Award,
    },
    {
      title: 'Goals Completed',
      value: goals.length > 0 ? `${goalsCompleted}/${goals.length}` : '--',
      icon: TrendingUp,
    },
    {
      title: 'Feedback Received',
      value: `${myFeedback.length}`,
      icon: MessageSquare,
    },
  ]

  return (
    <div className="space-y-10">
      {/* Header card */}
      <div className="group flex flex-col gap-6 overflow-hidden rounded-2xl border edge p-8 shadow-xl shadow-black/10 backdrop-blur-md dark:edge">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              {user?.name || 'Your'} Performance
            </h2>
            {myAppraisal ? (
              <p className="mt-2 text-sm text-foreground/60">
                Last Review: {new Date(myAppraisal.reviewDate).toLocaleDateString()}
              </p>
            ) : (
              <p className="mt-2 text-sm text-foreground/60">
                No appraisal on file for your account yet.
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-foreground">
              {myAppraisal?.overallRating != null ? myAppraisal.overallRating : '--'}
            </div>
            <p className="text-sm text-foreground/65">Out of 5.0</p>
            {myAppraisal && (
              <Badge
                variant={myAppraisal.status === 'completed' ? 'success' : 'warning'}
                className="mt-3"
              >
                {myAppraisal.status === 'completed' ? 'Review completed' : 'Review pending'}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid gap-5 sm:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Competencies */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Competencies &amp; Skills</h3>
          <p className="mt-1 text-sm text-foreground/60">
            Your proficiency across key competencies
          </p>
        </div>
        {skills.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {skills.map((comp) => (
              <div
                key={comp.skillName}
                className="group flex flex-col gap-3 overflow-hidden rounded-2xl border edge bg-white/70 p-5 shadow-md shadow-black/5 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:edge dark:surface-85"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{comp.skillName}</p>
                  <span className="text-lg font-bold text-foreground">{comp.skillRating}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 overflow-hidden rounded-full bg-foreground/10 dark:bg-white/5">
                    <div
                      className="h-full rounded-full brand transition-all duration-300 group-hover:scale-105"
                      style={{ width: `${(comp.skillRating / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-foreground/65">Target: {comp.targetRating}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-2xl border edge bg-white/70 p-8 text-sm text-foreground/65 backdrop-blur-md dark:edge dark:surface-85">
            {loading ? 'Loading skills data…' : 'No skill ratings recorded in your appraisal yet.'}
          </div>
        )}
      </div>

      {/* Goals */}
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
        {goals.length > 0 ? (
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
                <Badge
                  variant={
                    goal.completionStatus === 'completed'
                      ? 'success'
                      : goal.completionStatus === 'in_progress'
                        ? 'info'
                        : 'warning'
                  }
                  className="shrink-0"
                >
                  {goal.completionStatus === 'in_progress'
                    ? 'In Progress'
                    : goal.completionStatus.charAt(0).toUpperCase() +
                      goal.completionStatus.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-2xl border edge bg-white/70 p-8 text-sm text-foreground/65 backdrop-blur-md dark:edge dark:surface-85">
            {loading ? 'Loading goals…' : 'No performance goals recorded yet.'}
          </div>
        )}
      </div>

      {/* Feedback */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground">360° Feedback</h3>
          <p className="mt-1 text-sm text-foreground/60">Feedback from your team and managers</p>
        </div>
        {myFeedback.length > 0 ? (
          <div className="space-y-3">
            {myFeedback.map((item) => {
              const reviewer =
                typeof item.reviewerId === 'object' && item.reviewerId !== null
                  ? item.reviewerId.name
                  : 'Anonymous'
              return (
                <div
                  key={item._id}
                  className="group overflow-hidden rounded-2xl border edge bg-white/70 p-5 shadow-md shadow-black/5 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:edge dark:surface-85"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{reviewer}</p>
                      <p className="mt-0.5 text-sm capitalize text-foreground/65">
                        {item.relationship}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-foreground/60">
                      {item.date ? new Date(item.date).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-foreground/80 italic">
                    &ldquo;{item.comment}&rdquo;
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-2xl border edge bg-white/70 p-8 text-sm text-foreground/65 backdrop-blur-md dark:edge dark:surface-85">
            {loading
              ? 'Loading feedback…'
              : 'No feedback received yet. Request feedback from your peers to get started.'}
          </div>
        )}
      </div>
    </div>
  )
}
