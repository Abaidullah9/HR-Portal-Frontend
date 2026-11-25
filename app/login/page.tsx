'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { loginStep, verifyMfa, clearAuthError } from '@/lib/redux/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')
  // Set once the password is accepted on a two-factor account.
  const [mfaToken, setMfaToken] = useState('')
  const [code, setCode] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    dispatch(clearAuthError())

    const result = await dispatch(loginStep({ email, password }))
    if (loginStep.fulfilled.match(result)) {
      if ('mfaRequired' in result.payload) {
        setMfaToken(result.payload.mfaToken)
        return
      }
      router.push('/')
    }
  }

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault()
    setLocalError('')
    dispatch(clearAuthError())

    const result = await dispatch(verifyMfa({ mfaToken, code: code.trim() }))
    if (verifyMfa.fulfilled.match(result)) {
      router.push('/')
    }
  }

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setLocalError('')
    dispatch(clearAuthError())
  }

  const displayError = localError || error
  // Seeded logins are a development convenience. A production build must not
  // advertise working credentials on the sign-in page.
  const showDemoCredentials = process.env.NODE_ENV !== 'production'

  return (
    <div className="min-h-screen flex items-center justify-center auth-canvas px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 brand rounded-lg mb-4 shadow-lg shadow-black/20">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 12H9m4 8H8m8 0h-4m4-4h-4m-8-4h4"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">HR Portal</h1>
          <p className="text-muted-foreground">Welcome back to your workspace</p>
        </div>

        {/* Login Form */}
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          {mfaToken ? (
            <form onSubmit={handleVerify} className="space-y-5">
              {displayError && (
                <div
                  role="alert"
                  className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm"
                >
                  {displayError}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app.
              </p>
              <div>
                <label
                  htmlFor="mfa-code"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Authentication code
                </label>
                <Input
                  id="mfa-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full brand text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {loading ? 'Checking…' : 'Verify code'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setMfaToken('')
                  setCode('')
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                Use a different account
              </button>
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {displayError && (
              <div
                role="alert"
                className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm"
              >
                {displayError}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="brand-text text-sm font-medium hover:brightness-110"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full brand text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          )}

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-center text-muted-foreground text-sm">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="brand-text hover:brightness-110 dark:brand-text font-semibold"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials Helper — development only */}
        {showDemoCredentials && (
        <div className="mt-6 bg-card/60 backdrop-blur border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-foreground mb-3">
            Database Seed Demo Credentials (Click to fill):
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemoFill('admin@techcorp.com', 'Password123!')}
              className="rounded border border-border/70 p-2 text-left press transition-colors hover:bg-foreground/5"
            >
              <p className="font-semibold text-foreground">Admin</p>
              <p className="text-muted-foreground truncate">admin@techcorp.com</p>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('hr@techcorp.com', 'Password123!')}
              className="rounded border border-border/70 p-2 text-left press transition-colors hover:bg-foreground/5"
            >
              <p className="font-semibold text-foreground">HR Manager</p>
              <p className="text-muted-foreground truncate">hr@techcorp.com</p>
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
