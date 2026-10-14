'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { fetchCurrentUser } from '@/lib/redux/slices/authSlice'
import { GraduationCap } from 'lucide-react'

export function ProtectedWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/signup']
    const isPublicRoute = publicRoutes.includes(pathname)

    const checkAuth = async () => {
      if (!isAuthenticated) {
        await dispatch(fetchCurrentUser())
      }
      setIsChecking(false)
    }

    checkAuth()
  }, [isAuthenticated, pathname, router, dispatch])

  if (isChecking) {
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

  return <>{children}</>
}
