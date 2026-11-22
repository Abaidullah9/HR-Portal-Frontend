'use client'

import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SetupChecklistProps {
  departmentCount: number
  employeeCount: number
  leaveRequestCount: number
}

/**
 * A brand-new organisation lands on four zeroed cards and an empty directory.
 * This says what to do first, and disappears once the first step is done.
 */
export function SetupChecklist({
  departmentCount,
  employeeCount,
  leaveRequestCount,
}: SetupChecklistProps) {
  const steps = [
    {
      title: 'Create your first department',
      description: 'Employees belong to a department, so this comes first.',
      href: '/employees',
      linkLabel: 'Open the directory',
      done: departmentCount > 0,
    },
    {
      title: 'Add your team',
      description: 'Add employees so attendance, leave and payroll have something to track.',
      href: '/employees',
      linkLabel: 'Add an employee',
      done: employeeCount > 0,
    },
    {
      title: 'Review your first leave request',
      description: 'Approvals appear here and in the header bell once requests exist.',
      href: '/leaves',
      linkLabel: 'Open leave',
      done: leaveRequestCount > 0,
    },
  ]

  const completed = steps.filter((step) => step.done).length

  return (
    <section aria-labelledby="setup-heading" className="panel p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="setup-heading" className="text-lg font-semibold text-foreground">
          Get set up
        </h2>
        <p className="text-xs text-foreground/60">
          {completed} of {steps.length} done
        </p>
      </div>

      <ol className="mt-4 space-y-3">
        {steps.map((step) => (
          <li key={step.title} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={cn(
                'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border edge text-xs',
                step.done ? 'success-panel success-text' : 'text-foreground/50',
              )}
            >
              {step.done ? <Check size={13} /> : null}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'text-sm font-medium',
                  step.done ? 'text-foreground/55 line-through' : 'text-foreground',
                )}
              >
                {step.title}
                <span className="sr-only">{step.done ? ' (done)' : ' (not done yet)'}</span>
              </p>
              {!step.done && (
                <>
                  <p className="mt-0.5 text-sm text-foreground/65">{step.description}</p>
                  <Link
                    href={step.href}
                    className="mt-1 inline-flex items-center gap-1 rounded-md text-sm font-medium brand-text press hover:underline"
                  >
                    {step.linkLabel}
                    <ArrowRight size={13} aria-hidden="true" />
                  </Link>
                </>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
