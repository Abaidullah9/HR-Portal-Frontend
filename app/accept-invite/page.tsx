'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { GraduationCap, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { acceptInvite } from '@/lib/api/account'

function AcceptInviteForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Choose a password with at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('The two passwords do not match')
      return
    }

    setLoading(true)
    try {
      await acceptInvite(token, password)
      setDone(true)
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'This invite could not be accepted')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center auth-canvas px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl brand shadow-xl shadow-black/20 mb-5">
            <GraduationCap size={32} className="text-white" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Set your password</h1>
          <p className="text-foreground/60">
            Your account was created by HR. Choose a password to activate it.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border edge bg-white/80 p-8 shadow-2xl shadow-black/5 backdrop-blur-xl dark:edge dark:surface-85">
          {!token ? (
            <div role="alert" className="space-y-4 text-sm">
              <p className="font-medium">This link is missing its invite token.</p>
              <p className="text-foreground/65">
                Open the link from your invite email exactly as sent, or ask HR to send a new invite.
              </p>
              <Link
                href="/login"
                className="inline-flex rounded-lg brand px-4 py-2 text-sm font-medium text-white"
              >
                Go to sign in
              </Link>
            </div>
          ) : done ? (
            <div role="status" className="space-y-4 text-sm">
              <p className="flex items-center gap-2 font-medium">
                <ShieldCheck size={18} aria-hidden="true" /> Password set
              </p>
              <p className="text-foreground/65">You can sign in with your work email and new password.</p>
              <Link
                href="/login"
                className="inline-flex rounded-lg brand px-4 py-2 text-sm font-medium text-white"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              {error && (
                <div role="alert" className="rounded-xl border danger-panel p-3 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-foreground mb-2">
                  New password
                </label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <p className="mt-1 text-xs text-foreground/60">At least 8 characters.</p>
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-2">
                  Confirm password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full brand text-white border edge">
                {loading ? 'Activating…' : 'Activate account'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// useSearchParams needs a Suspense boundary on a statically rendered route.
export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInviteForm />
    </Suspense>
  )
}
