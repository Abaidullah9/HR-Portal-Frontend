'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Search, LogOut, Menu, CheckCheck, CheckCircle2, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/lib/redux/store'
import { logoutUser } from '@/lib/redux/slices/authSlice'
import { fetchLeaveRequests } from '@/lib/redux/slices/leaveSlice'
import { PaletteSwitcher } from '@/components/layout/palette-switcher'
import { useMenuNav } from '@/lib/hooks/use-menu-nav'

const ICON_BUTTON =
  'relative flex h-10 w-10 items-center justify-center rounded-xl border edge bg-white/50 text-foreground/70 press transition-all duration-200 hover:bg-white/80 hover:text-foreground hover:shadow-md hover:shadow-black/10 dark:surface-50 dark:text-foreground/60'

interface NotificationItem {
  id: string
  title: string
  detail: string
  href: string
  kind: 'leave' | 'joined'
}

export function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { requests: leaveRequests } = useAppSelector((state) => state.leaves)
  const { employees } = useAppSelector((state) => state.employee)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [readIds, setReadIds] = useState<string[]>([])
  const menusRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLButtonElement>(null)
  const accountRef = useRef<HTMLButtonElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Pending leave requests are the one queue that needs a human decision.
  useEffect(() => {
    dispatch(fetchLeaveRequests())
  }, [dispatch])

  const notifications: NotificationItem[] = useMemo(() => {
    const pending = leaveRequests
      .filter((request) => request.leaveStatus === 'pending')
      .slice(0, 4)
      .map<NotificationItem>((request) => ({
        id: request._id,
        title: `${
          typeof request.employeeId === 'object' && request.employeeId !== null
            ? request.employeeId.name
            : 'An employee'
        } requested ${request.leaveType} leave`,
        detail: `${new Date(request.fromDate).toLocaleDateString()} → ${new Date(
          request.toDate,
        ).toLocaleDateString()}`,
        href: '/leaves',
        kind: 'leave',
      }))

    const joined = employees
      .filter((employee) => employee.joiningDate)
      .slice(-2)
      .reverse()
      .map<NotificationItem>((employee) => ({
        id: `emp-${employee._id}`,
        title: `${employee.name} joined as ${employee.position}`,
        detail: employee.joiningDate
          ? new Date(employee.joiningDate).toLocaleDateString()
          : 'Recently added',
        href: '/employees',
        kind: 'joined',
      }))

    return [...pending, ...joined]
  }, [leaveRequests, employees])

  const unread = notifications.filter((item) => !readIds.includes(item.id))

  const closeMenus = () => {
    setShowUserMenu(false)
    setShowNotifications(false)
  }

  // Menus behave like real menus: outside click or Escape dismisses them, and
  // Escape hands focus back to the button that opened the panel.
  useEffect(() => {
    if (!showUserMenu && !showNotifications) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      closeMenus()
      if (showNotifications) bellRef.current?.focus()
      else if (showUserMenu) accountRef.current?.focus()
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!menusRef.current?.contains(event.target as Node)) closeMenus()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [showUserMenu, showNotifications])

  // Roving focus + arrow keys inside each open panel.
  useMenuNav({
    open: showNotifications,
    containerRef: notificationsRef,
    triggerRef: bellRef,
    onClose: closeMenus,
  })
  useMenuNav({
    open: showUserMenu,
    containerRef: userMenuRef,
    triggerRef: accountRef,
    onClose: closeMenus,
  })

  const handleLogout = async () => {
    closeMenus()
    await dispatch(logoutUser())
    router.push('/login')
  }

  const markAllRead = () => {
    setReadIds(notifications.map((item) => item.id))
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

        <div className="relative flex w-full max-w-md flex-1 items-center rounded-xl border edge bg-white/50 px-3 backdrop-blur-md shadow-sm shadow-black/5 transition-shadow focus-within:border-brand focus-within:ring-2 focus-within:ring-brand dark:surface-40">
          <Search
            size={18}
            className="shrink-0 text-foreground/65 transition-colors hover:text-foreground/80"
          />
          <input
            type="search"
            placeholder="Search employees, documents, reports..."
            className="w-full bg-transparent py-2.5 text-sm text-foreground placeholder:text-foreground/60 focus:outline-none md:pl-3"
          />
          <kbd className="hidden rounded-lg border edge bg-foreground/5 px-2 py-0.5 text-[10px] font-medium text-foreground/65 backdrop-blur-sm select-none md:inline-flex">
            /
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2" ref={menusRef}>
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            ref={bellRef}
            onClick={() => {
              setShowNotifications((prev) => !prev)
              setShowUserMenu(false)
            }}
            className={cn(ICON_BUTTON, showNotifications && 'bg-white/80 dark:surface-95')}
            aria-label={
              unread.length > 0 ? `Notifications, ${unread.length} unread` : 'Notifications'
            }
            aria-expanded={showNotifications}
            aria-haspopup="menu"
          >
            <Bell size={18} />
            {unread.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[rgb(var(--danger-rgb))] px-1 text-[10px] font-semibold text-white shadow-sm">
                {unread.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              ref={notificationsRef}
              className="absolute right-0 top-12 z-50 w-80 rounded-2xl border edge bg-white/90 p-2 backdrop-blur-xl shadow-2xl shadow-black/10 dark:surface-95 dark:shadow-black/50"
              role="menu"
              aria-label="Notifications"
            >
              <div className="flex items-center justify-between border-b edge px-3 py-2.5">
                <p className="text-sm font-semibold text-foreground">Notifications</p>
                {unread.length > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium brand-text press transition-colors hover:bg-foreground/5"
                    role="menuitem"
                  >
                    <CheckCheck size={13} />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto py-1">
                {notifications.length === 0 ? (
                  <p role="status" className="px-3 py-6 text-center text-sm text-foreground/60">
                    You&apos;re all caught up.
                  </p>
                ) : (
                  notifications.map((item) => {
                    const isUnread = !readIds.includes(item.id)
                    const Icon = item.kind === 'leave' ? CalendarDays : CheckCircle2
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        role="menuitem"
                        onClick={() => {
                          setReadIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]))
                          closeMenus()
                        }}
                        className="flex items-start gap-3 rounded-xl px-3 py-2.5 press-sm transition-colors hover:bg-foreground/5"
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg brand-tint brand-text border">
                          <Icon size={15} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-foreground">
                            {item.title}
                          </span>
                          <span className="block text-xs text-foreground/65">{item.detail}</span>
                        </span>
                        {isUnread && (
                          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[rgb(var(--brand-rgb))]" />
                        )}
                      </Link>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Colour palette picker (light + dark themes live here) */}
        <PaletteSwitcher />

        {/* User menu */}
        <div className="relative">
          <button
            type="button"
            ref={accountRef}
            onClick={() => {
              setShowUserMenu((prev) => !prev)
              setShowNotifications(false)
            }}
            className={cn(ICON_BUTTON, 'text-foreground', showUserMenu && 'bg-white/80 dark:surface-95')}
            aria-expanded={showUserMenu}
            aria-haspopup="menu"
            aria-label="Account menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full avatar-brand text-xs font-semibold text-white shadow-md shadow-black/20">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </button>

          {showUserMenu && (
            <div
              ref={userMenuRef}
              className="absolute right-0 top-12 z-50 w-64 rounded-2xl border edge bg-white/90 p-2 backdrop-blur-xl shadow-2xl shadow-black/10 dark:surface-95 dark:shadow-black/50"
              role="menu"
              aria-label="Account"
            >
              <div className="rounded-xl border-b edge px-3 py-2.5">
                <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                <p className="text-xs text-foreground/65">{user?.email}</p>
                <p className="mt-1 text-xs text-foreground/60 capitalize">
                  {typeof user?.roleId === 'object' && user?.roleId
                    ? user.roleId.roleName
                    : user?.role || 'Staff'}
                </p>
              </div>
              <Link
                href="/settings"
                onClick={closeMenus}
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
      </div>
    </header>
  )
}
