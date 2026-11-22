import { apiClient } from './client'

export interface Holiday {
  _id: string
  name: string
  /** YYYY-MM-DD in the organisation timezone. */
  date: string
  paid: boolean
}

export async function fetchHolidays(year?: number): Promise<Holiday[]> {
  const response = await apiClient.get<Holiday[]>(`/holidays${year ? `?year=${year}` : ''}`)
  return response.data ?? []
}

export async function addHoliday(input: {
  name: string
  date: string
  paid?: boolean
}): Promise<Holiday> {
  const response = await apiClient.post<Holiday, typeof input>('/holidays', input)
  if (!response.data) throw new Error('The holiday was not added')
  return response.data
}

export async function deleteHoliday(id: string): Promise<void> {
  await apiClient.delete(`/holidays/${id}`)
}
