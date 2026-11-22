'use client'

import { useCallback, useEffect, useState } from 'react'
import { CalendarPlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/common/toast'
import { addHoliday, deleteHoliday, fetchHolidays, type Holiday } from '@/lib/api/holidays'
import { formatDate } from '@/lib/utils'

/**
 * Public holidays are the calendar leave deductions and the attendance summary
 * share, so they live where organisation settings are edited.
 */
export function HolidayCalendar({ canManage }: { canManage: boolean }) {
  const toast = useToast()
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setHolidays(await fetchHolidays())
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Could not load holidays', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void load()
  }, [load])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !date) return
    setBusy(true)
    try {
      await addHoliday({ name: name.trim(), date })
      setName('')
      setDate('')
      await load()
      toast('Holiday added')
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Could not add the holiday', 'error')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (holiday: Holiday) => {
    setBusy(true)
    try {
      await deleteHoliday(holiday._id)
      await load()
      toast('Holiday removed')
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Could not remove the holiday', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-labelledby="holidays-heading" className="space-y-4">
      <div>
        <h2 id="holidays-heading" className="text-lg font-semibold">
          Public holidays
        </h2>
        <p className="text-sm text-foreground/65">
          Leave is charged in working days: weekends and these dates are not deducted.
        </p>
      </div>

      <div className="panel p-5">
        {loading ? (
          <p role="status" aria-busy="true" className="text-sm text-foreground/65">
            Loading holidays…
          </p>
        ) : holidays.length === 0 ? (
          <p className="text-sm text-foreground/65">No holidays recorded for this year.</p>
        ) : (
          <ul className="divide-y edge">
            {holidays.map((holiday) => (
              <li key={holiday._id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{holiday.name}</p>
                  <p className="text-sm text-foreground/60">{formatDate(holiday.date)}</p>
                </div>
                {canManage && (
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Remove ${holiday.name}`}
                    disabled={busy}
                    onClick={() => void remove(holiday)}
                  >
                    <Trash2 size={15} />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}

        {canManage && (
          <form onSubmit={submit} className="mt-5 flex flex-wrap items-end gap-3 border-t edge pt-5">
            <div className="min-w-[12rem] flex-1">
              <label htmlFor="holiday-name" className="mb-1 block text-sm font-medium">
                Holiday name
              </label>
              <Input
                id="holiday-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="New Year's Day"
                required
              />
            </div>
            <div>
              <label htmlFor="holiday-date" className="mb-1 block text-sm font-medium">
                Date
              </label>
              <Input
                id="holiday-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={busy} className="gap-2">
              <CalendarPlus size={16} /> Add holiday
            </Button>
          </form>
        )}
      </div>
    </section>
  )
}
