'use client'

import Link from 'next/link'
import {
  LayoutDashboard,
  IdCard,
  Users,
  Clock,
  Calendar,
  DollarSign,
  Briefcase,
  TrendingUp,
  GitBranch,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SidebarModule } from '@/lib/auth/roles'
import { useI18n } from '@/lib/i18n'

/**
 * `module` names the permission the destination needs. Dashboard aggregates
 * only what the role may read, and Settings holds personal preferences for
 * everyone, so both are always listed.
 */
export interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  href: string
  module?: SidebarModule
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  // Self-service: every role reads only its own rows here, so it is always listed.
  { label: 'My workspace', icon: IdCard, href: '/me' },
  { label: 'Employees', icon: Users, href: '/employees', module: 'employees' },
  { label: 'Attendance', icon: Clock, href: '/attendance', module: 'attendance' },
  { label: 'Leave', icon: Calendar, href: '/leaves', module: 'leaves' },
  { label: 'Payroll', icon: DollarSign, href: '/payroll', module: 'payroll' },
  { label: 'Recruitment', icon: Briefcase, href: '/recruitment', module: 'recruitment' },
  { label: 'Performance', icon: TrendingUp, href: '/performance', module: 'performance' },
  { label: 'Organization', icon: GitBranch, href: '/organization', module: 'organization' },
  { label: 'Reports', icon: BarChart3, href: '/reports', module: 'reports' },
  { label: 'Audit trail', icon: ShieldCheck, href: '/audit', module: 'audit' },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

export function SidebarLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon
  const { t } = useI18n()

  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
        'press-sm transition-all duration-200',
        isActive
          ? 'nav-active border edge backdrop-blur-md'
          : 'text-foreground/70 hover:text-foreground hover:bg-white/40 dark:hover:bg-white/5 border border-transparent hover:edge backdrop-blur-sm',
      )}
    >
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200',
          isActive
            ? 'bg-white/20 text-white'
            : 'text-foreground/60 group-hover:text-foreground group-hover:bg-white/20 dark:group-hover:bg-white/5',
        )}
      >
        <Icon size={18} strokeWidth={isActive ? 2 : 1.8} />
      </span>
      <span className="flex-1 text-left">{t(item.label)}</span>
      <ChevronRight
        size={14}
        className={cn(
          'shrink-0 text-foreground/60 transition-transform duration-200',
          isActive ? 'rotate-90 text-white/80' : '',
        )}
      />
    </Link>
  )
}
