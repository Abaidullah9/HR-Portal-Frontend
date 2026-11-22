'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'
import type { DirectReport } from '@/lib/api/profile'

/** People who report to this employee. */
export function ReportsPanel({ reports }: { reports: DirectReport[] }) {
  return (
    <section aria-labelledby="reports-heading" className="panel p-6">
      <h2 id="reports-heading" className="flex items-center gap-2 text-lg font-semibold">
        <Users size={18} aria-hidden="true" /> Direct reports
      </h2>
      {reports.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/65">No direct reports.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {reports.map((report) => (
            <li key={report._id}>
              <Link href={`/employees/${report._id}`} className="text-sm font-medium hover:underline">
                {report.name}
              </Link>
              <p className="text-xs text-foreground/60">{report.position}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
