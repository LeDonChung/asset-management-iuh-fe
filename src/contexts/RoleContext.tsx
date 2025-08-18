'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { Role } from '@/types/asset'

// Role-based permissions configuration
const ROLE_PERMISSIONS: Record<string, string[]> = {
  'SUPER_ADMIN': [
    'admin.dashboard.view',
    'asset.view',
    'asset.create', 
    'asset.edit',
    'asset.delete',
    'asset.allocate',
    'asset.move',
    'asset.receive',
    'asset.ledger.view',
    'unit.view',
    'unit.create',
    'unit.edit', 
    'unit.delete',
    'room.view',
    'room.create',
    'room.edit',
    'room.delete',
    'user.view',
    'user.create',
    'user.edit',
    'user.delete',
    'report.view',
    'report.generate',
    'system.config',
    'inventory.manage',
    'liquidation.manage'
  ],
  'ADMIN': [
    'admin.dashboard.view',
    'asset.view',
    'asset.create',
    'asset.edit',
    'asset.allocate',
    'asset.move', 
    'asset.receive',
    'asset.ledger.view',
    'unit.view',
    'unit.create',
    'unit.edit',
    'room.view',
    'room.create',
    'room.edit',
    'report.view',
    'report.generate',
    'inventory.manage'
  ],
  'PHONG_QUAN_TRI': [
    'admin.dashboard.view',
    'asset.view',
    'asset.create',
    'asset.edit',
    'asset.allocate',
    'asset.move',
    'asset.ledger.view',
    'unit.view',
    'unit.edit',
    'room.view',
    'room.create',
    'room.edit',
    'report.view',
    'report.generate'
  ],
  'PHONG_KE_HOACH_DAU_TU': [
    'admin.dashboard.view',
    'asset.view',
    'asset.create',
    'asset.edit',
    'asset.allocate',
    'asset.ledger.view',
    'unit.view',
    'report.view',
    'report.generate',
    'inventory.view'
  ],
  'DON_VI_SU_DUNG': [
    'staff.dashboard.view',
    'asset.view',
    'asset.receive',
    'asset.move', // Có thể di chuyển tài sản trong đơn vị
    'report.view'
  ]
}

// Navigation permissions
const NAVIGATION_PERMISSIONS: Record<string, string[]> = {
  '/admin': ['SUPER_ADMIN', 'ADMIN', 'PHONG_QUAN_TRI', 'PHONG_KE_HOACH_DAU_TU'],
  '/admin/asset': ['SUPER_ADMIN', 'ADMIN', 'PHONG_QUAN_TRI', 'PHONG_KE_HOACH_DAU_TU'],
  '/admin/asset/create': ['SUPER_ADMIN', 'ADMIN', 'PHONG_QUAN_TRI', 'PHONG_KE_HOACH_DAU_TU'],
  '/admin/asset/allocate': ['SUPER_ADMIN', 'ADMIN', 'PHONG_QUAN_TRI', 'PHONG_KE_HOACH_DAU_TU'],
  '/admin/asset/move': ['SUPER_ADMIN', 'ADMIN', 'PHONG_QUAN_TRI'],
  '/admin/asset/receive': ['SUPER_ADMIN', 'ADMIN', 'PHONG_QUAN_TRI', 'DON_VI_SU_DUNG'],
  '/admin/asset-ledger': ['SUPER_ADMIN', 'ADMIN', 'PHONG_QUAN_TRI', 'PHONG_KE_HOACH_DAU_TU'],
  '/admin/unit': ['SUPER_ADMIN', 'ADMIN', 'PHONG_QUAN_TRI'],
  '/admin/unit/create': ['SUPER_ADMIN', 'ADMIN'],
  '/staff': ['DON_VI_SU_DUNG']
}

interface RoleContextType {
  currentRole: Role | null
  availableRoles: Role[]
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  canAccessRoute: (route: string) => boolean
  canPerformAction: (action: string, resource?: string) => boolean
  switchRole: (roleCode: string) => void
  getRolePermissions: (roleCode?: string) => string[]
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export const useRole = () => {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}

interface RoleProviderProps {
  children: ReactNode
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const { user, getCurrentRole, switchRole: authSwitchRole, hasPermission: authHasPermission } = useAuth()

  const currentRole = getCurrentRole()
  const availableRoles = user?.roles || []

  const hasPermission = (permission: string): boolean => {
    if (!currentRole) return false
    const rolePermissions = ROLE_PERMISSIONS[currentRole.code] || []
    return rolePermissions.includes(permission)
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission))
  }

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission))
  }

  const canAccessRoute = (route: string): boolean => {
    if (!currentRole) return false
    
    // Check exact route match first
    const routeRoles = NAVIGATION_PERMISSIONS[route]
    if (routeRoles) {
      return routeRoles.includes(currentRole.code)
    }
    
    // Check parent routes
    const pathParts = route.split('/').filter(Boolean)
    for (let i = pathParts.length - 1; i > 0; i--) {
      const parentRoute = '/' + pathParts.slice(0, i).join('/')
      const parentRoles = NAVIGATION_PERMISSIONS[parentRoute]
      if (parentRoles) {
        return parentRoles.includes(currentRole.code)
      }
    }
    
    return false
  }

  const canPerformAction = (action: string, resource?: string): boolean => {
    if (!currentRole) return false
    
    const permission = resource ? `${resource}.${action}` : action
    return hasPermission(permission)
  }

  const switchRole = (roleCode: string) => {
    authSwitchRole(roleCode)
  }

  const getRolePermissions = (roleCode?: string): string[] => {
    const targetRoleCode = roleCode || currentRole?.code
    if (!targetRoleCode) return []
    return ROLE_PERMISSIONS[targetRoleCode] || []
  }

  const value: RoleContextType = {
    currentRole,
    availableRoles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    canPerformAction,
    switchRole,
    getRolePermissions
  }

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  )
}

export { RoleContext }
export type { RoleContextType }