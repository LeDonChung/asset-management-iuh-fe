'use client'

import { useRole } from '@/contexts/RoleContext'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Custom hook for role-based permissions and utilities
 */
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth()
  const {
    currentRole,
    availableRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    canPerformAction
  } = useRole()

  /**
   * Check if user is Super Admin
   */
  const isSuperAdmin = () => {
    return currentRole?.code === 'SUPER_ADMIN'
  }

  /**
   * Check if user is Admin (includes Super Admin)
   */
  const isAdmin = () => {
    return currentRole?.code === 'SUPER_ADMIN' || currentRole?.code === 'ADMIN'
  }

  /**
   * Check if user is Phòng Quản Trị
   */
  const isPhongQuanTri = () => {
    return currentRole?.code === 'PHONG_QUAN_TRI'
  }

  /**
   * Check if user is Phòng Kế Hoạch Đầu Tư
   */
  const isPhongKeHoachDauTu = () => {
    return currentRole?.code === 'PHONG_KE_HOACH_DAU_TU'
  }

  /**
   * Check if user is Đơn Vị Sử Dụng
   */
  const isDonViSuDung = () => {
    return currentRole?.code === 'DON_VI_SU_DUNG'
  }

  /**
   * Check if user has any admin privileges
   */
  const hasAdminAccess = () => {
    return ['SUPER_ADMIN', 'ADMIN', 'PHONG_QUAN_TRI', 'PHONG_KE_HOACH_DAU_TU'].includes(currentRole?.code || '')
  }

  /**
   * Check if user can manage administrative functions
   */
  const hasManagementAccess = () => {
    return ['SUPER_ADMIN', 'ADMIN', 'PHONG_QUAN_TRI'].includes(currentRole?.code || '')
  }

  /**
   * Check if user can manage assets
   */
  const canManageAssets = () => {
    return hasAnyPermission([
      'asset.create',
      'asset.edit',
      'asset.delete',
      'asset.allocate',
      'asset.move'
    ])
  }

  /**
   * Check if user can manage units
   */
  const canManageUnits = () => {
    return hasAnyPermission([
      'unit.create',
      'unit.edit',
      'unit.delete'
    ])
  }

  /**
   * Check if user can view reports
   */
  const canViewReports = () => {
    return hasPermission('report.view')
  }

  /**
   * Check if user can generate reports
   */
  const canGenerateReports = () => {
    return hasPermission('report.generate')
  }

  /**
   * Get user's display name
   */
  const getDisplayName = () => {
    return user?.fullName || 'Unknown User'
  }

  /**
   * Get current role display name
   */
  const getRoleDisplayName = () => {
    return currentRole?.name || 'No Role'
  }

  /**
   * Check if user can switch between multiple roles
   */
  const canSwitchRoles = () => {
    return availableRoles.length > 1
  }

  /**
   * Get breadcrumb permissions for route access
   */
  const getRouteAccess = (routes: string[]) => {
    return routes.map(route => ({
      route,
      canAccess: canAccessRoute(route)
    }))
  }

  /**
   * Get asset action permissions
   */
  const getAssetPermissions = () => {
    return {
      canView: hasPermission('asset.view'),
      canCreate: hasPermission('asset.create'),
      canEdit: hasPermission('asset.edit'),
      canDelete: hasPermission('asset.delete'),
      canAllocate: hasPermission('asset.allocate'),
      canMove: hasPermission('asset.move'),
      canReceive: hasPermission('asset.receive'),
      canViewLedger: hasPermission('asset.ledger.view')
    }
  }

  /**
   * Get unit management permissions
   */
  const getUnitPermissions = () => {
    return {
      canView: hasPermission('unit.view'),
      canCreate: hasPermission('unit.create'),
      canEdit: hasPermission('unit.edit'),
      canDelete: hasPermission('unit.delete')
    }
  }

  /**
   * Get room management permissions  
   */
  const getRoomPermissions = () => {
    return {
      canView: hasPermission('room.view'),
      canCreate: hasPermission('room.create'),
      canEdit: hasPermission('room.edit'),
      canDelete: hasPermission('room.delete')
    }
  }

  return {
    // Basic info
    user,
    currentRole,
    availableRoles,
    isAuthenticated,
    
    // Role checks
    isSuperAdmin,
    isAdmin,
    isPhongQuanTri,
    isPhongKeHoachDauTu,
    isDonViSuDung,
    hasAdminAccess,
    hasManagementAccess,
    
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    canPerformAction,
    
    // Specific permission groups
    canManageAssets,
    canManageUnits,
    canViewReports,
    canGenerateReports,
    
    // Utilities
    getDisplayName,
    getRoleDisplayName,
    canSwitchRoles,
    getRouteAccess,
    getAssetPermissions,
    getUnitPermissions,
    getRoomPermissions
  }
}

export default usePermissions
