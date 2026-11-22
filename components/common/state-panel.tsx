'use client'

import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

/**
 * Shown whenever a region loaded successfully but has nothing in it. Always
 * says what is missing and how to change that, never a bare "No data".
 */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center"
    >
      <span className="soft-tile flex h-12 w-12 items-center justify-center rounded-xl" aria-hidden="true">
        <Icon size={22} strokeWidth={1.8} />
      </span>
      {/* h2, not h3: the error panel replaces the page's sections, so an h3
          here would skip a level under the page h1. */}
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

interface ErrorStateProps {
  title: string
  description: string
  onRetry?: () => void
}

/**
 * A failed region. The description carries the real reason from the API, and
 * the retry button re-runs the same request rather than reloading the page.
 */
export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center"
    >
      <span className="danger-panel flex h-12 w-12 items-center justify-center rounded-xl border" aria-hidden="true">
        <AlertTriangle size={22} strokeWidth={1.8} />
      </span>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-1 gap-2 pointer-coarse:min-h-11"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  )
}
