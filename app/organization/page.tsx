'use client'

import { useEffect } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { Building2, Mail, Phone, MapPin, Users } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
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

  useEffect(() => {
    dispatch(fetchOrganizationSettings())
    dispatch(fetchOrgDepartments())
    dispatch(fetchTeams())
  }, [dispatch])

  return (
    <AppLayout>
      <div className="space-y-10">
        <SectionHeader
          title="Organization & Departments"
          description="View organizational hierarchy, department leaders, and active teams"
        />

        {error && (
          <div className="rounded-2xl border danger-panel p-6 text-sm backdrop-blur-md">
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
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="shrink-0 text-foreground/60" />
                      <span className="truncate">{settings.address}</span>
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
            <div className="flex h-48 items-center justify-center rounded-2xl border edge bg-white/70 p-8 text-sm text-foreground/65 backdrop-blur-md dark:edge dark:surface-85">
              Loading departments…
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
            <div className="flex h-48 items-center justify-center rounded-2xl border edge bg-white/70 p-8 text-sm text-foreground/65 backdrop-blur-md dark:edge dark:surface-85">
              No departments found.
            </div>
          )}
        </div>

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
