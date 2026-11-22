'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { WhatsNewModal } from '@/components/announcements/whats-new-modal'
import { ToastProvider } from '@/components/common/toast'
import { CommandPalette } from './command-palette'
import { APP_NAME, titleForPath } from '@/lib/routes'

interface AppLayoutProps {
  children: React.ReactNode
}

const MOBILE_QUERY = '(max-width: 767px)'

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const mainRef = useRef<HTMLElement>(null)
  const isFirstRender = useRef(true)

  // On small screens the sidebar is an overlay, so it starts closed to keep
  // the page content visible instead of dimmed behind the backdrop.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia(MOBILE_QUERY).matches) {
      setSidebarOpen(false)
    }
  }, [pathname])

  // Client-side navigation neither updates the title nor announces the new
  // page, so the title tracks the route and focus moves into the content.
  useEffect(() => {
    document.title = `${titleForPath(pathname)} · ${APP_NAME}`
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    mainRef.current?.focus()
  }, [pathname])

  return (
    <ToastProvider>
      <div className="relative flex min-h-screen bg-background antialiased">
        {/* First stop for keyboard users: jump straight past the sidebar and
            header instead of tabbing through every nav item on every page. */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[60] focus:rounded-xl focus:border focus:border-black/10 focus:bg-white focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-2xl focus:shadow-black/20 dark:focus:border-white/15 dark:focus:surface-95"
        >
          Skip to main content
        </a>

        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        {/* min-w-0 stops this column from growing to its content's min-content
            width (the data table's ~556px), which is what pushed the document to
            606px at 320px and 894px at 768px. */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

          {/* tabIndex={-1} so both the skip link and route changes can move
              focus here. min-w-0 is load-bearing: as a flex item, main's
              automatic minimum is its content's min-content width, and the data
              table's ~556px floors would otherwise stretch the page. */}
          <main
            id="main-content"
            ref={mainRef}
            tabIndex={-1}
            className="min-w-0 flex-1 overflow-auto px-6 py-8 focus:outline-none md:px-10 md:py-10"
          >
            <div className="mx-auto max-w-7xl space-y-8">{children}</div>
          </main>
        </div>

        <WhatsNewModal />
        <CommandPalette />
      </div>
    </ToastProvider>
  )
}
