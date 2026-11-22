import { apiClient } from './client'

export type PayrollRunStatus = 'draft' | 'approved' | 'paid' | 'reversed'

export interface PayrollRun {
  _id: string
  periodStart: string
  periodEnd: string
  status: PayrollRunStatus
  employeeCount: number
  totalNetPay: number
  currency: string
  notes?: string
  approvedAt?: string
  paidAt?: string
  reversedAt?: string
  reversalReason?: string
}

export async function fetchPayrollRuns(limit = 10): Promise<PayrollRun[]> {
  const response = await apiClient.get<PayrollRun[]>(`/payroll-runs?limit=${limit}`)
  return response.data ?? []
}

export async function generatePayrollRun(input: {
  periodStart: string
  periodEnd: string
  notes?: string
}): Promise<{ run: PayrollRun; created: number; skipped: number }> {
  const response = await apiClient.post<
    { run: PayrollRun; created: number; skipped: number },
    typeof input
  >('/payroll-runs', input)
  if (!response.data) throw new Error('The payroll run was not created')
  return response.data
}

export async function approvePayrollRun(runId: string): Promise<PayrollRun> {
  const response = await apiClient.patch<PayrollRun>(`/payroll-runs/${runId}/approve`, {})
  if (!response.data) throw new Error('The run was not approved')
  return response.data
}

export async function markPayrollRunPaid(runId: string): Promise<PayrollRun> {
  const response = await apiClient.patch<PayrollRun>(`/payroll-runs/${runId}/pay`, {})
  if (!response.data) throw new Error('The run was not marked paid')
  return response.data
}

export async function reversePayrollRun(runId: string, reason: string): Promise<PayrollRun> {
  const response = await apiClient.patch<PayrollRun, { reason: string }>(
    `/payroll-runs/${runId}/reverse`,
    { reason },
  )
  if (!response.data) throw new Error('The run was not reversed')
  return response.data
}

export async function downloadPayrollRun(run: PayrollRun): Promise<void> {
  const blob = await apiClient.download(`/payroll-runs/${run._id}/export.csv`)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `payroll-${run.periodStart}-to-${run.periodEnd}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
