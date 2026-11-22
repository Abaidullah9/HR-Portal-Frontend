'use client'

import { Gauge } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import type { ProfilePayslip } from '@/lib/api/profile'
import { formatDate, toSentenceCase } from '@/lib/utils'

/** The most recent payroll records for this employee. */
export function PayPanel({ payslips }: { payslips: ProfilePayslip[] }) {
  return (
    <section aria-labelledby="payslips-heading" className="panel p-6">
      <h2 id="payslips-heading" className="flex items-center gap-2 text-lg font-semibold">
        <Gauge size={18} aria-hidden="true" /> Recent pay
      </h2>
      {payslips.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/65">No payroll records yet.</p>
      ) : (
        <ul className="mt-4 space-y-2 text-sm">
          {payslips.map((slip) => (
            <li key={slip._id} className="flex items-center justify-between gap-3">
              <span>
                {formatDate(slip.payPeriodStart)} – {formatDate(slip.payPeriodEnd)}
              </span>
              <span className="font-medium">
                {slip.netPay.toLocaleString()} {slip.currency ?? ''}
              </span>
              <Badge>{toSentenceCase(slip.status)}</Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
