'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { fetchCurrentUser } from '@/lib/redux/slices/authSlice'
import { roleNameOf } from '@/lib/auth/roles'
import { GraduationCap } from 'lucide-react'
import { SessionGuard } from './session-guard'

// Auth screens: an invited or locked-out person has no session yet, so probing
// /users/me here would only 401 and leave them on the loading screen.
const PUBLIC_ROUTES = ['/login', '/signup', '/accept-invite', '/forgot-password', '/reset-password']

export function ProtectedWrapper({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAppSelector((state) => state.auth)
  const isPublic = PUBLIC_ROUTES.includes(pathname)

  const [checked, setChecked] = useState(false)
  const refreshedFor = useRef<string | null>(null)

  // Restore the session once per page load. Public routes skip the probe: it
  // would only 401 and delay the login form.
  useEffect(() => {
    if (isPublic) {
      setChecked(true)
      return
    }
    // StrictMode runs this effect twice in development (setup → cleanup →
    // setup). Each run must own its probe, otherwise the cleanup cancels the
    // only check and the gate stays on "Verifying session…" forever.
    let active = true
    const checkAuth = async () => {
      await dispatch(fetchCurrentUser())
      if (active) setChecked(true)
    }

    void checkAuth()
    return () => {
      active = false
    }
  }, [dispatch, isPublic])

  // Logging in does not remount this layout, and the login payload carries a
  // bare roleId, so gating would stay closed until a reload. Refresh once per
  // user to resolve the role.
  useEffect(() => {
    const userId = user?._id
    if (!userId || roleNameOf(user)) return
    if (refreshedFor.current === userId) return
    refreshedFor.current = userId
    void dispatch(fetchCurrentUser())
  }, [user, dispatch])

  // No session and not on a public page: send them to sign in rather than
  // rendering panels that will fail every request.
  useEffect(() => {
    if (isPublic || !checked) return
    if (!user) router.replace('/login')
  }, [checked, isPublic, user, router])

  if (!isPublic && (!checked || !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4 rounded-2xl border edge surface-70 px-10 py-8 text-center shadow-xl shadow-black/5 backdrop-blur-xl dark:surface-85">
          <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl avatar-brand shadow-lg shadow-black/20">
            <GraduationCap size={26} className="text-white" strokeWidth={2} />
            <span className="absolute inset-0 animate-ping rounded-2xl border border-white/30" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">HR Portal</p>
            <p className="mt-1 flex items-center justify-center gap-2 text-xs text-foreground/65">
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-[rgb(var(--brand-rgb))]"
                aria-hidden="true"
              />
              Verifying session…
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <SessionGuard />
      {children}
    </>
  )
}
