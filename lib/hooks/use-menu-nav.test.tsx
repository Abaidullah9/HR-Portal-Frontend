import { describe, it, expect } from 'vitest'
import { useRef, useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useMenuNav } from './use-menu-nav'

function Menu({ initialFocusSelector }: { initialFocusSelector?: string }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useMenuNav({
    open,
    containerRef: menuRef,
    triggerRef,
    onClose: () => setOpen(false),
    initialFocusSelector,
  })

  return (
    <div ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        Appearance
      </button>
      {open && (
        <div ref={menuRef} role="menu">
          <button type="button" role="menuitemradio" aria-checked="false">
            Midnight
          </button>
          <button type="button" role="menuitemradio" aria-checked="true" data-initial-focus>
            Indigo
          </button>
          <button type="button" role="menuitemradio" aria-checked="false">
            Slate
          </button>
        </div>
      )}
    </div>
  )
}

const openMenu = () => {
  const trigger = screen.getByRole('button', { name: 'Appearance' })
  trigger.focus()
  fireEvent.click(trigger)
  return trigger
}

const items = () => screen.getAllByRole('menuitemradio')

describe('useMenuNav', () => {
  it('focuses the first item when no initial item is given', () => {
    render(<Menu />)
    openMenu()
    expect(document.activeElement).toBe(items()[0])
  })

  it('focuses the item matched by initialFocusSelector', () => {
    render(<Menu initialFocusSelector="[data-initial-focus]" />)
    openMenu()
    expect(document.activeElement?.textContent).toBe('Indigo')
  })

  it('moves down the list with ArrowDown and wraps at the end', () => {
    render(<Menu />)
    openMenu()
    const [first, second, third] = items()

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' })
    expect(document.activeElement).toBe(second)

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' })
    expect(document.activeElement).toBe(third)

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' })
    expect(document.activeElement).toBe(first)
  })

  it('moves up the list with ArrowUp and wraps at the start', () => {
    render(<Menu />)
    openMenu()
    const all = items()

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowUp' })
    expect(document.activeElement).toBe(all[all.length - 1])
  })

  it('jumps with Home and End', () => {
    render(<Menu />)
    openMenu()
    const all = items()

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'End' })
    expect(document.activeElement).toBe(all[all.length - 1])

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Home' })
    expect(document.activeElement).toBe(all[0])
  })

  it('closes on Tab, prevents the default focus move, and keeps focus on the trigger', () => {
    render(<Menu />)
    const trigger = openMenu()

    const notPrevented = fireEvent.keyDown(screen.getByRole('menu'), { key: 'Tab' })
    // fireEvent returns false when the event's default was prevented.
    expect(notPrevented).toBe(false)
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('keeps focus on the first item across re-renders while open', () => {
    render(<Menu />)
    openMenu()
    const menu = screen.getByRole('menu')
    menu.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))

    expect(document.activeElement).toBe(items()[0])
  })
})

it('never strands focus on body when the menu unmounts', () => {
  function UnmountHarness() {
    const [open, setOpen] = useState(true)
    const menuRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)

    useMenuNav({
      open,
      containerRef: menuRef,
      triggerRef,
      onClose: () => setOpen(false),
    })

    return (
      <>
        <button type="button" ref={triggerRef}>
          Appearance
        </button>
        {open && (
          <div ref={menuRef} role="menu">
            <button type="button" role="menuitemradio">
              Midnight
            </button>
            <button type="button" role="menuitemradio">
              Indigo
            </button>
          </div>
        )}
      </>
    )
  }

  render(<UnmountHarness />)
  const trigger = screen.getByRole('button', { name: 'Appearance' })
  fireEvent.click(trigger)
  fireEvent.keyDown(screen.getByRole('menu'), { key: 'Tab' })

  expect(screen.queryByRole('menu')).toBeNull()
  expect(document.activeElement).not.toBe(document.body)
})
