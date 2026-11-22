'use client'

import { useEffect, useState } from 'react'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableSkeleton } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/state-panel'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { updateOrganizationSettings } from '@/lib/redux/slices/organizationSlice'

/**
 * Organization profile form. Owns its own copy of the fields so typing does not
 * re-render the rest of the settings page on every keystroke.
 */
export function OrganizationForm() {
  const dispatch = useAppDispatch()
  const { settings, loading } = useAppSelector((state) => state.organization)

  const [orgName, setOrgName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [lateAfter, setLateAfter] = useState('09:15')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (settings) {
      setOrgName(settings.organizationName || '')
      setEmail(settings.email || '')
      setPhone(settings.phone || '')
      setLateAfter(settings.lateAfter || '09:15')
    }
  }, [settings])

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveMessage(null)
    setSaving(true)
    try {
      const result = await dispatch(
        updateOrganizationSettings({
          organizationName: orgName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          lateAfter,
        }),
      )
      if (updateOrganizationSettings.fulfilled.match(result)) {
        setSaveMessage({ ok: true, text: 'Organization settings saved.' })
      } else {
        setSaveMessage({ ok: false, text: result.payload || 'Failed to save settings' })
      }
    } catch {
      setSaveMessage({ ok: false, text: 'An error occurred while saving' })
    } finally {
      setSaving(false)
    }
  }

  if (loading && !settings) {
    return (
      <div className="panel overflow-hidden" role="status" aria-busy="true">
        <span className="sr-only">Loading organization settings</span>
        <DataTableSkeleton rows={3} columns={2} />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="panel">
        <EmptyState
          icon={Building2}
          title="No organization profile yet"
          description="An administrator needs to create the organization profile before these details can be edited."
        />
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSaveOrg}
      className="overflow-hidden rounded-2xl border edge bg-white/70 p-6 shadow-xl shadow-black/5 backdrop-blur-md dark:edge dark:surface-85"
    >
      {saveMessage && (
        <div
          role={saveMessage.ok ? 'status' : 'alert'}
          className={`mb-4 rounded-xl p-3 text-sm backdrop-blur-sm ${
            saveMessage.ok ? 'success-panel' : 'danger-panel'
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="org-name" className="text-sm font-medium text-foreground">
            Organization Name
          </label>
          <Input
            id="org-name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Organization name"
            className="mt-2"
            required
          />
        </div>
        <div>
          <label htmlFor="org-email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="org-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="organization email"
            className="mt-2"
            required
          />
        </div>
        <div>
          <label htmlFor="org-phone" className="text-sm font-medium text-foreground">
            Phone
          </label>
          <Input
            id="org-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <label htmlFor="org-late-after" className="text-sm font-medium text-foreground">
            Late arrival after
          </label>
          <Input
            id="org-late-after"
            type="time"
            value={lateAfter}
            onChange={(e) => setLateAfter(e.target.value)}
            className="mt-2"
          />
          <p className="mt-1 text-xs text-foreground/60">
            Check-ins after this local time count as late on the attendance page.
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button type="submit" disabled={saving} className="brand text-white border edge">
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
        {saving && <span className="text-sm text-foreground/65">Saving changes…</span>}
      </div>
    </form>
  )
}
