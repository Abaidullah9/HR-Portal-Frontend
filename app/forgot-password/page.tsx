'use client'

import { useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ForgotResponse {
  delivered: boolean
  token?: string
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<ForgotResponse | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const response = await apiClient.post<ForgotResponse, { email: string }>(
        '/users/forgot-password',
        { email },
      )
      setResult(response.data ?? { delivered: true })
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Could not send the reset link')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center auth-canvas px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
          <p className="mt-2 text-sm text-foreground/65">
            Enter the email on your account and we&apos;ll send a link to set a new password.
          </p>
        </div>

        <div className="panel p-6">
          {result ? (
            <div className="space-y-4">
              <p role="status" className="rounded-xl border edge p-3 text-sm text-foreground/75">
                {result.delivered
                  ? 'If that email is registered, a reset link has been sent. The link expires in 30 minutes.'
                  : 'This server has no mail provider configured, so no email was sent. Use the link below; it expires in 30 minutes.'}
              </p>
              {result.token && (
                <p className="text-sm text-foreground/65">
                  Mail delivery is not configured in development, so use this link directly:{' '}
                  <Link
                    href={`/reset-password?token=${encodeURIComponent(result.token)}`}
                    className="brand-text font-medium hover:brightness-110"
                  >
                    Set a new password
                  </Link>
                </p>
              )}
              <Link href="/login" className="block text-sm brand-text font-medium">
                Back to sign in
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
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={busy}
                className="w-full brand text-white border edge"
              >
                {busy ? 'Sending…' : 'Send reset link'}
              </Button>
              <Link href="/login" className="block text-center text-sm text-foreground/65">
                Back to sign in
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
