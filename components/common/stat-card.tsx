import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
}

export function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <div className="panel group flex flex-col gap-4 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 motion-reduce:transform-none motion-reduce:transition-none dark:surface-85">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <span
          className="soft-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          aria-hidden="true"
        >
          <Icon size={22} strokeWidth={2} className="brand-text" />
        </span>
      </div>
    </div>
  )
}

/**
 * Same footprint as StatCard so swapping them in while data loads does not
 * move any surrounding layout.
 */
export function StatCardSkeleton() {
  return (
    <div aria-hidden="true" className="panel flex flex-col gap-4 p-6 dark:surface-85">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-4 w-24 rounded-md bg-foreground/10 motion-safe:animate-pulse" />
          <div className="h-8 w-16 rounded-md bg-foreground/10 motion-safe:animate-pulse" />
        </div>
        <div className="h-11 w-11 shrink-0 rounded-xl bg-foreground/10 motion-safe:animate-pulse" />
      </div>
    </div>
  )
}
