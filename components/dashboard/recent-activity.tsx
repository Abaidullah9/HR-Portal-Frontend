'use client'

import Link from 'next/link'
import { CalendarClock } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { DataTable, DataTableSkeleton } from '@/components/common/data-table'
import { SectionHeader } from '@/components/common/section-header'
import { EmptyState } from '@/components/common/state-panel'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ActivityItem {
  id: string | number
  employee: string
  action: string
  date: string
  status: string
}

interface RecentActivityProps {
  activities: ActivityItem[]
  loading: boolean
}

function statusVariant(status: string) {
  if (status === 'completed' || status === 'approved') return 'success' as const
  if (status === 'rejected') return 'destructive' as const
  return 'warning' as const
}

/**
 * The dashboard fails as a whole when any of its three requests fail, so the
 * error state lives one level up. This panel only owns loading and empty.
 */
export function RecentActivity({ activities, loading }: RecentActivityProps) {
  return (
    <section aria-labelledby="recent-activity-heading" className="space-y-4">
      <SectionHeader
        id="recent-activity-heading"
        title="Recent Activity"
        description="Latest updates and actions across your organization"
      />
      <div className="panel overflow-hidden">
        {loading ? (
          <div role="status" aria-busy="true">
            <span className="sr-only">Loading recent activity</span>
            <DataTableSkeleton rows={5} columns={4} />
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No recent activity yet"
            description="Leave requests and new joiners appear here as they happen. Nothing is waiting on you right now."
            action={
              <Link
                href="/leaves"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'gap-2 pointer-coarse:min-h-11',
                )}
              >
                Review leave requests
              </Link>
            }
          />
        ) : (
          <DataTable<ActivityItem>
            caption="Recent activity across the organization"
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
                className: 'text-muted-foreground',
              },
              {
                header: 'Status',
                accessor: 'status',
                render: (status) => (
                  <Badge variant={statusVariant(status)} className="capitalize">
                    {status}
                  </Badge>
                ),
              },
            ]}
            data={activities}
          />
        )}
      </div>
    </section>
  )
}
