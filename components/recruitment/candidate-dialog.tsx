'use client'

import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/common/toast'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'
import { apiClient } from '@/lib/api/client'
import { toSentenceCase } from '@/lib/utils'
import type { Candidate, Interview } from '@/types/recruitment'
import type { Department } from '@/types/employee'
import { CandidateOfferSection } from './candidate-offer-section'
import { CandidateInterviewsSection } from './candidate-interviews-section'

const NEXT_STAGE: Partial<Record<Candidate['status'], Candidate['status']>> = {
  applied: 'screening',
  screening: 'interview',
  interview: 'offered',
  offered: 'hired',
}

interface CandidateDialogProps {
  candidate: Candidate
  interviews: Interview[]
  departments: Department[]
  canManage: boolean
  onClose: () => void
  onChanged: () => void
}

/** Candidate detail shell: stage actions, then offer and interview sections. */
export function CandidateDialog({
  candidate,
  interviews,
  departments,
  canManage,
  onClose,
  onChanged,
}: CandidateDialogProps) {
  const toast = useToast()
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogA11y({ open: true, containerRef: dialogRef, onClose })

  const [busy, setBusy] = useState(false)
  const posting =
    typeof candidate.jobPostingId === 'object' && candidate.jobPostingId !== null
      ? candidate.jobPostingId
      : null
  const nextStage = NEXT_STAGE[candidate.status]

  const candidateInterviews = interviews.filter((interview) => {
    const id = typeof interview.candidateId === 'object' ? interview.candidateId._id : interview.candidateId
    return id === candidate._id
  })

  const move = async (status: Candidate['status']) => {
    setBusy(true)
    try {
      await apiClient.patch(`/candidates/${candidate._id}/status`, { status })
      toast(`Moved to ${toSentenceCase(status)}`)
      onChanged()
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Could not move the candidate', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="candidate-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border edge bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:surface-95"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="candidate-title" className="text-xl font-bold">
              {candidate.name}
            </h2>
            <p className="text-sm text-foreground/65">
              {candidate.email} · {posting?.position ?? 'No posting'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close candidate"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground/60 hover:bg-foreground/5"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge>{toSentenceCase(candidate.status)}</Badge>
          {canManage && nextStage && (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void move(nextStage)}>
              Move to {toSentenceCase(nextStage)}
            </Button>
          )}
          {canManage && candidate.status !== 'rejected' && (
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => void move('rejected')}>
              Reject
            </Button>
          )}
        </div>

        <CandidateOfferSection
          candidate={candidate}
          departments={departments}
          canManage={canManage}
          onChanged={onChanged}
          onHired={() => {
            onClose()
            onChanged()
          }}
        />
        <CandidateInterviewsSection
          interviews={candidateInterviews}
          canManage={canManage}
          onChanged={onChanged}
        />
      </div>
    </div>
  )
}
