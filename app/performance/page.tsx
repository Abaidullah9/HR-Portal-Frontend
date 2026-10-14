'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { RoleSelector } from '@/components/performance/role-selector'
import { EmployeeView } from '@/components/performance/employee-view'
import { ManagerView } from '@/components/performance/manager-view'
import { HRView } from '@/components/performance/hr-view'
import { useAppDispatch } from '@/lib/redux/store'
import {
  fetchPerformanceCycles,
  fetchAppraisals,
  fetchFeedback,
} from '@/lib/redux/slices/performanceSlice'

type UserRole = 'employee' | 'manager' | 'hr'

export default function PerformancePage() {
  const dispatch = useAppDispatch()
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee')

  useEffect(() => {
    dispatch(fetchPerformanceCycles())
    dispatch(fetchAppraisals())
    dispatch(fetchFeedback())
  }, [dispatch])

  const renderView = () => {
    switch (selectedRole) {
      case 'employee':
        return <EmployeeView />
      case 'manager':
        return <ManagerView />
      case 'hr':
        return <HRView />
      default:
        return <EmployeeView />
    }
  }

  return (
    <AppLayout>
      <div className="space-y-10">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Performance Management
            </h1>
            <p className="mt-2 text-sm text-foreground/60">
              Select your role to view personalized performance insights
            </p>
          </div>
          <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
        </div>

        {renderView()}
      </div>
    </AppLayout>
  )
}
