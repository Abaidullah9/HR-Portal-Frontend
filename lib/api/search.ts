import { apiClient } from './client'

export interface SearchHit {
  id: string
  type: 'employee' | 'document' | 'candidate'
  title: string
  subtitle: string
  href: string
}

/** Global search over people, documents and candidates, scoped on the server. */
export async function searchWorkspace(query: string): Promise<SearchHit[]> {
  if (query.trim().length < 2) return []
  const response = await apiClient.get<SearchHit[]>(`/search?q=${encodeURIComponent(query.trim())}`)
  return response.data ?? []
}
