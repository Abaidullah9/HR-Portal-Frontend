import { apiClient, API_BASE_URL } from './client'

export interface PayslipLine {
  label: string
  amount: number
  note?: string
}

export interface Payslip {
  id: string
  employee: { id?: string; name: string; code?: string; position?: string }
  periodStart: string
  periodEnd: string
  paymentMethod: string
  currency?: string
  status: string
  datePaid?: string
  earnings: PayslipLine[]
  deductions: PayslipLine[]
  grossPay: number
  totalDeductions: number
  netPay: number
}

export async function fetchPayslip(id: string): Promise<Payslip> {
  const response = await apiClient.get<Payslip>(`/payroll/${encodeURIComponent(id)}/payslip`)
  if (!response.data) throw new Error('Payslip unavailable')
  return response.data
}

export async function fetchMyPayslips(): Promise<Payslip[]> {
  const response = await apiClient.get<Payslip[]>('/payroll/me')
  return response.data ?? []
}

const fileName = (payslip: Payslip) => {
  const slug = payslip.employee.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `payslip-${slug}-${payslip.periodStart.slice(0, 10)}.pdf`
}

const save = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const fetchPdf = async (path: string, fallback: string): Promise<Blob> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    cache: 'no-store',
  })
  if (!response.ok) {
    const detail = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(detail?.message || fallback)
  }
  return response.blob()
}

/** The employee's own payslip, authorised on the session rather than an id. */
export async function downloadMyPayslip(payslip: Payslip): Promise<void> {
  const blob = await fetchPdf(
    `/payroll/me/${encodeURIComponent(payslip.id)}/payslip`,
    'Could not download the payslip',
  )
  save(blob, fileName(payslip))
}

/** HR/Admin download for a record they can already read. */
export async function downloadPayslip(payslip: Payslip): Promise<void> {
  const blob = await fetchPdf(
    `/payroll/${encodeURIComponent(payslip.id)}/payslip/pdf`,
    'Could not download the payslip',
  )
  save(blob, fileName(payslip))
}
