'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/common/toast'
import { usePermissions } from '@/lib/hooks/use-permissions'
import {
  anonymizeEmployee,
  exportEmployeeData,
  fetchEmployeeProfile,
  startChecklist,
  type EmployeeProfile,
} from '@/lib/api/profile'
import { ProfileOverview } from '@/components/employees/profile/profile-overview'
import { CompensationPanel } from '@/components/employees/profile/compensation-panel'
import { EmploymentPanel } from '@/components/employees/profile/employment-panel'
import { ChecklistPanel } from '@/components/employees/profile/checklist-panel'
import { DocumentsPanel } from '@/components/employees/profile/documents-panel'
import { LeavePanel } from '@/components/employees/profile/leave-panel'
import { ReviewsPanel } from '@/components/employees/profile/reviews-panel'
import { PayPanel } from '@/components/employees/profile/pay-panel'
import { ReportsPanel } from '@/components/employees/profile/reports-panel'
import { PrivacyPanel } from '@/components/employees/profile/privacy-panel'

export default function EmployeeProfilePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const toast = useToast()
  const { can } = usePermissions()
  const canManage = can('manageEmployees')

  const employeeId = params?.id
  const [profile, setProfile] = useState<EmployeeProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!employeeId) return
    try {
      setProfile(await fetchEmployeeProfile(employeeId))
      setError(null)
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not load this employee')
    } finally {
      setLoading(false)
    }
  }, [employeeId])

  useEffect(() => {
    void load()
  }, [load])

  const handleStartOffboarding = async () => {
    if (!profile) return
    setBusy('offboarding')
    try {
      await startChecklist(profile.employee._id, 'offboarding')
      await load()
      toast('Offboarding checklist ready')
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Could not start offboarding', 'error')
    } finally {
      setBusy(null)
    }
  }

  const handleExport = async () => {
    if (!profile) return
    setBusy('export')
    try {
      await exportEmployeeData(profile.employee._id)
      toast('Data export downloaded')
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Could not export the data', 'error')
    } finally {
      setBusy(null)
    }
  }

  const handleErase = async () => {
    if (!profile) return
    const confirmed = window.confirm(
      'Erase this person’s identifying details? Payroll and audit history are kept for legal retention.',
    )
    if (!confirmed) return

    setBusy('erase')
    try {
      await anonymizeEmployee(profile.employee._id)
      toast('Identifying details erased')
      router.push('/employees')
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Could not erase the record', 'error')
    } finally {
      setBusy(null)
    }
  }

  if (loading && !profile) {
    return (
      <AppLayout>
        <div role="status" aria-busy="true" className="panel p-8">
          <span className="sr-only">Loading employee profile</span>
          <div className="space-y-4">
            <div className="h-6 w-48 animate-pulse rounded bg-foreground/10" />
            <div className="h-4 w-72 animate-pulse rounded bg-foreground/10" />
            <div className="h-4 w-64 animate-pulse rounded bg-foreground/10" />
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !profile) {
    return (
      <AppLayout>
        <div className="panel p-8 text-center">
          <h1 className="text-xl font-semibold">This profile is not available</h1>
          <p role="alert" className="mt-2 text-sm text-foreground/65">
            {error ?? 'The employee record could not be found.'}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={() => router.push('/employees')} className="gap-2">
              <ArrowLeft size={16} /> Back to directory
            </Button>
            <Button onClick={() => void load()}>Try again</Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-10">
        <div>
          <Link
            href="/employees"
            className="inline-flex items-center gap-1.5 text-sm text-foreground/65 hover:text-foreground"
          >
            <ArrowLeft size={15} aria-hidden="true" /> Employee directory
          </Link>
        </div>

        <ProfileOverview
          profile={profile}
          canManage={canManage}
          busy={busy}
          onExport={handleExport}
          onStartOffboarding={handleStartOffboarding}
        />

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <CompensationPanel profile={profile} canManage={canManage} onChanged={() => void load()} />
          <EmploymentPanel employee={profile.employee} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ChecklistPanel
            employeeId={profile.employee._id}
            tasks={profile.tasks}
            canManage={canManage}
            onChanged={() => void load()}
          />
          <DocumentsPanel documents={profile.documents} />
          <LeavePanel balances={profile.balances} requests={profile.leaveRequests} />
          <ReviewsPanel appraisals={profile.appraisals} />
          <PayPanel payslips={profile.payslips} />
          <ReportsPanel reports={profile.directReports} />
        </div>

        {canManage && (
          <PrivacyPanel busy={busy} onExport={handleExport} onErase={handleErase} />
        )}
      </div>
    </AppLayout>
  )
}
