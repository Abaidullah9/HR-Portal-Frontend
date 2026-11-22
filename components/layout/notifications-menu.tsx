'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Banknote, Bell, CalendarDays, CheckCheck, Clock, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from '@/lib/api/notifications'
import { useMenuNav } from '@/lib/hooks/use-menu-nav'
import { ICON_BUTTON } from './icon-button'

const ICONS = {
  leave: CalendarDays,
  payroll: Banknote,
  attendance: Clock,
  appraisal: Star,
  system: Bell,
} as const

/**
 * The header's bell. Entries are written server-side when something happens
 * (a leave request, a decision, a payroll run), so every signed-in user sees
 * the same feed regardless of which page they are on.
 */
export function NotificationsMenu({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [items, setItems] = useState<AppNotification[]>([])
  const [readIds, setReadIds] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const feed = await fetchNotifications()
      setItems(feed.items)
    } catch {
      // A bell that cannot refresh should stay quiet rather than show an error.
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // New entries arrive while the page sits open, so refresh on focus and once a
  // minute while the tab is visible — no websocket needed for a badge.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') void load()
    }
    const interval = window.setInterval(refresh, 60_000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [load])

  const isUnread = (item: AppNotification) => !item.readAt && !readIds.includes(item._id)
  const unread = items.filter(isUnread)

  useMenuNav({
    open,
    containerRef: panelRef,
    triggerRef,
    wrapperRef: containerRef,
    onClose: () => onOpenChange(false),
  })

  const markAllRead = () => {
    setReadIds(items.map((item) => item._id))
    void markAllNotificationsRead().catch(() => undefined)
  }

  const acknowledge = (item: AppNotification) => {
    if (!isUnread(item)) return
    setReadIds((prev) => (prev.includes(item._id) ? prev : [...prev, item._id]))
    void markNotificationRead(item._id).catch(() => undefined)
    onOpenChange(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        onClick={() => onOpenChange(!open)}
        className={cn(ICON_BUTTON, open && 'bg-white/80 dark:surface-95')}
        aria-label={unread.length > 0 ? `Notifications, ${unread.length} unread` : 'Notifications'}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell size={18} />
        {unread.length > 0 && (
          <span className="danger-solid absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold shadow-sm">
            {unread.length}
          </span>
        )}
      </button>

      {open && (
        /* At narrow widths a w-80 panel anchored right-0 to a bell near the
           left of the viewport hangs 168px off-screen, so below sm it anchors
           to the viewport underneath the header instead. */
        <div
          ref={panelRef}
          className="fixed inset-x-4 top-20 z-50 w-auto rounded-2xl border edge bg-white/90 p-2 backdrop-blur-xl shadow-2xl shadow-black/10 sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-80 dark:surface-95 dark:shadow-black/50"
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
            {items.length === 0 ? (
              <p role="status" className="px-3 py-6 text-center text-sm text-foreground/60">
                You&apos;re all caught up.
              </p>
            ) : (
              items.map((item) => {
                const unreadItem = isUnread(item)
                const Icon = ICONS[item.kind] ?? Bell
                return (
                  <Link
                    key={item._id}
                    href={item.href}
                    role="menuitem"
                    onClick={() => acknowledge(item)}
                    className="flex items-start gap-3 rounded-xl px-3 py-2.5 press-sm transition-colors hover:bg-foreground/5"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg brand-tint brand-text border">
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="wrap-anywhere block text-sm font-medium text-foreground">
                        {item.title}
                      </span>
                      <span className="wrap-anywhere block text-xs text-foreground/65">
                        {item.detail}
                      </span>
                    </span>
                    {unreadItem && (
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
  )
}
