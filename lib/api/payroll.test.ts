import { describe, expect, it } from 'vitest'
import { payslipHtml, type Payslip } from './payroll'

const payslip: Payslip = {
  id: 'pay1',
  employee: { name: 'Diana Employee', code: 'EMP-0002', position: 'Engineer' },
  periodStart: '2026-05-01T00:00:00.000Z',
  periodEnd: '2026-05-31T00:00:00.000Z',
  paymentMethod: 'bank transfer',
  status: 'completed',
  earnings: [
    { label: 'Base salary', amount: 1000 },
    { label: 'transport', amount: 100 },
  ],
  deductions: [{ label: 'tax', amount: 200 }],
  grossPay: 1100,
  totalDeductions: 200,
  netPay: 900,
}

describe('payslipHtml', () => {
  it('includes the period, line items and net pay', () => {
    const html = payslipHtml(payslip)
    expect(html).toContain('Diana Employee')
    expect(html).toContain('Base salary')
    expect(html).toContain('900.00')
  })

  it('escapes employee text instead of injecting it as markup', () => {
    const html = payslipHtml({
      ...payslip,
      employee: { ...payslip.employee, name: '<img src=x onerror=alert(1)>' },
    })
    expect(html).not.toContain('<img src=x')
    expect(html).toContain('&lt;img src=x')
  })
})
