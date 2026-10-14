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
  /** Dismisses the panel. */
  onClose: () => void
  /** Optional selector for the item that should take focus first (e.g. `:checked`). */
  initialFocusSelector?: string
}

/**
 * Keyboard behaviour shared by the header dropdowns and the palette picker.
 *
 * - Opening lands focus on the first item, so the panel is immediately usable.
 * - ArrowUp/ArrowDown/Home/End move between items (roving focus).
 * - Escape and Tab dismiss the panel and hand focus back to the trigger, so
 *   keyboard users are never stranded on `<body>` after the panel unmounts.
 *
 * Escape/Tab only ever *close*: the outside-click dismissal lives with the
 * caller, which is the only place that knows which element opened the panel.
 */
export function useMenuNav({
  open,
  containerRef,
  triggerRef,
  onClose,
  initialFocusSelector,
}: UseMenuNavArgs) {
  // Held in a ref so re-rendering the panel (hover state, new data) does not
  // restart the effect and yank focus back onto the first item.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

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

    container.addEventListener('keydown', onKeyDown)
    return () => container.removeEventListener('keydown', onKeyDown)
    // `onClose` intentionally omitted — see onCloseRef.
  }, [open, containerRef, triggerRef, initialFocusSelector])
}
