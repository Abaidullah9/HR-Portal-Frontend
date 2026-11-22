'use client'

import { useCallback, useContext, createContext, useMemo, useState } from 'react'

type Tone = 'success' | 'error'
type ToastFn = (text: string, tone?: Tone) => void

interface ToastMessage {
  id: number
  text: string
  tone: Tone
}

const ToastContext = createContext<ToastFn | null>(null)

/**
 * One polite live region for mutation feedback. Rendered once inside the app
 * layout, so "approved", "paid" and "created" are announced and visible wherever
 * the action happened instead of leaving the click silent.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  const toast = useCallback<ToastFn>((text, tone = 'success') => {
    const id = Date.now() + Math.random()
    setMessages((prev) => [...prev, { id, text, tone }])
    window.setTimeout(() => {
      setMessages((prev) => prev.filter((message) => message.id !== id))
    }, 5000)
  }, [])

  const value = useMemo(() => toast, [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`pointer-events-auto w-full max-w-xs rounded-xl border px-4 py-3 text-sm shadow-lg shadow-black/10 backdrop-blur-md ${
              message.tone === 'error' ? 'danger-panel' : 'success-panel'
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

/** Outside a provider this is a no-op, so components stay testable in isolation. */
export function useToast(): ToastFn {
  return useContext(ToastContext) ?? noop
}

const noop: ToastFn = () => {}
