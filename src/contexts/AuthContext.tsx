'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Role, UserStatus } from '@/types/asset'

// Mock roles data
const MOCK_ROLES: Role[] = [
  { id: '1', name: 'Super Admin', code: 'SUPER_ADMIN' },
  { id: '2', name: 'Admin', code: 'ADMIN' },
  { id: '3', name: 'Phòng Quản Trị', code: 'PHONG_QUAN_TRI' },
  { id: '4', name: 'Phòng Kế Hoạch Đầu Tư', code: 'PHONG_KE_HOACH_DAU_TU' },
  { id: '5', name: 'Đơn Vị Sử Dụng', code: 'DON_VI_SU_DUNG' }
]

// Mock users data
const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'superadmin',
    fullName: 'Super Administrator',
    email: 'superadmin@iuh.edu.vn',
    phoneNumber: '0123456789',
    birthDate: '1990-01-01',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [MOCK_ROLES[0]] // SUPER_ADMIN
  },
  {
    id: '2', 
    username: 'admin',
    fullName: 'Quản Trị Viên Hệ Thống',
    email: 'admin@iuh.edu.vn',
    phoneNumber: '0987654321',
    birthDate: '1992-05-15',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [MOCK_ROLES[1]] // ADMIN
  },
  {
    id: '3',
    username: 'quantri',
    fullName: 'Nguyễn Văn Quản Trị',
    email: 'quantri@iuh.edu.vn',
    phoneNumber: '0555666777',
    birthDate: '1985-03-20',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [MOCK_ROLES[2]] // PHONG_QUAN_TRI
  },
  {
    id: '4',
    username: 'kehoach',
    fullName: 'Trần Thị Kế Hoạch',
    email: 'kehoach@iuh.edu.vn',
    phoneNumber: '0444555666',
    birthDate: '1988-07-10',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [MOCK_ROLES[3]] // PHONG_KE_HOACH_DAU_TU
  },
  {
    id: '5',
    username: 'donvi',
    fullName: 'Lê Văn Đơn Vị',
    email: 'donvi@iuh.edu.vn',
    phoneNumber: '0333444555',
    birthDate: '1995-12-05',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [MOCK_ROLES[4]] // DON_VI_SU_DUNG
  }
]

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  switchRole: (roleCode: string) => void
  getCurrentRole: () => Role | null
  hasPermission: (requiredRoles: string[]) => boolean
  refreshUser: () => void
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
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentRoleCode, setCurrentRoleCode] = useState<string>('')

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('auth_user')
        const storedRoleCode = localStorage.getItem('current_role')
        
        if (storedUser) {
          const parsedUser: User = JSON.parse(storedUser)
          setUser(parsedUser)
          
          // Set current role - default to first role if no stored role
          const roleCode = storedRoleCode || parsedUser.roles?.[0]?.code || ''
          setCurrentRoleCode(roleCode)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        localStorage.removeItem('auth_user')
        localStorage.removeItem('current_role')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Find user by username
      const foundUser = MOCK_USERS.find(u => u.username === username)
      
      if (!foundUser) {
        return false
      }
      
      // Simple password validation (in real app, this would be handled by backend)
      const validPasswords: Record<string, string> = {
        'superadmin': 'superadmin123',
        'admin': 'admin123', 
        'quantri': 'quantri123',
        'kehoach': 'kehoach123',
        'donvi': 'donvi123'
      }
      
      if (validPasswords[username] !== password) {
        return false
      }
      
      // Set user and default role
      setUser(foundUser)
      const defaultRoleCode = foundUser.roles?.[0]?.code || ''
      setCurrentRoleCode(defaultRoleCode)
      
      // Store in localStorage and cookies
      localStorage.setItem('auth_user', JSON.stringify(foundUser))
      localStorage.setItem('current_role', defaultRoleCode)
      
      // Set cookie for middleware
      document.cookie = `auth_user=${JSON.stringify(foundUser)}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
      
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setCurrentRoleCode('')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('current_role')
    
    // Remove auth cookie
    document.cookie = 'auth_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  const switchRole = (roleCode: string) => {
    if (!user || !user.roles) return
    
    // Check if user has this role
    const hasRole = user.roles.some(role => role.code === roleCode)
    if (!hasRole) {
      console.warn(`User does not have role: ${roleCode}`)
      return
    }
    
    setCurrentRoleCode(roleCode)
    localStorage.setItem('current_role', roleCode)
  }

  const getCurrentRole = (): Role | null => {
    if (!user || !user.roles || !currentRoleCode) return null
    return user.roles.find(role => role.code === currentRoleCode) || null
  }

  const hasPermission = (requiredRoles: string[]): boolean => {
    if (!user || !currentRoleCode) return false
    return requiredRoles.includes(currentRoleCode)
  }

  const refreshUser = () => {
    // In real app, this would fetch fresh user data from API
    const storedUser = localStorage.getItem('auth_user')
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser)
      setUser(parsedUser)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    switchRole,
    getCurrentRole,
    hasPermission,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
export type { AuthContextType }
