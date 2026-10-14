import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring/50 focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive/60 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/40 dark:aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'brand brand-hover backdrop-blur-sm',
        outline:
          'border edge bg-white/80 text-foreground backdrop-blur-md hover:bg-white hover:text-foreground hover:shadow-lg hover:shadow-black/10 dark:surface-80',
        secondary:
          'border edge bg-white/60 text-foreground backdrop-blur-md hover:bg-white/90 hover:text-foreground hover:shadow-md dark:surface-60',
        ghost:
          'bg-transparent text-foreground/80 hover:bg-white/40 hover:text-foreground dark:bg-transparent dark:text-foreground/70 dark:hover:bg-white/5',
        destructive:
          'border border-transparent bg-[rgb(var(--danger-rgb))] text-white shadow-md shadow-black/20 backdrop-blur-sm hover:brightness-110',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 gap-2',
        xs: 'h-7 px-2 text-xs gap-1.5 rounded-lg',
        sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
        lg: 'h-10 px-5 text-sm gap-2.5 rounded-xl',
        icon: 'h-9 w-9',
        'icon-sm': 'h-7 w-7',
        'icon-xs': 'h-6 w-6',
        'icon-lg': 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
