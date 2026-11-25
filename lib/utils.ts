import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toSentenceCase(value: string): string {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}` : ''
}

const moneyFormatters = new Map<string, Intl.NumberFormat>()

/**
 * "PKR 158,000.00" for an amount in the record's currency; older records may
 * store it as a string. The ISO code is shown rather than a symbol so an amount
 * can never be mistaken for a different currency.
 */
export function formatMoney(value?: number | string | null, currency = 'PKR'): string {
  const amount = Number(value ?? 0)
  if (!Number.isFinite(amount)) return '--'

  try {
    let formatter = moneyFormatters.get(currency)
    if (!formatter) {
      formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        currencyDisplay: 'code',
        // Intl drops the paise for PKR; a payslip must match its PDF exactly.
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      moneyFormatters.set(currency, formatter)
    }
    return formatter.format(amount)
  } catch {
    // An unknown ISO code must not blank the number it labels.
    return `${currency} ${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
}

/** "May 9, 2026" for a timestamp, the raw value when unparseable, "--" when absent. */
export function formatDate(value?: string | null): string {
  if (!value) return '--'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}
