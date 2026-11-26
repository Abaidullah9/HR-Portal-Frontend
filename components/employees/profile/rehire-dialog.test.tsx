import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { makeStore } from '@/lib/redux/store'
import type { EmployeeProfileEmployee } from '@/lib/api/profile'
import { RehireDialog } from './rehire-dialog'
import { rehireEmployee } from '@/lib/api/profile'

vi.mock('@/lib/api/profile', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/api/profile')>()),
  rehireEmployee: vi.fn(),
}))

const employee: EmployeeProfileEmployee = {
  _id: 'e1',
  name: 'Priya Patel',
  email: 'priya@techcorp.com',
  employeeCode: 'EMP-0005',
  position: 'Account Executive',
  employmentType: 'full-time',
  isActive: false,
  joiningDate: '2023-09-18',
  salary: 112000,
  departmentId: { _id: 'd1', name: 'Sales' },
}

const renderDialog = () => {
  const store = makeStore()
  store.dispatch({
    type: 'employees/fetchDepartments/fulfilled',
    payload: [{ _id: 'd1', name: 'Sales' }],
  })
  const onRehired = vi.fn()
  const view = render(
    <Provider store={store}>
      <RehireDialog employee={employee} onClose={() => {}} onRehired={onRehired} />
    </Provider>,
  )
  return { ...view, onRehired }
}

beforeEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('RehireDialog', () => {
  it('sends the form values and exposes the invite link when email is off', async () => {
    vi.mocked(rehireEmployee).mockResolvedValue({
      employee: { ...employee, isActive: true },
      inviteLink: 'http://localhost:3000/accept-invite?token=abc',
      delivered: false,
    })
    const { onRehired } = renderDialog()

    fireEvent.change(screen.getByLabelText('Monthly salary (PKR)'), {
      target: { value: '120000' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Rehire employee' }))

    await waitFor(() => expect(onRehired).toHaveBeenCalledOnce())
    expect(rehireEmployee).toHaveBeenCalledWith(
      'e1',
      expect.objectContaining({ salary: 120000, departmentId: 'd1' }),
    )
    expect(screen.getByRole('status').textContent).toContain('Email delivery is not configured')
    expect(screen.getByLabelText('Invite link')).toHaveProperty(
      'value',
      'http://localhost:3000/accept-invite?token=abc',
    )
  })

  it('blocks a negative salary before calling the API', () => {
    renderDialog()
    const salary = screen.getByLabelText('Monthly salary (PKR)') as HTMLInputElement
    fireEvent.change(salary, { target: { value: '-1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Rehire employee' }))

    expect(salary.validity.rangeUnderflow).toBe(true)
    expect(rehireEmployee).not.toHaveBeenCalled()
  })
})
