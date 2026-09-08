'use client'

import { StatCard } from '@/components/common/stat-card'
import { Badge } from '@/components/common/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/data-table'
import {
  BarChart3,
  Users,
  TrendingUp,
  Zap,
  Plus,
  Settings,
  Download,
  Eye,
} from 'lucide-react'

const hrStats = [
  {
    title: 'Total Employees',
    value: '248',
    icon: Users,
    trend: { direction: 'up' as const, percentage: 5 },
  },
  {
    title: 'Appraisals Completed',
    value: '184',
    icon: TrendingUp,
    trend: { direction: 'up' as const, percentage: 74 },
  },
  {
    title: 'Appraisals Pending',
    value: '64',
    icon: Zap,
    trend: { direction: 'down' as const, percentage: 26 },
  },
  {
    title: 'Org Avg Rating',
    value: '4.1',
    icon: BarChart3,
    trend: { direction: 'up' as const, percentage: 3 },
  },
]

const appraisalCycles = [
  {
    id: 1,
    cycle: 'Q4 2024 Review',
    startDate: 'Dec 1, 2024',
    endDate: 'Dec 31, 2024',
    status: 'active',
    employees: 248,
    completed: 184,
    daysLeft: 9,
  },
  {
    id: 2,
    cycle: 'Q3 2024 Review',
    startDate: 'Sep 1, 2024',
    endDate: 'Sep 30, 2024',
    status: 'completed',
    employees: 248,
    completed: 248,
    daysLeft: 0,
  },
  {
    id: 3,
    cycle: 'Mid-Year Review 2024',
    startDate: 'Jun 15, 2024',
    endDate: 'Jul 15, 2024',
    status: 'completed',
    employees: 242,
    completed: 242,
    daysLeft: 0,
  },
]

const departmentPerformance = [
  {
    id: 1,
    department: 'Engineering',
    employees: 45,
    avgRating: 4.3,
    completed: 42,
    pending: 3,
  },
  {
    id: 2,
    department: 'Sales',
    employees: 32,
    avgRating: 4.0,
    completed: 28,
    pending: 4,
  },
  {
    id: 3,
    department: 'Marketing',
    employees: 18,
    avgRating: 4.2,
    completed: 18,
    pending: 0,
  },
  {
    id: 4,
    department: 'HR',
    employees: 12,
    avgRating: 4.1,
    completed: 11,
    pending: 1,
  },
  {
    id: 5,
    department: 'Operations',
    employees: 35,
    avgRating: 3.9,
    completed: 30,
    pending: 5,
  },
  {
    id: 6,
    department: 'Finance',
    employees: 28,
    avgRating: 4.0,
    completed: 27,
    pending: 1,
  },
]

export function HRView() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Management Hub</h2>
          <p className="text-muted-foreground mt-1">Manage appraisal cycles and organizational performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Plus size={16} className="mr-2" />
            New Cycle
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hrStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Active Cycles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Appraisal Cycles</h3>
            <p className="text-sm text-muted-foreground mt-1">Manage and monitor all appraisal cycles</p>
          </div>
          <Button variant="outline" size="sm">
            <Settings size={16} className="mr-2" />
            Cycle Settings
          </Button>
        </div>

        <div className="grid gap-4">
          {appraisalCycles.map((cycle) => {
            const progress = (cycle.completed / cycle.employees) * 100
            return (
              <div
                key={cycle.id}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">{cycle.cycle}</h4>
                    <p className="text-sm text-muted-foreground">
                      {cycle.startDate} — {cycle.endDate}
                    </p>
                  </div>
                  <Badge
                    variant={cycle.status === 'active' ? 'info' : 'success'}
                    className="text-xs"
                  >
                    {cycle.status === 'active' ? (
                      <>
                        <Zap size={12} className="mr-1" />
                        Active - {cycle.daysLeft} days left
                      </>
                    ) : (
                      'Completed'
                    )}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Employees</p>
                    <p className="text-2xl font-bold mt-1">{cycle.employees}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-success mt-1">{cycle.completed}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-warning mt-1">
                      {cycle.employees - cycle.completed}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold text-primary mt-1">{progress.toFixed(0)}%</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye size={14} className="mr-1" />
                    View Details
                  </Button>
                  {cycle.status === 'active' && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download size={14} className="mr-1" />
                      Export
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Department Performance */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Performance by Department</h3>
          <p className="text-sm text-muted-foreground mt-1">Current appraisal status across all departments</p>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <DataTable
            columns={[
              { header: 'Department', accessor: 'department', className: 'font-medium' },
              { header: 'Employees', accessor: 'employees', className: 'text-center font-semibold' },
              {
                header: 'Avg Rating',
                accessor: 'avgRating',
                className: 'text-center font-bold text-primary',
              },
              {
                header: 'Completed',
                accessor: 'completed',
                className: 'text-center',
                render: (completed) => (
                  <Badge variant="success" className="text-xs">
                    {completed}
                  </Badge>
                ),
              },
              {
                header: 'Pending',
                accessor: 'pending',
                className: 'text-center',
                render: (pending) => (
                  <Badge variant={pending > 0 ? 'warning' : 'success'} className="text-xs">
                    {pending}
                  </Badge>
                ),
              },
              {
                header: 'Actions',
                accessor: 'id',
                render: () => (
                  <Button size="sm" variant="ghost" className="h-8 text-xs">
                    View
                  </Button>
                ),
                className: 'text-right',
              },
            ]}
            data={departmentPerformance}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">On Track</p>
          <p className="text-3xl font-bold text-success mt-2">184/248</p>
          <p className="text-xs text-muted-foreground mt-1">74% completion rate</p>
        </div>
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">At Risk</p>
          <p className="text-3xl font-bold text-warning mt-2">18</p>
          <p className="text-xs text-muted-foreground mt-1">2 days overdue</p>
        </div>
        <div className="bg-info/10 border border-info/20 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Org Average</p>
          <p className="text-3xl font-bold text-info mt-2">4.1/5</p>
          <p className="text-xs text-muted-foreground mt-1">+3% vs last cycle</p>
        </div>
      </div>
    </div>
  )
}
