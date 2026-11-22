import { apiClient } from './client'

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

const money = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return map[character] ?? character
  })

/** A self-contained printable document, so a payslip needs no PDF service. */
export function payslipHtml(payslip: Payslip): string {
  const row = (line: PayslipLine) =>
    `<tr><td>${escapeHtml(line.label)}</td><td class="amount">${money(line.amount)}</td></tr>`

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Payslip — ${escapeHtml(payslip.employee.name)}</title>
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, sans-serif; color: #111827; max-width: 720px; margin: 40px auto; padding: 0 24px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .muted { color: #6b7280; font-size: 13px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 28px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding: 6px 0; }
  td { padding: 6px 0; border-bottom: 1px solid #f3f4f6; }
  .amount { text-align: right; font-variant-numeric: tabular-nums; }
  .total { font-weight: 600; border-top: 2px solid #111827; border-bottom: 0; }
  .net { margin-top: 24px; font-size: 18px; font-weight: 700; display: flex; justify-content: space-between; border-top: 2px solid #111827; padding-top: 12px; }
  @media print { body { margin: 0; } }
</style></head>
<body>
  <h1>Payslip</h1>
  <p class="muted">${escapeHtml(payslip.employee.name)}${payslip.employee.code ? ` · ${escapeHtml(payslip.employee.code)}` : ''}${payslip.employee.position ? ` · ${escapeHtml(payslip.employee.position)}` : ''}</p>
  <p class="muted">Pay period ${escapeHtml(new Date(payslip.periodStart).toLocaleDateString())} – ${escapeHtml(new Date(payslip.periodEnd).toLocaleDateString())} · ${escapeHtml(payslip.paymentMethod)} · ${escapeHtml(payslip.status)}</p>
  <div class="grid">
    <table><thead><tr><th>Earnings</th><th class="amount">Amount</th></tr></thead>
      <tbody>${payslip.earnings.map(row).join('')}
      <tr class="total"><td>Gross pay</td><td class="amount">${money(payslip.grossPay)}</td></tr></tbody></table>
    <table><thead><tr><th>Deductions</th><th class="amount">Amount</th></tr></thead>
      <tbody>${payslip.deductions.length ? payslip.deductions.map(row).join('') : '<tr><td>None</td><td class="amount">0.00</td></tr>'}
      <tr class="total"><td>Total deductions</td><td class="amount">${money(payslip.totalDeductions)}</td></tr></tbody></table>
  </div>
  <div class="net"><span>Net pay</span><span>${money(payslip.netPay)}</span></div>
</body></html>`
}

export function downloadPayslip(payslip: Payslip): void {
  const slug = payslip.employee.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const blob = new Blob([payslipHtml(payslip)], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${slug}-payslip-${payslip.periodStart.slice(0, 10)}.html`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
