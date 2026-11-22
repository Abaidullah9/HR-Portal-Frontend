import { apiClient } from './client'

export interface ActionRef {
  _id: string
  actionName: string
  actionDescription?: string
}

export interface RoleRecord {
  _id: string
  roleName: string
  actions: ActionRef[]
}

const PAGE_LIMIT = 100

/** Walks every page because the API caps `limit` at 100 and there are ~80 actions. */
export async function fetchAllActions(): Promise<ActionRef[]> {
  const first = await apiClient.get<ActionRef[]>(
    `/actions/paginated?page=1&limit=${PAGE_LIMIT}`,
  )
  const actions = [...(first.data ?? [])]
  const totalPages = first.pagination?.totalPages ?? 1

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await apiClient.get<ActionRef[]>(
      `/actions/paginated?page=${page}&limit=${PAGE_LIMIT}`,
    )
    actions.push(...(next.data ?? []))
  }
  return actions.sort((a, b) => a.actionName.localeCompare(b.actionName))
}

export async function fetchAllRoles(): Promise<RoleRecord[]> {
  const first = await apiClient.get<RoleRecord[]>(
    `/roles/paginated?page=1&limit=${PAGE_LIMIT}`,
  )
  const roles = [...(first.data ?? [])]
  const totalPages = first.pagination?.totalPages ?? 1

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await apiClient.get<RoleRecord[]>(
      `/roles/paginated?page=${page}&limit=${PAGE_LIMIT}`,
    )
    roles.push(...(next.data ?? []))
  }
  return roles
}

export async function assignRoleActions(roleId: string, actionIds: string[]): Promise<RoleRecord> {
  const response = await apiClient.patch<RoleRecord, { actionIds: string[] }>(
    `/roles/${encodeURIComponent(roleId)}/actions`,
    { actionIds },
  )
  if (!response.data) throw new Error('The role was not updated')
  return response.data
}
