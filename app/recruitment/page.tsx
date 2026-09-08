'use client';

import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { SectionHeader } from '@/components/common/section-header';
import { Badge } from '@/components/common/badge';
import { DataTable } from '@/components/common/data-table';
import { Button } from '@/components/ui/button';
import { Plus, Users, Briefcase, Calendar } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import {
  fetchJobPostings,
  fetchCandidates,
  fetchInterviews,
} from '@/lib/redux/slices/recruitmentSlice';
import { JobPosting } from '@/types/recruitment';

export default function RecruitmentPage() {
  const dispatch = useAppDispatch();
  const { jobPostings, candidates, interviews, loading, error } = useAppSelector(
    (state) => state.recruitment
  );

  useEffect(() => {
    dispatch(fetchJobPostings());
    dispatch(fetchCandidates());
    dispatch(fetchInterviews());
  }, [dispatch]);

  const openPositionsCount = jobPostings.filter((j) => j.status === 'open').length;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    try {
      return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'open') return <Badge variant="success">Open</Badge>;
    if (status === 'closed') return <Badge variant="destructive">Closed</Badge>;
    return <Badge variant="warning">On Hold</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <SectionHeader
          title="Recruitment & Hiring"
          description="Manage job postings, applicant pipelines, and interview schedules"
          action={
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus size={18} />
              Post Job
            </Button>
          }
        />

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Open Positions</p>
              <p className="text-3xl font-bold mt-1">{openPositionsCount}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600">
              <Briefcase size={24} />
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Active Candidates</p>
              <p className="text-3xl font-bold mt-1">{candidates.length}</p>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600">
              <Users size={24} />
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Scheduled Interviews</p>
              <p className="text-3xl font-bold mt-1">{interviews.length}</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600">
              <Calendar size={24} />
            </div>
          </div>
        </div>

        {/* Job Postings Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Active Job Postings</h3>
          </div>
          {loading && jobPostings.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Loading job postings...</div>
          ) : jobPostings.length > 0 ? (
            <DataTable<JobPosting>
              columns={[
                { header: 'Position', accessor: 'position', className: 'font-semibold' },
                {
                  header: 'Department',
                  accessor: 'departmentId',
                  render: (dept) =>
                    typeof dept === 'object' && dept !== null ? dept.name : 'Engineering',
                },
                {
                  header: 'Openings',
                  accessor: 'numberOfOpenings',
                  className: 'text-center',
                },
                {
                  header: 'Posted Date',
                  accessor: 'postedOnDate',
                  render: (date) => formatDate(date),
                  className: 'text-muted-foreground text-sm',
                },
                {
                  header: 'Status',
                  accessor: 'status',
                  render: (status) => getStatusBadge(status),
                },
              ]}
              data={jobPostings}
            />
          ) : (
            <div className="p-8 text-center text-muted-foreground">No job postings found.</div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
