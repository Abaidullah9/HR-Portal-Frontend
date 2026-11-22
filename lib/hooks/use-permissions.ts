'use client'

import { useAppSelector } from '@/lib/redux/store'
import { can, canView, type Capability, type SidebarModule } from '@/lib/auth/roles'

/** Which write actions and destinations the current user may use; the server still decides. */
export function usePermissions() {
  const user = useAppSelector((state) => state.auth.user)
  return {
    can: (capability: Capability) => can(user, capability),
    canView: (module: SidebarModule) => canView(user, module),
  }
}
