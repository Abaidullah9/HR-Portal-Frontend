'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface AttendanceToolbarProps {
  date: string
  lateAfter: string
  onDateChange: (value: string) => void
}

export function AttendanceToolbar({ date, lateAfter, onDateChange }: AttendanceToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="attendance-date" className="text-sm font-medium text-foreground/60">
        Filter by date
      </label>
      <Input
        id="attendance-date"
        type="date"
        value={date}
        onChange={(event) => onDateChange(event.target.value)}
        className="h-10 w-44"
      />
      {date && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDateChange('')}
          className="text-foreground/60 hover:text-foreground"
        >
          Clear filter
        </Button>
      )}
      <p className="text-xs text-foreground/55">Late after {lateAfter} per organization policy</p>
    </div>
  )
}
