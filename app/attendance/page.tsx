'use client'

import { useCallback, useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { AccessDenied } from '@/components/common/access-denied'
import { useToast } from '@/components/common/toast'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { roleNameOf } from '@/lib/auth/roles'
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
import type { AttendanceRecord, UpdateAttendancePayload } from '@/types/attendance'
import { AttendanceTable } from './attendance-table'
import { CorrectionDialog } from './correction-dialog'
import { CheckInBar } from './check-in-bar'
import { AttendanceToolbar } from '@/components/attendance/attendance-toolbar'
import { AttendanceSummaryCards } from '@/components/attendance/attendance-summary-cards'

export default function AttendancePage() {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const { canView } = usePermissions()
  // Only roles that can read the employee directory may use the check-in bar.
  // Requesting it as an Employee is a guaranteed 403.
  const canPickEmployees = canView('employees')
  // HR has no read_Attendance, so its table request would only return 403.
  const { user } = useAppSelector((state) => state.auth)
  const roleReady = Boolean(user && roleNameOf(user))
  const canRead = canView('attendance')
  const { records, loading, error, pagination } = useAppSelector((state) => state.attendance)
  const { employees } = useAppSelector((state) => state.employee)
  const [page, setPage] = useState(0)
  const [selectedDate, setSelectedDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [correcting, setCorrecting] = useState<AttendanceRecord | null>(null)
  const [savingCorrection, setSavingCorrection] = useState(false)
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
    if (!canRead) return
    void dispatch(
      fetchAttendance({ page: page + 1, limit: PAGE_SIZE, date: selectedDate || undefined }),
    )
  }, [dispatch, page, selectedDate, canRead])

  useEffect(() => {
    if (!canPickEmployees) return
    void dispatch(fetchEmployees({ limit: PICKER_LIMIT }))
    void loadToday()
  }, [dispatch, loadToday, canPickEmployees])

  useEffect(() => {
    if (!canRead) return
    void loadSummary(selectedDate || undefined)
  }, [loadSummary, selectedDate, canRead])

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

  /** Saves an attendance change and reports whether the table needs reloading. */
  const saveAttendance = async (id: string, payload: UpdateAttendancePayload, done: string) => {
    const result = await dispatch(updateAttendance({ id, payload }))
    if (!updateAttendance.fulfilled.match(result)) {
      toast('Could not save that change', 'error')
      return false
    }
    toast(done)
    return true
  }

  const handleCheckOut = async (recordId: string) => {
    setBusy(true)
    try {
      if (await saveAttendance(recordId, { checkOut: new Date().toISOString() }, 'Checked out')) {
        await refresh()
      }
    } finally {
      setBusy(false)
    }
  }

  const handleCorrection = async (payload: UpdateAttendancePayload) => {
    if (!correcting) return
    setSavingCorrection(true)
    try {
      if (await saveAttendance(correcting._id, payload, 'Attendance corrected')) {
        setCorrecting(null)
        await refresh()
      }
    } finally {
      setSavingCorrection(false)
    }
  }

  const message = error ?? summaryError
  const changeDate = (value: string) => {
    setSelectedDate(value)
    setPage(0)
  }

  if (roleReady && !canRead) {
    return (
      <AppLayout>
        <div className="space-y-10">
          <SectionHeader
            title="Attendance"
            description="Track and manage real-time employee attendance"
          />
          <AccessDenied area="the attendance module" />
        </div>
      </AppLayout>
    )
  }

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

        {/* Totals come from the server, so they stay correct however the table is paged. */}
        <AttendanceSummaryCards summary={summary} selectedDate={selectedDate} />

        {canPickEmployees && (
          <CheckInBar
            employees={employees}
            records={todayRecords}
            busy={busy}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        )}

        <AttendanceToolbar
          date={selectedDate}
          lateAfter={lateAfter}
          onDateChange={changeDate}
        />

        <AttendanceTable
          records={records}
          loading={loading}
          filtered={Boolean(selectedDate)}
          lateAfter={lateAfter}
          onClearFilter={() => changeDate('')}
          onCorrect={setCorrecting}
          pagination={{
            page,
            pageCount: pagination.totalPages,
            total: pagination.total,
            pageSize: PAGE_SIZE,
            onPageChange: setPage,
          }}
        />
      </div>

      {correcting && (
        <CorrectionDialog
          record={correcting}
          submitting={savingCorrection}
          onClose={() => setCorrecting(null)}
          onSubmit={handleCorrection}
        />
      )}
    </AppLayout>
  )
}
