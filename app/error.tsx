'use client'

import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Route-level error boundary. Without it a render-time throw shows the
 * framework's default error screen with no way back into the app.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div role="alert" className="panel w-full max-w-md p-6 text-center">
        <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || 'This page could not be rendered.'}
        </p>
        <Button onClick={reset} variant="outline" className="mt-4 gap-2">
          <RefreshCw size={14} aria-hidden="true" />
          Try again
        </Button>
      </div>
    </div>
  )
}
