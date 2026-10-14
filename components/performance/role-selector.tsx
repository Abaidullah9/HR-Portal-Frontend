import { Button } from '@/components/ui/button'
import { User, Users, BarChart3 } from 'lucide-react'

type UserRole = 'employee' | 'manager' | 'hr'

interface RoleSelectorProps {
  selectedRole: UserRole
  onRoleChange: (role: UserRole) => void
}

const roles: Array<{
  id: UserRole
  label: string
  icon: React.ReactNode
  description: string
}> = [
  {
    id: 'employee',
    label: 'Employee',
    icon: <User size={20} strokeWidth={2} />,
    description: 'View your performance & feedback',
  },
  {
    id: 'manager',
    label: 'Manager',
    icon: <Users size={20} strokeWidth={2} />,
    description: 'Appraise your team members',
  },
  {
    id: 'hr',
    label: 'HR Admin',
    icon: <BarChart3 size={20} strokeWidth={2} />,
    description: 'Manage all appraisals & cycles',
  },
]

export function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {roles.map((role) => {
        const isSelected = selectedRole === role.id
        return (
          <Button
            key={role.id}
            type="button"
            variant={isSelected ? 'default' : 'outline'}
            className={`
 h-auto p-5 flex flex-col items-start gap-3
 ${
   isSelected
     ? 'brand text-white shadow-lg shadow-black/20 hover:shadow-xl border edge'
     : 'bg-white/70 border edge text-foreground hover:bg-white hover:shadow-md hover:shadow-black/10 dark:surface-80 dark:edge dark:hover:bg-white/5'
 }
 `}
            onClick={() => onRoleChange(role.id)}
          >
            <span
              className={`
 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
 ${
   isSelected
     ? 'brand-tile'
     : 'bg-white/60 text-foreground/70 hover:bg-white hover:text-foreground dark:bg-white/5 dark:hover:bg-white/10'
 }
 `}
            >
              {role.icon}
            </span>
            <div className="flex flex-col items-start">
              <span className={`font-semibold ${isSelected ? 'text-white' : 'text-foreground'}`}>
                {role.label}
              </span>
              <span className={`text-xs ${isSelected ? 'text-white' : 'text-foreground/65'}`}>
                {role.description}
              </span>
            </div>
          </Button>
        )
      })}
    </div>
  )
}
