'use client'

import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/state-panel'
import { PipelineBoard } from './pipeline-board'
import type { Candidate, Interview } from '@/types/recruitment'
import type { Department } from '@/types/employee'

interface CandidatePipelineSectionProps {
  candidates: Candidate[]
  interviews: Interview[]
  departments: Department[]
  canRecruit: boolean
  onAddCandidate: () => void
  onChanged: () => void
}

/** The pipeline region of the recruitment page, including its empty state. */
export function CandidatePipelineSection({
  candidates,
  interviews,
  departments,
  canRecruit,
  onAddCandidate,
  onChanged,
}: CandidatePipelineSectionProps) {
  return (
    <section aria-labelledby="pipeline-heading" className="space-y-4">
      <div>
        <h2 id="pipeline-heading" className="text-lg font-semibold">
          Candidate pipeline
        </h2>
        <p className="text-sm text-foreground/65">
          Select a candidate to move their stage, record interview feedback, or convert them into an
          employee with an invite.
        </p>
      </div>

      {candidates.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={Users}
            title="No candidates yet"
            description="Add a candidate to a posting and the pipeline fills in as they move through stages."
            action={
              canRecruit ? (
                <Button onClick={onAddCandidate} variant="outline" className="gap-2">
                  <Users size={16} /> Add candidate
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <PipelineBoard
          candidates={candidates}
          interviews={interviews}
          departments={departments}
          canManage={canRecruit}
          onChanged={onChanged}
        />
      )}
    </section>
  )
}
