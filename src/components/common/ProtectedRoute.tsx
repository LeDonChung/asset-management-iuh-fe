'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useRole } from '@/contexts/RoleContext'
import { Loader2, AlertCircle } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: string[]
  requiredPermissions?: string[]
  fallbackPath?: string
  showLoading?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackPath = '/login',
  showLoading = true
}) => {
  const { isAuthenticated, isLoading } = useAuth()
  const { currentRole, hasPermission, hasAnyPermission } = useRole()
  const router = useRouter()

  useEffect(() => {
    // If still loading, wait
    if (isLoading) return

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(fallbackPath)
      return
    }

    // Check role requirements
    if (requiredRoles.length > 0 && currentRole) {
      const hasRequiredRole = requiredRoles.includes(currentRole.code)
      if (!hasRequiredRole) {
        router.push('/unauthorized')
        return
      }
    }

    // Check permission requirements
    if (requiredPermissions.length > 0) {
      const hasRequiredPermissions = hasAnyPermission(requiredPermissions)
      if (!hasRequiredPermissions) {
        router.push('/unauthorized')
        return
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    currentRole,
    requiredRoles,
    requiredPermissions,
    router,
    fallbackPath,
    hasAnyPermission
  ])

  // Show loading while checking authentication
  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render children
  if (!isAuthenticated) {
    return null
  }

  // Check role access
  if (requiredRoles.length > 0 && currentRole) {
    const hasRequiredRole = requiredRoles.includes(currentRole.code)
    if (!hasRequiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Không có quyền truy cập
            </h2>
            <p className="text-gray-600">
              Bạn cần có vai trò: {requiredRoles.join(', ')} để truy cập trang này.
            </p>
          </div>
        </div>
      )
    }
  }

  // Check permission access
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = hasAnyPermission(requiredPermissions)
    if (!hasRequiredPermissions) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Không có quyền truy cập
            </h2>
            <p className="text-gray-600">
              Bạn không có quyền thực hiện hành động này.
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

/**
 * Higher-order component for protecting routes
 */
export const withProtectedRoute = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'>
) => {
  const ProtectedComponent = (props: P) => (
    <ProtectedRoute {...options}>
      <WrappedComponent {...props} />
    </ProtectedRoute>
  )

  ProtectedComponent.displayName = `withProtectedRoute(${WrappedComponent.displayName || WrappedComponent.name})`

  return ProtectedComponent
}

export default ProtectedRoute
