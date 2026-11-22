'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { DataTableSkeleton } from '@/components/common/data-table'
import { ErrorState } from '@/components/common/state-panel'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/common/toast'
import {
  assignRoleActions,
  fetchAllActions,
  fetchAllRoles,
  type ActionRef,
  type RoleRecord,
} from '@/lib/api/roles'

const moduleOf = (actionName: string) => actionName.split('_').slice(1).join('_') || 'Other'

const moduleLabel = (module: string) => module.replace(/([a-z])([A-Z])/g, '$1 $2')

const actionLabel = (actionName: string) => {
  const [verb] = actionName.split('_')
  return verb ? verb.replace(/([a-z])([A-Z])/g, '$1 $2') : actionName
}

export default function RolesPage() {
  const toast = useToast()
  const [roles, setRoles] = useState<RoleRecord[]>([])
  const [actions, setActions] = useState<ActionRef[]>([])
  const [drafts, setDrafts] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [roleList, actionList] = await Promise.all([fetchAllRoles(), fetchAllActions()])
      setRoles(roleList)
      setActions(actionList)
      setDrafts(
        Object.fromEntries(
          roleList.map((role) => [role._id, role.actions.map((action) => action._id)]),
        ),
      )
      setError(null)
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not load roles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const grouped = useMemo(() => {
    const groups = new Map<string, ActionRef[]>()
    for (const action of actions) {
      const key = moduleOf(action.actionName)
      groups.set(key, [...(groups.get(key) ?? []), action])
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [actions])

  const isSelected = (roleId: string, actionId: string) =>
    (drafts[roleId] ?? []).includes(actionId)

  const toggle = (roleId: string, actionId: string) => {
    setDrafts((prev) => {
      const current = prev[roleId] ?? []
      return {
        ...prev,
        [roleId]: current.includes(actionId)
          ? current.filter((id) => id !== actionId)
          : [...current, actionId],
      }
    })
  }

  const isDirty = (role: RoleRecord) => {
    const saved = role.actions.map((action) => action._id).sort().join(',')
    const draft = [...(drafts[role._id] ?? [])].sort().join(',')
    return saved !== draft
  }

  const save = async (role: RoleRecord) => {
    setSavingId(role._id)
    try {
      const updated = await assignRoleActions(role._id, drafts[role._id] ?? [])
      setRoles((prev) => prev.map((item) => (item._id === role._id ? updated : item)))
      setDrafts((prev) => ({
        ...prev,
        [role._id]: updated.actions.map((action) => action._id),
      }))
      toast(`${role.roleName} permissions saved`)
    } catch (problem) {
      toast(problem instanceof Error ? problem.message : 'Could not save permissions', 'error')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <Link
            href="/settings"
            className="mb-4 inline-flex items-center gap-2 text-sm text-foreground/65 transition-colors hover:text-foreground"
          >
            <ArrowLeft size={15} />
            Back to settings
          </Link>
          <SectionHeader
            title="Roles & permissions"
            description="Choose which actions each role can perform. Changes apply on the user's next request."
          />
        </div>

        {error ? (
          <div className="panel">
            <ErrorState
              title="Couldn't load roles"
              description={error}
              onRetry={() => void load()}
            />
          </div>
        ) : loading ? (
          <div className="panel overflow-hidden">
            <div role="status" aria-busy="true">
              <span className="sr-only">Loading roles</span>
              <DataTableSkeleton rows={4} columns={4} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {roles.map((role) => (
              <section key={role._id} className="panel p-6" aria-labelledby={`role-${role._id}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b edge pb-4">
                  <h2
                    id={`role-${role._id}`}
                    className="flex items-center gap-2 text-base font-semibold"
                  >
                    <ShieldCheck size={17} aria-hidden="true" />
                    {role.roleName}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground/60">
                      {(drafts[role._id] ?? []).length} of {actions.length} actions
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      disabled={!isDirty(role) || savingId === role._id}
                      onClick={() => void save(role)}
                      className="brand text-white border edge"
                    >
                      {savingId === role._id ? 'Saving…' : 'Save'}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  {grouped.map(([module, moduleActions]) => (
                    <fieldset key={module}>
                      <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/55">
                        {moduleLabel(module)}
                      </legend>
                      <div className="space-y-1">
                        {moduleActions.map((action) => (
                          <label
                            key={action._id}
                            className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm text-foreground/80 hover:bg-foreground/5"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected(role._id, action._id)}
                              onChange={() => toggle(role._id, action._id)}
                              className="h-4 w-4 accent-[rgb(var(--brand-rgb))]"
                            />
                            <span className="capitalize">{actionLabel(action.actionName)}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
