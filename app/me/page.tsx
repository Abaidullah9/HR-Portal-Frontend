'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Banknote, CalendarCheck, ClipboardList, Download, Star } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { Badge } from '@/components/common/badge'
import { DataTable, DataTableSkeleton, type ColumnDef } from '@/components/common/data-table'
import { EmptyState, ErrorState } from '@/components/common/state-panel'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { fetchLeaveBalances } from '@/lib/redux/slices/leaveSlice'
import { PAGE_SIZE } from '@/lib/api/page'
import { fetchMyAppraisals, fetchMyAttendance } from '@/lib/api/self'
import { downloadPayslip, fetchMyPayslips, type Payslip } from '@/lib/api/payroll'
import { dayKey, formatTime } from '@/lib/attendance'
import { formatDate, toSentenceCase } from '@/lib/utils'
import type { AttendanceRecord } from '@/types/attendance'
import type { Appraisal } from '@/types/performance'
import { LeaveBalances } from '../leaves/leave-balances'

const cycleName = (appraisal: Appraisal) =>
  typeof appraisal.cycleId === 'object' && appraisal.cycleId !== null
    ? appraisal.cycleId.name
    : 'Review cycle'

const appraiserName = (appraisal: Appraisal) =>
  typeof appraisal.appraiserId === 'object' && appraisal.appraiserId !== null
    ? appraisal.appraiserId.name
    : 'Not recorded'

const columns: ColumnDef<AttendanceRecord>[] = [
  {
    header: 'Date',
    accessor: 'date',
    render: (date) => formatDate(date),
    sortValue: (row) => dayKey(row.date),
  },
  {
    header: 'Check-in',
    accessor: 'checkIn',
    render: (value) => formatTime(value),
    sortValue: (row) => row.checkIn ?? '',
  },
  {
    header: 'Check-out',
    accessor: 'checkOut',
    render: (value) => formatTime(value),
    sortValue: (row) => row.checkOut ?? '',
  },
  {
    header: 'Status',
    accessor: 'status',
    render: (value) => (
      <Badge>{typeof value === 'string' && value ? toSentenceCase(value) : 'Logged'}</Badge>
    ),
  },
]

