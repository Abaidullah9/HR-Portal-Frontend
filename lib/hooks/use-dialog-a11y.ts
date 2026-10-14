'use client'

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

interface UseDialogA11yArgs {
  /** Whether the dialog is currently rendered. */
  open: boolean
  /** The dialog surface (the element that should own focus). */
  containerRef: RefObject<HTMLElement | null>
  /** Dismisses the dialog. */
  onClose: () => void
  /** Optional CSS selector for the element that should receive initial focus. */
  initialFocusSelector?: string
}

/**
 * The behaviour every modal in the app needs:
 *
 * - focus moves into the dialog when it opens,
 * - Tab / Shift+Tab cycle inside it instead of escaping to the page behind,
 * - Escape dismisses it,
 * - the page behind cannot scroll while it is open,
 * - focus returns to whatever opened the dialog when it closes.
 */
export function useDialogA11y({
  open,
  containerRef,
  onClose,
  initialFocusSelector,
}: UseDialogA11yArgs) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Capture the trigger and give focus back in the cleanup, so it happens
  // whether the dialog closes or its whole component unmounts. Kept in its own
  // layout effect keyed only on `open`:
  //
  // - layout effects run before every `useEffect`, so a modal whose own effect
  //   moves focus into a field cannot clobber the capture with the field itself;
  // - keying only on `open` means the trap effect below re-running never
  //   re-captures and resets the element we owe focus back to.
  useLayoutEffect(() => {
    if (!open) return
    previousFocusRef.current = (document.activeElement as HTMLElement | null) ?? null

    return () => {
      const previous = previousFocusRef.current
      previousFocusRef.current = null
      if (previous && previous.isConnected) previous.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const container = containerRef.current
    if (!container) return

    const focusable = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))

    const initial =
      (initialFocusSelector
        ? container.querySelector<HTMLElement>(initialFocusSelector)
        : null) ??
      focusable()[0] ??
      container
    initial.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const list = focusable()
      if (list.length === 0) {
        event.preventDefault()
        container.focus()
        return
      }

      const first = list[0]
      const last = list[list.length - 1]
      const active = document.activeElement as HTMLElement | null
      const inside = active !== null && container.contains(active)

      if (event.shiftKey && (!inside || active === first)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (!inside || active === last)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = previousOverflow
    }
    // `onClose` intentionally omitted — see onCloseRef.
  }, [open, containerRef, initialFocusSelector])
}
