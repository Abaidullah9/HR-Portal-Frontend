'use client'

import { LANGUAGES, useI18n, type Language } from '@/lib/i18n'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Notification and timezone blocks are display-only until the backend stores
 * per-user preferences, so those controls render disabled. Language is stored
 * on this device and applied to the navigation shell.
 */
const TIMEZONES = [
  { value: 'UTC-8 (Pacific Time)', label: 'UTC-8 (Pacific Time)' },
  { value: 'UTC-5 (Eastern Time)', label: 'UTC-5 (Eastern Time)' },
  { value: 'UTC (GMT)', label: 'UTC (GMT)' },
]

const NOTIFICATIONS = [
  { title: 'Email Notifications', description: 'Receive email updates' },
  { title: 'Leave Requests', description: 'Get notified about leave requests' },
  { title: 'Payroll Updates', description: 'Get payroll processing notifications' },
]

export function PreferencesPanel() {
  const { language, setLanguage } = useI18n()

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Notifications</h3>
          <div className="space-y-4 overflow-hidden rounded-2xl border edge bg-white/70 p-6 backdrop-blur-md dark:edge dark:surface-85">
            <p className="text-sm text-foreground/65">
              Notification preferences are not stored per user yet, so these controls are inactive.
            </p>
            {NOTIFICATIONS.map((item, index) => (
              <div
                key={item.title}
                className={`flex items-center justify-between px-4 py-3 ${
                  index < NOTIFICATIONS.length - 1 ? 'border-b edge' : ''
                }`}
              >
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-foreground/65">{item.description}</p>
                </div>
                <input
                  type="checkbox"
                  disabled
                  aria-label={item.title}
                  className="h-4 w-4 rounded edge bg-white/80 accent-[rgb(var(--brand-rgb))] dark:bg-white/10"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Preferences</h3>
          <div className="space-y-4 overflow-hidden rounded-2xl border edge bg-white/70 p-6 backdrop-blur-md dark:edge dark:surface-85">
            <div>
              <label htmlFor="pref-language" className="text-sm font-medium text-foreground">
                Language
              </label>
              <Select
                items={LANGUAGES}
                value={language}
                onValueChange={(value) => setLanguage((value ?? 'en') as Language)}
              >
                <SelectTrigger id="pref-language" className="mt-2 h-10 w-full">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-foreground/60">
                Translates the navigation and shell on this device. Page content stays in your
                organization&apos;s working language.
              </p>
            </div>
            <div>
              <label htmlFor="pref-timezone" className="text-sm font-medium text-foreground">
                Time Zone
              </label>
              <Select items={TIMEZONES} defaultValue="UTC-8 (Pacific Time)" disabled>
                <SelectTrigger id="pref-timezone" className="mt-2 h-10 w-full">
                  <SelectValue placeholder="UTC-8 (Pacific Time)" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((zone) => (
                    <SelectItem key={zone.value} value={zone.value}>
                      {zone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-foreground/60">
                The organization timezone is set on the server (ORGANIZATION_TIMEZONE) and applies
                to attendance and leave for everyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
