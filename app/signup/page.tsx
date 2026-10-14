'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { registerUser, clearAuthError } from '@/lib/redux/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GraduationCap } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.auth)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    dispatch(clearAuthError())

    const result = await dispatch(registerUser({ name, email, password }))
    if (registerUser.fulfilled.match(result)) {
      router.push('/')
    }
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen flex items-center justify-center auth-canvas px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl brand shadow-xl shadow-black/20 mb-5">
            <GraduationCap size={32} className="text-white" strokeWidth={2} />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full surface-solid p-0.5">
              <GraduationCap size={10} className="text-foreground/65" />
            </span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-foreground/60">Join your HR workspace today</p>
        </div>

        {/* Signup Form */}
        <div className="overflow-hidden rounded-2xl border edge bg-white/80 p-8 shadow-2xl shadow-black/5 backdrop-blur-xl dark:edge dark:surface-85">
          <form onSubmit={handleSubmit} className="space-y-5">
            {displayError && (
              <div className="rounded-xl border danger-panel p-3 text-sm backdrop-blur-sm">
                {displayError}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
            </div>

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
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full brand text-white border edge"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t edge">
            <p className="text-center text-sm text-foreground/60">
              Already have an account?{' '}
              <Link
                href="/login"
                className="brand-text font-semibold hover:brightness-110 dark:brand-text"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials helper */}
        <div className="mt-6 overflow-hidden rounded-2xl border edge bg-white/50 p-4 shadow-lg shadow-black/5 backdrop-blur-md dark:edge dark:surface-50">
          <p className="text-xs font-semibold text-foreground mb-3">
            Demo Credentials (Click to fill):
          </p>
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setName('Admin User')
                setEmail('admin@techcorp.com')
                setPassword('Password123!')
                setLocalError('')
                dispatch(clearAuthError())
              }}
              className="flex items-start gap-3 rounded-xl border edge bg-white/60 px-3 py-2.5 text-left transition-colors hover:bg-white hover:text-foreground hover:shadow-md dark:edge dark:surface-50 dark:hover:bg-white/5"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg avatar-brand text-white text-[10px] font-semibold shadow-sm">
                AD
              </span>
              <div>
                <p className="font-semibold text-foreground">Admin</p>
                <p className="text-foreground/65 truncate">admin@techcorp.com</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setName('HR Manager')
                setEmail('hr@techcorp.com')
                setPassword('Password123!')
                setLocalError('')
                dispatch(clearAuthError())
              }}
              className="flex items-start gap-3 rounded-xl border edge bg-white/60 px-3 py-2.5 text-left transition-colors hover:bg-white hover:text-foreground hover:shadow-md dark:edge dark:surface-50 dark:hover:bg-white/5"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg avatar-brand text-white text-[10px] font-semibold shadow-sm">
                HR
              </span>
              <div>
                <p className="font-semibold text-foreground">HR Manager</p>
                <p className="text-foreground/65 truncate">hr@techcorp.com</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
