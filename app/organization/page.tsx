'use client'

import { useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import Link from 'next/link'
import { Building2, GitBranch, Mail, Phone, MapPin, Users } from 'lucide-react'
import { DataTableSkeleton } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/state-panel'
import { AccessDenied } from '@/components/common/access-denied'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { roleNameOf } from '@/lib/auth/roles'
import { HolidayCalendar } from '@/components/organization/holiday-calendar'
import {
  fetchOrganizationSettings,
  fetchOrgDepartments,
  fetchTeams,
} from '@/lib/redux/slices/organizationSlice'

export default function OrganizationPage() {
  const dispatch = useAppDispatch()
  const { settings, departments, teams, loading, error } = useAppSelector(
    (state) => state.organization,
  )
  const { canView } = usePermissions()
  const { user } = useAppSelector((state) => state.auth)
  const roleReady = Boolean(user && roleNameOf(user))
  const canRead = canView('organization')

  // Employee and Manager roles hold no read_OrganizationSetting; requesting the
  // page's data for them only produced three 403s and an error banner.
  useEffect(() => {
    if (!canRead) return
    dispatch(fetchOrganizationSettings())
    dispatch(fetchOrgDepartments())
    dispatch(fetchTeams())
  }, [dispatch, canRead])

  if (roleReady && !canRead) {
    return (
      <AppLayout>
        <div className="space-y-10">
          <SectionHeader
            title="Organization & Departments"
            description="View organizational hierarchy, department leaders, and active teams"
          />
          <AccessDenied area="the organization module" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-10">
        <SectionHeader
          title="Organization & Departments"
          description="View organizational hierarchy, department leaders, and active teams"
          action={
            <Link
              href="/organization/chart"
              className="inline-flex items-center gap-2 rounded-xl border edge px-4 py-2 text-sm font-medium hover:bg-foreground/5"
            >
              <GitBranch size={16} aria-hidden="true" /> View org chart
            </Link>
          }
        />

        {error && (
          <div role="alert" className="rounded-2xl border danger-panel p-6 text-sm backdrop-blur-md">
            {error}
          </div>
        )}

        {/* Company info */}
        {settings && (
          <div className="group overflow-hidden rounded-2xl border edge bg-white/70 p-6 shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:edge dark:surface-85">
            <div className="flex items-start gap-5">
              <span className="brand-tile flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <Building2 size={26} strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-foreground">
                  {settings.organizationName || 'Organization'}
                </h2>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm text-foreground/60">
                  {settings.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="shrink-0 text-foreground/60" />
                      <span>{settings.email}</span>
                    </div>
                  )}
                  {settings.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="shrink-0 text-foreground/60" />
                      <span>{settings.phone}</span>
                    </div>
                  )}
                  {settings.address && (
                    <div className="flex min-w-0 items-center gap-2">
                      <MapPin size={14} className="shrink-0 text-foreground/60" />
                      {/* Wraps instead of truncating: at 320px an ellipsis hid
                          most of the street address. */}
                      <span className="wrap-anywhere">{settings.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Departments */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Departments</h3>
          {loading && departments.length === 0 ? (
            <div role="status" aria-busy="true" className="panel overflow-hidden">
              <span className="sr-only">Loading departments</span>
              <DataTableSkeleton rows={2} columns={3} />
            </div>
          ) : departments.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {departments.map((dept) => (
                <div
                  key={dept._id}
                  className="group overflow-hidden rounded-2xl border edge bg-white/70 p-5 shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:edge dark:surface-85"
                >
                  <h4 className="font-bold text-foreground">{dept.name}</h4>
                  <p className="mt-1 text-sm text-foreground/60">
                    {dept.description || 'Department within the organization'}
                  </p>
                  <div className="mt-4 pt-3 border-t edge text-xs text-foreground/60 flex items-center gap-2">
                    <Users size={14} className="shrink-0" />
                    <span>
                      Manager:{' '}
                      {typeof dept.managerId === 'object' && dept.managerId !== null
                        ? dept.managerId.name
                        : 'Assigned'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="panel overflow-hidden">
              <EmptyState
                icon={Building2}
                title="No departments yet"
                description="Create a department from the employee directory to start grouping people."
              />
            </div>
          )}
        </div>

        <HolidayCalendar canManage={canRead} />

        {/* Teams */}
        {teams.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Active Teams</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {teams.map((team) => (
                <div
                  key={team._id}
                  className="group overflow-hidden rounded-2xl border edge bg-white/70 p-5 shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:edge dark:surface-85"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-foreground">{team.teamName}</h4>
                      <p className="mt-1 text-xs text-foreground/65">
                        Lead:{' '}
                        {typeof team.teamLeadId === 'object' && team.teamLeadId !== null
                          ? team.teamLeadId.name
                          : 'Team Lead'}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-foreground/5 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm border edge">
                      {team.teamMembers?.length || 0} Members
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
