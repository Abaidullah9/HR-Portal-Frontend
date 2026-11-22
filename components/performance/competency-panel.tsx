import { Award } from 'lucide-react'
import { DataTableSkeleton } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/state-panel'

interface CompetencyPanelProps {
  skills: { skillName: string; skillRating: number; targetRating?: number }[]
  loading: boolean
}

export function CompetencyPanel({ skills, loading }: CompetencyPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-foreground">Competencies &amp; Skills</h3>
        <p className="mt-1 text-sm text-foreground/60">Your proficiency across key competencies</p>
      </div>

      {loading && skills.length === 0 ? (
        <div className="panel overflow-hidden" role="status" aria-busy="true">
          <span className="sr-only">Loading skills data</span>
          <DataTableSkeleton rows={3} columns={2} />
        </div>
      ) : skills.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={Award}
            title="No skill ratings yet"
            description="Skill ratings come from your appraisal. They appear here once your reviewer records them."
          />
        </div>
      ) : (
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
      )}
    </div>
  )
}
