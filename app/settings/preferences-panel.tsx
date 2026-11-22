'use client'

import { LANGUAGES, useI18n, type Language } from '@/lib/i18n'

/**
 * Notification and timezone blocks are display-only until the backend stores
 * per-user preferences, so those controls render disabled. Language is stored
 * on this device and applied to the navigation shell.
 */
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
              <select
                id="pref-language"
                value={language}
                onChange={(event) => setLanguage(event.target.value as Language)}
                className="mt-2 w-full h-10 rounded-xl border edge bg-white/80 px-3 text-sm text-foreground shadow-sm backdrop-blur-md dark:edge dark:surface-70"
              >
                {LANGUAGES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-foreground/60">
                Translates the navigation and shell on this device. Page content stays in your
                organization&apos;s working language.
              </p>
            </div>
            <div>
              <label htmlFor="pref-timezone" className="text-sm font-medium text-foreground">
                Time Zone
              </label>
              <select
                id="pref-timezone"
                disabled
                className="mt-2 w-full h-10 rounded-xl border edge bg-white/80 px-3 text-sm text-foreground shadow-sm backdrop-blur-md dark:edge dark:surface-70"
              >
                <option>UTC-8 (Pacific Time)</option>
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC (GMT)</option>
              </select>
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
