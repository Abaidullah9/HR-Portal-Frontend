import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Provider } from 'react-redux'
import { makeStore } from '@/lib/redux/store'
import { setCredentials } from '@/lib/redux/slices/authSlice'
import type { AuthUser } from '@/types/auth'
import type { Appraisal } from '@/types/performance'
import { EmployeeView } from './employee-view'

const { fetchMyAppraisalsMock, fetchGoalsMock } = vi.hoisted(() => ({
  fetchMyAppraisalsMock: vi.fn(),
  fetchGoalsMock: vi.fn(),
}))

vi.mock('@/lib/api/self', () => ({ fetchMyAppraisals: fetchMyAppraisalsMock }))
vi.mock('@/lib/api/goals', () => ({
  fetchGoals: fetchGoalsMock,
  createGoal: vi.fn(),
  updateGoalProgress: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/performance',
}))

// The seed's login id is not the employee document's id; the self endpoint
// returns reviews already scoped to the employee, so no matching is needed.
const USER_ID = '65f000000000000000000001'
const EMPLOYEE_ID = '65f000000000000000000002'
const CYCLE_ID = '65f000000000000000000003'

const appraisal = {
  _id: '65f000000000000000000004',
  employeeId: EMPLOYEE_ID,
  cycleId: { _id: CYCLE_ID, name: 'Q4 2024 Review' },
  appraiserId: { _id: '65f000000000000000000005', name: 'Charlie Manager' },
  reviewDate: '2024-12-01T00:00:00.000Z',
  overallRating: 4.5,
  goalsCompleted: 0,
  feedbackReceived: 0,
  skillsRating: [],
  goals: [],
  status: 'pending',
  workflowStage: 'self_review',
} as unknown as Appraisal

const renderView = () => {
  const store = makeStore()
  store.dispatch(
    setCredentials({
      user: {
        _id: USER_ID,
        name: 'Diana Employee',
        email: 'employee@techcorp.com',
        roleId: { _id: 'r1', roleName: 'Employee' },
        isActive: true,
      } as AuthUser,
    }),
  )

  render(
    <Provider store={store}>
      <EmployeeView />
    </Provider>,
  )
}

beforeEach(() => {
  cleanup()
  fetchMyAppraisalsMock.mockReset()
  fetchGoalsMock.mockReset()
  fetchGoalsMock.mockResolvedValue([])
})

describe('EmployeeView', () => {
  it('renders the self review and cycle goals from the employee-scoped reviews', async () => {
    fetchMyAppraisalsMock.mockResolvedValue([appraisal])
    renderView()

    expect(await screen.findByRole('heading', { name: /your self review/i })).toBeTruthy()
    expect(screen.queryByText(/no appraisal on file/i)).toBeNull()

    // Goals are requested for the employee document the review belongs to.
    expect(await screen.findByRole('heading', { name: /your cycle goals/i })).toBeTruthy()
    expect(fetchGoalsMock).toHaveBeenCalledWith({ employeeId: EMPLOYEE_ID, cycleId: CYCLE_ID })
  })

  it('shows no review when the endpoint returns none', async () => {
    fetchMyAppraisalsMock.mockResolvedValue([])
    renderView()

    expect(await screen.findByText(/no appraisal on file/i)).toBeTruthy()
    expect(screen.queryByRole('heading', { name: /your self review/i })).toBeNull()
    expect(fetchGoalsMock).not.toHaveBeenCalled()
  })
})
