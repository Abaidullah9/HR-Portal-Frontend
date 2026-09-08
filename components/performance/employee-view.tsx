'use client'

import { StatCard } from '@/components/common/stat-card'
import { Badge } from '@/components/common/badge'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  TrendingUp,
  Award,
  MessageSquare,
  Download,
  ChevronRight,
} from 'lucide-react'

const employeePerformanceData = {
  name: 'Sarah Anderson',
  department: 'Engineering',
  overallRating: 4.5,
  lastReview: 'December 10, 2024',
  reviewers: 3,
}

const performanceMetrics = [
  {
    title: 'Overall Rating',
    value: '4.5',
    icon: Award,
    trend: { direction: 'up' as const, percentage: 12 },
  },
  {
    title: 'Goals Completed',
    value: '8/10',
    icon: TrendingUp,
    trend: { direction: 'up' as const, percentage: 80 },
  },
  {
    title: 'Feedback Received',
    value: '3',
    icon: MessageSquare,
    trend: { direction: 'up' as const, percentage: 0 },
  },
]

const competencies = [
  { name: 'Technical Skills', rating: 4.7, target: 4.5 },
  { name: 'Communication', rating: 4.3, target: 4.0 },
  { name: 'Leadership', rating: 4.2, target: 4.0 },
  { name: 'Teamwork', rating: 4.5, target: 4.5 },
  { name: 'Problem Solving', rating: 4.8, target: 4.5 },
  { name: 'Adaptability', rating: 4.1, target: 4.0 },
]

const feedback = [
  {
    id: 1,
    from: 'Alex Johnson',
    role: 'Direct Manager',
    date: 'Dec 10, 2024',
    snippet: 'Exceptional technical abilities and great collaboration with the team.',
  },
  {
    id: 2,
    from: 'Emily Brown',
    role: 'Peer',
    date: 'Dec 8, 2024',
    snippet: 'Always willing to help and share knowledge with team members.',
  },
  {
    id: 3,
    from: 'David Lee',
    role: 'Peer',
    date: 'Dec 7, 2024',
    snippet: 'Shows strong initiative and takes ownership of projects.',
  },
]

const goals = [
  {
    id: 1,
    title: 'Complete Advanced TypeScript Course',
    status: 'completed',
    progress: 100,
    dueDate: 'Oct 31, 2024',
  },
  {
    id: 2,
    title: 'Lead 2 Technical Architecture Reviews',
    status: 'in-progress',
    progress: 50,
    dueDate: 'Dec 31, 2024',
  },
  {
    id: 3,
    title: 'Mentor 1 Junior Developer',
    status: 'in-progress',
    progress: 75,
    dueDate: 'Dec 31, 2024',
  },
  {
    id: 4,
    title: 'Contribute to Open Source Project',
    status: 'pending',
    progress: 0,
    dueDate: 'Q1 2025',
  },
]

export function EmployeeView() {
  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold">{employeePerformanceData.name}</h2>
            <p className="text-muted-foreground mt-1">{employeePerformanceData.department}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Last Review: {employeePerformanceData.lastReview}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-primary">{employeePerformanceData.overallRating}</div>
            <p className="text-sm text-muted-foreground">Out of 5.0</p>
            <Badge className="mt-3 bg-success/20 text-success border-success/30">
              Reviewed by {employeePerformanceData.reviewers} people
            </Badge>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {performanceMetrics.map((metric) => (
          <StatCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            trend={metric.trend}
          />
        ))}
      </div>

      {/* Competencies */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Competencies & Skills</h3>
          <p className="text-sm text-muted-foreground mt-1">Your proficiency across key competencies</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {competencies.map((comp) => (
            <div key={comp.name} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{comp.name}</p>
                <span className="text-lg font-bold text-primary">{comp.rating}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(comp.rating / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">Target: {comp.target}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Goals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Performance Goals</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {goals.filter((g) => g.status === 'completed').length} of {goals.length} goals completed
            </p>
          </div>
          <Button variant="outline" size="sm">
            <ChevronRight size={16} className="mr-1" />
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-card border border-border rounded-lg p-4 flex items-start justify-between"
            >
              <div className="flex-1">
                <p className="font-medium">{goal.title}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex-1 max-w-xs">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          goal.status === 'completed' ? 'bg-success' : 'bg-primary'
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium">{goal.progress}%</span>
                  <span className="text-xs text-muted-foreground">{goal.dueDate}</span>
                </div>
              </div>
              <Badge
                variant={
                  goal.status === 'completed' ? 'success' : goal.status === 'in-progress' ? 'info' : 'warning'
                }
                className="ml-4 shrink-0"
              >
                {goal.status === 'in-progress'
                  ? 'In Progress'
                  : goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">360° Feedback</h3>
            <p className="text-sm text-muted-foreground mt-1">Anonymous feedback from your team and managers</p>
          </div>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-1" />
            Export
          </Button>
        </div>
        <div className="space-y-3">
          {feedback.map((item) => (
            <div key={item.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">{item.from}</p>
                  <p className="text-sm text-muted-foreground">{item.role}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.date}</span>
              </div>
              <p className="text-sm text-foreground/80 italic">&quot;{item.snippet}&quot;</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          Request Feedback
        </Button>
        <Button variant="outline" className="flex-1">
          View Full Report
        </Button>
      </div>
    </div>
  )
}
