'use client'

import { useMemo } from 'react'
import { useAppSelector } from '@/lib/redux/store'
import { canView } from '@/lib/auth/roles'
import { navItems } from '@/components/layout/nav-item'
import { useCommandSearch } from './use-command-search'

export interface Command {
  id: string
  label: string
  hint: string
  href: string
}

/**
 * Pages the role may open, plus server matches for people and documents.
 * Local matches narrow as you type; remote hits are deduplicated by href.
 */
export function useCommandResults(open: boolean, query: string) {
  const { user } = useAppSelector((state) => state.auth)
  const { employees } = useAppSelector((state) => state.employee)
  const { hits, searching } = useCommandSearch(open, query)

  const commands = useMemo<Command[]>(() => {
    const pages = navItems
      .filter((item) => !item.module || canView(user, item.module))
      .map<Command>((item) => ({
        id: `page-${item.href}`,
        label: item.label,
        hint: 'Page',
        href: item.href,
      }))

    const people = canView(user, 'employees')
      ? employees.slice(0, 50).map<Command>((employee) => ({
          id: `employee-${employee._id}`,
          label: employee.name,
          hint: employee.position || 'Employee',
          href: `/employees/${employee._id}`,
        }))
      : []

    return [...pages, ...people]
  }, [user, employees])

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return commands.slice(0, 8)

    const remote: Command[] = hits.map((hit) => ({
      id: `${hit.type}-${hit.id}`,
      label: hit.title,
      hint: hit.subtitle || hit.type,
      href: hit.href,
    }))

    const local = commands.filter(
      (command) =>
        command.label.toLowerCase().includes(needle) ||
        command.hint.toLowerCase().includes(needle),
    )

    const seen = new Set<string>()
    return [...remote, ...local]
      .filter((command) => {
        if (seen.has(command.href)) return false
        seen.add(command.href)
        return true
      })
      .slice(0, 8)
  }, [commands, hits, query])

  return { results, searching }
}
