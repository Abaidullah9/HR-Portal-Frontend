import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { StatCard } from '@/components/common/stat-card'
import type { AttendanceSummary } from '@/lib/api/insights'

interface AttendanceSummaryCardsProps {
  summary: AttendanceSummary | null
  selectedDate: string
}

export function AttendanceSummaryCards({ summary, selectedDate }: AttendanceSummaryCardsProps) {
  const unknown = '--'
  const stats = [
    {
      title: selectedDate ? 'Present that day' : 'Present today',
      value: summary ? String(summary.present) : unknown,
      icon: CheckCircle,
    },
    {
      title: 'Absent',
      value: summary ? String(summary.absent) : unknown,
      icon: XCircle,
    },
    {
      title: 'Late arrivals',
      value: summary ? String(summary.late) : unknown,
      icon: AlertCircle,
    },
    {
      title: 'Check-in rate',
      value: summary?.checkInRate != null ? `${summary.checkInRate}%` : unknown,
      icon: Clock,
    },
  ]

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
