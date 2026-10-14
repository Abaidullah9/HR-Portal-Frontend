'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { SectionHeader } from '@/components/common/section-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import {
  fetchOrganizationSettings,
  updateOrganizationSettings,
} from '@/lib/redux/slices/organizationSlice'

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const { settings, loading, error } = useAppSelector((state) => state.organization)

  const [orgName, setOrgName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{
    ok: boolean
    text: string
  } | null>(null)

  useEffect(() => {
    dispatch(fetchOrganizationSettings())
  }, [dispatch])

  useEffect(() => {
    if (settings) {
      setOrgName(settings.organizationName || '')
      setEmail(settings.email || '')
      setPhone(settings.phone || '')
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
        }),
      )
      if (updateOrganizationSettings.fulfilled.match(result)) {
        setSaveMessage({ ok: true, text: 'Organization settings saved.' })
      } else {
        setSaveMessage({
          ok: false,
          text: result.payload || 'Failed to save settings',
        })
      }
    } catch {
      setSaveMessage({
        ok: false,
        text: 'An error occurred while saving',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-10">
        <SectionHeader title="Settings" description="Manage your organization and preferences" />

        {error && (
          <div className="rounded-2xl border danger-panel p-6 text-sm backdrop-blur-md">
            {error}
          </div>
        )}

        {/* Organization settings */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Organization</h3>
            {loading && !settings ? (
              <div className="rounded-2xl border edge bg-white/70 p-6 text-sm text-foreground/65 backdrop-blur-md dark:edge dark:surface-85">
                Loading organization settings…
              </div>
            ) : !settings ? (
              <div className="rounded-2xl border edge bg-white/70 p-6 text-sm text-foreground/65 backdrop-blur-md dark:edge dark:surface-85">
                No organization settings found. Settings can be created by an administrator.
              </div>
            ) : (
              <form
                onSubmit={handleSaveOrg}
                className="overflow-hidden rounded-2xl border edge bg-white/70 p-6 shadow-xl shadow-black/5 backdrop-blur-md dark:edge dark:surface-85"
              >
                {saveMessage && (
                  <div
                    className={`mb-4 rounded-xl p-3 text-sm backdrop-blur-sm ${
                      saveMessage.ok
                        ? 'border  success-panel    '
                        : 'border  danger-panel    '
                    }`}
                  >
                    {saveMessage.text}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Organization Name</label>
                    <Input
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Organization name"
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="organization email"
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Phone</label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <Button type="submit" disabled={saving} className="brand text-white border edge">
                    {saving ? 'Saving…' : 'Save Changes'}
                  </Button>
                  {saving && <span className="text-sm text-foreground/65">Saving changes…</span>}
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Notification settings — display only until backend */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Notifications</h3>
            <div className="space-y-4 overflow-hidden rounded-2xl border edge bg-white/70 p-6 backdrop-blur-md dark:edge dark:surface-85">
              <div className="flex items-center justify-between px-4 py-3 border-b edge">
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-sm text-foreground/65">Receive email updates</p>
                </div>
                <input
                  type="checkbox"
                  disabled
                  className="h-4 w-4 rounded edge bg-white/80 accent-[rgb(var(--brand-rgb))] dark:bg-white/10"
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b edge">
                <div>
                  <p className="font-medium text-foreground">Leave Requests</p>
                  <p className="text-sm text-foreground/65">Get notified about leave requests</p>
                </div>
                <input
                  type="checkbox"
                  disabled
                  className="h-4 w-4 rounded edge bg-white/80 accent-[rgb(var(--brand-rgb))] dark:bg-white/10"
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="font-medium text-foreground">Payroll Updates</p>
                  <p className="text-sm text-foreground/65">Get payroll processing notifications</p>
                </div>
                <input
                  type="checkbox"
                  disabled
                  className="h-4 w-4 rounded edge bg-white/80 accent-[rgb(var(--brand-rgb))] dark:bg-white/10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences — display only until preference storage */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Preferences</h3>
            <div className="space-y-4 overflow-hidden rounded-2xl border edge bg-white/70 p-6 backdrop-blur-md dark:edge dark:surface-85">
              <div>
                <label className="text-sm font-medium text-foreground">Language</label>
                <select
                  disabled
                  className="mt-2 w-full h-10 rounded-xl border edge bg-white/80 px-3 text-sm text-foreground shadow-sm backdrop-blur-md dark:edge dark:surface-70"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Time Zone</label>
                <select
                  disabled
                  className="mt-2 w-full h-10 rounded-xl border edge bg-white/80 px-3 text-sm text-foreground shadow-sm backdrop-blur-md dark:edge dark:surface-70"
                >
                  <option>UTC-8 (Pacific Time)</option>
                  <option>UTC-5 (Eastern Time)</option>
                  <option>UTC (GMT)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
