'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calendar, CheckCircle, TrendingUp, Users, type LucideIcon } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { StatCard, StatCardSkeleton } from '@/components/common/stat-card'
import { ErrorState } from '@/components/common/state-panel'
import { WelcomeBanner } from '@/components/dashboard/welcome-banner'
import { RecentActivity, type ActivityItem } from '@/components/dashboard/recent-activity'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { SetupChecklist } from '@/components/dashboard/setup-checklist'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { fetchDepartments, fetchEmployees } from '@/lib/redux/slices/employeeSlice'
import { fetchLeaveRequests } from '@/lib/redux/slices/leaveSlice'
import { fetchDashboardSummary, type DashboardSummary } from '@/lib/api/insights'
import { PICKER_LIMIT } from '@/lib/api/page'
import { canView, roleNameOf } from '@/lib/auth/roles'

export default function Home() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const employee = useAppSelector((state) => state.employee)
  const leaves = useAppSelector((state) => state.leaves)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  // Waits for the session refresh to populate the role: fetching before that
  // would ask for modules this role cannot read and fail the whole page.
  const roleReady = Boolean(user && roleNameOf(user))
  const canSeeEmployees = roleReady && canView(user, 'employees')
  const canSeeLeaves = roleReady && canView(user, 'leaves')

  const loadDashboard = useCallback(() => {
    // One 403 used to replace the entire dashboard with an error, so only the
    // panels this role can read are requested. HR, for example, has no
    // Attendance module and Manager has no Payroll.
    if (canSeeEmployees) {
      void dispatch(fetchEmployees({ limit: PICKER_LIMIT }))
      void dispatch(fetchDepartments())
    }
    if (canSeeLeaves) void dispatch(fetchLeaveRequests({ limit: PICKER_LIMIT }))

    // The cards count every record, not one page of the lists above, so their
    // numbers stay correct once those tables page on the server.
    if (roleReady) {
      setSummaryLoading(true)
      void fetchDashboardSummary()
        .then((data) => {
          setSummary(data)
          setSummaryError(null)
        })
        .catch((problem: unknown) => {
          setSummaryError(problem instanceof Error ? problem.message : 'Could not load totals')
        })
        .finally(() => setSummaryLoading(false))
    }
  }, [dispatch, roleReady, canSeeEmployees, canSeeLeaves])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const error =
    summaryError ??
    (canSeeEmployees ? employee.error : null) ??
    (canSeeLeaves ? leaves.error : null)

  const stats = useMemo(() => {
    const cards: { title: string; value: string; icon: LucideIcon }[] = []

    if (summary?.employees) {
      cards.push({ title: 'Total employees', value: String(summary.employees.total), icon: Users })
      cards.push({ title: 'Active staff', value: String(summary.employees.active), icon: TrendingUp })
    }

    if (summary?.attendance) {
      cards.push({
        title: 'Present today',
        value: String(summary.attendance.presentToday),
        icon: CheckCircle,
      })
    }

    if (summary?.leaves) {
      cards.push({ title: 'On leave', value: String(summary.leaves.onLeave), icon: Calendar })
    }

    return cards
  }, [summary])

  const recentActivities: ActivityItem[] = useMemo(() => {
    const activities: ActivityItem[] = []

    if (canSeeLeaves) {
      leaves.requests.slice(0, 3).forEach((request) => {
        activities.push({
          id: request._id,
          employee:
            typeof request.employeeId === 'object' && request.employeeId !== null
              ? request.employeeId.name
              : 'Employee',
          action: `Requested ${request.leaveType} leave`,
          date: request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Recent',
          status: request.leaveStatus,
        })
      })
    }

    if (canSeeEmployees) {
      employee.employees.slice(0, 2).forEach((record) => {
        activities.push({
          id: `emp-${record._id}`,
          employee: record.name,
          action: `Joined as ${record.position}`,
          date: record.joiningDate ? new Date(record.joiningDate).toLocaleDateString() : 'Recent',
          status: 'completed',
        })
      })
    }

    return activities
  }, [canSeeLeaves, canSeeEmployees, leaves.requests, employee.employees])

  return (
    <AppLayout>
      <div className="space-y-10">
        <WelcomeBanner name={user?.name} />

        {error ? (
          /* One announcement for the whole dashboard: the requests back these
             panels, so a failure here fails all of them. */
          <div className="panel">
            <ErrorState
              title="Couldn't load your dashboard"
              description={error}
              onRetry={loadDashboard}
            />
          </div>
        ) : (
          <>
            {canSeeEmployees && !summaryLoading && employee.employees.length === 0 && (
              <SetupChecklist
                departmentCount={employee.departments.length}
                employeeCount={summary?.employees?.total ?? 0}
                leaveRequestCount={leaves.requests.length}
              />
            )}

            {stats.length > 0 && (
              /* The cards are h3s, so the section needs an h2 or the heading
                 order jumps from the page h1 straight to h3. */
              <section aria-labelledby="workforce-summary-heading">
                <h2 id="workforce-summary-heading" className="sr-only">
                  Workforce summary
                </h2>
                {summaryLoading ? (
                  <div
                    className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
                    role="status"
                    aria-busy="true"
                  >
                    <span className="sr-only">Loading workforce summary</span>
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                  </div>
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                      <StatCard key={stat.title} {...stat} />
                    ))}
                  </div>
                )}
              </section>
            )}

            <RecentActivity activities={recentActivities} loading={summaryLoading} />
          </>
        )}

        <QuickActions />
      </div>
    </AppLayout>
  )
}
