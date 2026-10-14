'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMenuNav } from '@/lib/hooks/use-menu-nav'

const STORAGE_KEY = 'hr-palette'

export type PaletteId = 'midnight' | 'indigo' | 'slate' | 'emerald'

interface PaletteOption {
  id: PaletteId
  name: string
  tagline: string
  swatches: [string, string, string, string]
}

export const PALETTES: PaletteOption[] = [
  {
    id: 'midnight',
    name: 'Midnight Navy',
    tagline: 'Corporate & trustworthy',
    swatches: ['#080D1A', '#111827', '#2563EB', '#60A5FA'],
  },
  {
    id: 'indigo',
    name: 'Dark Indigo',
    tagline: 'Modern & vivid',
    swatches: ['#0C0D18', '#1E2034', '#2563EB', '#7C3AED'],
  },
  {
    id: 'slate',
    name: 'White Slate',
    tagline: 'Clean, light workspace',
    swatches: ['#FFFFFF', '#F1F5F9', '#2563EB', '#0F172A'],
  },
  {
    id: 'emerald',
    name: 'Charcoal Emerald',
    tagline: 'Calm & data focused',
    swatches: ['#0A0F0D', '#121A17', '#10B981', '#14B8A6'],
  },
]

/** Applies a palette to <html> and remembers it for the next visit. */
export function applyPalette(id: PaletteId) {
  const root = document.documentElement
  root.setAttribute('data-palette', id)
  if (id === 'slate') {
    root.classList.remove('dark')
  } else {
    root.classList.add('dark')
  }

  // Keep the browser/OS chrome in step with the palette background.
  const bg = PALETTES.find((option) => option.id === id)?.swatches[0]
  if (bg) {
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.setAttribute('content', bg)
    })
  }

  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // Storage can be unavailable (private mode); the palette still applies.
  }
}

export function PaletteSwitcher() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<PaletteId>('midnight')
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as PaletteId | null
      if (stored && PALETTES.some((p) => p.id === stored)) {
        setActive(stored)
      } else {
        setActive('midnight')
      }
    } catch {
      setActive('midnight')
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open])

  const current = PALETTES.find((p) => p.id === active) ?? PALETTES[0]

  // Arrow keys + roving focus inside the colour menu.
  useMenuNav({
    open,
    containerRef: menuRef,
    triggerRef,
    onClose: () => setOpen(false),
    initialFocusSelector: '[data-initial-focus]',
  })

  const select = (id: PaletteId) => {
    setActive(id)
    applyPalette(id)
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Appearance: ${current.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'flex h-10 items-center gap-2 rounded-xl border edge bg-white/50 px-2.5 text-foreground/70 press transition-all duration-200 hover:bg-white/80 hover:text-foreground hover:shadow-md hover:shadow-black/10 dark:surface-50 dark:text-foreground/60',
          open && 'bg-white/80 dark:surface-95',
        )}
      >
        <Palette size={18} />
        <span className="flex items-center gap-0.5" aria-hidden="true">
          {current.swatches.slice(0, 3).map((color) => (
            <span
              key={color}
              className="h-3 w-3 rounded-full ring-1 ring-black/10"
              style={{ backgroundColor: color }}
            />
          ))}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border edge bg-white/90 p-2 shadow-2xl shadow-black/15 backdrop-blur-xl dark:surface-95 dark:shadow-black/60">
          <p
            id="palette-menu-label"
            className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-foreground/65"
          >
            Colour palette
          </p>
          <div ref={menuRef} role="menu" aria-labelledby="palette-menu-label">
            {PALETTES.map((option) => {
              const isActive = option.id === active
              return (
                <button
                  key={option.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  data-initial-focus={isActive || undefined}
                  onClick={() => select(option.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left press-sm transition-colors duration-150',
                    isActive
                      ? 'bg-foreground/5 dark:bg-white/5'
                      : 'hover:bg-foreground/5 dark:hover:bg-white/5',
                  )}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 overflow-hidden rounded-lg ring-1 ring-black/10"
                    aria-hidden="true"
                  >
                    {option.swatches.map((color) => (
                      <span
                        key={color}
                        className="h-full flex-1"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {option.name}
                    </span>
                    <span className="truncate text-xs text-foreground/65">{option.tagline}</span>
                  </span>
                  {isActive && <Check size={16} className="shrink-0 text-primary" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
