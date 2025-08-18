'use client'

import React, { useState } from 'react'
import { ChevronDown, User, Shield, Crown, Building2, TrendingUp } from 'lucide-react'
import { useRole } from '@/contexts/RoleContext'
import { Role } from '@/types/asset'

interface RoleSwitcherProps {
  className?: string
  showLabel?: boolean
  variant?: 'default' | 'compact' | 'dropdown'
}

const getRoleIcon = (roleCode: string) => {
  switch (roleCode) {
    case 'SUPER_ADMIN':
      return <Crown className="h-4 w-4 text-yellow-500" />
    case 'ADMIN':
      return <Shield className="h-4 w-4 text-blue-500" />
    case 'PHONG_QUAN_TRI':
      return <Building2 className="h-4 w-4 text-purple-500" />
    case 'PHONG_KE_HOACH_DAU_TU':
      return <TrendingUp className="h-4 w-4 text-orange-500" />
    case 'DON_VI_SU_DUNG':
      return <User className="h-4 w-4 text-green-500" />
    default:
      return <User className="h-4 w-4 text-gray-500" />
  }
}

const getRoleColor = (roleCode: string) => {
  switch (roleCode) {
    case 'SUPER_ADMIN':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    case 'ADMIN': 
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'PHONG_QUAN_TRI':
      return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'PHONG_KE_HOACH_DAU_TU':
      return 'bg-orange-50 text-orange-700 border-orange-200'
    case 'DON_VI_SU_DUNG':
      return 'bg-green-50 text-green-700 border-green-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ 
  className = '',
  showLabel = true,
  variant = 'default'
}) => {
  const { currentRole, availableRoles, switchRole } = useRole()
  const [isOpen, setIsOpen] = useState(false)

  if (!currentRole || availableRoles.length <= 1) {
    // If no role or only one role, show current role without dropdown
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {currentRole && (
          <>
            {getRoleIcon(currentRole.code)}
            {showLabel && (
              <span className={`text-sm font-medium px-2 py-1 rounded-md border ${getRoleColor(currentRole.code)}`}>
                {currentRole.name}
              </span>
            )}
          </>
        )}
      </div>
    )
  }

  const handleRoleSwitch = (role: Role) => {
    switchRole(role.code)
    setIsOpen(false)
  }

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md border transition-colors ${getRoleColor(currentRole.code)} hover:opacity-80`}
        >
          {getRoleIcon(currentRole.code)}
          {showLabel && <span className="text-sm font-medium">{currentRole.name}</span>}
          <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 mt-1 w-full min-w-[150px] bg-white border border-gray-200 rounded-md shadow-lg z-20">
              {availableRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSwitch(role)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    role.code === currentRole.code ? 'bg-gray-50 font-medium' : ''
                  }`}
                >
                  {getRoleIcon(role.code)}
                  <span>{role.name}</span>
                  {role.code === currentRole.code && (
                    <span className="ml-auto text-xs text-gray-500">✓</span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        {showLabel && (
          <span className="text-sm text-gray-600 font-medium">Vai trò:</span>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${getRoleColor(currentRole.code)} hover:opacity-80`}
        >
          {getRoleIcon(currentRole.code)}
          <span className="font-medium">{currentRole.name}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="text-xs text-gray-500 px-2 py-1 mb-1">
                Chuyển đổi vai trò
              </div>
              {availableRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSwitch(role)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors ${
                    role.code === currentRole.code 
                      ? 'bg-gray-50 font-medium border border-gray-200' 
                      : ''
                  }`}
                >
                  {getRoleIcon(role.code)}
                  <div className="flex-1 text-left">
                    <div className="font-medium">{role.name}</div>
                    <div className="text-xs text-gray-500">{role.code}</div>
                  </div>
                  {role.code === currentRole.code && (
                    <span className="text-xs text-green-600">✓ Đang sử dụng</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default RoleSwitcher