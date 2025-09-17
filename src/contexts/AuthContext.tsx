'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import Cookies from 'js-cookie'
import { UserLoginResponse } from '@/lib/store/slices/authSlice'
interface AuthContextType {
  user: UserLoginResponse | null
  isLoading: boolean
  isAuthenticated: boolean
  hasPermission: (requiredRoles: string[]) => boolean
  hasAnyPermission: (requiredPermissions: string[]) => boolean
  hasAllPermissions: (requiredPermissions: string[]) => boolean
  getUserPermissions: () => string[]
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
          permissions: userData.permissions
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

  const hasPermission = (requiredRoles: string[]): boolean => {
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

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
export type { AuthContextType }
