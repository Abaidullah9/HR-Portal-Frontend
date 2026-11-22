import { apiClient } from './client'

export async function acceptInvite(token: string, password: string): Promise<void> {
  await apiClient.post('/users/accept-invite', { token, password })
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiClient.post('/users/change-password', { currentPassword, newPassword })
}
