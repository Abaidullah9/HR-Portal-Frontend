'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch } from '@/lib/redux/store'
import { logout } from '@/lib/redux/slices/authSlice'
import { SESSION_EXPIRED_EVENT } from '@/lib/api/client'

/**
 * An expired cookie used to leave the user on a page whose panels failed one
 * request at a time. The API client announces a 401; this turns it into a clean
 * sign-out and a trip to the login screen.
 */
export function SessionGuard() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  useEffect(() => {
    const handleExpired = () => {
      dispatch(logout())
      router.replace('/login')
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired)
  }, [dispatch, router])

  return null
}
