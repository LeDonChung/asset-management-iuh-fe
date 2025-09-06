"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Building,
  Shield,
  Key,
  Lock,
  Unlock
} from "lucide-react";
import { User, UserStatus } from "@/types/asset";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onResetPassword: (userId: string) => void;
  onToggleLock: (userId: string) => void;
}

const statusLabels = {
  [UserStatus.ACTIVE]: "Đang hoạt động",
  [UserStatus.INACTIVE]: "Không hoạt động",
  [UserStatus.LOCKED]: "Đã khóa",
  [UserStatus.DELETED]: "Đã xóa"
};

const statusColors = {
  [UserStatus.ACTIVE]: "bg-green-100 text-green-800",
  [UserStatus.INACTIVE]: "bg-gray-100 text-gray-800",
  [UserStatus.LOCKED]: "bg-red-100 text-red-800",
  [UserStatus.DELETED]: "bg-black text-white"
};

export default function UserDetailModal({
  isOpen,
  onClose,
  user,
  onResetPassword,
  onToggleLock
}: UserDetailModalProps) {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết Người dùng">
      <div className="space-y-6">
        {/* User Info Header */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">{user.fullName}</h3>
            <p className="text-gray-600">@{user.username}</p>
            <Badge className={statusColors[user.status]}>
              {statusLabels[user.status]}
            </Badge>
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 border-b pb-2">
            Thông tin cơ bản
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Số điện thoại</p>
                <p className="font-medium">{user.phoneNumber || "Chưa có"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Ngày sinh</p>
                <p className="font-medium">
                  {user.birthDate ? new Date(user.birthDate).toLocaleDateString('vi-VN') : "Chưa có"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Đơn vị</p>
                <p className="font-medium">{user.unit?.name || "Chưa phân bổ"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Roles */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Vai trò và quyền hạn
          </h4>
          
          {user.roles && user.roles.length > 0 ? (
            <div className="space-y-3">
              {user.roles.map(role => (
                <div key={role.id} className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-blue-900">{role.name}</h5>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {role.code}
                    </Badge>
                  </div>
                  {role.permissions && role.permissions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map(permission => (
                        <Badge 
                          key={permission.id} 
                          variant="outline" 
                          className="text-xs bg-white text-blue-700"
                        >
                          {permission.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Chưa được gán vai trò nào</p>
          )}
        </div>

        {/* System Information */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 border-b pb-2">
            Thông tin hệ thống
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Ngày tạo</p>
              <p className="font-medium">{new Date(user.createdAt).toLocaleString('vi-VN')}</p>
            </div>
            <div>
              <p className="text-gray-600">Cập nhật lần cuối</p>
              <p className="font-medium">{new Date(user.updatedAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 border-b pb-2">
            Hành động nhanh
          </h4>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResetPassword(user.id)}
              className="flex items-center gap-2"
            >
              <Key className="h-4 w-4" />
              Đặt lại mật khẩu
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleLock(user.id)}
              className={`flex items-center gap-2 ${
                user.status === UserStatus.LOCKED
                  ? 'text-green-600 hover:text-green-700'
                  : 'text-orange-600 hover:text-orange-700'
              }`}
            >
              {user.status === UserStatus.LOCKED ? (
                <>
                  <Unlock className="h-4 w-4" />
                  Mở khóa tài khoản
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Khóa tài khoản
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