export default function MyWorkspacePage() {
  const dispatch = useAppDispatch()
  const { balances } = useAppSelector((state) => state.leaves)

  const [page, setPage] = useState(0)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [pageCount, setPageCount] = useState(1)
  const [total, setTotal] = useState(0)
  const [attendanceLoading, setAttendanceLoading] = useState(true)
  const [attendanceError, setAttendanceError] = useState<string | null>(null)

  const [appraisals, setAppraisals] = useState<Appraisal[]>([])
  const [appraisalsLoading, setAppraisalsLoading] = useState(true)
  const [appraisalsError, setAppraisalsError] = useState<string | null>(null)

  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [payslipsLoading, setPayslipsLoading] = useState(true)
  const [payslipsError, setPayslipsError] = useState<string | null>(null)

  const loadAttendance = useCallback(async (target: number) => {
    setAttendanceLoading(true)
    try {
      const result = await fetchMyAttendance(target + 1, PAGE_SIZE)
      setRecords(result.records)
      setPageCount(result.pagination.totalPages)
      setTotal(result.pagination.total)
      setAttendanceError(null)
    } catch (problem) {
      setAttendanceError(
        problem instanceof Error ? problem.message : 'Could not load your attendance history',
      )
    } finally {
      setAttendanceLoading(false)
    }
  }, [])

  const loadAppraisals = useCallback(async () => {
    setAppraisalsLoading(true)
    try {
      setAppraisals(await fetchMyAppraisals())
      setAppraisalsError(null)
    } catch (problem) {
      setAppraisalsError(problem instanceof Error ? problem.message : 'Could not load your appraisals')
    } finally {
      setAppraisalsLoading(false)
    }
  }, [])

  const loadPayslips = useCallback(async () => {
    setPayslipsLoading(true)
    try {
      setPayslips(await fetchMyPayslips())
      setPayslipsError(null)
    } catch (problem) {
      setPayslipsError(problem instanceof Error ? problem.message : 'Could not load your payslips')
    } finally {
      setPayslipsLoading(false)
    }
  }, [])

  useEffect(() => {
    void dispatch(fetchLeaveBalances())
    void loadAppraisals()
    void loadPayslips()
  }, [dispatch, loadAppraisals, loadPayslips])

  useEffect(() => {
    void loadAttendance(page)
  }, [loadAttendance, page])

  const pagination = useMemo(
    () => ({
      page,
      pageCount,
      total,
      pageSize: PAGE_SIZE,
      onPageChange: setPage,
    }),
    [page, pageCount, total],
  )

  return (
    <AppLayout>
      <div className="space-y-10">
        <SectionHeader
          title="My workspace"
          description="Your leave balances, attendance history and performance reviews"
        />

        <section aria-labelledby="my-balances-heading" className="space-y-4">
          <h2 id="my-balances-heading" className="flex items-center gap-2 text-lg font-semibold">
            <CalendarCheck size={18} aria-hidden="true" />
            Leave balances
          </h2>
          {balances.length === 0 ? (
            <p className="text-sm text-foreground/65">
              No leave balances are on file for you yet. HR sets these up when your
              entitlements are allocated.
            </p>
          ) : (
            <LeaveBalances balances={balances} />
          )}
        </section>

        <section aria-labelledby="my-attendance-heading" className="space-y-4">
          <h2 id="my-attendance-heading" className="flex items-center gap-2 text-lg font-semibold">
            <ClipboardList size={18} aria-hidden="true" />
            Attendance history
          </h2>

          {attendanceError ? (
            <div className="panel">
              <ErrorState
                title="Couldn't load your attendance"
                description={attendanceError}
                onRetry={() => void loadAttendance(page)}
              />
            </div>
          ) : (
            <div className="panel overflow-hidden">
              {attendanceLoading && records.length === 0 ? (
                <div role="status" aria-busy="true">
                  <span className="sr-only">Loading your attendance history</span>
                  <DataTableSkeleton rows={5} columns={4} />
                </div>
              ) : records.length === 0 ? (
                <EmptyState
                  icon={CalendarCheck}
                  title="No attendance recorded yet"
                  description="Once you check in, your days show up here with their check-in and check-out times."
                />
              ) : (
                <DataTable<AttendanceRecord>
                  caption="Your attendance history"
                  columns={columns}
                  data={records}
                  pagination={pagination}
                />
              )}
            </div>
          )}
        </section>

        <section aria-labelledby="my-appraisals-heading" className="space-y-4">
          <h2 id="my-appraisals-heading" className="flex items-center gap-2 text-lg font-semibold">
            <Star size={18} aria-hidden="true" />
            Appraisals
          </h2>

          {appraisalsError ? (
            <div className="panel">
              <ErrorState
                title="Couldn't load your appraisals"
                description={appraisalsError}
                onRetry={() => void loadAppraisals()}
              />
            </div>
          ) : appraisalsLoading ? (
            <div className="panel overflow-hidden">
              <div role="status" aria-busy="true">
                <span className="sr-only">Loading your appraisals</span>
                <DataTableSkeleton rows={3} columns={4} />
              </div>
            </div>
          ) : appraisals.length === 0 ? (
            <div className="panel overflow-hidden">
              <EmptyState
                icon={Star}
                title="No appraisals yet"
                description="Reviews appear here after your manager completes them for a performance cycle."
              />
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {appraisals.map((appraisal) => (
                <li key={appraisal._id} className="panel p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{cycleName(appraisal)}</h3>
                      <p className="mt-1 text-sm text-foreground/65">
                        Reviewed {formatDate(appraisal.reviewDate)}
                      </p>
                    </div>
                    <Badge>
                      {appraisal.status ? toSentenceCase(appraisal.status) : 'Pending'}
                    </Badge>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-foreground/55">Overall rating</dt>
                      <dd className="mt-1 font-medium text-foreground">
                        {appraisal.overallRating != null ? `${appraisal.overallRating} / 5` : 'Not rated'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-foreground/55">Goals completed</dt>
                      <dd className="mt-1 font-medium text-foreground">{appraisal.goalsCompleted}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-foreground/55">Appraiser</dt>
                      <dd className="mt-1 font-medium text-foreground">{appraiserName(appraisal)}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="my-payslips-heading" className="space-y-4">
          <h2 id="my-payslips-heading" className="flex items-center gap-2 text-lg font-semibold">
            <Banknote size={18} aria-hidden="true" />
            Payslips
          </h2>

          {payslipsError ? (
            <div className="panel">
              <ErrorState
                title="Couldn't load your payslips"
                description={payslipsError}
                onRetry={() => void loadPayslips()}
              />
            </div>
          ) : payslipsLoading ? (
            <div className="panel overflow-hidden">
              <div role="status" aria-busy="true">
                <span className="sr-only">Loading your payslips</span>
                <DataTableSkeleton rows={2} columns={3} />
              </div>
            </div>
          ) : payslips.length === 0 ? (
            <div className="panel overflow-hidden">
              <EmptyState
                icon={Banknote}
                title="No payslips yet"
                description="Payslips appear here once payroll is generated for a period."
              />
            </div>
          ) : (
            <ul className="space-y-3">
              {payslips.map((slip) => (
                <li
                  key={slip.id}
                  className="panel flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {formatDate(slip.periodStart)} – {formatDate(slip.periodEnd)}
                    </p>
                    <p className="text-sm text-foreground/65">
                      Net pay{' '}
                      {slip.netPay.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      {slip.status ? ` · ${toSentenceCase(slip.status)}` : ''}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => downloadPayslip(slip)}
                  >
                    <Download size={15} />
                    Payslip
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
