'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Cookies from 'js-cookie'
import { UserLoginResponse } from '@/lib/store/slices/authSlice'
import { AccessScopeType, Unit } from '@/types/asset'
interface AuthContextType {
  user: UserLoginResponse | null
  isLoading: boolean
  isAuthenticated: boolean
  hasRole: (requiredRoles: string[]) => boolean
  hasAnyPermission: (requiredPermissions: string[]) => boolean
  hasAllPermissions: (requiredPermissions: string[]) => boolean
  getUserPermissions: () => string[]
  getAccessibleUnits: (allUnits: Unit[]) => Unit[]
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserLoginResponse | null>(null)
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load user từ storage
  const loadUserFromStorage = () => {
    try {
      const token = localStorage.getItem('token')
      const userStorage = localStorage.getItem('user')

      if (token && userStorage) {
        const userData = JSON.parse(userStorage)

        // Convert từ Redux user format sang legacy User format
        const legacyUser: UserLoginResponse = {
          id: userData.id,
          username: userData.username,
          fullName: userData.fullName,
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          birthDate: userData.birthDate || '',
          roles: userData.roles,
          permissions: userData.permissions,
          accessScopeTypes: userData.accessScopeTypes || [],
          unitId: userData.unitId || '',
          unitName: userData.unitName
        }
        console.log(legacyUser)
        setUser(legacyUser)

        setUserPermissions(userData.permissions || [])

        return true
      } else {
        setUser(null)
        setUserPermissions([])
        return false
      }
    } catch (error) {
      console.error('Error loading auth:', error)
      // Clear corrupted data
      Cookies.remove('token')
      localStorage.removeItem('user')
      setUser(null)
      setUserPermissions([])
      return false
    }
  }

  // Khởi tạo từ localStorage
  useEffect(() => {
    loadUserFromStorage()
    setIsLoading(false)
  }, [])

  // Listen for storage changes (khi Redux update)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        loadUserFromStorage()
      }
    }

    // Listen for custom storage events (từ Redux)
    const handleCustomStorageChange = () => {
      loadUserFromStorage()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('auth-storage-change', handleCustomStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth-storage-change', handleCustomStorageChange)
    }
  }, [])

  const hasRole = (requiredRoles: string[]): boolean => {
    if (!user || !user.roles) return false
    return requiredRoles.some(role => user.roles.includes(role))
  }

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    if (!userPermissions.length) return false
    return requiredPermissions.some(permission => userPermissions.includes(permission))
  }

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => userPermissions.includes(permission))
  }

  const getUserPermissions = (): string[] => {
    return userPermissions
  }

  const getAccessibleUnits = (allUnits: Unit[]): Unit[] => {
    if (!user || !user.accessScopeTypes) return []

    const accessScopeTypes = user.accessScopeTypes

    if (accessScopeTypes.length === 0) return []

    // Nếu có bất kỳ scope nào là GLOBAL, return tất cả units
    if (accessScopeTypes.includes(AccessScopeType.GLOBAL)) {
      return allUnits
    }

    const accessibleUnits: Unit[] = []

    accessScopeTypes.forEach(scopeType => {
      switch (scopeType) {
        case AccessScopeType.UNIT:
          // Chỉ unit của user đăng nhập
          if (user.unitId) {
            const unit = allUnits.find(u => u.id === user.unitId)
            if (unit && !accessibleUnits.find(au => au.id === unit.id)) {
              accessibleUnits.push(unit)
            }
          }
          break

        case AccessScopeType.CHILD_UNITS:
          // Unit của user và các unit con
          if (user.unitId) {
            const parentUnit = allUnits.find(u => u.id === user.unitId)
            if (parentUnit && !accessibleUnits.find(au => au.id === parentUnit.id)) {
              accessibleUnits.push(parentUnit)
            }
            
            // Thêm các unit con
            const childUnits = allUnits.filter(u => u.parentUnitId === user.unitId)
            childUnits.forEach(child => {
              if (!accessibleUnits.find(au => au.id === child.id)) {
                accessibleUnits.push(child)
              }
            })
          }
          break

        case AccessScopeType.SELF:
          // Chỉ unit của chính user (giống UNIT)
          if (user.unitId) {
            const userUnit = allUnits.find(u => u.id === user.unitId)
            if (userUnit && !accessibleUnits.find(au => au.id === userUnit.id)) {
              accessibleUnits.push(userUnit)
            }
          }
          break
      }
    })

    return accessibleUnits
  }

  const logout = () => {
    Cookies.remove('token')
    localStorage.removeItem('user')
    setUser(null)
    setUserPermissions([])
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    getAccessibleUnits,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
export type { AuthContextType }
