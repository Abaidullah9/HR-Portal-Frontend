import Link from 'next/link'
import { Calendar, CheckCircle, ChevronRight, TrendingUp, Users } from 'lucide-react'
import { SectionHeader } from '@/components/common/section-header'

const QUICK_ACTIONS = [
  {
    label: 'Manage employees',
    description: 'Onboard staff and browse the directory',
    href: '/employees',
    icon: Users,
  },
  {
    label: 'Manage leave',
    description: 'Review and approve leave requests',
    href: '/leaves',
    icon: Calendar,
  },
  {
    label: 'Run payroll',
    description: 'Process salaries and review summaries',
    href: '/payroll',
    icon: TrendingUp,
  },
  {
    label: 'Track attendance',
    description: 'Review daily check-ins and check-outs',
    href: '/attendance',
    icon: CheckCircle,
  },
]

/**
 * Each action is a single <Link> styled as a card. The old markup wrapped a
 * <button> inside an <a>, which produced two tab stops per action and an
 * invalid nested-interactive structure for screen readers.
 *
 * Task-shaped links rather than a button, so the router handles navigation and
 * the browser gets middle-click, focus and open-in-new-tab for free.
 */
export function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-heading" className="space-y-4">
      <SectionHeader
        id="quick-actions-heading"
        title="Quick Actions"
        description="Jump to the most used HR tools"
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <li key={action.href}>
              <Link
                href={action.href}
                className="panel group flex h-full items-center gap-4 px-5 py-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transform-none motion-reduce:transition-none"
              >
                <span
                  className="brand-tile flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  aria-hidden="true"
                >
                  <Icon size={20} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="font-semibold text-foreground">{action.label}</span>
                  <span className="text-sm text-muted-foreground">{action.description}</span>
                </span>
                <ChevronRight
                  size={18}
                  aria-hidden="true"
                  className="ml-auto shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
