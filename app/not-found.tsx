'use client'

import Link from 'next/link'
import { Compass } from 'lucide-react'
import { EmptyState } from '@/components/common/state-panel'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="panel w-full max-w-md">
        <EmptyState
          icon={Compass}
          title="Page not found"
          description="That address doesn't match anything in the portal. Check the link or head back to your dashboard."
          action={
            <Link href="/" className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}>
              Back to dashboard
            </Link>
          }
        />
      </div>
    </div>
  )
}
