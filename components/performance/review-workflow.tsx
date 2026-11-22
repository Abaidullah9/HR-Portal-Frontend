'use client'

import { useState } from 'react'
import { CheckCircle2, Lock, PenLine } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/common/toast'
import { calibrateAppraisal, lockAppraisal, submitManagerReview } from '@/lib/api/appraisals'
import type { Appraisal } from '@/types/performance'

const STAGES: Record<string, string> = {
  self_review: 'Self review',
  manager_review: 'Manager review',
  calibration: 'Calibration',
  completed: 'Completed',
}

const employeeName = (appraisal: Appraisal) =>
  typeof appraisal.employeeId === 'object' && appraisal.employeeId !== null
    ? appraisal.employeeId.name
    : 'Unknown employee'

const stageOf = (appraisal: Appraisal) =>
  appraisal.workflowStage ?? (appraisal.status === 'completed' ? 'completed' : 'manager_review')

/**
 * The review workflow is one row per appraisal with the single action that is
 * legal at its current stage: submit manager review, calibrate, or lock.
 */
export function ReviewWorkflow({
  appraisals,
  canManage,
  onChanged,
}: {
  appraisals: Appraisal[]
  canManage: boolean
  onChanged: () => void
}) {
  const toast = useToast()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState('')
  const [busy, setBusy] = useState(false)

  if (appraisals.length === 0) {
    return <p className="text-sm text-foreground/65">No appraisals are in flight.</p>
  }

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true)
    try {
      await action()
      toast(success)
      setActiveId(null)
      setComment('')
      setRating('')
      onChanged()
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'That action failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ul className="space-y-3">
      {appraisals.map((appraisal) => {
        const stage = stageOf(appraisal)
        const locked = Boolean(appraisal.lockedAt)
        return (
          <li key={appraisal._id} className="rounded-xl border edge p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{employeeName(appraisal)}</p>
                <p className="text-sm text-foreground/60">
                  {typeof appraisal.cycleId === 'object' && appraisal.cycleId !== null
                    ? appraisal.cycleId.name
                    : 'Review cycle'}
                  {appraisal.overallRating != null ? ` · ${appraisal.overallRating}/5` : ''}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{STAGES[stage] ?? stage}</Badge>
                {locked && <Badge variant="success">Locked</Badge>}
              </div>
            </div>

            {canManage && !locked && (
              <div className="mt-3 flex flex-wrap gap-2">
                {stage === 'manager_review' && (
                  <Button size="sm" variant="outline" onClick={() => setActiveId(appraisal._id)}>
                    <PenLine size={14} /> Submit manager review
                  </Button>
                )}
                {stage === 'calibration' && (
                  <Button size="sm" variant="outline" onClick={() => setActiveId(appraisal._id)}>
                    <CheckCircle2 size={14} /> Calibrate
                  </Button>
                )}
                {stage === 'completed' && (
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => void run(() => lockAppraisal(appraisal._id), 'Appraisal locked')}
                  >
                    <Lock size={14} /> Lock appraisal
                  </Button>
                )}
              </div>
            )}

            {activeId === appraisal._id && (
              <div className="mt-3 space-y-2">
                <label htmlFor={`review-${appraisal._id}`} className="block text-sm font-medium">
                  {stage === 'calibration' ? 'Calibration note' : 'Manager review'}
                </label>
                <textarea
                  id={`review-${appraisal._id}`}
                  rows={3}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  className="w-full rounded-xl border edge bg-white/80 p-2 text-sm"
                />
                <label htmlFor={`rating-${appraisal._id}`} className="block text-sm font-medium">
                  Overall rating (optional)
                </label>
                <Input
                  id={`rating-${appraisal._id}`}
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={busy || !comment.trim()}
                    onClick={() =>
                      void run(
                        () =>
                          stage === 'calibration'
                            ? calibrateAppraisal(appraisal._id, {
                                note: comment.trim(),
                                ...(rating ? { rating: Number(rating) } : {}),
                              })
                            : submitManagerReview(appraisal._id, {
                                comment: comment.trim(),
                                ...(rating ? { rating: Number(rating) } : {}),
                              }),
                        stage === 'calibration' ? 'Appraisal calibrated' : 'Manager review submitted',
                      )
                    }
                  >
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setActiveId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
