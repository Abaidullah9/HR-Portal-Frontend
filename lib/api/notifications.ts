import { apiClient } from './client'

export interface AppNotification {
  _id: string
  title: string
  detail: string
  href: string
  kind: 'leave' | 'payroll' | 'attendance' | 'appraisal' | 'system'
  readAt?: string
  createdAt: string
}

export interface NotificationFeed {
  items: AppNotification[]
  unread: number
}

export async function fetchNotifications(): Promise<NotificationFeed> {
  const response = await apiClient.get<AppNotification[]>('/notifications')
  const pagination = response.pagination as { unread?: number } | undefined
  return { items: response.data ?? [], unread: pagination?.unread ?? 0 }
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.post(`/notifications/${encodeURIComponent(id)}/read`)
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post('/notifications/read-all')
}
