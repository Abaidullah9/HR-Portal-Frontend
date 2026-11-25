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
  /** The card `<li>` elements, keyed by the caller. */
  children: ReactNode
  table: ReactNode
  pager?: ReactNode
}

/**
 * Swaps a table for a card list below the breakpoint. Only one view is ever
 * displayed, so a single pager after both serves whichever one is showing.
 */
export function RowCards({ below, children, table, pager }: RowCardsProps) {
  return (
    <>
      <ul className={cn('divide-y edge', CARD_ONLY[below])}>{children}</ul>
      <div className={TABLE_ONLY[below]}>{table}</div>
      {pager}
    </>
  )
}
