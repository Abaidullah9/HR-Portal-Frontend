'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/common/toast'
import {
  addChecklistTask,
  updateChecklistTask,
  type ChecklistTask,
} from '@/lib/api/profile'
import { formatDate, toSentenceCase } from '@/lib/utils'

interface ChecklistPanelProps {
  employeeId: string
  tasks: ChecklistTask[]
  canManage: boolean
  onChanged: () => void
}

/** Onboarding and offboarding tasks for one employee. */
export function ChecklistPanel({ employeeId, tasks, canManage, onChanged }: ChecklistPanelProps) {
  const toast = useToast()
  const [newTask, setNewTask] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const toggle = async (taskId: string, status: 'open' | 'done') => {
    setBusy(taskId)
    try {
      await updateChecklistTask(taskId, status)
      onChanged()
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Could not update the task', 'error')
    } finally {
      setBusy(null)
    }
  }

  const add = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newTask.trim()) return
    setBusy('task')
    try {
      await addChecklistTask(employeeId, { title: newTask.trim() })
      setNewTask('')
      onChanged()
      toast('Task added')
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Could not add the task', 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <section aria-labelledby="tasks-heading" className="panel p-6">
      <h2 id="tasks-heading" className="flex items-center gap-2 text-lg font-semibold">
        <CheckCircle2 size={18} aria-hidden="true" /> Onboarding &amp; offboarding
      </h2>
      {tasks.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/65">
          No checklist yet. One is created automatically when someone joins or a leaving date is set.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="flex flex-wrap items-start justify-between gap-3 border-b edge pb-3 last:border-0"
            >
              <div>
                <p
                  className={
                    task.status === 'done'
                      ? 'font-medium line-through text-foreground/55'
                      : 'font-medium'
                  }
                >
                  {task.title}
                </p>
                <p className="text-xs text-foreground/60">
                  {toSentenceCase(task.type)} · {task.category}
                  {task.dueDate ? ` · due ${formatDate(task.dueDate)}` : ''}
                </p>
              </div>
              {canManage ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={busy === task._id}
                  onClick={() => void toggle(task._id, task.status === 'done' ? 'open' : 'done')}
                >
                  {task.status === 'done' ? 'Reopen' : 'Mark done'}
                </Button>
              ) : (
                <Badge>{toSentenceCase(task.status)}</Badge>
              )}
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <form onSubmit={add} className="mt-4 flex gap-2">
          <label htmlFor="new-task" className="sr-only">
            New checklist task
          </label>
          <Input
            id="new-task"
            placeholder="Add a task…"
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
          />
          <Button type="submit" variant="outline" disabled={busy === 'task' || !newTask.trim()}>
            Add
          </Button>
        </form>
      )}
    </section>
  )
}
