'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { fetchOrganizationSettings } from '@/lib/redux/slices/organizationSlice'
import { canView, roleNameOf } from '@/lib/auth/roles'
import { OrganizationForm } from './organization-form'
import { PreferencesPanel } from './preferences-panel'

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { error } = useAppSelector((state) => state.organization)

  // Organization settings sit behind read_OrganizationSetting, which only the
  // seeded Admin role has; everyone else manages their own preferences here.
  const roleReady = Boolean(user && roleNameOf(user))
  const canManageOrganization = roleReady && canView(user, 'organization')

  useEffect(() => {
    if (canManageOrganization) dispatch(fetchOrganizationSettings())
  }, [dispatch, canManageOrganization])

  return (
    <AppLayout>
      <div className="space-y-10">
        <SectionHeader
          title="Settings"
          description={
            canManageOrganization
              ? 'Manage your organization and preferences'
              : 'Manage your personal preferences'
          }
        />

        {canManageOrganization && error && (
          <div role="alert" className="rounded-2xl border danger-panel p-6 text-sm backdrop-blur-md">
            {error}
          </div>
        )}

        {canManageOrganization && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-foreground">Organization</h3>
              <OrganizationForm />
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-foreground">Roles &amp; permissions</h3>
              <div className="panel flex flex-wrap items-center justify-between gap-3 p-6">
                <p className="text-sm text-foreground/65">
                  Choose which actions each role can perform without reseeding the database.
                </p>
                <Link
                  href="/settings/roles"
                  className="brand text-white border edge rounded-lg px-4 py-2 text-sm font-medium"
                >
                  Manage roles
                </Link>
              </div>
            </div>
          </div>
        )}

        <PreferencesPanel />
      </div>
    </AppLayout>
  )
}
