'use client'

import type { EmployeeProfile } from '@/lib/api/profile'
import { formatDate } from '@/lib/utils'

const departmentName = (department: EmployeeProfile['employee']['departmentId']) =>
  typeof department === 'object' && department !== null ? department.name : 'General'

/** Read-only employment facts that are not covered by the salary history. */
export function EmploymentPanel({ employee }: { employee: EmployeeProfile['employee'] }) {
  const manager = typeof employee.reportingManagerId === 'object' ? employee.reportingManagerId : null

  return (
    <section aria-labelledby="details-heading" className="panel p-6">
      <h2 id="details-heading" className="text-lg font-semibold">
        Employment
      </h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-foreground/60">Email</dt>
          <dd className="wrap-anywhere font-medium">{employee.email}</dd>
        </div>
        <div>
          <dt className="text-foreground/60">Employment type</dt>
          <dd className="font-medium capitalize">{employee.employmentType}</dd>
        </div>
        <div>
          <dt className="text-foreground/60">Department</dt>
          <dd className="font-medium">{departmentName(employee.departmentId)}</dd>
        </div>
        {employee.exitDate && (
          <div>
            <dt className="text-foreground/60">Exit date</dt>
            <dd className="font-medium">{formatDate(employee.exitDate)}</dd>
          </div>
        )}
        {manager?.position && (
          <div>
            <dt className="text-foreground/60">Manager role</dt>
            <dd className="font-medium">{manager.position}</dd>
          </div>
        )}
      </dl>
    </section>
  )
}
