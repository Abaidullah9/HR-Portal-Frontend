'use client'

import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/common/toast'
import type { RehireResult } from '@/lib/api/profile'

interface RehireResultPanelProps {
  name: string
  result: RehireResult
  onClose: () => void
}

/** Confirms the rehire and exposes the invite link when email is unavailable. */
export function RehireResultPanel({ name, result, onClose }: RehireResultPanelProps) {
  const toast = useToast()

  const copyLink = async () => {
    if (!result.inviteLink) return
    try {
      await navigator.clipboard.writeText(result.inviteLink)
      toast('Invite link copied')
    } catch {
      toast('Could not copy the link', 'error')
    }
  }

  return (
    <div role="status" className="space-y-4">
      <p className="text-sm text-foreground/75">
        {result.delivered
          ? `${name} is active again and a fresh invite was emailed.`
          : `${name} is active again. Email delivery is not configured, so share this link.`}
      </p>
      {result.inviteLink && !result.delivered && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={result.inviteLink}
            readOnly
            aria-label="Invite link"
            onFocus={(event) => event.currentTarget.select()}
          />
          <Button type="button" variant="outline" onClick={() => void copyLink()} className="gap-2">
            <Copy size={16} aria-hidden="true" /> Copy link
          </Button>
        </div>
      )}
      <Button type="button" onClick={onClose} className="w-full brand text-white border edge">
        Done
      </Button>
    </div>
  )
}
