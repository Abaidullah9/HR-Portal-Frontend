import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    direction: 'up' | 'down'
    percentage: number
  }
  className?: string
}

export function StatCard({ title, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'group flex flex-col gap-4 rounded-2xl border edge surface-70 p-6 shadow-sm shadow-black/5 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 dark:surface-85',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground/60">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                'mt-2 flex items-center gap-1.5 text-sm font-medium',
                trend.direction === 'up'
                  ? 'text-[rgb(var(--success-text-rgb))]'
                  : 'text-[rgb(var(--danger-text-rgb))]',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'inline-block h-1.5 w-1.5 rounded-full',
                  trend.direction === 'up' ? 'bg-[rgb(var(--success-rgb))]' : 'bg-[rgb(var(--danger-rgb))]',
                )}
              />
              {trend.direction === 'up' ? '+' : '-'}
              {trend.percentage}%
              <span className="text-foreground/65"> this month</span>
            </p>
          )}
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border edge bg-foreground/[0.04] dark:bg-white/[0.06]">
          <Icon size={22} strokeWidth={2} className="text-primary" />
        </span>
      </div>
    </div>
  )
}
