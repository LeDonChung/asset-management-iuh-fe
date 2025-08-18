'use client'

import React from 'react'
import { useRole } from '@/contexts/RoleContext'
import { usePermissions } from '@/hooks/usePermissions'

export const RoleInfo: React.FC = () => {
  const { currentRole, getRolePermissions } = useRole()
  const { 
    isSuperAdmin, 
    isAdmin, 
    isPhongQuanTri, 
    isPhongKeHoachDauTu, 
    isDonViSuDung,
    hasAdminAccess,
    hasManagementAccess 
  } = usePermissions()

  if (!currentRole) return null

  const permissions = getRolePermissions()

  const getRoleDescription = () => {
    switch (currentRole.code) {
      case 'SUPER_ADMIN':
        return 'Có quyền truy cập tất cả các chức năng của hệ thống. Có thể quản lý người dùng, cấu hình hệ thống.'
      case 'ADMIN':
        return 'Quản trị viên hệ thống. Có quyền quản lý tài sản, đơn vị, báo cáo và kiểm kê.'
      case 'PHONG_QUAN_TRI':
        return 'Phòng Quản Trị. Có quyền quản lý tài sản, phân bổ, di chuyển và tạo báo cáo.'
      case 'PHONG_KE_HOACH_DAU_TU':
        return 'Phòng Kế Hoạch Đầu Tư. Có quyền xem và tạo tài sản, phân bổ tài sản và xem báo cáo.'
      case 'DON_VI_SU_DUNG':
        return 'Đơn vị sử dụng. Có quyền xem tài sản được phân bổ, tiếp nhận tài sản và xem báo cáo.'
      default:
        return 'Vai trò không xác định.'
    }
  }

  const getBadgeColor = () => {
    if (isSuperAdmin()) return 'bg-yellow-100 text-yellow-800'
    if (isAdmin()) return 'bg-blue-100 text-blue-800'
    if (isPhongQuanTri()) return 'bg-purple-100 text-purple-800'
    if (isPhongKeHoachDauTu()) return 'bg-orange-100 text-orange-800'
    if (isDonViSuDung()) return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="max-w-2xl bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Thông tin vai trò hiện tại</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor()}`}>
            {currentRole.name}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Mô tả vai trò:</h4>
            <p className="text-sm text-gray-600">{getRoleDescription()}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Phân loại quyền:</h4>
            <div className="flex flex-wrap gap-2">
              {hasAdminAccess() && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Quyền Admin
                </span>
              )}
              {hasManagementAccess() && (
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                  Quyền Quản Lý
                </span>
              )}
              {isDonViSuDung() && (
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  Đơn vị sử dụng
                </span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Quyền chi tiết ({permissions.length} quyền):
            </h4>
            <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto">
              {permissions.map((permission) => (
                <span 
                  key={permission} 
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded truncate"
                >
                  {permission}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Role Code: {currentRole.code}</span>
              <span>Role ID: {currentRole.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleInfo
