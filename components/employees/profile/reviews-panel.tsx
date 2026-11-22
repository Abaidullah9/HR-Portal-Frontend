'use client'

import { Star } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import type { ProfileAppraisal } from '@/lib/api/profile'
import { formatDate, toSentenceCase } from '@/lib/utils'

const STAGE_LABEL: Record<string, string> = {
  self_review: 'Self review',
  manager_review: 'Manager review',
  calibration: 'Calibration',
  completed: 'Completed',
}

const stageOf = (appraisal: ProfileAppraisal) =>
  appraisal.workflowStage ?? (appraisal.status === 'completed' ? 'completed' : 'manager_review')

/** Appraisal history for this employee. */
export function ReviewsPanel({ appraisals }: { appraisals: ProfileAppraisal[] }) {
  return (
    <section aria-labelledby="appraisals-heading" className="panel p-6">
      <h2 id="appraisals-heading" className="flex items-center gap-2 text-lg font-semibold">
        <Star size={18} aria-hidden="true" /> Reviews
      </h2>
      {appraisals.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/65">No appraisals recorded yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {appraisals.map((appraisal) => {
            const stage = stageOf(appraisal)
            return (
              <li key={appraisal._id} className="border-b edge pb-3 last:border-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">
                    {typeof appraisal.cycleId === 'object' && appraisal.cycleId !== null
                      ? appraisal.cycleId.name
                      : 'Review cycle'}
                  </p>
                  <Badge>{STAGE_LABEL[stage] ?? toSentenceCase(stage)}</Badge>
                </div>
                <p className="mt-1 text-sm text-foreground/60">
                  {appraisal.overallRating != null ? `${appraisal.overallRating} / 5` : 'Not rated'} ·{' '}
                  {formatDate(appraisal.reviewDate)}
                  {appraisal.lockedAt ? ' · locked' : ''}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
