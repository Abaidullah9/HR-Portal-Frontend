'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Target } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/common/toast'
import { createGoal, fetchGoals, updateGoalProgress, type Goal } from '@/lib/api/goals'
import { formatDate, toSentenceCase } from '@/lib/utils'

interface GoalsLivePanelProps {
  employeeId?: string
  cycleId?: string
  canCreate?: boolean
  title?: string
}

/**
 * Cycle goals live outside the appraisal, so progress can be updated all cycle
 * and the review still snapshots the goals as they stood when it was written.
 */
export function GoalsLivePanel({ employeeId, cycleId, canCreate = false, title = 'Goals' }: GoalsLivePanelProps) {
  const toast = useToast()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [title_, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setGoals(await fetchGoals({ ...(employeeId ? { employeeId } : {}), ...(cycleId ? { cycleId } : {}) }))
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Could not load goals', 'error')
    } finally {
      setLoading(false)
    }
  }, [employeeId, cycleId, toast])

  useEffect(() => {
    void load()
  }, [load])

  const setProgress = async (goal: Goal, progress: number) => {
    try {
      await updateGoalProgress(goal._id, progress)
      await load()
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Could not update progress', 'error')
    }
  }

  const add = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!employeeId || !cycleId || !title_.trim()) return
    setBusy(true)
    try {
      await createGoal({
        employeeId,
        cycleId,
        title: title_.trim(),
        ...(dueDate ? { dueDate } : {}),
      })
      setTitle('')
      setDueDate('')
      await load()
      toast('Goal added')
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Could not add the goal', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-labelledby="goals-live-heading" className="panel p-6">
      <h2 id="goals-live-heading" className="flex items-center gap-2 text-lg font-semibold">
        <Target size={18} aria-hidden="true" /> {title}
      </h2>

      {loading ? (
        <p role="status" aria-busy="true" className="mt-3 text-sm text-foreground/65">
          Loading goals…
        </p>
      ) : goals.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/65">
          No goals set for this cycle yet. Goals can be added while the cycle runs, not only at review time.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {goals.map((goal) => (
            <li key={goal._id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{goal.title}</p>
                  <p className="text-xs text-foreground/60">
                    {goal.dueDate ? `Due ${formatDate(goal.dueDate)}` : 'No due date'}
                  </p>
                </div>
                <Badge>{toSentenceCase(goal.status)}</Badge>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <label htmlFor={`progress-${goal._id}`} className="sr-only">
                  Progress for {goal.title}
                </label>
                <input
                  id={`progress-${goal._id}`}
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={goal.progress}
                  onChange={(event) => void setProgress(goal, Number(event.target.value))}
                  className="flex-1 accent-[rgb(var(--brand-rgb))]"
                />
                <span className="w-12 text-right text-sm font-medium">{goal.progress}%</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {canCreate && employeeId && cycleId && (
        <form onSubmit={add} className="mt-5 flex flex-wrap items-end gap-3 border-t edge pt-5">
          <div className="min-w-[12rem] flex-1">
            <label htmlFor="goal-title" className="mb-1 block text-sm font-medium">
              New goal
            </label>
            <Input
              id="goal-title"
              value={title_}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="goal-due" className="mb-1 block text-sm font-medium">
              Due date
            </label>
            <Input
              id="goal-due"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
          <Button type="submit" disabled={busy} className="gap-2">
            <Plus size={16} /> Add goal
          </Button>
        </form>
      )}
    </section>
  )
}
