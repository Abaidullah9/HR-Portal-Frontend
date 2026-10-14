'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { StatCard } from '@/components/common/stat-card'
import { DataTable } from '@/components/common/data-table'
import { Badge } from '@/components/common/badge'
import { SectionHeader } from '@/components/common/section-header'
import { Button } from '@/components/ui/button'
import {
  Users,
  Calendar,
  CheckCircle,
  TrendingUp,
  ChevronRight,
  Briefcase,
  ClipboardList,
} from 'lucide-react'
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

const QUICK_ACTIONS = [
  {
    label: 'Manage Employees',
    description: 'Onboard new staff and view directory',
    href: '/employees',
    icon: Users,
  },
  {
    label: 'Manage Leaves',
    description: 'View and approve leave requests',
    href: '/leaves',
    icon: Calendar,
  },
  {
    label: 'Run Payroll',
    description: 'Process salaries and review summaries',
    href: '/payroll',
    icon: TrendingUp,
  },
  {
    label: 'Attendance',
    description: 'Track daily check-ins and check-outs',
    href: '/attendance',
    icon: CheckCircle,
  },
]

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

  const recentActivities: ActivityItem[] = useMemo(() => {
    const activities: ActivityItem[] = []

    leaveRequests.slice(0, 3).forEach((req) => {
      const empName =
        typeof req.employeeId === 'object' && req.employeeId !== null
          ? req.employeeId.name
          : 'Employee'
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
      <div className="space-y-10">
        {/* Banner */}
        <div className="rounded-2xl p-8 text-foreground border shadow-lg shadow-black/10">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center md:gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-foreground/60">
                Here&apos;s what&apos;s happening across your HR workspace today.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2 brand-text hover:brand-text dark: dark:brand-text"
              >
                <Briefcase size={16} />
                See all activity
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Recent activities */}
        <div className="space-y-4">
          <SectionHeader
            title="Recent Activity"
            description="Latest updates and actions across your organization"
          />
          <div className="overflow-hidden rounded-2xl border edge bg-white/70 backdrop-blur-md shadow-xl shadow-black/5 dark:edge dark:surface-85">
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
                    className: 'text-foreground/65 text-sm',
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
              <div className="flex h-40 items-center justify-center text-sm text-foreground/60">
                No recent activities yet.
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <SectionHeader title="Quick Actions" description="Jump to the most used HR tools" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.href} href={action.href} className="group block">
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-4 rounded-2xl border edge bg-white/70 px-5 py-5 text-left shadow-xl shadow-black/5 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/10 dark:edge dark:surface-80 active:scale-[0.98]"
                  >
                    <span className="brand-tile flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                      <Icon size={20} />
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{action.label}</span>
                      <span className="text-sm text-foreground/60">{action.description}</span>
                    </div>
                    <ChevronRight
                      size={18}
                      className="ml-auto shrink-0 text-foreground/65 transition-transform group-hover:translate-x-1 group-hover:text-foreground/60"
                    />
                  </button>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
