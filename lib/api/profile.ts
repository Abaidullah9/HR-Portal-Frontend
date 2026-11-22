import { apiClient } from './client'

export interface CompensationRecord {
  _id: string
  baseSalary: number
  currency: string
  effectiveFrom: string
  reason: 'initial' | 'raise' | 'promotion' | 'adjustment' | 'correction'
  note?: string
  createdAt?: string
}

export interface ChecklistTask {
  _id: string
  type: 'onboarding' | 'offboarding'
  title: string
  category: 'people' | 'it' | 'payroll' | 'compliance' | 'manager'
  status: 'open' | 'done' | 'skipped'
  dueDate?: string
  completedAt?: string
  notes?: string
}

export interface ProfileDocument {
  _id: string
  name: string
  type: string
  mimeType?: string
  size?: number
  createdAt?: string
}

export interface EmployeeProfileEmployee {
  _id: string
  name: string
  email: string
  employeeCode: string
  position: string
  employmentType: string
  isActive: boolean
  joiningDate: string
  exitDate?: string
  salary?: number
  phone?: string
  departmentId?: { _id: string; name: string } | string
  reportingManagerId?: { _id: string; name: string; position?: string } | string
  userId?: { _id: string; email?: string; isActive?: boolean; lastLogin?: string } | string
  organizationId?: string
}

export interface ProfileLeaveBalance {
  _id: string
  leaveType: string
  totalAllocated: number
  used: number
  remaining: number
  year: number
}

export interface ProfileLeaveRequest {
  _id: string
  leaveType: string
  fromDate: string
  toDate: string
  leaveStatus: string
  workingDays?: number
  reasonForLeave: string
}

export interface ProfileAppraisal {
  _id: string
  reviewDate: string
  overallRating?: number
  goalsCompleted: number
  status: string
  workflowStage?: string
  selfReview?: string
  managerReview?: string
  calibrationNote?: string
  lockedAt?: string
  cycleId?: { name?: string } | string
  appraiserId?: { name?: string } | string
}

export interface ProfilePayslip {
  _id: string
  payPeriodStart: string
  payPeriodEnd: string
  netPay: number
  status: string
  currency?: string
}

export interface DirectReport {
  _id: string
  name: string
  position: string
  employeeCode: string
}

export interface EmployeeProfile {
  employee: EmployeeProfileEmployee
  documents: ProfileDocument[]
  compensations: CompensationRecord[]
  balances: ProfileLeaveBalance[]
  leaveRequests: ProfileLeaveRequest[]
  appraisals: ProfileAppraisal[]
  payslips: ProfilePayslip[]
  tasks: ChecklistTask[]
  directReports: DirectReport[]
}

export async function fetchEmployeeProfile(employeeId: string): Promise<EmployeeProfile> {
  const response = await apiClient.get<EmployeeProfile>(`/employees/${employeeId}/profile`)
  if (!response.data) throw new Error('Could not load that employee profile')
  return response.data
}

export async function fetchOwnProfile(): Promise<EmployeeProfile> {
  const response = await apiClient.get<EmployeeProfile>('/employees/me/profile')
  if (!response.data) throw new Error('Could not load your profile')
  return response.data
}

export async function recordCompensation(input: {
  employeeId: string
  baseSalary: number
  currency?: string
  effectiveFrom?: string
  reason?: CompensationRecord['reason']
  note?: string
}): Promise<CompensationRecord> {
  const response = await apiClient.post<CompensationRecord, typeof input>('/compensations', input)
  if (!response.data) throw new Error('Could not record the compensation change')
  return response.data
}

export async function updateChecklistTask(
  taskId: string,
  status: 'open' | 'done' | 'skipped',
): Promise<ChecklistTask> {
  const response = await apiClient.patch<ChecklistTask, { status: string }>(
    `/checklists/${taskId}`,
    { status },
  )
  if (!response.data) throw new Error('Could not update that task')
  return response.data
}

export async function addChecklistTask(
  employeeId: string,
  input: { title: string; type?: 'onboarding' | 'offboarding'; dueDate?: string },
): Promise<ChecklistTask> {
  const response = await apiClient.post<ChecklistTask, typeof input>(
    `/checklists/employee/${employeeId}`,
    input,
  )
  if (!response.data) throw new Error('Could not add that task')
  return response.data
}

export async function startChecklist(
  employeeId: string,
  type: 'onboarding' | 'offboarding',
): Promise<ChecklistTask[]> {
  const response = await apiClient.post<ChecklistTask[], { type: string }>(
    `/checklists/employee/${employeeId}/start`,
    { type },
  )
  return response.data ?? []
}

export async function downloadDocument(documentId: string, name: string): Promise<void> {
  const blob = await apiClient.download(`/documents/${documentId}/file`)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name || 'document'
  link.click()
  URL.revokeObjectURL(url)
}

export async function exportEmployeeData(employeeId: string): Promise<void> {
  const blob = await apiClient.download(`/employees/${employeeId}/export`)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `employee-${employeeId}-export.json`
  link.click()
  URL.revokeObjectURL(url)
}

export async function anonymizeEmployee(employeeId: string): Promise<void> {
  await apiClient.post(`/employees/${employeeId}/anonymize`, {})
}

export interface ImportRow {
  name: string
  email: string
  employeeCode?: string
  department: string
  position: string
  employmentType?: string
  joiningDate?: string
  salary?: string
  managerEmail?: string
}

export interface ImportResult {
  created: { employeeId: string; email: string; inviteLink?: string }[]
  failed: { row: number; email?: string; reason: string }[]
  total: number
}

export async function importEmployees(rows: ImportRow[]): Promise<ImportResult> {
  const response = await apiClient.post<ImportResult, { rows: ImportRow[] }>('/employees/import', {
    rows,
  })
  if (!response.data) throw new Error('The import did not return a result')
  return response.data
}

export interface OrgChartNode {
  id: string
  name: string
  email: string
  employeeCode: string
  position: string
  department: string
  managerId: string | null
}

export async function fetchOrgChart(): Promise<OrgChartNode[]> {
  const response = await apiClient.get<OrgChartNode[]>('/employees/org-chart')
  return response.data ?? []
}

export async function inviteUser(input: {
  name: string
  email: string
  roleName?: string
}): Promise<{ inviteLink?: string; delivered: boolean }> {
  const response = await apiClient.post<
    { inviteLink?: string; delivered: boolean },
    typeof input
  >('/users/invite', input)
  if (!response.data) throw new Error('The invite could not be created')
  return response.data
}

export interface HireResult {
  employee: { _id: string; name: string; employeeCode: string }
  inviteLink?: string
  delivered: boolean
}

export async function hireCandidate(
  candidateId: string,
  input: { departmentId?: string; position?: string; salary?: number; joiningDate?: string },
): Promise<HireResult> {
  const response = await apiClient.post<HireResult, typeof input>(
    `/candidates/${candidateId}/hire`,
    input,
  )
  if (!response.data) throw new Error('The candidate could not be converted')
  return response.data
}
