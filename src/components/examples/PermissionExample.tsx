'use client'

import { useAuth } from '@/contexts/AuthContext'
import { usePermissions, PermissionConstants } from '@/hooks/usePermissions'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Shield, User, Users, Building, Home, Package, ClipboardList } from 'lucide-react'

export function PermissionExample() {
  const { user, isAuthenticated, getCurrentRole } = useAuth()
  const {
    getUserPermissions,
    canManageUsers,
    canViewUsers,
    canManageAssets,
    canViewAssets,
    canManageInventory,
    canViewInventory,
    canManageRoles,
    canViewRoles
  } = usePermissions()

  const currentRole = getCurrentRole()
  const userPermissions = getUserPermissions()

  if (!isAuthenticated || !user) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Vui lòng đăng nhập để xem thông tin permissions</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Shield className="h-6 w-6 mr-2" />
          Permission System Example
        </h2>

        {/* User Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Thông tin người dùng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>ID:</strong> {user.id}</div>
            <div><strong>Username:</strong> {user.username}</div>
            <div><strong>Full Name:</strong> {user.fullName}</div>
            <div><strong>Email:</strong> {user.email}</div>
          </div>
        </div>

        {/* Current Role */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium mb-2">Role hiện tại</h3>
          {currentRole ? (
            <Badge variant="outline" className="bg-blue-100">
              {currentRole.name} ({currentRole.code})
            </Badge>
          ) : (
            <span className="text-gray-500">Không có role</span>
          )}
        </div>

        {/* All Permissions */}
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium mb-3">Tất cả permissions ({userPermissions.length})</h3>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {userPermissions.map((permission) => (
              <Badge key={permission} variant="outline" className="bg-green-100 text-xs">
                {permission}
              </Badge>
            ))}
          </div>
        </div>

        {/* Permission Checks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* User Management */}
          <Card className="p-4">
            <div className="flex items-center mb-3">
              <User className="h-5 w-5 mr-2" />
              <h4 className="font-medium">User Management</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Can View Users:</span>
                <Badge variant={canViewUsers() ? "default" : "secondary"}>
                  {canViewUsers() ? '✅' : '❌'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Can Manage Users:</span>
                <Badge variant={canManageUsers() ? "default" : "secondary"}>
                  {canManageUsers() ? '✅' : '❌'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Role Management */}
          <Card className="p-4">
            <div className="flex items-center mb-3">
              <Users className="h-5 w-5 mr-2" />
              <h4 className="font-medium">Role Management</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Can View Roles:</span>
                <Badge variant={canViewRoles() ? "default" : "secondary"}>
                  {canViewRoles() ? '✅' : '❌'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Can Manage Roles:</span>
                <Badge variant={canManageRoles() ? "default" : "secondary"}>
                  {canManageRoles() ? '✅' : '❌'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Asset Management */}
          <Card className="p-4">
            <div className="flex items-center mb-3">
              <Package className="h-5 w-5 mr-2" />
              <h4 className="font-medium">Asset Management</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Can View Assets:</span>
                <Badge variant={canViewAssets() ? "default" : "secondary"}>
                  {canViewAssets() ? '✅' : '❌'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Can Manage Assets:</span>
                <Badge variant={canManageAssets() ? "default" : "secondary"}>
                  {canManageAssets() ? '✅' : '❌'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Inventory Management */}
          <Card className="p-4">
            <div className="flex items-center mb-3">
              <ClipboardList className="h-5 w-5 mr-2" />
              <h4 className="font-medium">Inventory Management</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Can View Inventory:</span>
                <Badge variant={canViewInventory() ? "default" : "secondary"}>
                  {canViewInventory() ? '✅' : '❌'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Can Manage Inventory:</span>
                <Badge variant={canManageInventory() ? "default" : "secondary"}>
                  {canManageInventory() ? '✅' : '❌'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Raw Data for Debug */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
            Debug: Raw Permission Data
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify({ userPermissions, currentRole }, null, 2)}
          </pre>
        </details>
      </Card>
    </div>
  )
}
