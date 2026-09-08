'use client'

import { Button } from '@/components/ui/button'
import { User, Users, BarChart3 } from 'lucide-react'

type UserRole = 'employee' | 'manager' | 'hr'

interface RoleSelectorProps {
  selectedRole: UserRole
  onRoleChange: (role: UserRole) => void
}

const roles: Array<{ id: UserRole; label: string; icon: React.ReactNode; description: string }> = [
  {
    id: 'employee',
    label: 'Employee',
    icon: <User size={20} />,
    description: 'View your performance & feedback',
  },
  {
    id: 'manager',
    label: 'Manager',
    icon: <Users size={20} />,
    description: 'Appraise your team members',
  },
  {
    id: 'hr',
    label: 'HR Admin',
    icon: <BarChart3 size={20} />,
    description: 'Manage all appraisals & cycles',
  },
]

export function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {roles.map((role) => (
        <Button
          key={role.id}
          variant={selectedRole === role.id ? 'default' : 'outline'}
          className="h-auto p-4 flex-col items-start gap-2"
          onClick={() => onRoleChange(role.id)}
        >
          <div className="flex items-center gap-2">
            {role.icon}
            <span className="font-semibold">{role.label}</span>
          </div>
          <span className="text-xs opacity-75 text-left">{role.description}</span>
        </Button>
      ))}
    </div>
  )
}
