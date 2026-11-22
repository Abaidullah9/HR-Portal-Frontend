'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/lib/redux/store'
import { canView } from '@/lib/auth/roles'
import { GraduationCap } from 'lucide-react'
import { navItems, SidebarLink } from './nav-item'

export function Sidebar({
  open = true,
  onOpenChange,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const pathname = usePathname()
  const { user } = useAppSelector((state) => state.auth)

  // Escape dismisses the mobile drawer, matching the menus and dialogs. On
  // desktop the rail is not dismissible, so Escape is left alone there.
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (!window.matchMedia('(max-width: 767px)').matches) return
      onOpenChange?.(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  const initials = (user?.name || 'U')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const roleName =
    typeof user?.roleId === 'object' && user?.roleId !== null
      ? user.roleId.roleName
      : user?.role || 'Staff'

  const close = () => onOpenChange?.(false)

  // Only destinations this role can actually read: every list route is behind
  // authorize("read_X"), so an unusable link would just answer 403.
  const visibleItems = navItems.filter((item) => !item.module || canView(user, item.module))

  return (
    <>
      {/* Mobile backdrop — only covers the page while the drawer is open */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r transition-transform duration-300',
          'bg-white/70 dark:surface-80 backdrop-blur-xl',
          'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-32 before:origin-left before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:content-[""] before:pointer-events-none md:before:opacity-60 dark:before:via-black/10',
          'after:absolute after:right-0 after:top-0 after:bottom-0 after:w-8 after:origin-right after:bg-gradient-to-l after:from-white/30 after:to-transparent after:content-[""] after:pointer-events-none',
          'sidebar-glow',
          'md:relative md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="flex h-20 items-center justify-between border-b edge px-4">
          <Link
            href="/"
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2',
              'bg-white/40 dark:bg-white/5 border edge backdrop-blur-md',
              'press-sm transition-transform duration-200 hover:scale-[1.02]',
            )}
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg avatar-brand shadow-md shadow-black/20">
              <span className="text-white font-bold text-sm">HR</span>
              <span className="absolute -right-0.5 -top-0.5 rounded-full surface-solid p-0.5">
                <GraduationCap size={8} className="text-foreground/65" />
              </span>
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              HR Portal
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-4">
          {visibleItems.map((item) => (
            <SidebarLink key={item.href} item={item} isActive={pathname === item.href} />
          ))}
        </nav>

        {/* User profile chip — links through to account settings. */}
        <div className="border-t edge p-3">
          <Link
            href="/settings"
            onClick={close}
            className={cn(
              'flex items-center gap-3 rounded-xl border edge px-3 py-2.5 backdrop-blur-sm',
              'press-sm bg-white/30 dark:bg-white/5 transition-all duration-200 hover:bg-white/40 dark:hover:bg-white/10',
            )}
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full avatar-brand text-sm font-semibold text-white shadow-md shadow-black/20">
              {initials}
              <span className="absolute -right-0.5 -top-0.5 rounded-full surface-solid p-0.5">
                <GraduationCap size={8} className="text-foreground/65" />
              </span>
            </div>
            <div className="flex min-w-0 flex-col">
              {/* Ellipsised in the rail; title exposes the full value. */}
              <span className="truncate text-sm font-semibold text-foreground" title={user?.name || 'Guest'}>
                {user?.name || 'Guest'}
              </span>
              <span className="truncate text-xs text-foreground/60" title={roleName}>
                {roleName}
              </span>
            </div>
          </Link>
        </div>
      </aside>
    </>
  )
}
