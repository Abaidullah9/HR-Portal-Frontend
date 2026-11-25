'use client'

import { useCallback, useEffect, useState } from 'react'
import { ShieldCheck, ShieldOff } from 'lucide-react'
import { Badge } from '@/components/common/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'

interface ApiResult<T> {
  success: boolean
  message: string
  data?: T
}

const call = async <T,>(path: string, body?: Record<string, unknown>): Promise<ApiResult<T>> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    cache: 'no-store',
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  return response.json()
}

/**
 * Two-factor authentication for the signed-in account. The secret is shown as
 * text rather than a QR image: the QR would need another dependency, and every
 * authenticator app accepts manual entry.
 */
export function SecurityPanel() {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [setup, setSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const result = await call<{ mfaEnabled?: boolean }>('/users/me')
    setEnabled(Boolean(result.data?.mfaEnabled))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const run = async (task: () => Promise<void>) => {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await task()
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const startSetup = () =>
    run(async () => {
      const result = await call<{ secret: string; otpauthUrl: string }>('/users/mfa/setup', {})
      if (!result.success || !result.data) throw new Error(result.message)
      setSetup(result.data)
    })

  const enable = () =>
    run(async () => {
      const result = await call('/users/mfa/enable', { code: code.trim() })
      if (!result.success) throw new Error(result.message)
      setEnabled(true)
      setSetup(null)
      setCode('')
      setMessage('Two-factor authentication is on')
    })

  const disable = () =>
    run(async () => {
      const result = await call('/users/mfa/disable', { password })
      if (!result.success) throw new Error(result.message)
      setEnabled(false)
      setPassword('')
      setMessage('Two-factor authentication is off')
    })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          {enabled ? (
            <ShieldCheck size={18} aria-hidden="true" />
          ) : (
            <ShieldOff size={18} aria-hidden="true" />
          )}
          Security
        </h3>
        <div className="space-y-4 rounded-2xl border edge bg-white/70 p-6 backdrop-blur-md dark:edge dark:surface-85">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">Two-factor authentication</p>
              <p className="text-sm text-foreground/65">
                Require a code from an authenticator app when signing in.
              </p>
            </div>
            <Badge variant={enabled ? 'success' : 'default'}>{enabled ? 'On' : 'Off'}</Badge>
          </div>

          {error && (
            <p role="alert" className="text-sm danger-text">
              {error}
            </p>
          )}
          {message && <p className="text-sm success-text">{message}</p>}

          {!enabled && !setup && (
            <Button type="button" variant="outline" onClick={startSetup} disabled={busy}>
              {busy ? 'Preparing…' : 'Turn on two-factor'}
            </Button>
          )}

          {!enabled && setup && (
            <div className="space-y-3">
              <p className="text-sm text-foreground/75">
                Add this secret to your authenticator app, then enter the current code.
              </p>
              <p className="break-all rounded-lg border edge bg-foreground/[0.04] p-3 font-mono text-xs">
                {setup.secret}
              </p>
              <p className="break-all text-xs text-foreground/55">{setup.otpauthUrl}</p>
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <label htmlFor="mfa-setup-code" className="text-sm font-medium text-foreground">
                    Code
                  </label>
                  <Input
                    id="mfa-setup-code"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    className="mt-1 w-32"
                  />
                </div>
                <Button type="button" onClick={enable} disabled={busy || code.trim().length !== 6}>
                  {busy ? 'Checking…' : 'Confirm'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setSetup(null)} disabled={busy}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {enabled && (
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label htmlFor="mfa-password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <Input
                  id="mfa-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1 w-56"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={disable}
                disabled={busy || !password}
                className="danger-text"
              >
                {busy ? 'Turning off…' : 'Turn off two-factor'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
