"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, MapPin, Building, Users } from "lucide-react";
import Link from "next/link";
import { RoomStatus, Unit, UnitStatus } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock units
const mockUnits: Unit[] = [
  {
    id: "unit1",
    name: "Phòng Kế hoạch Đầu tư",
    phone: "0234567890",
    email: "kehoach@iuh.edu.vn",
    type: "phòng_kế_hoạch_đầu_tư" as any,
    representativeId: "user1",
    status: UnitStatus.ACTIVE,
    createdBy: "admin",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z"
  },
  {
    id: "unit2",
    name: "Khoa Công nghệ Thông tin",
    phone: "0234567892",
    email: "cntt@iuh.edu.vn",
    type: "đơn_vị_sử_dụng" as any,
    representativeId: "user3",
    status: UnitStatus.ACTIVE,
    createdBy: "admin",
    createdAt: "2024-01-12T08:00:00Z",
    updatedAt: "2024-01-12T08:00:00Z"
  },
  {
    id: "unit3",
    name: "Khoa Kế toán",
    phone: "0234567893",
    email: "ketoan@iuh.edu.vn",
    type: "đơn_vị_sử_dụng" as any,
    representativeId: "user4",
    status: UnitStatus.ACTIVE,
    createdBy: "admin",
    createdAt: "2024-01-13T08:00:00Z",
    updatedAt: "2024-01-13T08:00:00Z"
  }
];

interface RoomFormData {
  building: string;
  floor: string;
  roomNumber: string;
  unitId: string;
  status: RoomStatus;
}

interface FormErrors {
  building?: string;
  floor?: string;
  roomNumber?: string;
  unitId?: string;
}

export default function CreateRoomPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RoomFormData>({
    building: "",
    floor: "",
    roomNumber: "",
    unitId: "",
    status: RoomStatus.ACTIVE
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: FormErrors = {};
    if (!formData.building.trim()) newErrors.building = "Tòa nhà là bắt buộc";
    if (!formData.floor.trim()) newErrors.floor = "Tầng là bắt buộc";
    if (!formData.roomNumber.trim()) newErrors.roomNumber = "Tên phòng là bắt buộc";
    if (!formData.unitId) newErrors.unitId = "Đơn vị là bắt buộc";

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Creating room:", formData);
        router.push("/room");
      } catch (error) {
        console.error("Error creating room:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (field: keyof RoomFormData, value: string | RoomStatus) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/room">
          <Button variant="ghost" size="sm" className="p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm phòng mới</h1>
          <p className="text-gray-600">Nhập thông tin phòng/lớp học mới</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Thông tin vị trí
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Building */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tòa nhà *
                  </label>
                  <Input
                    type="text"
                    className={errors.building ? 'border-red-500' : ''}
                    placeholder="Nhập tòa nhà (VD: A, B, C)"
                    value={formData.building}
                    onChange={(e) => handleChange('building', e.target.value)}
                  />
                  {errors.building && (
                    <p className="text-red-500 text-sm mt-1">{errors.building}</p>
                  )}
                </div>

                {/* Floor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tầng *
                  </label>
                  <Input
                    type="text"
                    className={errors.floor ? 'border-red-500' : ''}
                    placeholder="Nhập số tầng (VD: 1, 2, 3)"
                    value={formData.floor}
                    onChange={(e) => handleChange('floor', e.target.value)}
                  />
                  {errors.floor && (
                    <p className="text-red-500 text-sm mt-1">{errors.floor}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Room Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Thông tin phòng
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Room Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên/Số phòng *
                  </label>
                  <Input
                    type="text"
                    className={errors.roomNumber ? 'border-red-500' : ''}
                    placeholder="Nhập tên hoặc số phòng (VD: Phòng IT 09, 101, P.Meeting)"
                    value={formData.roomNumber}
                    onChange={(e) => handleChange('roomNumber', e.target.value)}
                  />
                  {errors.roomNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.roomNumber}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value as RoomStatus)}
                  >
                    <option value={RoomStatus.ACTIVE}>Đang hoạt động</option>
                    <option value={RoomStatus.INACTIVE}>Ngừng hoạt động</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Unit Assignment */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Đơn vị quản lý
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn đơn vị *
                </label>
                <select
                  className={`w-full rounded-md border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    errors.unitId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.unitId}
                  onChange={(e) => handleChange('unitId', e.target.value)}
                >
                  <option value="">Chọn đơn vị quản lý</option>
                  {mockUnits
                    .filter(unit => unit.status === UnitStatus.ACTIVE)
                    .map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                </select>
                {errors.unitId && (
                  <p className="text-red-500 text-sm mt-1">{errors.unitId}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Chỉ hiển thị các đơn vị đang hoạt động
                </p>
              </div>
            </div>

            {/* Preview */}
            {formData.building && formData.floor && formData.roomNumber && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Xem trước</h4>
                <div className="text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {formData.roomNumber} - Tòa {formData.building}, Tầng {formData.floor}
                    </span>
                  </div>
                  {formData.unitId && (
                    <div className="flex items-center gap-2 mt-2">
                      <Users className="h-4 w-4" />
                      <span>
                        Thuộc: {mockUnits.find(u => u.id === formData.unitId)?.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Đang lưu..." : "Lưu phòng"}
              </Button>
              <Link href="/room" className="flex-1">
                <Button variant="secondary" className="w-full">
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
