'use client';

import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { SectionHeader } from '@/components/common/section-header';
import { Building2, Mail, Phone, MapPin, Users } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import {
  fetchOrganizationSettings,
  fetchOrgDepartments,
  fetchTeams,
} from '@/lib/redux/slices/organizationSlice';

export default function OrganizationPage() {
  const dispatch = useAppDispatch();
  const { settings, departments, teams, loading, error } = useAppSelector(
    (state) => state.organization
  );

  useEffect(() => {
    dispatch(fetchOrganizationSettings());
    dispatch(fetchOrgDepartments());
    dispatch(fetchTeams());
  }, [dispatch]);

  return (
    <AppLayout>
      <div className="space-y-8">
        <SectionHeader
          title="Organization & Departments"
          description="View organizational hierarchy, department leaders, and active teams"
        />

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Company Info Card */}
        {settings && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600">
                <Building2 size={32} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">
                  {settings.organizationName || 'TechCorp Solutions'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm text-muted-foreground">
                  {settings.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span>{settings.email}</span>
                    </div>
                  )}
                  {settings.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span>{settings.phone}</span>
                    </div>
                  )}
                  {settings.address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{settings.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Departments Grid */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Departments</h3>
          {loading && departments.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground bg-card border border-border rounded-xl">
              Loading departments...
            </div>
          ) : departments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <div key={dept._id} className="bg-card border border-border rounded-xl p-5 shadow-xs">
                  <h4 className="font-bold text-foreground">{dept.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {dept.description || 'Department within the organization'}
                  </p>
                  <div className="mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground flex items-center gap-2">
                    <Users size={14} />
                    <span>Manager: {typeof dept.managerId === 'object' && dept.managerId !== null ? dept.managerId.name : 'Assigned'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground bg-card border border-border rounded-xl">
              No departments found.
            </div>
          )}
        </div>

        {/* Teams Section */}
        {teams.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Active Teams</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teams.map((team) => (
                <div key={team._id} className="bg-card border border-border rounded-xl p-5 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-foreground">{team.teamName}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Lead: {typeof team.teamLeadId === 'object' && team.teamLeadId !== null ? team.teamLeadId.name : 'Team Lead'}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-secondary text-secondary-foreground text-xs rounded-full font-medium">
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
  );
}
