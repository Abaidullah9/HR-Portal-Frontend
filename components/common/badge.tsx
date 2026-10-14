import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
  children: React.ReactNode
}

/**
 * Status colours come from the active palette so they stay legible on both the
 * dark navies and the light slate theme. Each badge always carries a text
 * label, so status never depends on colour alone.
 */
const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    background: 'rgb(var(--edge-rgb) / 0.12)',
    color: 'rgb(var(--fg-rgb) / 0.72)',
    border: '1px solid rgb(var(--edge-rgb) / 0.24)',
  },
  success: {
    background: 'rgb(var(--success-rgb) / 0.14)',
    color: 'rgb(var(--success-text-rgb))',
    border: '1px solid rgb(var(--success-rgb) / 0.32)',
  },
  warning: {
    background: 'rgb(var(--warning-rgb) / 0.14)',
    color: 'rgb(var(--warning-text-rgb))',
    border: '1px solid rgb(var(--warning-rgb) / 0.32)',
  },
  destructive: {
    background: 'rgb(var(--danger-rgb) / 0.14)',
    color: 'rgb(var(--danger-text-rgb))',
    border: '1px solid rgb(var(--danger-rgb) / 0.32)',
  },
  info: {
    background: 'rgb(var(--info-rgb) / 0.14)',
    color: 'rgb(var(--info-text-rgb))',
    border: '1px solid rgb(var(--info-rgb) / 0.32)',
  },
}

export function Badge({ variant = 'default', className, children, style, ...props }: BadgeProps) {
  const variantStyle = variantStyles[variant]
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        className,
      )}
      style={{
        ...variantStyle,
        ...(style ?? {}),
      }}
      {...props}
    >
      {children}
    </div>
  )
}
