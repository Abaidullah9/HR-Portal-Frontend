import { cn } from '@/lib/utils'

/**
 * Widths are a fixed class map so the bar needs no inline style and Tailwind can
 * statically see every class it must generate.
 */
const STEPS = [
  'w-0',
  'w-[5%]',
  'w-[10%]',
  'w-[15%]',
  'w-[20%]',
  'w-[25%]',
  'w-[30%]',
  'w-[35%]',
  'w-[40%]',
  'w-[45%]',
  'w-[50%]',
  'w-[55%]',
  'w-[60%]',
  'w-[65%]',
  'w-[70%]',
  'w-[75%]',
  'w-[80%]',
  'w-[85%]',
  'w-[90%]',
  'w-[95%]',
  'w-full',
] as const

const widthClass = (percent: number) =>
  STEPS[Math.min(STEPS.length - 1, Math.max(0, Math.round(percent / 5)))]!

interface ProgressBarProps {
  /** Completion from 0 to 100. Values outside the range are clamped. */
  value: number
  /** Accessible name describing what is being measured. */
  label: string
  tone?: 'brand' | 'success'
  className?: string
}

export function ProgressBar({ value, label, tone = 'brand', className }: ProgressBarProps) {
  const percent = Math.round(Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0)))

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn(
        'h-2 min-w-16 overflow-hidden rounded-full bg-foreground/10 dark:bg-white/5',
        className,
      )}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-300',
          tone === 'success' ? 'bg-[rgb(var(--success-rgb))]' : 'brand',
          widthClass(percent),
        )}
      />
    </div>
  )
}
