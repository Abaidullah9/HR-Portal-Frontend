'use client'

import { useCallback, useEffect, useState } from 'react'
import { Award, MessageSquare, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { StatCard } from '@/components/common/stat-card'
import { useAppSelector } from '@/lib/redux/store'
import { fetchMyAppraisals } from '@/lib/api/self'
import type { Appraisal } from '@/types/performance'
import { CompetencyPanel } from './competency-panel'
import { GoalPanel } from './goal-panel'
import { FeedbackPanel } from './feedback-panel'
import { SelfReviewCard } from './self-review-card'
import { GoalsLivePanel } from './goals-live-panel'

const resolveId = (value: string | { _id: string } | undefined) =>
  typeof value === 'object' && value !== null ? value._id : value

export function EmployeeView() {
  const { user } = useAppSelector((state) => state.auth)
  const { feedback, loading: feedbackLoading } = useAppSelector((state) => state.performance)

  const [reviews, setReviews] = useState<Appraisal[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)

  // This endpoint is scoped on the server to the caller's own employee record,
  // so its results are theirs by construction — no id matching against the
  // login, which is a different document from the employee.
  const loadReviews = useCallback(async () => {
    try {
      setReviews(await fetchMyAppraisals())
    } catch {
      setReviews([])
    } finally {
      setReviewsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadReviews()
  }, [loadReviews])

  // Newest first from the API.
  const myAppraisal = reviews[0] ?? null
  const myEmployeeId = resolveId(myAppraisal?.employeeId)
  const myCycleId = resolveId(myAppraisal?.cycleId)
  const myStage =
    myAppraisal?.workflowStage ?? (myAppraisal?.status === 'completed' ? 'completed' : 'manager_review')

  const goals = myAppraisal?.goals ?? []
  const skills = myAppraisal?.skillsRating ?? []
  const goalsCompleted = goals.filter((goal) => goal.completionStatus === 'completed').length
  const myFeedback = myEmployeeId
    ? feedback.filter((item) => resolveId(item.targetEmployeeId) === myEmployeeId)
    : []

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
              <p className="mt-2 text-sm text-foreground/60" role="status">
                {reviewsLoading ? 'Loading your appraisal…' : 'No appraisal on file for your account yet.'}
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

      {myAppraisal && myStage === 'self_review' && (
        <SelfReviewCard appraisal={myAppraisal} onChanged={() => void loadReviews()} />
      )}

      {myEmployeeId && myCycleId && (
        <GoalsLivePanel employeeId={myEmployeeId} cycleId={myCycleId} title="Your cycle goals" />
      )}

      <CompetencyPanel skills={skills} loading={reviewsLoading} />
      <GoalPanel goals={goals} goalsCompleted={goalsCompleted} loading={reviewsLoading} />
      <FeedbackPanel feedback={myFeedback} loading={feedbackLoading} />
    </div>
  )
}
