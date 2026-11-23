'use client'

import { useCallback, useEffect, useState } from 'react'
import { CalendarCheck } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { fetchLeaveBalances } from '@/lib/redux/slices/leaveSlice'
import { PAGE_SIZE } from '@/lib/api/page'
import { fetchMyAppraisals, fetchMyAttendance } from '@/lib/api/self'
import { fetchMyPayslips, type Payslip } from '@/lib/api/payroll'
import type { AttendanceRecord } from '@/types/attendance'
import type { Appraisal } from '@/types/performance'
import { LeaveBalances } from '../leaves/leave-balances'
import { AttendanceHistory } from '@/components/me/attendance-history'
import { AppraisalList } from '@/components/me/appraisal-list'
import { PayslipList } from '@/components/me/payslip-list'

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
      setAppraisalsError(
        problem instanceof Error ? problem.message : 'Could not load your appraisals',
      )
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
              No leave balances are on file for you yet. HR sets these up when your entitlements are
              allocated.
            </p>
          ) : (
            <LeaveBalances balances={balances} />
          )}
        </section>

        <AttendanceHistory
          records={records}
          loading={attendanceLoading}
          error={attendanceError}
          onRetry={() => void loadAttendance(page)}
          pagination={{
            page,
            pageCount,
            total,
            pageSize: PAGE_SIZE,
            onPageChange: setPage,
          }}
        />

        <AppraisalList
          appraisals={appraisals}
          loading={appraisalsLoading}
          error={appraisalsError}
          onRetry={() => void loadAppraisals()}
        />

        <PayslipList
          payslips={payslips}
          loading={payslipsLoading}
          error={payslipsError}
          onRetry={() => void loadPayslips()}
        />
      </div>
    </AppLayout>
  )
}
