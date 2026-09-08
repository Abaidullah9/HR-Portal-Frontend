'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  DollarSign,
  Briefcase,
  TrendingUp,
  GitBranch,
  BarChart3,
  Settings,
  Bell,
  User,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Employees', icon: Users, href: '/employees' },
  { label: 'Attendance', icon: Clock, href: '/attendance' },
  { label: 'Leave', icon: Calendar, href: '/leaves' },
  { label: 'Payroll', icon: DollarSign, href: '/payroll' },
  { label: 'Recruitment', icon: Briefcase, href: '/recruitment' },
  { label: 'Performance', icon: TrendingUp, href: '/performance' },
  { label: 'Organization', icon: GitBranch, href: '/organization' },
  { label: 'Reports', icon: BarChart3, href: '/reports' },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

interface SidebarProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Sidebar({ open = true, onOpenChange }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(open)

  const handleToggle = () => {
    const newOpen = !isOpen
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-40"
        onClick={handleToggle}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={handleToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40',
          'flex flex-col',
          isOpen ? 'w-64' : 'w-20',
          'md:relative md:z-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-4 border-b border-sidebar-border">
          {isOpen && (
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground">
                HR
              </div>
              <span className="text-sidebar-foreground hidden md:inline">HR</span>
            </Link>
          )}
          {!isOpen && (
            <Link href="/" className="flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-sm font-bold">
                H
              </div>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
                title={!isOpen ? item.label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {isOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-sidebar-border p-3">
          <button
            className={cn(
              'w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-sidebar-accent transition-colors duration-200',
              isOpen ? 'justify-between' : 'justify-center'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-sm font-bold">
                JD
              </div>
              {isOpen && (
                <div className="flex flex-col items-start">
                  <p className="text-sm font-medium text-sidebar-foreground">John Doe</p>
                  <p className="text-xs text-sidebar-foreground/60">Admin</p>
                </div>
              )}
            </div>
            {isOpen && <ChevronDown size={16} />}
          </button>
        </div>
      </aside>
    </>
  )
}
