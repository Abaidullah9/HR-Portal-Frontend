'use client'

import { useRef, useState } from 'react'
import { Mail, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDialogA11y } from '@/lib/hooks/use-dialog-a11y'
import { inviteUser } from '@/lib/api/profile'

interface InviteUserDialogProps {
  isOpen: boolean
  onClose: () => void
}

/** Invites a login only (no employee record), e.g. for a hiring manager. */
export function InviteUserDialog({ isOpen, onClose }: InviteUserDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogA11y({ open: isOpen, containerRef: dialogRef, onClose })

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [roleName, setRoleName] = useState('Employee')
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [delivered, setDelivered] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setInviteLink(null)
    setLoading(true)
    try {
      const result = await inviteUser({ name: name.trim(), email: email.trim(), roleName })
      setInviteLink(result.inviteLink ?? null)
      setDelivered(result.delivered)
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'The invite could not be sent')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-title"
        className="w-full max-w-md rounded-2xl border edge bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:surface-95"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="invite-title" className="text-xl font-bold">
            Invite a user
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground/60 hover:bg-foreground/5"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="invite-name" className="mb-1 block text-sm font-medium">
              Full name
            </label>
            <Input
              id="invite-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="invite-email" className="mb-1 block text-sm font-medium">
              Work email
            </label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="invite-role" className="mb-1 block text-sm font-medium">
              Role
            </label>
            <select
              id="invite-role"
              value={roleName}
              onChange={(event) => setRoleName(event.target.value)}
              className="h-10 w-full rounded-xl border edge bg-white/80 px-3 text-sm"
            >
              <option>Employee</option>
              <option>Manager</option>
              <option>HR</option>
            </select>
          </div>

          {error && (
            <div role="alert" className="rounded-xl border danger-panel p-3 text-sm">
              {error}
            </div>
          )}

          {inviteLink && (
            <div role="status" className="rounded-xl border edge p-3 text-sm">
              <p className="font-medium">
                {delivered ? 'Invite email sent.' : 'Email is not configured, so share this link:'}
              </p>
              <p className="mt-2 break-all font-mono text-xs">{inviteLink}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t edge pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {inviteLink ? 'Done' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <Mail size={16} />
              {loading ? 'Sending…' : 'Send invite'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
