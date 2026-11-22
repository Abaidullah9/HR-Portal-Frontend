'use client'

import Link from 'next/link'
import { GraduationCap, Mail } from 'lucide-react'

/**
 * Accounts are created by invitation only: HR adds the employee (or imports a
 * CSV), the API issues a one-time token and the person activates it through
 * /accept-invite. Public self-registration would let anyone into the tenant.
 */
export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center auth-canvas px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl brand shadow-xl shadow-black/20 mb-5">
            <GraduationCap size={32} className="text-white" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Accounts are by invitation</h1>
          <p className="text-foreground/60">
            HR creates your account and emails a link to set your password.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border edge bg-white/80 p-8 shadow-2xl shadow-black/5 backdrop-blur-xl dark:edge dark:surface-85">
          <div className="flex items-start gap-3">
            <span className="brand-tile flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <Mail size={20} aria-hidden="true" />
            </span>
            <div className="text-sm text-foreground/70">
              <p className="font-medium text-foreground">Already invited?</p>
              <p className="mt-1">
                Open the link in your invite email, or paste it into the address bar, to choose a
                password. Ask HR to resend it if it expired.
              </p>
            </div>
          </div>

          <div className="mt-6 border-t edge pt-6">
            <p className="text-center text-sm text-foreground/60">
              Have an account already?{' '}
              <Link href="/login" className="brand-text font-semibold hover:brightness-110">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
