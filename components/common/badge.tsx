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
 *
 * Styling is class-based (no inline `style` objects) and every value resolves
 * through a palette token, so switching `data-palette` repaints badges too.
 */
const variantClasses: Record<BadgeVariant, string> = {
  default: 'edge bg-foreground/[0.06] text-muted-foreground',
  success: 'success-panel',
  warning: 'warning-panel warning-text',
  destructive: 'danger-panel',
  info: 'brand-tint brand-text',
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
