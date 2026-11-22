'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { StatCard } from '@/components/common/stat-card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/common/toast'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import {
  fetchAttendance,
  recordAttendance,
  updateAttendance,
} from '@/lib/redux/slices/attendanceSlice'
import { fetchEmployees } from '@/lib/redux/slices/employeeSlice'
import { dayKey } from '@/lib/attendance'
import { PAGE_SIZE, PICKER_LIMIT } from '@/lib/api/page'
import {
  fetchAttendanceForDay,
  fetchAttendanceSummary,
  type AttendanceSummary,
} from '@/lib/api/insights'
import type { AttendanceRecord } from '@/types/attendance'
import { AttendanceTable } from './attendance-table'
import { CheckInBar } from './check-in-bar'

export default function AttendancePage() {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { records, loading, error, pagination } = useAppSelector((state) => state.attendance)
  const { employees } = useAppSelector((state) => state.employee)
  const [page, setPage] = useState(0)
  const [selectedDate, setSelectedDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [summary, setSummary] = useState<AttendanceSummary | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  // The check-in bar needs today's record for every employee, which is not
  // necessarily on the page the table is showing.
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([])

  const today = dayKey(new Date().toISOString())
  // The summary already carries the organization's late threshold, so the page
  // does not need a second request for it.
  const lateAfter = summary?.lateAfter ?? '09:15'

  const loadSummary = useCallback(async (date?: string) => {
    try {
      const data = await fetchAttendanceSummary(date)
      setSummary(data)
      setSummaryError(null)
    } catch (problem) {
      setSummaryError(problem instanceof Error ? problem.message : 'Could not load totals')
    }
  }, [])

  const loadToday = useCallback(async () => {
    try {
      setTodayRecords(await fetchAttendanceForDay(today))
    } catch {
      setTodayRecords([])
    }
  }, [today])

  useEffect(() => {
    void dispatch(
      fetchAttendance({ page: page + 1, limit: PAGE_SIZE, date: selectedDate || undefined }),
    )
  }, [dispatch, page, selectedDate])

  useEffect(() => {
    void dispatch(fetchEmployees({ limit: PICKER_LIMIT }))
    void loadToday()
  }, [dispatch, loadToday])

  useEffect(() => {
    void loadSummary(selectedDate || undefined)
  }, [loadSummary, selectedDate])

  // The cards come from the server's totals, so they stay correct regardless of
  // how many rows are loaded or filtered.
  const stats = useMemo(() => {
    const unknown = '--'
    return [
      {
        title: selectedDate ? 'Present that day' : 'Present today',
        value: summary ? String(summary.present) : unknown,
        icon: CheckCircle,
      },
      {
        title: 'Absent',
        value: summary ? String(summary.absent) : unknown,
        icon: XCircle,
      },
      {
        title: 'Late arrivals',
        value: summary ? String(summary.late) : unknown,
        icon: AlertCircle,
      },
      {
        title: 'Check-in rate',
        value: summary?.checkInRate != null ? `${summary.checkInRate}%` : unknown,
        icon: Clock,
      },
    ]
  }, [summary, selectedDate])

  const refresh = async () => {
    await dispatch(
      fetchAttendance({ page: page + 1, limit: PAGE_SIZE, date: selectedDate || undefined }),
    )
    await Promise.all([loadSummary(selectedDate || undefined), loadToday()])
  }

  const handleCheckIn = async (employeeId: string) => {
    const now = new Date()
    setBusy(true)
    try {
      const result = await dispatch(
        recordAttendance({
          employeeId,
          date: now.toISOString(),
          checkIn: now.toISOString(),
        }),
      )
      if (recordAttendance.fulfilled.match(result)) {
        toast('Checked in')
        await refresh()
      } else {
        toast('Could not log that check-in', 'error')
      }
    } finally {
      setBusy(false)
    }
  }

  const handleCheckOut = async (recordId: string) => {
    setBusy(true)
    try {
      const result = await dispatch(
        updateAttendance({ id: recordId, payload: { checkOut: new Date().toISOString() } }),
      )
      if (updateAttendance.fulfilled.match(result)) {
        toast('Checked out')
        await refresh()
      } else {
        toast('Could not log that check-out', 'error')
      }
    } finally {
      setBusy(false)
    }
  }

  const message = error ?? summaryError

  return (
    <AppLayout>
      <div className="space-y-10">
        <SectionHeader
          title="Attendance"
          description="Track and manage real-time employee attendance"
        />

        {message && (
          <div role="alert" className="rounded-2xl border danger-panel p-6 text-sm backdrop-blur-md">
            {message}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <CheckInBar
          employees={employees}
          records={todayRecords}
          busy={busy}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="attendance-date" className="text-sm font-medium text-foreground/60">
            Filter by date
          </label>
          <input
            id="attendance-date"
            type="date"
            value={selectedDate}
            onChange={(event) => {
              setSelectedDate(event.target.value)
              setPage(0)
            }}
            className="h-10 w-44 rounded-xl border edge bg-white/80 px-3 text-sm text-foreground shadow-sm backdrop-blur-md focus:border-brand focus:outline-none focus:ring-2 ring-brand dark:edge dark:surface-70"
          />
          {selectedDate && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedDate('')
                setPage(0)
              }}
              className="text-foreground/60 hover:text-foreground"
            >
              Clear filter
            </Button>
          )}
          <p className="text-xs text-foreground/55">
            Late after {lateAfter} per organization policy
          </p>
        </div>

        <AttendanceTable
          records={records}
          loading={loading}
          filtered={Boolean(selectedDate)}
          lateAfter={lateAfter}
          onClearFilter={() => {
            setSelectedDate('')
            setPage(0)
          }}
          pagination={{
            page,
            pageCount: pagination.totalPages,
            total: pagination.total,
            pageSize: PAGE_SIZE,
            onPageChange: setPage,
          }}
        />
      </div>
    </AppLayout>
  )
}
