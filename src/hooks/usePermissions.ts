import { useAuth } from '@/contexts/AuthContext'
import { PermissionConstants, Permission } from '@/lib/constants/permissions'

export const usePermissions = () => {
  const { hasAnyPermission, hasAllPermissions, getUserPermissions } = useAuth()
  const canCreateInventorySession = () => hasAnyPermission([
    PermissionConstants.PERM_CREATE_INVENTORY,
  ])

  const canUpdateInventorySession = () => hasAnyPermission([
    PermissionConstants.PERM_UPDATE_INVENTORY,
  ])

  // Helper functions for specific permission checks
  const canManageUsers = () => hasAnyPermission([
    PermissionConstants.PERM_CREATE_USER,
    PermissionConstants.PERM_UPDATE_USER,
    PermissionConstants.PERM_REMOVE_USER,
  ])

  const canViewUsers = () => hasAnyPermission([
    PermissionConstants.PERM_VIEW_USER,
  ])

  const canManageRoles = () => hasAnyPermission([
    PermissionConstants.PERM_CREATE_ROLE,
    PermissionConstants.PERM_UPDATE_ROLE,
    PermissionConstants.PERM_REMOVE_ROLE,
  ])

  const canViewRoles = () => hasAnyPermission([
    PermissionConstants.PERM_VIEW_ROLE,
  ])

  const canManageCategories = () => hasAnyPermission([
    PermissionConstants.PERM_CREATE_CATEGORY,
    PermissionConstants.PERM_UPDATE_CATEGORY,
    PermissionConstants.PERM_REMOVE_CATEGORY,
  ])

  const canViewCategories = () => hasAnyPermission([
    PermissionConstants.PERM_VIEW_CATEGORY,
  ])

  const canManageUnits = () => hasAnyPermission([
    PermissionConstants.PERM_CREATE_UNIT,
    PermissionConstants.PERM_UPDATE_UNIT,
    PermissionConstants.PERM_REMOVE_UNIT,
  ])

  const canViewUnits = () => hasAnyPermission([
    PermissionConstants.PERM_VIEW_UNIT,
  ])

  const canManageRooms = () => hasAnyPermission([
    PermissionConstants.PERM_CREATE_ROOM,
    PermissionConstants.PERM_UPDATE_ROOM,
    PermissionConstants.PERM_REMOVE_ROOM,
  ])

  const canViewRooms = () => hasAnyPermission([
    PermissionConstants.PERM_VIEW_ROOM,
  ])

  const canManageAssets = () => hasAnyPermission([
    PermissionConstants.PERM_UPDATE_ASSET,
    PermissionConstants.PERM_REMOVE_ASSET,
    PermissionConstants.PERM_IDENTIFY_ASSET,
    PermissionConstants.PERM_IMPORT_ASSET,
  ])

  const canViewAssets = () => hasAnyPermission([
    PermissionConstants.PERM_VIEW_ASSET,
  ])

  const canManageRFID = () => hasAnyPermission([
    PermissionConstants.PERM_UPDATE_RFID,
    PermissionConstants.PERM_REMOVE_RFID,
  ])

  const canManageInventory = () => hasAnyPermission([
    PermissionConstants.PERM_CREATE_INVENTORY,
    PermissionConstants.PERM_UPDATE_INVENTORY,
    PermissionConstants.PERM_REMOVE_INVENTORY,
  ])

  const canViewInventory = () => hasAnyPermission([
    PermissionConstants.PERM_VIEW_INVENTORY,
  ])

  const canManageInventoryGroups = () => hasAnyPermission([
    PermissionConstants.PERM_CREATE_INVENTORY_GROUP,
    PermissionConstants.PERM_UPDATE_INVENTORY_GROUP,
    PermissionConstants.PERM_REMOVE_INVENTORY_GROUP,
    PermissionConstants.PERM_ASSIGN_INVENTORY_GROUP,
    PermissionConstants.PERM_MANAGE_GROUP_MEMBERS,
  ])

  const canViewInventoryGroups = () => hasAnyPermission([
    PermissionConstants.PERM_VIEW_INVENTORY_GROUP,
  ])

  const canManageInventorySubs = () => hasAnyPermission([
    PermissionConstants.PERM_CREATE_INVENTORY_SUB,
    PermissionConstants.PERM_UPDATE_INVENTORY_SUB,
    PermissionConstants.PERM_REMOVE_INVENTORY_SUB,
    PermissionConstants.PERM_MANAGE_SUB_MEMBERS,
  ])

  const canViewInventorySubs = () => hasAnyPermission([
    PermissionConstants.PERM_VIEW_INVENTORY_SUB,
  ])

  const canManageInventoryCommittee = () => hasAnyPermission([
    PermissionConstants.PERM_APPROVE_INVENTORY_RESULT,
    PermissionConstants.PERM_REVIEW_INVENTORY_REPORT,
    PermissionConstants.PERM_FINALIZE_INVENTORY,
  ])

  return {
    // Core permission functions
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,

    // Specific permission checks
    canManageUsers,
    canViewUsers,
    canManageRoles,
    canViewRoles,
    canManageCategories,
    canViewCategories,
    canManageUnits,
    canViewUnits,
    canManageRooms,
    canViewRooms,
    canManageAssets,
    canViewAssets,
    canManageRFID,
    canManageInventory,
    canViewInventory,
    canManageInventoryGroups,
    canViewInventoryGroups,
    canManageInventorySubs,
    canViewInventorySubs,
    canManageInventoryCommittee,
    canCreateInventorySession,
    canUpdateInventorySession
  }
}

export { PermissionConstants } from '@/lib/constants/permissions'
export type { Permission } from '@/lib/constants/permissions'