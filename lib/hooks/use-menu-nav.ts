'use client'

import { useEffect, useRef, type RefObject } from 'react'

/** The items that participate in roving focus inside a menu. */
const ITEM_SELECTOR = '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]'

interface UseMenuNavArgs {
  /** Whether the floating panel is currently rendered. */
  open: boolean
  /** The panel that owns the menu items. */
  containerRef: RefObject<HTMLElement | null>
  /** The control that opened the panel — focus returns here on Escape/Tab. */
  triggerRef: RefObject<HTMLElement | null>
  /** Wraps the trigger and the panel; a click outside it dismisses the panel. */
  wrapperRef: RefObject<HTMLElement | null>
  /** Dismisses the panel. */
  onClose: () => void
  /** Optional selector for the item that should take focus first (e.g. `:checked`). */
  initialFocusSelector?: string
}

/**
 * Behaviour shared by the header dropdowns and the palette picker.
 *
 * - Opening lands focus on the first item, so the panel is immediately usable.
 * - ArrowUp/ArrowDown/Home/End move between items (roving focus).
 * - Escape, Tab and a click outside the wrapper dismiss the panel and hand
 *   focus back to the trigger, so keyboard users are never stranded on
 *   `<body>` after the panel unmounts.
 */
export function useMenuNav({
  open,
  containerRef,
  triggerRef,
  wrapperRef,
  onClose,
  initialFocusSelector,
}: UseMenuNavArgs) {
  // Held in a ref so re-rendering the panel (hover state, new data) does not
  // restart the effect and yank focus back onto the first item.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const container = containerRef.current
    if (!container) return

    const items = () => Array.from(container.querySelectorAll<HTMLElement>(ITEM_SELECTOR))

    const initial =
      (initialFocusSelector
        ? container.querySelector<HTMLElement>(initialFocusSelector)
        : null) ?? items()[0]
    initial?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      const list = items()
      if (list.length === 0) return

      const currentIndex = list.indexOf(document.activeElement as HTMLElement)

      if (event.key === 'Tab') {
        // Prevent the browser's own Tab move: without this, focus() lands on
        // the trigger and then the default Tab immediately skips past it.
        event.preventDefault()
        onCloseRef.current()
        triggerRef.current?.focus()
        return
      }

      let nextIndex: number
      switch (event.key) {
        case 'ArrowDown':
          nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % list.length
          break
        case 'ArrowUp':
          nextIndex =
            currentIndex < 0 ? list.length - 1 : (currentIndex - 1 + list.length) % list.length
          break
        case 'Home':
          nextIndex = 0
          break
        case 'End':
          nextIndex = list.length - 1
          break
        default:
          return
      }

      event.preventDefault()
      list[nextIndex]?.focus()
    }

    // Escape and outside clicks go on the document: focus can sit outside the
    // panel (after clicking a non-focusable spot inside it) and still close.
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      onCloseRef.current()
      triggerRef.current?.focus()
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) onCloseRef.current()
    }

    container.addEventListener('keydown', onKeyDown)
    document.addEventListener('keydown', onEscape)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      container.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keydown', onEscape)
      document.removeEventListener('mousedown', onPointerDown)
    }
    // `onClose` intentionally omitted — see onCloseRef.
  }, [open, containerRef, triggerRef, wrapperRef, initialFocusSelector])
}
