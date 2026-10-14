'use client'

import { useEffect, useMemo, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { StatCard } from '@/components/common/stat-card'
import { Badge } from '@/components/common/badge'
import { DataTable } from '@/components/common/data-table'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { fetchAttendance, recordAttendance } from '@/lib/redux/slices/attendanceSlice'
import { fetchEmployees } from '@/lib/redux/slices/employeeSlice'
import { AttendanceRecord } from '@/types/attendance'

export default function AttendancePage() {
  const dispatch = useAppDispatch()
  const { records, loading, error } = useAppSelector((state) => state.attendance)
  const { employees } = useAppSelector((state) => state.employee)
  const [selectedDate, setSelectedDate] = useState<string>('')

  useEffect(() => {
    dispatch(fetchAttendance())
    dispatch(fetchEmployees())
  }, [dispatch])

  const filteredRecords = useMemo(() => {
    if (!selectedDate) return records
    return records.filter((r) => r.date?.startsWith(selectedDate))
  }, [records, selectedDate])

  const stats = useMemo(() => {
    const totalEmployees = employees.length || Math.max(records.length, 1)
    const presentCount = records.filter((r) => r.checkIn).length
    const lateCount = records.filter((r) => {
      if (!r.checkIn) return false
      const hour = new Date(r.checkIn).getHours()
      const minute = new Date(r.checkIn).getMinutes()
      return hour >= 9 && (hour > 9 || minute > 15)
    }).length
    const absentCount = Math.max(0, totalEmployees - presentCount)
    const checkInRate =
      totalEmployees > 0 ? ((presentCount / totalEmployees) * 100).toFixed(1) : '0.0'

    return [
      {
        title: 'Present Today',
        value: presentCount.toString(),
        icon: CheckCircle,
        trend: { direction: 'up' as const, percentage: 5 },
      },
      {
        title: 'Absent',
        value: absentCount.toString(),
        icon: XCircle,
        trend: { direction: 'down' as const, percentage: 2 },
      },
      {
        title: 'Late Arrivals',
        value: lateCount.toString(),
        icon: AlertCircle,
        trend: { direction: 'down' as const, percentage: 1 },
      },
      {
        title: 'Check-in Rate',
        value: `${checkInRate}%`,
        icon: Clock,
        trend: { direction: 'up' as const, percentage: 3 },
      },
    ]
  }, [records, employees])

  const handleQuickCheckIn = async () => {
    const firstEmp = employees[0]
    if (!firstEmp) return
    await dispatch(
      recordAttendance({
        employeeId: firstEmp._id,
        date: new Date().toISOString(),
        checkIn: new Date().toISOString(),
      }),
    )
  }

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '--'
    try {
      return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeStr
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <AppLayout>
      <div className="space-y-10">
        <SectionHeader
          title="Attendance"
          description="Track and manage real-time employee attendance"
          action={
            <Button onClick={handleQuickCheckIn} className="gap-2 brand text-white border edge">
              <Clock size={16} />
              Quick Check-in
            </Button>
          }
        />

        {error && (
          <div className="rounded-2xl border danger-panel p-6 text-sm backdrop-blur-md">
            {error}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Date filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-foreground/60">Filter by date</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-10 w-44 rounded-xl border edge bg-white/80 px-3 text-sm text-foreground shadow-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-2 ring-brand focus:border-brand dark:edge dark:surface-70"
          />
          {selectedDate && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate('')}
              className="text-foreground/60 hover:text-foreground"
            >
              Clear filter
            </Button>
          )}
        </div>

        {/* Attendance records */}
        <div className="overflow-hidden rounded-2xl border edge bg-white/70 shadow-xl shadow-black/5 backdrop-blur-md dark:edge dark:surface-85">
          {loading && records.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-foreground/65">
              Loading attendance logs…
            </div>
          ) : filteredRecords.length > 0 ? (
            <DataTable<AttendanceRecord>
              columns={[
                {
                  header: 'Employee',
                  accessor: 'employeeId',
                  render: (emp) =>
                    typeof emp === 'object' && emp !== null && 'name' in emp
                      ? emp.name
                      : 'Unknown Employee',
                },
                {
                  header: 'Date',
                  accessor: 'date',
                  render: (date) => formatDate(date),
                  className: 'text-foreground/65 text-sm',
                },
                {
                  header: 'Check-in',
                  accessor: 'checkIn',
                  render: (checkIn) => formatTime(checkIn),
                },
                {
                  header: 'Check-out',
                  accessor: 'checkOut',
                  render: (checkOut) => formatTime(checkOut),
                },
                {
                  header: 'Status',
                  accessor: 'checkIn',
                  render: (checkIn) => (
                    <Badge variant={checkIn ? 'success' : 'destructive'}>
                      {checkIn ? 'Present' : 'Absent'}
                    </Badge>
                  ),
                },
              ]}
              data={filteredRecords}
            />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-sm text-foreground/65">
              <p>No attendance records found.</p>
              <p className="mt-1 text-xs">Click &quot;Quick Check-in&quot; to log attendance.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
