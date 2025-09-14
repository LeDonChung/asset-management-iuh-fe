'use client'

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { logout, clearError } from '@/lib/store/slices/authSlice'
import { Button } from '@/components/ui/button'
import { User, LogOut, Shield, Mail, Phone, Calendar } from 'lucide-react'

export function AuthReduxExample() {
  const dispatch = useAppDispatch()
  const { userLogin, loading, error, isAuthenticated, token } = useAppSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
  }

  const handleClearError = () => {
    dispatch(clearError())
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Redux Auth State Example</h2>
        
        {/* Auth Status */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-5 w-5" />
            <span className="font-medium">Trạng thái xác thực:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              isAuthenticated 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isAuthenticated ? 'Đã đăng nhập' : 'Chưa đăng nhập'}
            </span>
          </div>
          
          {loading && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Đang xử lý...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 flex items-center justify-between">
              <span className="text-red-700 text-sm">{error}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleClearError}
                className="text-red-600 hover:text-red-800"
              >
                Xóa
              </Button>
            </div>
          )}
        </div>

        {/* User Info */}
        {isAuthenticated && userLogin ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Thông tin người dùng</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Thông tin cơ bản</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">ID:</span> {userLogin.user.id}
                  </div>
                  <div>
                    <span className="font-medium">Tên đăng nhập:</span> {userLogin.user.username}
                  </div>
                  <div>
                    <span className="font-medium">Họ tên:</span> {userLogin.user.fullName}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Mail className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Liên hệ</span>
                </div>
                <div className="space-y-2 text-sm">
                  {userLogin.user.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{userLogin.user.email}</span>
                    </div>
                  )}
                  {userLogin.user.phoneNumber && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{userLogin.user.phoneNumber}</span>
                    </div>
                  )}
                  {userLogin.user.birthDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{new Date(userLogin.user.birthDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Roles and Permissions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Vai trò</h4>
                <div className="flex flex-wrap gap-2">
                  {userLogin.user.roles.map((role, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Quyền</h4>
                <div className="flex flex-wrap gap-2">
                  {userLogin.user.permissions.slice(0, 3).map((permission, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs"
                    >
                      {permission}
                    </span>
                  ))}
                  {userLogin.user.permissions.length > 3 && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
                      +{userLogin.user.permissions.length - 3} khác
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Token Info */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Token</h4>
              <div className="text-xs font-mono text-yellow-800 break-all">
                {token ? `${token.substring(0, 50)}...` : 'Không có token'}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4 border-t">
              <Button 
                onClick={handleLogout}
                variant="destructive"
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Chưa đăng nhập</p>
            <p className="text-sm">Vui lòng đăng nhập để xem thông tin</p>
          </div>
        )}
      </div>
    </div>
  )
}
