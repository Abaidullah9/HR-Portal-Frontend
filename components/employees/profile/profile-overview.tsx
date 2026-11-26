'use client'

import { Download, ShieldAlert, UserPlus } from 'lucide-react'
import { SectionHeader } from '@/components/common/section-header'
import { Badge } from '@/components/common/badge'
import { Button } from '@/components/ui/button'
import type { EmployeeProfile } from '@/lib/api/profile'
import { formatDate } from '@/lib/utils'

const departmentName = (department: EmployeeProfile['employee']['departmentId']) =>
  typeof department === 'object' && department !== null ? department.name : 'General'

const managerName = (manager: EmployeeProfile['employee']['reportingManagerId']) =>
  typeof manager === 'object' && manager !== null ? manager.name : 'Not assigned'

interface ProfileOverviewProps {
  profile: EmployeeProfile
  canManage: boolean
  busy: string | null
  onExport: () => void
  onStartOffboarding: () => void
  onRehire: () => void
}

/** Name, key facts and the page-level actions for an employee. */
export function ProfileOverview({
  profile,
  canManage,
  busy,
  onExport,
  onStartOffboarding,
  onRehire,
}: ProfileOverviewProps) {
  const { employee } = profile
  const openTasks = profile.tasks.filter((task) => task.status === 'open').length

  return (
    <div className="space-y-6">
      <SectionHeader
        title={employee.name}
        description={`${employee.position} · ${departmentName(employee.departmentId)} · ${employee.employeeCode}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onExport} disabled={busy === 'export'} className="gap-2">
              <Download size={16} /> Export data
            </Button>
            {canManage && employee.isActive && (
              <Button
                variant="outline"
                onClick={onStartOffboarding}
                disabled={busy === 'offboarding'}
                className="gap-2"
              >
                <ShieldAlert size={16} /> Start offboarding
              </Button>
            )}
            {canManage && !employee.isActive && (
              <Button variant="outline" onClick={onRehire} className="gap-2">
                <UserPlus size={16} /> Rehire
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="panel p-5">
          <p className="text-sm text-foreground/60">Status</p>
          <div className="mt-2">
            <Badge variant={employee.isActive ? 'success' : 'destructive'}>
              {employee.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-foreground/60">Joined</p>
          <p className="mt-2 font-semibold">{formatDate(employee.joiningDate)}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-foreground/60">Reports to</p>
          <p className="mt-2 font-semibold">{managerName(employee.reportingManagerId)}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-foreground/60">Open onboarding tasks</p>
          <p className="mt-2 font-semibold">{openTasks}</p>
        </div>
      </div>
    </div>
  )
}
