'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PaletteSwitcher } from '@/components/layout/palette-switcher'
import { NotificationsMenu } from '@/components/layout/notifications-menu'
import { AccountMenu } from '@/components/layout/account-menu'
import { ICON_BUTTON } from '@/components/layout/icon-button'

type HeaderMenu = 'notifications' | 'account'

export function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const router = useRouter()
  // Only one header menu is ever open: this is state shared between two
  // siblings, so it is lifted here rather than left to event ordering.
  const [openMenu, setOpenMenu] = useState<HeaderMenu | null>(null)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // The kbd hint advertises "/", so implement it: focus the search field from
  // anywhere except while the user is already typing in a control.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (
        target?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT'
      ) {
        return
      }
      event.preventDefault()
      searchRef.current?.focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    router.push(`/employees?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b edge surface-70 px-6 backdrop-blur-xl shadow-sm shadow-black/5 dark:surface-75">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation"
            className={cn(ICON_BUTTON, 'shrink-0 md:hidden')}
          >
            <Menu size={18} />
          </button>
        )}

        {/* w-0 + flex-1, not w-full: a percentage width still adds the field's
            intrinsic width (~322px) to the header's min-content, which forced
            the page to 606px at 320px. */}
        <form
          role="search"
          onSubmit={handleSearch}
          className="relative flex w-0 min-w-0 max-w-md flex-1 items-center rounded-xl border edge bg-white/50 px-3 backdrop-blur-md shadow-sm shadow-black/5 transition-shadow focus-within:border-brand focus-within:ring-2 focus-within:ring-brand max-[399px]:hidden dark:surface-40"
        >
          <Search
            size={18}
            className="shrink-0 text-foreground/65 transition-colors hover:text-foreground/80"
          />
          {/* A placeholder is not a label, so the field carries its own
              accessible name. size={1} caps the input's intrinsic width — the
              default size=20 floors the field at ~278px, which min-w-0 cannot
              override. */}
          <input
            ref={searchRef}
            type="search"
            size={1}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search employees"
            placeholder="Search employees by name, email, department..."
            className="w-full min-w-0 bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none pointer-coarse:min-h-11 md:pl-3"
          />
          <kbd
            aria-hidden="true"
            className="hidden rounded-lg border edge bg-foreground/5 px-2 py-0.5 text-xs font-medium text-muted-foreground backdrop-blur-sm select-none md:inline-flex"
          >
            /
          </kbd>
        </form>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <NotificationsMenu
          open={openMenu === 'notifications'}
          onOpenChange={(open) => setOpenMenu(open ? 'notifications' : null)}
        />
        <PaletteSwitcher />
        <AccountMenu
          open={openMenu === 'account'}
          onOpenChange={(open) => setOpenMenu(open ? 'account' : null)}
        />
      </div>
    </header>
  )
}
