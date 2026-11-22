'use client'

import { useEffect } from 'react'

/**
 * Registers the offline shell in production only: a service worker in front of
 * `next dev` would serve stale bundles and hide hot reload.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    const register = () => {
      void navigator.serviceWorker.register('/sw.js').catch(() => {
        // Offline support is an enhancement; failing to register is not fatal.
      })
    }

    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })

    return () => window.removeEventListener('load', register)
  }, [])

  return null
}
