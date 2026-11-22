import { apiClient } from './client'

export interface Goal {
  _id: string
  employeeId: string | { _id: string; name?: string }
  cycleId: string | { _id: string; name?: string }
  title: string
  description?: string
  successCriteria?: string
  progress: number
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled'
  dueDate?: string
  weight: number
}

export async function fetchGoals(params: { employeeId?: string; cycleId?: string } = {}): Promise<Goal[]> {
  const query = new URLSearchParams()
  if (params.employeeId) query.set('employeeId', params.employeeId)
  if (params.cycleId) query.set('cycleId', params.cycleId)
  const suffix = query.toString() ? `?${query.toString()}` : ''
  const response = await apiClient.get<Goal[]>(`/goals${suffix}`)
  return response.data ?? []
}

export async function createGoal(input: {
  employeeId: string
  cycleId: string
  title: string
  description?: string
  successCriteria?: string
  dueDate?: string
  weight?: number
}): Promise<Goal> {
  const response = await apiClient.post<Goal, typeof input>('/goals', input)
  if (!response.data) throw new Error('The goal was not created')
  return response.data
}

export async function updateGoalProgress(
  goalId: string,
  progress: number,
  status?: Goal['status'],
): Promise<Goal> {
  const response = await apiClient.patch<Goal, { progress: number; status?: string }>(
    `/goals/${goalId}/progress`,
    status ? { progress, status } : { progress },
  )
  if (!response.data) throw new Error('The goal was not updated')
  return response.data
}

export async function deleteGoal(goalId: string): Promise<void> {
  await apiClient.delete(`/goals/${goalId}`)
}
