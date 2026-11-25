'use client'

import { useCallback, useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { DataTable, DataTableSkeleton } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/state-panel'
import { AccessDenied } from '@/components/common/access-denied'
import { useAppSelector } from '@/lib/redux/store'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { roleNameOf } from '@/lib/auth/roles'
import { fetchAuditLogs, type AuditLogEntry } from '@/lib/api/insights'

const formatWhen = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAppSelector((state) => state.auth)
  const { canView } = usePermissions()
  const roleReady = Boolean(user && roleNameOf(user))
  const canRead = canView('audit')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchAuditLogs()
      setEntries(result.entries)
      setError(null)
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not load the audit trail')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (roleReady && canRead) void load()
  }, [load, roleReady, canRead])

  if (roleReady && !canRead) {
    return (
      <AppLayout>
        <div className="space-y-10">
          <SectionHeader
            title="Audit trail"
            description="Who changed what: leave decisions, payroll runs and employee removals"
          />
          <AccessDenied area="the audit trail" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-10">
        <SectionHeader
          title="Audit trail"
          description="Who changed what: leave decisions, payroll runs and employee removals"
        />

        {error && (
          <div role="alert" className="rounded-2xl border danger-panel p-6 text-sm backdrop-blur-md">
            {error}
          </div>
        )}

        <div className="panel overflow-hidden">
          {loading ? (
            <div role="status" aria-busy="true">
              <span className="sr-only">Loading audit trail</span>
              <DataTableSkeleton rows={6} columns={4} />
            </div>
          ) : entries.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="Nothing recorded yet"
              description="Leave decisions, payroll runs and employee removals appear here as they happen."
            />
          ) : (
            <DataTable<AuditLogEntry>
              caption="Audit trail"
              pageSize={20}
              columns={[
                {
                  header: 'When',
                  accessor: 'createdAt',
                  render: (value) => formatWhen(value),
                  className: 'text-foreground/65 text-sm',
                  sortValue: (row) => row.createdAt,
                },
                { header: 'Actor', accessor: 'actorName', render: (value) => value || 'Unknown' },
                {
                  header: 'Action',
                  accessor: 'action',
                  render: (value) => <span className="font-mono text-xs">{value}</span>,
                },
                { header: 'Entity', accessor: 'entity' },
                {
                  header: 'Detail',
                  accessor: 'detail',
                  render: (value) => value || '--',
                  className: 'text-foreground/65 text-sm',
                },
              ]}
              data={entries}
              renderCard={(entry) => (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-mono text-xs text-foreground">{entry.action}</p>
                    <span className="whitespace-nowrap text-xs text-foreground/65">
                      {formatWhen(entry.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/75">
                    {entry.actorName || 'Unknown'} · {entry.entity}
                  </p>
                  <p className="text-sm text-foreground/60 break-words">{entry.detail || '--'}</p>
                </div>
              )}
            />
          )}
        </div>
      </div>
    </AppLayout>
  )
}
