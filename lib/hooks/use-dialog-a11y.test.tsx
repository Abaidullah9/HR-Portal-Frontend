import { describe, it, expect, vi } from 'vitest'
import { useEffect, useRef, useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useDialogA11y } from './use-dialog-a11y'

/**
 * A dialog that behaves like the real ones: it focuses a field in its own
 * passive effect (declared *before* the hook), which is exactly the situation
 * that used to clobber the element focus should be restored to.
 */
function Dialog({
  open,
  onClose,
  stealsFocusOnOpen = true,
}: {
  open: boolean
  onClose: () => void
  stealsFocusOnOpen?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open && stealsFocusOnOpen) fieldRef.current?.focus()
  }, [open, stealsFocusOnOpen])

  useDialogA11y({ open, containerRef, onClose, initialFocusSelector: '#name' })

  if (!open) return null

  return (
    <div ref={containerRef} role="dialog" aria-modal="true" tabIndex={-1}>
      <button type="button" aria-label="Close dialog" onClick={onClose}>
        x
      </button>
      <input id="name" ref={fieldRef} />
      <button type="button">Save</button>
    </div>
  )
}

function Harness({ stealFocus = true }: { stealFocus?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        Post a Job
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} stealsFocusOnOpen={stealFocus} />
    </div>
  )
}

const openDialog = () => {
  const trigger = screen.getByRole('button', { name: 'Post a Job' })
  trigger.focus()
  fireEvent.click(trigger)
  return trigger
}

describe('useDialogA11y', () => {
  it('moves focus into the dialog when it opens', () => {
    render(<Harness />)
    openDialog()
    expect(document.activeElement).toBe(screen.getByRole('dialog').querySelector('#name'))
  })

  it('wraps Tab from the last element back to the first', () => {
    render(<Harness />)
    openDialog()
    const dialog = screen.getByRole('dialog')
    const first = screen.getAllByRole('button')[1] // "Close dialog"
    const last = screen.getByRole('button', { name: 'Save' })

    last.focus()
    fireEvent.keyDown(dialog, { key: 'Tab' })
    expect(document.activeElement).toBe(first)
  })

  it('wraps Shift+Tab from the first element to the last', () => {
    render(<Harness />)
    openDialog()
    const dialog = screen.getByRole('dialog')
    const first = screen.getAllByRole('button')[1]
    const last = screen.getByRole('button', { name: 'Save' })

    first.focus()
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })

  it('pulls focus back inside if Tab is pressed from outside the dialog', () => {
    render(<Harness />)
    openDialog()
    const dialog = screen.getByRole('dialog')
    const first = screen.getAllByRole('button')[1]

    screen.getByRole('button', { name: 'Post a Job' }).focus()
    fireEvent.keyDown(dialog, { key: 'Tab' })
    expect(document.activeElement).toBe(first)
  })

  it('calls onClose on Escape', () => {
    const onClose = vi.fn()
    render(<Dialog open onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('locks page scroll while open and restores it after', () => {
    const { rerender } = render(<Dialog open onClose={() => {}} />)
    expect(document.body.style.overflow).toBe('hidden')

    rerender(<Dialog open={false} onClose={() => {}} />)
    expect(document.body.style.overflow).toBe('')
  })

  it('returns focus to the trigger when the dialog closes', () => {
    render(<Harness />)
    const trigger = openDialog()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('returns focus to the trigger even when the dialog steals focus for a field', () => {
    render(<Harness stealFocus />)
    const trigger = openDialog()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.activeElement).toBe(trigger)
  })

  it('returns focus to the trigger when the whole dialog unmounts', () => {
    function UnmountHarness() {
      const [mounted, setMounted] = useState(false)
      return (
        <div>
          <button type="button" onClick={() => setMounted(true)}>
            Post a Job
          </button>
          {mounted && <Dialog open onClose={() => setMounted(false)} />}
        </div>
      )
    }

    render(<UnmountHarness />)
    const trigger = screen.getByRole('button', { name: 'Post a Job' })
    trigger.focus()
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
})
