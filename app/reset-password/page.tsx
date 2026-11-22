'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ResetPasswordPage() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Read the token from the address bar rather than useSearchParams, which
  // would otherwise require a Suspense boundary around the whole page.
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('token') ?? ''
    setToken(value)
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!token) {
      setError('This page needs the link from your reset email')
      return
    }
    if (password.length < 6) {
      setError('Use at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('The two passwords do not match')
      return
    }

    setBusy(true)
    try {
      await apiClient.post<null, { token: string; password: string }>(
        '/users/reset-password',
        { token, password },
      )
      setDone(true)
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not reset the password')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center auth-canvas px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Set a new password</h1>
          <p className="mt-2 text-sm text-foreground/65">
            Choose a password you have not used before.
          </p>
        </div>

        <div className="panel p-6">
          {done ? (
            <div className="space-y-4">
              <p role="status" className="rounded-xl border edge p-3 text-sm text-foreground/75">
                Your password has been updated. Sign in with the new password.
              </p>
              <Link
                href="/login"
                className="inline-flex brand text-white border edge rounded-lg px-4 py-2 text-sm font-medium"
              >
                Go to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && (
                <div role="alert" className="rounded-xl border danger-panel p-3 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                  New password
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="confirm" className="mb-2 block text-sm font-medium text-foreground">
                  Confirm password
                </label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={busy}
                className="w-full brand text-white border edge"
              >
                {busy ? 'Saving…' : 'Set new password'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
