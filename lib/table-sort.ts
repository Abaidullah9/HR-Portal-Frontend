export type SortDirection = 'asc' | 'desc'

export interface SortState {
  accessor: string
  direction: SortDirection
}

/**
 * Cycling asc → desc → unsorted on the same column keeps the original server
 * order reachable, which matters for tables that arrive pre-sorted.
 */
export function nextSortState(
  current: SortState | null,
  accessor: string,
): SortState | null {
  if (!current || current.accessor !== accessor) return { accessor, direction: 'asc' }
  if (current.direction === 'asc') return { accessor, direction: 'desc' }
  return null
}

/** Numbers compare numerically, everything else as text; blanks sort last. */
export function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b)
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}
