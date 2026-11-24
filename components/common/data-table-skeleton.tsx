import { cn } from '@/lib/utils'

/**
 * Placeholder rows that match the real table's rhythm, so the panel keeps its
 * height instead of collapsing and shoving the page around when data lands.
 */
export function DataTableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div aria-hidden="true">
      <div className="flex gap-6 border-b edge px-4 py-4">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="h-4 flex-1 rounded-md bg-foreground/10 motion-safe:animate-pulse" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-6 border-b edge px-4 py-4 last:border-0">
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <div
              key={columnIndex}
              className={cn(
                'h-4 flex-1 rounded-md motion-safe:animate-pulse',
                columnIndex === 0 ? 'bg-foreground/10' : 'bg-foreground/[0.07]',
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
