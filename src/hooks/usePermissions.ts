import { useAuth } from '@/contexts/AuthContext'
import { PermissionConstants, Permission } from '@/lib/constants/permissions'

export const usePermissions = () => {
  const { hasAnyPermission, hasAllPermissions, getUserPermissions } = useAuth()

  // Helper functions for specific permission checks
  

  return {
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
  }
}

export { PermissionConstants } from '@/lib/constants/permissions'
export type { Permission } from '@/lib/constants/permissions'