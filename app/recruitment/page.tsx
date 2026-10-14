'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { Badge } from '@/components/common/badge'
import { DataTable } from '@/components/common/data-table'
import { Button } from '@/components/ui/button'
import { Plus, Briefcase, Users, Calendar } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import {
  fetchJobPostings,
  fetchCandidates,
  fetchInterviews,
} from '@/lib/redux/slices/recruitmentSlice'
import { PostJobModal } from '@/components/recruitment/post-job-modal'
import { JobPosting } from '@/types/recruitment'

export default function RecruitmentPage() {
  const dispatch = useAppDispatch()
  const { jobPostings, candidates, interviews, loading, error } = useAppSelector(
    (state) => state.recruitment,
  )
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchJobPostings())
    dispatch(fetchCandidates())
    dispatch(fetchInterviews())
  }, [dispatch])

  const openPositionsCount = jobPostings.filter((j) => j.status === 'open').length

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--'
    try {
      return new Date(dateStr).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'open') return <Badge variant="success">Open</Badge>
    if (status === 'closed') return <Badge variant="destructive">Closed</Badge>
    return <Badge variant="warning">On Hold</Badge>
  }

  return (
    <AppLayout>
      <div className="space-y-10">
        <SectionHeader
          title="Recruitment & Hiring"
          description="Manage job postings, applicant pipelines, and interview schedules"
          action={
            <Button
              onClick={() => setIsModalOpen(true)}
              className="gap-2 brand text-white border edge"
            >
              <Plus size={18} />
              Post a Job
            </Button>
          }
        />

        {error && (
          <div className="rounded-2xl border danger-panel p-6 text-sm backdrop-blur-md">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="group flex items-center justify-between rounded-2xl border edge bg-white/70 p-5 shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:edge dark:surface-85">
            <div>
              <p className="text-sm font-medium text-foreground/60">Open Positions</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{openPositionsCount}</p>
            </div>
            <span className="brand-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <Briefcase size={22} strokeWidth={2} />
            </span>
          </div>

          <div className="group flex items-center justify-between rounded-2xl border edge bg-white/70 p-5 shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:edge dark:surface-85">
            <div>
              <p className="text-sm font-medium text-foreground/60">Active Candidates</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{candidates.length}</p>
            </div>
            <span className="soft-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <Users size={22} strokeWidth={2} />
            </span>
          </div>

          <div className="group flex items-center justify-between rounded-2xl border edge bg-white/70 p-5 shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:edge dark:surface-85">
            <div>
              <p className="text-sm font-medium text-foreground/60">Scheduled Interviews</p>
              <p className="mt-1 text-3xl font-bold text-foreground">{interviews.length}</p>
            </div>
            <span className="success-panel flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border">
              <Calendar size={22} strokeWidth={2} />
            </span>
          </div>
        </div>

        {/* Job postings */}
        <div className="overflow-hidden rounded-2xl border edge bg-white/70 shadow-xl shadow-black/5 backdrop-blur-md dark:edge dark:surface-85">
          <div className="border-b edge px-6 py-4">
            <h3 className="font-semibold text-foreground">Active Job Postings</h3>
          </div>
          {loading && jobPostings.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-foreground/65">
              Loading job postings…
            </div>
          ) : jobPostings.length > 0 ? (
            <DataTable<JobPosting>
              columns={[
                {
                  header: 'Position',
                  accessor: 'position',
                  className: 'font-semibold',
                },
                {
                  header: 'Department',
                  accessor: 'departmentId',
                  render: (dept) =>
                    typeof dept === 'object' && dept !== null && 'name' in dept ? dept.name : '--',
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
                  className: 'text-foreground/65 text-sm',
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
            <div className="flex h-64 flex-col items-center justify-center text-sm text-foreground/65">
              <p className="mb-4">No job postings found.</p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="gap-2 brand text-white border edge"
              >
                <Plus size={18} />
                Post a Job
              </Button>
            </div>
          )}
        </div>
      </div>

      <PostJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </AppLayout>
  )
}
