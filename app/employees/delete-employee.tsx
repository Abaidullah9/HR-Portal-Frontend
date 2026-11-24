'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DeleteEmployeeProps {
  id: string
  deletingId: string | null
  confirming: boolean
  onConfirmChange: (id: string | null) => void
  onDelete: (id: string) => void
}

/** Delete control with its confirmation popover, shared by the row and the card. */
export function DeleteEmployee({
  id,
  deletingId,
  confirming,
  onConfirmChange,
  onDelete,
}: DeleteEmployeeProps) {
  return (
    <div className="flex justify-end">
      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 text-foreground/60 pointer-coarse:min-h-11 pointer-coarse:min-w-11 hover:danger-text hover:danger-panel dark:text-foreground/65 dark:hover:danger-text"
          onClick={() => onConfirmChange(id)}
          aria-label="Delete employee"
        >
          <Trash2 size={15} />
        </Button>
        {confirming && (
          <div className="absolute right-0 top-9 z-50 w-56 rounded-2xl border edge bg-white/95 p-4 backdrop-blur-xl shadow-2xl shadow-black/10 dark:edge dark:surface-95">
            <p className="font-semibold text-foreground">Confirm deletion?</p>
            <p className="mt-1 text-sm text-foreground/60">This employee will be permanently removed.</p>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onConfirmChange(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={deletingId === id}
                onClick={() => {
                  onConfirmChange(null)
                  onDelete(id)
                }}
                className="flex-1"
              >
                {deletingId === id ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
