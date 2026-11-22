import Link from 'next/link'
import { Users } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Page heading for the dashboard. The action is a real link to the employee
 * directory — the previous button had no handler and did nothing when pressed.
 */
export function WelcomeBanner({ name }: { name?: string }) {
  const firstName = name?.trim().split(' ')[0] || 'there'

  return (
    <section className="panel p-5 sm:p-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center md:gap-6">
        <div className="min-w-0">
          {/* wrap-anywhere (overflow-wrap: anywhere) also shrinks min-content,
              so a single 80-character name cannot widen the banner past the
              viewport. Plain break-words would only affect line breaking. */}
          <h1 className="wrap-anywhere text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening across your HR workspace today.
          </p>
        </div>
        <Link
          href="/employees"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'shrink-0 gap-2 pointer-coarse:min-h-11',
          )}
        >
          <Users size={16} aria-hidden="true" />
          View employees
        </Link>
      </div>
    </section>
  )
}
