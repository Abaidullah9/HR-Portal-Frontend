'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, GitBranch, Search } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { Input } from '@/components/ui/input'
import { EmptyState, ErrorState } from '@/components/common/state-panel'
import { Button } from '@/components/ui/button'
import { AccessDenied } from '@/components/common/access-denied'
import { fetchOrgChart, type OrgChartNode } from '@/lib/api/profile'
import { useAppSelector } from '@/lib/redux/store'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { roleNameOf } from '@/lib/auth/roles'
import { cn } from '@/lib/utils'

export default function OrgChartPage() {
  const [nodes, setNodes] = useState<OrgChartNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const { user } = useAppSelector((state) => state.auth)
  const { canView } = usePermissions()
  const roleReady = Boolean(user && roleNameOf(user))
  const canRead = canView('organization')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setNodes(await fetchOrgChart())
      setError(null)
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not load the org chart')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (roleReady && canRead) void load()
  }, [load, roleReady, canRead])

  const { roots, childrenOf } = useMemo(() => {
    const byManager = new Map<string, OrgChartNode[]>()
    const ids = new Set(nodes.map((node) => node.id))
    for (const node of nodes) {
      const manager = node.managerId && ids.has(node.managerId) ? node.managerId : '__root__'
      const bucket = byManager.get(manager) ?? []
      bucket.push(node)
      byManager.set(manager, bucket)
    }
    return {
      roots: byManager.get('__root__') ?? [],
      childrenOf: (id: string) => byManager.get(id) ?? [],
    }
  }, [nodes])

  const needle = query.trim().toLowerCase()
  const matches = (node: OrgChartNode) =>
    !needle ||
    node.name.toLowerCase().includes(needle) ||
    node.position.toLowerCase().includes(needle) ||
    node.department.toLowerCase().includes(needle)

  // A match deep in the tree must stay reachable: filtering out its manager
  // would otherwise hide the very person the query found. Ancestors are kept
  // as context, and the visited set guards against a manager cycle.
  const subtreeMatches = (node: OrgChartNode, seen = new Set<string>()): boolean => {
    if (matches(node)) return true
    if (seen.has(node.id)) return false
    seen.add(node.id)
    return childrenOf(node.id).some((report) => subtreeMatches(report, seen))
  }

  const hasMatches = !needle || nodes.some((node) => matches(node))

  const renderNode = (node: OrgChartNode, depth: number): React.ReactNode => {
    if (!subtreeMatches(node)) return null
    const reports = childrenOf(node.id)

    return (
      <li key={node.id}>
        <div
          className={cn(
            'rounded-xl border edge bg-white/70 p-4 backdrop-blur-md dark:surface-85',
            depth > 0 && 'ml-5',
          )}
        >
          <Link href={`/employees/${node.id}`} className="font-semibold hover:underline">
            {node.name}
          </Link>
          <p className="text-sm text-foreground/65">
            {node.position} · {node.department}
          </p>
          <p className="text-xs text-foreground/55">{node.employeeCode}</p>
        </div>
        {reports.length > 0 && (
          <ul
            className={cn(
              'mt-3 space-y-3 border-l edge pl-4',
              depth === 0 ? 'ml-4' : 'ml-9',
            )}
          >
            {reports.map((report) => renderNode(report, depth + 1))}
          </ul>
        )}
      </li>
    )
  }

  if (roleReady && !canRead) {
    return (
      <AppLayout>
        <div className="space-y-8">
          <SectionHeader
            title="Org chart"
            description="Who reports to whom, built from each employee's manager."
          />
          <AccessDenied area="the organization chart" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <Link
          href="/organization"
          className="inline-flex items-center gap-1.5 text-sm text-foreground/65 hover:text-foreground"
        >
          <ArrowLeft size={15} aria-hidden="true" /> Organization
        </Link>

        <SectionHeader
          title="Org chart"
          description="Who reports to whom, built from each employee's manager. Select a person for their full profile."
        />

        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/60"
            aria-hidden="true"
          />
          <label htmlFor="org-search" className="sr-only">
            Filter the org chart
          </label>
          <Input
            id="org-search"
            className="pl-11"
            placeholder="Filter by name, role or department…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {loading ? (
          <div role="status" aria-busy="true" className="panel p-8">
            <span className="sr-only">Loading the org chart</span>
            <div className="space-y-3">
              <div className="h-16 w-72 animate-pulse rounded-xl bg-foreground/10" />
              <div className="ml-8 h-16 w-64 animate-pulse rounded-xl bg-foreground/10" />
              <div className="ml-16 h-16 w-56 animate-pulse rounded-xl bg-foreground/10" />
            </div>
          </div>
        ) : error ? (
          <div className="panel">
            <ErrorState title="Couldn't load the org chart" description={error} onRetry={() => void load()} />
          </div>
        ) : roots.length === 0 ? (
          <div className="panel">
            <EmptyState
              icon={GitBranch}
              title="No reporting lines yet"
              description="Assign a reporting manager to an employee and the hierarchy appears here."
            />
          </div>
        ) : !hasMatches ? (
          <div className="panel">
            <EmptyState
              icon={GitBranch}
              title={`No matches for “${query.trim()}”`}
              description="Try a different name, role or department."
              action={
                <Button variant="outline" size="sm" onClick={() => setQuery('')}>
                  Clear search
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="space-y-4">{roots.map((root) => renderNode(root, 0))}</ul>
        )}
      </div>
    </AppLayout>
  )
}
