"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Building,
  Shield,
  Eye,
  EyeOff,
  Users,
  Settings,
  CheckSquare
} from "lucide-react";
import { User, UserStatus, Role, Unit, UnitType, UnitStatus } from "@/types/asset";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RoleSelectionModal from "@/components/user/RoleSelectionModal";

// Mock data
const mockRoles: Role[] = [
  { id: "1", name: "Quản trị viên", code: "ADMIN" },
  { id: "2", name: "Kế toán", code: "ACCOUNTANT" },
  { id: "3", name: "Nhân viên kiểm kê", code: "INVENTORY_STAFF" },
  { id: "4", name: "Trưởng phòng", code: "DEPARTMENT_HEAD" }
];

const mockUnits: Unit[] = [
  {
    id: "unit1",
    name: "Phòng Kế hoạch Đầu tư",
    phone: "0234567890",
    email: "kehoach@iuh.edu.vn",
    type: UnitType.PHONG_KE_HOACH_DAU_TU,
    representativeId: "user1",
    status: UnitStatus.ACTIVE,
    createdBy: "admin",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z"
  },
  {
    id: "unit2",
    name: "Phòng Quản trị",
    phone: "0234567891",
    email: "quantri@iuh.edu.vn",
    type: UnitType.PHONG_QUAN_TRI,
    representativeId: "user2",
    status: UnitStatus.ACTIVE,
    createdBy: "admin",
    createdAt: "2024-01-11T08:00:00Z",
    updatedAt: "2024-01-11T08:00:00Z"
  },
  {
    id: "unit3",
    name: "Khoa Công nghệ Thông tin",
    phone: "0234567892",
    email: "cntt@iuh.edu.vn",
    type: UnitType.DON_VI_SU_DUNG,
    representativeId: "user3",
    status: UnitStatus.ACTIVE,
    createdBy: "admin",
    createdAt: "2024-01-12T08:00:00Z",
    updatedAt: "2024-01-12T08:00:00Z"
  }
];

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    unitId: "",
    status: UserStatus.ACTIVE,
    password: ""
  });
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleRoleSelection = (roleIds: string[]) => {
    setSelectedRoles(roleIds);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Tài khoản là bắt buộc";
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!formData.unitId) {
      newErrors.unitId = "Đơn vị là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Create user logic here
      const newUser = {
        ...formData,
        id: Date.now().toString(),
        roles: selectedRoles,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Creating user:", newUser);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push("/user");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Có lỗi xảy ra khi tạo người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRoleObjects = mockRoles.filter(role => selectedRoles.includes(role.id));
  const selectedUnit = mockUnits.find(unit => unit.id === formData.unitId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/user">
          <Button variant="ghost" size="icon" className="rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm người dùng mới</h1>
          <p className="text-gray-600">Tạo tài khoản người dùng và phân quyền</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow">
          {/* Form Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Thông tin cơ bản</h3>
                <p className="text-sm text-gray-500">Nhập thông tin cơ bản của người dùng</p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="px-6 py-6 space-y-6">
            {/* Tài khoản và Họ tên */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tài khoản (Mã nhân viên) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="VD: NV001"
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Nhập họ và tên"
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>
            </div>

            {/* Email và Số điện thoại */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="email@iuh.edu.vn"
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    placeholder="0901234567"
                    className="pl-10"
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Ngày sinh và Đơn vị */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày sinh
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn vị <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.unitId}
                    onChange={(e) => handleInputChange("unitId", e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.unitId ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Chọn đơn vị</option>
                    {mockUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
                {errors.unitId && (
                  <p className="text-red-500 text-sm mt-1">{errors.unitId}</p>
                )}
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
              </div>
              <div></div>
            </div>
          </div>
        </div>

        {/* Roles Section */}
        <div className="bg-white rounded-lg shadow">
          {/* Form Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-sm">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Phân quyền</h3>
                <p className="text-sm text-gray-500">Chọn vai trò và quyền hạn cho người dùng</p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="px-6 py-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò
              </label>
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRoleModalOpen(true)}
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Chọn vai trò ({selectedRoles.length})
                  </span>
                  <Settings className="h-4 w-4" />
                </Button>
                
                {selectedRoleObjects.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Đã chọn:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoleObjects.map(role => (
                        <Badge key={role.id} className="bg-purple-100 text-purple-800 flex items-center gap-1">
                          {role.name}
                          <button
                            type="button"
                            onClick={() => setSelectedRoles(prev => prev.filter(id => id !== role.id))}
                            className="ml-1 hover:bg-purple-200 rounded"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value as UserStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={UserStatus.ACTIVE}>Đang hoạt động</option>
                <option value={UserStatus.INACTIVE}>Không hoạt động</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <Link href="/user">
            <Button variant="outline">
              Hủy
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isLoading ? "Đang lưu..." : "Lưu người dùng"}
          </Button>
        </div>
      </form>

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        roles={mockRoles}
        selectedRoleIds={selectedRoles}
        onSave={handleRoleSelection}
      />
    </div>
  );
}
