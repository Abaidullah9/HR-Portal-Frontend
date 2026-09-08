'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { StatCard } from '@/components/common/stat-card'
import { DataTable } from '@/components/common/data-table'
import { Badge } from '@/components/common/badge'
import { SectionHeader } from '@/components/common/section-header'
import {
  Users,
  Calendar,
  CheckCircle,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { fetchEmployees } from '@/lib/redux/slices/employeeSlice'
import { fetchAttendance } from '@/lib/redux/slices/attendanceSlice'
import { fetchLeaveRequests } from '@/lib/redux/slices/leaveSlice'

interface ActivityItem {
  id: string | number
  employee: string
  action: string
  date: string
  status: string
}

export default function Home() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { employees } = useAppSelector((state) => state.employee)
  const { records: attendanceRecords } = useAppSelector((state) => state.attendance)
  const { requests: leaveRequests } = useAppSelector((state) => state.leaves)

  useEffect(() => {
    dispatch(fetchEmployees())
    dispatch(fetchAttendance())
    dispatch(fetchLeaveRequests())
  }, [dispatch])

  // Calculate dynamic stats from real Redux data
  const stats = useMemo(() => {
    const total = employees.length
    const active = employees.filter((e) => e.isActive !== false).length
    const presentToday = attendanceRecords.filter((r) => r.checkIn).length
    const onLeave = leaveRequests.filter((l) => l.leaveStatus === 'approved').length

    return [
      {
        title: 'Total Employees',
        value: total.toString(),
        icon: Users,
        trend: { direction: 'up' as const, percentage: 5 },
      },
      {
        title: 'Present Today',
        value: presentToday.toString(),
        icon: CheckCircle,
        trend: { direction: 'up' as const, percentage: 2 },
      },
      {
        title: 'On Leave',
        value: onLeave.toString(),
        icon: Calendar,
        trend: { direction: 'down' as const, percentage: 1 },
      },
      {
        title: 'Active Staff',
        value: active.toString(),
        icon: TrendingUp,
        trend: { direction: 'up' as const, percentage: 8 },
      },
    ]
  }, [employees, attendanceRecords, leaveRequests])

  // Recent activities generated from real data
  const recentActivities: ActivityItem[] = useMemo(() => {
    const activities: ActivityItem[] = []

    leaveRequests.slice(0, 3).forEach((req) => {
      const empName = typeof req.employeeId === 'object' && req.employeeId !== null ? req.employeeId.name : 'Employee'
      activities.push({
        id: req._id,
        employee: empName,
        action: `Requested ${req.leaveType} leave`,
        date: req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent',
        status: req.leaveStatus,
      })
    })

    employees.slice(0, 2).forEach((emp) => {
      activities.push({
        id: `emp-${emp._id}`,
        employee: emp.name,
        action: `Joined as ${emp.position}`,
        date: emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'Recent',
        status: 'completed',
      })
    })

    return activities
  }, [leaveRequests, employees])

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Here&apos;s what&apos;s happening with your HR today.
          </p>
        </div>

        {/* Stats Grid */}
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

        {/* Recent Activities */}
        <div className="space-y-4">
          <SectionHeader
            title="Recent Activities"
            description="Latest updates and actions across your organization"
          />
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {recentActivities.length > 0 ? (
              <DataTable<ActivityItem>
                columns={[
                  {
                    header: 'Employee',
                    accessor: 'employee',
                    className: 'font-semibold',
                  },
                  {
                    header: 'Action',
                    accessor: 'action',
                  },
                  {
                    header: 'Date',
                    accessor: 'date',
                    className: 'text-muted-foreground text-sm',
                  },
                  {
                    header: 'Status',
                    accessor: 'status',
                    render: (status) => (
                      <Badge
                        variant={
                          status === 'completed' || status === 'approved'
                            ? 'success'
                            : status === 'rejected'
                              ? 'destructive'
                              : 'warning'
                        }
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    ),
                  },
                ]}
                data={recentActivities}
              />
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No recent activities found.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <SectionHeader title="Quick Actions" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link href="/employees" className="block">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:border-primary/50 transition-colors"
              >
                <Users size={20} className="mr-3 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Manage Employees</p>
                  <p className="text-xs text-muted-foreground">Onboard new staff and view directory</p>
                </div>
              </Button>
            </Link>
            <Link href="/leaves" className="block">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:border-primary/50 transition-colors"
              >
                <Calendar size={20} className="mr-3 text-indigo-600" />
                <div className="text-left">
                  <p className="font-medium">Manage Leaves</p>
                  <p className="text-xs text-muted-foreground">View and approve leave requests</p>
                </div>
              </Button>
            </Link>
            <Link href="/payroll" className="block">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 hover:border-primary/50 transition-colors"
              >
                <TrendingUp size={20} className="mr-3 text-emerald-600" />
                <div className="text-left">
                  <p className="font-medium">Run Payroll</p>
                  <p className="text-xs text-muted-foreground">Process salaries and review summaries</p>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
