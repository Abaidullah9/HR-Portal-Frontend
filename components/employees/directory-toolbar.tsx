'use client'

import { Building2, Mail, Plus, Search, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DirectoryToolbarProps {
  canManage: boolean
  searchTerm: string
  onSearchChange: (value: string) => void
  onClearSearch: () => void
  onInvite: () => void
  onImport: () => void
  onAddDepartment: () => void
  onAddEmployee: () => void
}

/** Management actions and the server-backed directory search. */
export function DirectoryToolbar({
  canManage,
  searchTerm,
  onSearchChange,
  onClearSearch,
  onInvite,
  onImport,
  onAddDepartment,
  onAddEmployee,
}: DirectoryToolbarProps) {
  return (
    <>
      {canManage && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={onInvite} variant="outline" className="gap-2">
            <Mail size={18} /> Invite user
          </Button>
          <Button onClick={onImport} variant="outline" className="gap-2">
            <Upload size={18} /> Import CSV
          </Button>
          <Button onClick={onAddDepartment} variant="outline" className="gap-2">
            <Building2 size={18} /> Add department
          </Button>
          <Button onClick={onAddEmployee} className="gap-2 brand text-white border edge">
            <Plus size={18} /> Add employee
          </Button>
        </div>
      )}

      <div className="flex max-w-xl">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/60 transition-colors hover:text-foreground/70"
            aria-hidden="true"
          />
          <Input
            aria-label="Filter the employee directory"
            placeholder="Search by name, email, or position..."
            className="pl-11 pr-11"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={onClearSearch}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-foreground/60 pointer-coarse:min-h-11 pointer-coarse:min-w-11 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </>
  )
}
