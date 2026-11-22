import { apiClient } from './client'

export interface AnalyticsSummary {
  headcount: { total: number; active: number; inactive: number }
  departments: { name: string; count: number }[]
  employmentTypes: { type: string; count: number }[]
  attendance: { trackedDays: number; presentDays: number; rate: number | null }
  leaveByType: { type: string; approved: number; pending: number }[]
  payrollTrend: { period: string; totalNetPay: number; records: number }[]
}

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  const response = await apiClient.get<AnalyticsSummary>('/analytics/summary')
  if (!response.data) throw new Error('Analytics unavailable')
  return response.data
}
