import { Lock } from 'lucide-react'
import { EmptyState } from '@/components/common/state-panel'

interface AccessDeniedProps {
  /** The module named in the message, e.g. "payroll". */
  area: string
}

/**
 * Shown instead of a page's content when the signed-in role cannot read the
 * module. Rendering this before any request keeps the console and the network
 * clean: the server would answer 403 anyway.
 */
export function AccessDenied({ area }: AccessDeniedProps) {
  return (
    <div className="panel overflow-hidden">
      <EmptyState
        icon={Lock}
        title="You don't have access to this page"
        description={`Your role does not include ${area}. Ask an administrator if you need access.`}
      />
    </div>
  )
}
