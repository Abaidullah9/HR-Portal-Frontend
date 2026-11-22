'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { logoutUser } from '@/lib/redux/slices/authSlice'
import { useMenuNav } from '@/lib/hooks/use-menu-nav'
import { ICON_BUTTON } from './icon-button'

export function AccountMenu({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useMenuNav({
    open,
    containerRef: panelRef,
    triggerRef,
    wrapperRef: containerRef,
    onClose: () => onOpenChange(false),
  })

  const roleName =
    typeof user?.roleId === 'object' && user?.roleId
      ? user.roleId.roleName
      : user?.role || 'Staff'

  const handleLogout = async () => {
    onOpenChange(false)
    await dispatch(logoutUser())
    router.push('/login')
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => onOpenChange(!open)}
        className={cn(ICON_BUTTON, 'text-foreground', open && 'bg-white/80 dark:surface-95')}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full avatar-brand text-xs font-semibold text-white shadow-md shadow-black/20">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-12 z-50 w-64 rounded-2xl border edge bg-white/90 p-2 backdrop-blur-xl shadow-2xl shadow-black/10 dark:surface-95 dark:shadow-black/50"
          role="menu"
          aria-label="Account"
        >
          <div className="min-w-0 rounded-xl border-b edge px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-foreground" title={user?.name}>
              {user?.name}
            </p>
            <p className="truncate text-xs text-foreground/65" title={user?.email}>
              {user?.email}
            </p>
            <p className="mt-1 text-xs text-foreground/60 capitalize">{roleName}</p>
          </div>
          <Link
            href="/settings"
            onClick={() => onOpenChange(false)}
            role="menuitem"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground/70 press-sm transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <Menu size={15} />
            Settings &amp; preferences
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl border border-transparent px-3 py-2.5 text-sm text-foreground/70 press-sm transition-colors hover:danger-panel hover:danger-text dark:hover:danger-text"
            role="menuitem"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
