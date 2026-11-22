'use client'

import { useState } from 'react'
import { CalendarCheck, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/common/toast'
import { apiClient } from '@/lib/api/client'
import { formatDate, toSentenceCase } from '@/lib/utils'
import type { Interview } from '@/types/recruitment'

interface CandidateInterviewsSectionProps {
  interviews: Interview[]
  canManage: boolean
  onChanged: () => void
}

/** Interview schedule and scorecards for one candidate. */
export function CandidateInterviewsSection({
  interviews,
  canManage,
  onChanged,
}: CandidateInterviewsSectionProps) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState('4')
  const [activeId, setActiveId] = useState<string | null>(null)

  const save = async (interview: Interview) => {
    setBusy(true)
    try {
      await apiClient.patch(`/interviews/${interview._id}`, {
        feedback: feedback.trim(),
        rating: Number(rating),
        status: 'completed',
      })
      toast('Scorecard saved')
      setActiveId(null)
      setFeedback('')
      onChanged()
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Could not save the scorecard', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-labelledby="interviews-heading" className="mt-6 space-y-3">
      <h3 id="interviews-heading" className="flex items-center gap-2 font-semibold">
        <CalendarCheck size={16} aria-hidden="true" /> Interviews
      </h3>
      {interviews.length === 0 ? (
        <p className="text-sm text-foreground/65">No interviews scheduled.</p>
      ) : (
        <ul className="space-y-3">
          {interviews.map((interview) => (
            <li key={interview._id} className="rounded-xl border edge p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {interview.round} · {interview.mode}
                  </p>
                  <p className="text-sm text-foreground/60">{formatDate(interview.scheduledAt)}</p>
                </div>
                <Badge>{toSentenceCase(interview.status)}</Badge>
              </div>
              {interview.feedback && (
                <p className="mt-2 text-sm text-foreground/70">
                  {interview.rating ? `${interview.rating}/5 · ` : ''}
                  {interview.feedback}
                </p>
              )}
              {canManage && activeId !== interview._id && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => setActiveId(interview._id)}
                >
                  {interview.feedback ? 'Update scorecard' : 'Add scorecard'}
                </Button>
              )}
              {activeId === interview._id && (
                <div className="mt-3 space-y-2">
                  <label htmlFor={`feedback-${interview._id}`} className="block text-sm font-medium">
                    Feedback
                  </label>
                  <textarea
                    id={`feedback-${interview._id}`}
                    rows={3}
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    className="w-full rounded-xl border edge bg-white/80 p-2 text-sm"
                  />
                  <label htmlFor={`rating-${interview._id}`} className="block text-sm font-medium">
                    Rating (1–5)
                  </label>
                  <Input
                    id={`rating-${interview._id}`}
                    type="number"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(event) => setRating(event.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={busy || !feedback.trim()}
                      onClick={() => void save(interview)}
                    >
                      <CheckCircle2 size={14} /> Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setActiveId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
