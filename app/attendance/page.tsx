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

  // Filter records by date if chosen
  const filteredRecords = useMemo(() => {
    if (!selectedDate) return records
    return records.filter((r) => r.date && r.date.startsWith(selectedDate))
  }, [records, selectedDate])

  // Compute live statistics
  const stats = useMemo(() => {
    const totalEmployees = employees.length || records.length || 1
    const presentCount = records.filter((r) => r.checkIn).length
    const lateCount = records.filter((r) => {
      if (!r.checkIn) return false
      const checkInHour = new Date(r.checkIn).getHours()
      return checkInHour >= 9 && new Date(r.checkIn).getMinutes() > 15
    }).length
    const absentCount = Math.max(0, totalEmployees - presentCount)
    const checkInRate = ((presentCount / totalEmployees) * 100).toFixed(1)

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
    if (employees.length === 0) return
    const firstEmp = employees[0]
    if (!firstEmp) return
    await dispatch(
      recordAttendance({
        employeeId: firstEmp._id,
        date: new Date().toISOString(),
        checkIn: new Date().toISOString(),
      })
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
      return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <SectionHeader
          title="Attendance"
          description="Track and manage real-time employee attendance"
          action={
            <Button 
              onClick={handleQuickCheckIn}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Clock size={16} />
              Quick Check-in
            </Button>
          }
        />

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">Filter by Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-background"
            />
          </div>
          {selectedDate && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate('')}>
              Clear Filter
            </Button>
          )}
        </div>

        {/* Attendance Records Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading && records.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Loading attendance logs...</div>
          ) : filteredRecords.length > 0 ? (
            <DataTable<AttendanceRecord>
              columns={[
                {
                  header: 'Employee',
                  accessor: 'employeeId',
                  render: (emp) =>
                    typeof emp === 'object' && emp !== null ? emp.name : 'Diana Employee',
                },
                {
                  header: 'Date',
                  accessor: 'date',
                  render: (date) => formatDate(date),
                  className: 'text-muted-foreground text-sm',
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
            <div className="p-8 text-center text-muted-foreground">
              No attendance records found. Click &quot;Quick Check-in&quot; to log attendance.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
