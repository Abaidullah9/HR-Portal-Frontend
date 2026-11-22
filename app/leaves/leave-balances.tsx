import { Calendar } from 'lucide-react'
import type { LeaveBalance } from '@/types/leave'

/** Remaining allowance per leave type. Renders nothing when no balances exist. */
export function LeaveBalances({ balances }: { balances: LeaveBalance[] }) {
  if (balances.length === 0) return null

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {balances.map((balance) => (
        <div
          key={balance._id}
          className="group flex flex-col gap-3 rounded-2xl border edge bg-white/70 p-5 shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:edge dark:surface-85"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground capitalize">
              {balance.leaveType} Leave
            </span>
            <Calendar
              size={16}
              className="text-foreground/60 transition-colors group-hover:text-foreground/70"
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{balance.remaining}</span>
            <span className="text-sm text-foreground/65">days remaining</span>
          </div>
          <div className="flex justify-between border-t edge pt-3 text-xs text-foreground/60 dark:edge">
            <span>Allocated: {balance.totalAllocated}</span>
            <span>Used: {balance.used}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
