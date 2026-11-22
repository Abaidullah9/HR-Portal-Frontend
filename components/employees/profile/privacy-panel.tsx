'use client'

import { Download, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PrivacyPanelProps {
  busy: string | null
  onExport: () => void
  onErase: () => void
}

/**
 * GDPR actions. Export returns everything held about the person; erasure keeps
 * payroll and audit history for its retention period, as the copy states.
 */
export function PrivacyPanel({ busy, onExport, onErase }: PrivacyPanelProps) {
  return (
    <section aria-labelledby="privacy-heading" className="panel border danger-panel p-6">
      <h2 id="privacy-heading" className="flex items-center gap-2 text-lg font-semibold">
        <ShieldAlert size={18} aria-hidden="true" /> Privacy and retention
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-foreground/70">
        Export returns everything held about this person. Erasure replaces their name and email and
        disables the login, while payroll and audit records stay for the statutory retention period.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" className="gap-2" onClick={onExport} disabled={busy === 'export'}>
          <Download size={16} /> Export personal data
        </Button>
        <Button variant="destructive" className="gap-2" onClick={onErase} disabled={busy === 'erase'}>
          {busy === 'erase' ? 'Erasing…' : 'Erase identifying details'}
        </Button>
      </div>
    </section>
  )
}
