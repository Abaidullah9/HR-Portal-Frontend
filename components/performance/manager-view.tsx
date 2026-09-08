'use client'

import { StatCard } from '@/components/common/stat-card'
import { Badge } from '@/components/common/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/data-table'
import { Input } from '@/components/ui/input'
import {
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Plus,
  FileText,
} from 'lucide-react'

const managerStats = [
  {
    title: 'Team Members',
    value: '8',
    icon: Users,
    trend: { direction: 'up' as const, percentage: 0 },
  },
  {
    title: 'Appraisals Completed',
    value: '5',
    icon: CheckCircle,
    trend: { direction: 'up' as const, percentage: 62 },
  },
  {
    title: 'Pending Review',
    value: '3',
    icon: Clock,
    trend: { direction: 'down' as const, percentage: 33 },
  },
  {
    title: 'Team Avg Rating',
    value: '4.2',
    icon: AlertCircle,
    trend: { direction: 'up' as const, percentage: 5 },
  },
]

const teamMembers = [
  {
    id: 1,
    name: 'Sarah Anderson',
    department: 'Engineering',
    rating: '4.5',
    status: 'completed',
    date: 'Dec 10, 2024',
    lastReview: '6 months ago',
  },
  {
    id: 2,
    name: 'Michael Chen',
    department: 'Engineering',
    rating: '4.2',
    status: 'completed',
    date: 'Dec 8, 2024',
    lastReview: '6 months ago',
  },
  {
    id: 3,
    name: 'Emma Watson',
    department: 'Engineering',
    rating: '--',
    status: 'pending',
    date: 'Due: Dec 20',
    lastReview: '12 months ago',
  },
  {
    id: 4,
    name: 'James Thompson',
    department: 'Engineering',
    rating: '3.9',
    status: 'completed',
    date: 'Dec 5, 2024',
    lastReview: '6 months ago',
  },
  {
    id: 5,
    name: 'Lisa Park',
    department: 'Engineering',
    rating: '--',
    status: 'pending',
    date: 'Due: Dec 22',
    lastReview: '12 months ago',
  },
]

const upcomingReviews = [
  { id: 1, employee: 'Emma Watson', dueDate: 'Dec 20, 2024', daysLeft: 4 },
  { id: 2, employee: 'Lisa Park', dueDate: 'Dec 22, 2024', daysLeft: 6 },
  { id: 3, employee: 'David Lee', dueDate: 'Dec 25, 2024', daysLeft: 9 },
]

export function ManagerView() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manage Team Performance</h2>
          <p className="text-muted-foreground mt-1">Appraise and develop your team members</p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          Start New Appraisal
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {managerStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Urgent Reminders */}
      {upcomingReviews.length > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Pending Appraisals</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You have {upcomingReviews.length} appraisals due this month
              </p>
              <div className="mt-3 space-y-2">
                {upcomingReviews.map((review) => (
                  <div key={review.id} className="flex items-center justify-between text-sm">
                    <span>{review.employee}</span>
                    <Badge variant="warning" className="text-xs">
                      {review.daysLeft} days left
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Members Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Team Members</h3>
            <p className="text-sm text-muted-foreground mt-1">Manage appraisals for your team</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <Input
              placeholder="Search team members..."
              className="pl-10 bg-background"
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <DataTable
            columns={[
              { header: 'Name', accessor: 'name', className: 'font-medium' },
              { header: 'Department', accessor: 'department', className: 'text-muted-foreground text-sm' },
              {
                header: 'Rating',
                accessor: 'rating',
                className: 'font-bold text-center',
              },
              {
                header: 'Last Review',
                accessor: 'lastReview',
                className: 'text-muted-foreground text-sm',
              },
              {
                header: 'Status',
                accessor: 'status',
                render: (status) => (
                  <Badge
                    variant={status === 'completed' ? 'success' : 'warning'}
                    className="text-xs"
                  >
                    {status === 'completed' ? 'Completed' : 'Pending'}
                  </Badge>
                ),
              },
              {
                header: 'Actions',
                accessor: 'id',
                render: (id) => (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                    >
                      <FileText size={14} className="mr-1" />
                      Review
                    </Button>
                  </div>
                ),
                className: 'text-right',
              },
            ]}
            data={teamMembers}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" size="sm" className="h-auto p-3 flex-col gap-1">
            <FileText size={18} />
            <span className="text-xs">Start Appraisal</span>
          </Button>
          <Button variant="outline" size="sm" className="h-auto p-3 flex-col gap-1">
            <Users size={18} />
            <span className="text-xs">View Team</span>
          </Button>
          <Button variant="outline" size="sm" className="h-auto p-3 flex-col gap-1">
            <CheckCircle size={18} />
            <span className="text-xs">My Feedback</span>
          </Button>
          <Button variant="outline" size="sm" className="h-auto p-3 flex-col gap-1">
            <Clock size={18} />
            <span className="text-xs">Reminders</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
