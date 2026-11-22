'use client'

import { Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/common/toast'
import { downloadDocument, type ProfileDocument } from '@/lib/api/profile'
import { formatDate, toSentenceCase } from '@/lib/utils'

/** Documents on file, downloaded through the authenticated endpoint. */
export function DocumentsPanel({ documents }: { documents: ProfileDocument[] }) {
  const toast = useToast()

  const download = (document: ProfileDocument) =>
    void downloadDocument(document._id, document.name).catch((problem) =>
      toast(problem instanceof Error ? problem.message : 'Download failed', 'error'),
    )

  return (
    <section aria-labelledby="documents-heading" className="panel p-6">
      <h2 id="documents-heading" className="flex items-center gap-2 text-lg font-semibold">
        <FileText size={18} aria-hidden="true" /> Documents
      </h2>
      {documents.length === 0 ? (
        <p className="mt-3 text-sm text-foreground/65">No documents on file.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {documents.map((document) => (
            <li
              key={document._id}
              className="flex items-center justify-between gap-3 border-b edge pb-3 last:border-0"
            >
              <div>
                <p className="font-medium">{document.name}</p>
                <p className="text-xs text-foreground/60">
                  {toSentenceCase(document.type)} · {formatDate(document.createdAt)}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => download(document)}
              >
                <Download size={14} /> Download
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
