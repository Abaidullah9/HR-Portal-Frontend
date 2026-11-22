import { MessageSquare } from 'lucide-react'
import { DataTableSkeleton } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/state-panel'

interface FeedbackItem {
  _id: string
  reviewerId: string | { _id: string; name?: string }
  relationship: string
  comment: string
  date?: string
}

interface FeedbackPanelProps {
  feedback: FeedbackItem[]
  loading: boolean
}

export function FeedbackPanel({ feedback, loading }: FeedbackPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-foreground">360° Feedback</h3>
        <p className="mt-1 text-sm text-foreground/60">Feedback from your team and managers</p>
      </div>

      {loading && feedback.length === 0 ? (
        <div className="panel overflow-hidden" role="status" aria-busy="true">
          <span className="sr-only">Loading feedback</span>
          <DataTableSkeleton rows={2} columns={2} />
        </div>
      ) : feedback.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={MessageSquare}
            title="No feedback yet"
            description="Feedback from peers and managers is collected during review cycles. Ask a colleague to add theirs once a cycle opens."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map((item) => {
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
      )}
    </div>
  )
}
