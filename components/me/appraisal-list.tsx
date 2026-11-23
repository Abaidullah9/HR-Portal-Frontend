import { Star } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { DataTableSkeleton } from '@/components/common/data-table'
import { EmptyState, ErrorState } from '@/components/common/state-panel'
import { formatDate, toSentenceCase } from '@/lib/utils'
import type { Appraisal } from '@/types/performance'

const cycleName = (appraisal: Appraisal) =>
  typeof appraisal.cycleId === 'object' && appraisal.cycleId !== null
    ? appraisal.cycleId.name
    : 'Review cycle'

const appraiserName = (appraisal: Appraisal) =>
  typeof appraisal.appraiserId === 'object' && appraisal.appraiserId !== null
    ? appraisal.appraiserId.name
    : 'Not recorded'

interface AppraisalListProps {
  appraisals: Appraisal[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function AppraisalList({ appraisals, loading, error, onRetry }: AppraisalListProps) {
  return (
    <section aria-labelledby="my-appraisals-heading" className="space-y-4">
      <h2 id="my-appraisals-heading" className="flex items-center gap-2 text-lg font-semibold">
        <Star size={18} aria-hidden="true" />
        Appraisals
      </h2>

      {error ? (
        <div className="panel">
          <ErrorState title="Couldn't load your appraisals" description={error} onRetry={onRetry} />
        </div>
      ) : loading ? (
        <div className="panel overflow-hidden">
          <div role="status" aria-busy="true">
            <span className="sr-only">Loading your appraisals</span>
            <DataTableSkeleton rows={3} columns={4} />
          </div>
        </div>
      ) : appraisals.length === 0 ? (
        <div className="panel overflow-hidden">
          <EmptyState
            icon={Star}
            title="No appraisals yet"
            description="Reviews appear here after your manager completes them for a performance cycle."
          />
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {appraisals.map((appraisal) => (
            <li key={appraisal._id} className="panel p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {cycleName(appraisal)}
                  </h3>
                  <p className="mt-1 text-sm text-foreground/65">
                    Reviewed {formatDate(appraisal.reviewDate)}
                  </p>
                </div>
                <Badge>{appraisal.status ? toSentenceCase(appraisal.status) : 'Pending'}</Badge>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-foreground/55">Overall rating</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {appraisal.overallRating != null
                      ? `${appraisal.overallRating} / 5`
                      : 'Not rated'}
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground/55">Goals completed</dt>
                  <dd className="mt-1 font-medium text-foreground">{appraisal.goalsCompleted}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-foreground/55">Appraiser</dt>
                  <dd className="mt-1 font-medium text-foreground">{appraiserName(appraisal)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
