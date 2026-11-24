'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { CardBreakpoint } from './table-types'

/** Cards below the breakpoint, table above it. Literal names, so Tailwind keeps them. */
const CARD_ONLY: Record<CardBreakpoint, string> = {
  md: 'md:hidden',
  lg: 'lg:hidden',
  xl: 'xl:hidden',
}

const TABLE_ONLY: Record<CardBreakpoint, string> = {
  md: 'hidden md:block',
  lg: 'hidden lg:block',
  xl: 'hidden xl:block',
}

interface RowCardsProps {
  below: CardBreakpoint
  rows: ReactNode[]
  keys: (string | number)[]
  pager?: ReactNode
  table: ReactNode
}

/**
 * Shows cards below the breakpoint and the table above it. The pager appears in
 * whichever view is visible, so only one is ever reachable.
 */
export function RowCards({ below, rows, keys, pager, table }: RowCardsProps) {
  return (
    <>
      <ul className={cn('divide-y edge', CARD_ONLY[below])}>
        {rows.map((row, index) => (
          <li key={keys[index] ?? index} className="px-4 py-4">
            {row}
          </li>
        ))}
      </ul>
      {pager && <div className={CARD_ONLY[below]}>{pager}</div>}
      <div className={TABLE_ONLY[below]}>
        {table}
        {pager}
      </div>
    </>
  )
}
