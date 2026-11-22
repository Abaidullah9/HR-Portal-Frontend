'use client'

import { useState } from 'react'
import { Banknote, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/common/toast'
import { recordCompensation, type EmployeeProfile } from '@/lib/api/profile'
import { formatDate, toSentenceCase } from '@/lib/utils'

interface CompensationPanelProps {
  profile: EmployeeProfile
  canManage: boolean
  onChanged: () => void
}

/** Salary history plus the form that appends to it. */
export function CompensationPanel({ profile, canManage, onChanged }: CompensationPanelProps) {
  const toast = useToast()
  const { employee } = profile
  const [salary, setSalary] = useState('')
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().slice(0, 10))
  const [reason, setReason] = useState('raise')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const amount = Number(salary)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast('Enter a salary greater than zero', 'error')
      return
    }

    setBusy(true)
    try {
      await recordCompensation({
        employeeId: employee._id,
        baseSalary: amount,
        effectiveFrom,
        reason: reason as 'initial' | 'raise' | 'promotion' | 'adjustment' | 'correction',
        ...(note.trim() ? { note: note.trim() } : {}),
      })
      toast('Compensation change recorded')
      setSalary('')
      setNote('')
      onChanged()
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Could not record the change', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-labelledby="compensation-heading" className="panel p-6">
      <h2 id="compensation-heading" className="flex items-center gap-2 text-lg font-semibold">
        <Banknote size={18} aria-hidden="true" /> Compensation
      </h2>
      <p className="mt-1 text-sm text-foreground/65">
        Current base salary{' '}
        <span className="font-semibold text-foreground">
          {employee.salary != null ? employee.salary.toLocaleString() : 'Not set'}
        </span>
        {profile.compensations[0] ? ` ${profile.compensations[0].currency}` : ''}
      </p>

      {profile.compensations.length === 0 ? (
        <p className="mt-4 text-sm text-foreground/65">No compensation history recorded yet.</p>
      ) : (
        <ul className="mt-4 divide-y edge">
          {profile.compensations.map((record) => (
            <li key={record._id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div>
                <p className="font-medium">
                  {record.baseSalary.toLocaleString()} {record.currency}
                </p>
                <p className="text-sm text-foreground/60">
                  Effective {formatDate(record.effectiveFrom)} · {toSentenceCase(record.reason)}
                </p>
                {record.note && <p className="text-sm text-foreground/60">{record.note}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canManage && (
        <form onSubmit={submit} className="mt-6 space-y-4 border-t edge pt-6">
          <h3 className="text-sm font-semibold">Record a change</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="salary" className="mb-1 block text-sm font-medium">
                New base salary
              </label>
              <Input
                id="salary"
                type="number"
                min="0"
                step="0.01"
                value={salary}
                onChange={(event) => setSalary(event.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="effectiveFrom" className="mb-1 block text-sm font-medium">
                Effective from
              </label>
              <Input
                id="effectiveFrom"
                type="date"
                value={effectiveFrom}
                onChange={(event) => setEffectiveFrom(event.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="reason" className="mb-1 block text-sm font-medium">
                Reason
              </label>
              <select
                id="reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="h-10 w-full rounded-xl border edge bg-white/80 px-3 text-sm"
              >
                <option value="raise">Raise</option>
                <option value="promotion">Promotion</option>
                <option value="adjustment">Adjustment</option>
                <option value="correction">Correction</option>
              </select>
            </div>
            <div>
              <label htmlFor="comp-note" className="mb-1 block text-sm font-medium">
                Note (optional)
              </label>
              <Input id="comp-note" value={note} onChange={(event) => setNote(event.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={busy} className="gap-2">
            <Plus size={16} /> {busy ? 'Saving…' : 'Record change'}
          </Button>
        </form>
      )}
    </section>
  )
}
