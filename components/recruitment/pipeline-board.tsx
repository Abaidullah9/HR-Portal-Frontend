'use client'

import { useState } from 'react'
import { toSentenceCase, formatDate } from '@/lib/utils'
import type { Candidate, Interview } from '@/types/recruitment'
import type { Department } from '@/types/employee'
import { CandidateDialog } from './candidate-dialog'

const STAGES: Candidate['status'][] = ['applied', 'screening', 'interview', 'offered', 'hired', 'rejected']

const postingOf = (candidate: Candidate) =>
  typeof candidate.jobPostingId === 'object' && candidate.jobPostingId !== null
    ? candidate.jobPostingId
    : null

interface PipelineBoardProps {
  candidates: Candidate[]
  interviews: Interview[]
  departments: Department[]
  canManage: boolean
  onChanged: () => void
}

/** Kanban columns of the pipeline; selecting a card opens its detail dialog. */
export function PipelineBoard({
  candidates,
  interviews,
  departments,
  canManage,
  onChanged,
}: PipelineBoardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = candidates.find((candidate) => candidate._id === selectedId) ?? null

  return (
    <div className="space-y-6">
      {/* Columns share the width instead of holding a fixed minimum: a min-width
          wider than its grid track pushed each card over the next column. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {STAGES.map((stage) => {
          const bucket = candidates.filter((candidate) => candidate.status === stage)
          return (
            <section key={stage} aria-labelledby={`stage-${stage}`} className="min-w-0 space-y-3">
              <h3 id={`stage-${stage}`} className="flex items-center justify-between text-sm font-semibold">
                {toSentenceCase(stage)}
                <span className="rounded-full border edge px-2 py-0.5 text-xs text-foreground/60">
                  {bucket.length}
                </span>
              </h3>

              <ul className="space-y-2">
                {bucket.map((candidate) => (
                  <li key={candidate._id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(candidate._id)}
                      className="w-full rounded-xl border edge bg-white/70 p-3 text-left backdrop-blur-md transition hover:-translate-y-0.5 hover:shadow-md dark:surface-85"
                    >
                      <span className="block font-medium">{candidate.name}</span>
                      <span className="mt-1 block text-xs text-foreground/60">
                        {postingOf(candidate)?.position ?? 'No posting'}
                      </span>
                      <span className="mt-1 block text-xs text-foreground/50">
                        Applied {formatDate(candidate.appliedDate)}
                      </span>
                    </button>
                  </li>
                ))}
                {bucket.length === 0 && (
                  <li className="rounded-xl border border-dashed edge p-3 text-xs text-foreground/50">
                    Nobody here
                  </li>
                )}
              </ul>
            </section>
          )
        })}
      </div>

      {selected && (
        <CandidateDialog
          key={selected._id}
          candidate={selected}
          interviews={interviews}
          departments={departments}
          canManage={canManage}
          onClose={() => setSelectedId(null)}
          onChanged={onChanged}
        />
      )}
    </div>
  )
}
