'use client'

import { useEffect, useState } from 'react'
import { searchWorkspace, type SearchHit } from '@/lib/api/search'

/**
 * Debounced server search for the command palette. People and documents are
 * not held in the sidebar, so results come from the API's scoped search.
 */
export function useCommandSearch(open: boolean, query: string) {
  const [hits, setHits] = useState<SearchHit[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const term = query.trim()
    if (!open || term.length < 2) {
      setHits([])
      setSearching(false)
      return
    }

    let cancelled = false
    setSearching(true)
    const timer = window.setTimeout(async () => {
      try {
        const found = await searchWorkspace(term)
        if (!cancelled) setHits(found)
      } catch {
        if (!cancelled) setHits([])
      } finally {
        if (!cancelled) setSearching(false)
      }
    }, 220)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [open, query])

  return { hits, searching }
}
