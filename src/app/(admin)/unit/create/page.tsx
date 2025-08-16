"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Building, Phone, Mail, User } from "lucide-react";
import Link from "next/link";
import { UnitType, UnitStatus, User as UserType } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock users for representative selection
const mockUsers: UserType[] = [
  {
    id: "user1",
    username: "nguyen.van.a",
    email: "nguyen.van.a@iuh.edu.vn",
    fullName: "Nguyễn Văn A",
    phoneNumber: "0901234567",
    birthDate: "1980-01-15",
    status: "ACTIVE" as any,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "user2", 
    username: "tran.thi.b",
    email: "tran.thi.b@iuh.edu.vn",
    fullName: "Trần Thị B",
    phoneNumber: "0901234568",
    birthDate: "1985-03-20",
    status: "ACTIVE" as any,
    createdAt: "2024-01-01T00:00:00Z", 
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "user3",
    username: "le.van.c",
    email: "le.van.c@iuh.edu.vn", 
    fullName: "Lê Văn C",
    phoneNumber: "0901234569",
    birthDate: "1978-07-10",
    status: "ACTIVE" as any,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
];

interface UnitFormData {
  name: string;
  phone: string;
  email: string;
  type: UnitType | "";
  representativeId: string;
  status: UnitStatus;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  type?: string;
  representativeId?: string;
}

export default function CreateUnitPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<UnitFormData>({
    name: "",
    phone: "",
    email: "",
    type: "",
    representativeId: "",
    status: UnitStatus.ACTIVE
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Tên đơn vị là bắt buộc";
    if (!formData.phone.trim()) newErrors.phone = "Số điện thoại là bắt buộc";
    if (!formData.email.trim()) newErrors.email = "Email là bắt buộc";
    if (!formData.type) newErrors.type = "Loại đơn vị là bắt buộc";
    if (!formData.representativeId) newErrors.representativeId = "Người đại diện là bắt buộc";

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không đúng định dạng";
    }

    // Phone validation
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải có 10-11 số";
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Creating unit:", formData);
        router.push("/admin/unit");
      } catch (error) {
        console.error("Error creating unit:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (field: keyof UnitFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/unit">
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm đơn vị mới</h1>
          <p className="text-gray-600">Nhập thông tin đơn vị mới</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Thông tin cơ bản
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Unit Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên đơn vị *
                  </label>
                  <Input
                    type="text"
                    className={errors.name ? 'border-red-500' : ''}
                    placeholder="Nhập tên đơn vị"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Unit Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại đơn vị *
                  </label>
                  <div className={`relative ${errors.type ? 'border-red-500' : 'border-gray-300'}`}>
                    <select
                      className="w-full px-3 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.type}
                      onChange={(e) => handleChange('type', e.target.value)}
                    >
                      <option value="">Chọn loại đơn vị</option>
                      <option value={UnitType.PHONG_KE_HOACH_DAU_TU}>Phòng kế hoạch đầu tư</option>
                      <option value={UnitType.PHONG_QUAN_TRI}>Phòng quản trị</option>
                      <option value={UnitType.DON_VI_SU_DUNG}>Đơn vị sử dụng</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value as UnitStatus)}
                    >
                      <option value={UnitStatus.ACTIVE}>Đang hoạt động</option>
                      <option value={UnitStatus.INACTIVE}>Ngừng hoạt động</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Thông tin liên hệ
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại *
                  </label>
                  <Input
                    type="tel"
                    className={errors.phone ? 'border-red-500' : ''}
                    placeholder="Nhập số điện thoại"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    className={errors.email ? 'border-red-500' : ''}
                    placeholder="Nhập email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Representative */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Người đại diện
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn người đại diện *
                </label>
                <div className={`relative ${errors.representativeId ? 'border-red-500' : 'border-gray-300'}`}>
                  <select
                    className="w-full px-3 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.representativeId}
                    onChange={(e) => handleChange('representativeId', e.target.value)}
                  >
                    <option value="">Chọn người đại diện</option>
                    {mockUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} - {user.email}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.representativeId && (
                  <p className="text-red-500 text-sm mt-1">{errors.representativeId}</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Đang lưu..." : "Lưu đơn vị"}
              </Button>
              <Link href="/admin/unit" className="flex-1">
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Hủy bỏ
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
