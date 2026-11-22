'use client'

import { CalendarDays } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import type { ProfileLeaveBalance, ProfileLeaveRequest } from '@/lib/api/profile'
import { formatDate, toSentenceCase } from '@/lib/utils'

interface LeavePanelProps {
  balances: ProfileLeaveBalance[]
  requests: ProfileLeaveRequest[]
}

/** Leave balances and the most recent requests. */
export function LeavePanel({ balances, requests }: LeavePanelProps) {
  return (
    <section aria-labelledby="leave-heading" className="panel p-6">
      <h2 id="leave-heading" className="flex items-center gap-2 text-lg font-semibold">
        <CalendarDays size={18} aria-hidden="true" /> Leave
      </h2>
      {balances.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/65">No leave balances on file.</p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {balances.map((balance) => (
            <li key={balance._id} className="rounded-xl border edge p-3">
              <p className="text-sm font-medium capitalize">{balance.leaveType}</p>
              <p className="text-xs text-foreground/60">
                {balance.remaining} of {balance.totalAllocated} days left · {balance.year}
              </p>
            </li>
          ))}
        </ul>
      )}

      {requests.length > 0 && (
        <ul className="mt-4 space-y-2">
          {requests.slice(0, 5).map((request) => (
            <li key={request._id} className="flex items-center justify-between gap-3 text-sm">
              <span>
                {formatDate(request.fromDate)} – {formatDate(request.toDate)}
              </span>
              <Badge>{toSentenceCase(request.leaveStatus)}</Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
