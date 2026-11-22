import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ApiError, SESSION_EXPIRED_EVENT, apiClient } from './client'

const stubFetch = (status: number, body: unknown) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  )
}

beforeEach(() => {
  vi.unstubAllGlobals()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('apiClient request handling', () => {
  it('returns the payload and pagination on success', async () => {
    const pagination = { total: 3, page: 1, limit: 10, totalPages: 1 }
    stubFetch(200, { success: true, message: 'ok', data: [{ _id: 'a' }], pagination })

    const response = await apiClient.get<{ _id: string }[]>('/employees/paginated')
    expect(response.data).toEqual([{ _id: 'a' }])
    expect(response.pagination).toEqual(pagination)
  })

  it('announces session expiry on 401 and carries the status', async () => {
    const listener = vi.fn()
    window.addEventListener(SESSION_EXPIRED_EVENT, listener)
    stubFetch(401, { success: false, message: 'Not logged in' })

    await expect(apiClient.get('/employees')).rejects.toBeInstanceOf(ApiError)
    await expect(apiClient.get('/employees')).rejects.toMatchObject({ status: 401 })
    expect(listener).toHaveBeenCalled()

    window.removeEventListener(SESSION_EXPIRED_EVENT, listener)
  })

  it('replaces an RBAC denial with a readable message', async () => {
    stubFetch(403, { success: false, message: 'Not authorized: read_Payroll' })

    await expect(apiClient.get('/employee-payroll/paginated')).rejects.toMatchObject({
      status: 403,
      message: 'You do not have permission to perform this action.',
    })
  })

  it('passes through a validation message from the server', async () => {
    stubFetch(400, { success: false, message: 'Validation error: email is required' })

    await expect(apiClient.post('/employees', {})).rejects.toThrow(
      'Validation error: email is required',
    )
  })
})
