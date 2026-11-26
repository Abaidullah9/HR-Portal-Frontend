import { beforeEach, describe, expect, it, vi } from 'vitest'
import { downloadMyPayslip, downloadPayslip, type Payslip } from './payroll'

const payslip: Payslip = {
  id: 'pay1',
  employee: { name: 'Diana Employee', code: 'EMP-0002', position: 'Engineer' },
  periodStart: '2026-05-01T00:00:00.000Z',
  periodEnd: '2026-05-31T00:00:00.000Z',
  paymentMethod: 'bank transfer',
  status: 'completed',
  earnings: [{ label: 'Base salary', amount: 1000 }],
  deductions: [{ label: 'tax', amount: 200 }],
  grossPay: 1000,
  totalDeductions: 200,
  netPay: 800,
  calculatedNetPay: 800,
  reconciles: true,
}

const pdfResponse = () =>
  new Response(new Blob(['%PDF-1.7'], { type: 'application/pdf' }), {
    status: 200,
    headers: { 'Content-Type': 'application/pdf' },
  })

/** The download link is removed straight after the click, so capture the name. */
const captureDownloads = () => {
  const names: string[] = []
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    names.push(this.download)
  })
  return names
}

beforeEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
  // jsdom has neither of these; the download path only needs them to exist.
  URL.createObjectURL = vi.fn(() => 'blob:payslip')
  URL.revokeObjectURL = vi.fn()
})

describe('payslip PDF download', () => {
  it('fetches the caller’s own PDF from the session-scoped route', async () => {
    const fetchMock = vi.fn().mockResolvedValue(pdfResponse())
    vi.stubGlobal('fetch', fetchMock)
    const downloads = captureDownloads()

    await downloadMyPayslip(payslip)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/payroll/me/pay1/payslip'),
      expect.objectContaining({ credentials: 'include' }),
    )
    expect(downloads).toEqual(['payslip-diana-employee-2026-05-01.pdf'])
  })

  it('names the file after the issued payslip number', async () => {
    const fetchMock = vi.fn().mockResolvedValue(pdfResponse())
    vi.stubGlobal('fetch', fetchMock)
    const downloads = captureDownloads()

    await downloadPayslip({ ...payslip, payslipNumber: 'PS-202605-0001' })

    expect(downloads).toEqual(['ps-202605-0001-diana-employee.pdf'])
  })

  it('uses the HR route when downloading someone else’s payslip', async () => {
    const fetchMock = vi.fn().mockResolvedValue(pdfResponse())
    vi.stubGlobal('fetch', fetchMock)
    captureDownloads()

    await downloadPayslip(payslip)

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/payroll/pay1/payslip/pdf'),
      expect.anything(),
    )
  })

  it('surfaces the server message instead of saving an error page', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: false, message: 'Not authorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    const downloads = captureDownloads()

    await expect(downloadMyPayslip(payslip)).rejects.toThrow('Not authorized')
    expect(downloads).toEqual([])
  })
})
