import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toSentenceCase(value: string): string {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}` : ''
}

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

/** "$7,916.67" for an amount; older records may store it as a string. */
export function formatMoney(value?: number | string | null): string {
  const amount = Number(value ?? 0)
  return Number.isFinite(amount) ? money.format(amount) : '--'
}

/** "May 9, 2026" for a timestamp, the raw value when unparseable, "--" when absent. */
export function formatDate(value?: string | null): string {
  if (!value) return '--'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}
