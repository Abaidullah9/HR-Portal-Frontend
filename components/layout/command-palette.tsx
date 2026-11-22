'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CornerDownLeft, Search } from 'lucide-react'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'
import { useCommandResults, type Command } from '@/lib/hooks/use-command-results'

/**
 * Cmd/Ctrl+K jump-to. Pages come from the same list the sidebar uses, already
 * filtered by what this role may open, and employee matches link to the
 * directory's own search.
 */
export function CommandPalette() {
  const router = useRouter()
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const { results, searching } = useCommandResults(open, query)
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useDialogA11y({
    open,
    containerRef: dialogRef,
    onClose: () => setOpen(false),
    initialFocusSelector: '#command-input',
  })

  useEffect(() => {
    if (open) return
    setQuery('')
    setActive(0)
  }, [open])

  const go = (command: Command | undefined) => {
    if (!command) return
    setOpen(false)
    router.push(command.href)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((index) => Math.min(index + 1, Math.max(results.length - 1, 0)))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => Math.max(index - 1, 0))
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      go(results[active])
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && setOpen(false)}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Jump to"
        className="w-full max-w-lg overflow-hidden rounded-2xl border edge bg-white/95 shadow-2xl shadow-black/20 backdrop-blur-xl dark:surface-95"
      >
        <div className="flex items-center gap-2.5 border-b edge px-4 py-3">
          <Search size={16} className="text-foreground/60" aria-hidden="true" />
          <input
            id="command-input"
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-label="Search pages and people"
            placeholder="Jump to a page or person…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(0)
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground/50 focus:outline-none"
          />
          <kbd className="rounded border edge px-1.5 py-0.5 text-[10px] font-medium text-foreground/60">
            Esc
          </kbd>
        </div>

        <ul id={listId} role="listbox" aria-label="Results" className="max-h-72 overflow-y-auto p-2">
          {results.length === 0 ? (
            <li role="status" className="px-3 py-6 text-center text-sm text-foreground/60">
              {searching ? 'Searching…' : `Nothing matches “${query}”.`}
            </li>
          ) : (
            results.map((command, index) => (
              <li key={command.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === active}
                  onClick={() => go(command)}
                  onMouseEnter={() => setActive(index)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm ${
                    index === active
                      ? 'bg-foreground/5 font-medium text-foreground'
                      : 'text-foreground/80'
                  }`}
                >
                  <span className="wrap-anywhere">{command.label}</span>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-foreground/55">
                    {command.hint}
                    {index === active && <CornerDownLeft size={12} aria-hidden="true" />}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
