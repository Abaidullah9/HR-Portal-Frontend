'use client'

import { useState, useEffect } from 'react'
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
      <div className="space-y-8">
        {/* Role Selector */}
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Performance Management</h1>
            <p className="text-muted-foreground mt-2">
              Select your role to view personalized performance insights
            </p>
          </div>
          <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
        </div>

        {/* Role-Specific Content */}
        {renderView()}
      </div>
    </AppLayout>
  )
}
