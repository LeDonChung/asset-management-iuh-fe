"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, MapPin, Building, Users, Link2 } from "lucide-react";
import Link from "next/link";
import { Room, RoomStatus, Unit, UnitStatus } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AdjacentRoomSelector from "@/components/room/AdjacentRoomSelector";

// Mock data
const mockRoom: Room = {
  id: "room1",
  name: "Phòng IT 09",
  building: "B",
  floor: "1",
  roomNumber: "B109",
  adjacentRooms: ["room2", "room3"], // Đã có sẵn một số phòng cạnh bên
  status: RoomStatus.ACTIVE,
  unitId: "unit2",
  createdBy: "admin",
  createdAt: "2024-01-10T08:00:00Z",
  updatedAt: "2024-01-10T08:00:00Z"
};

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

// Mock rooms để demo
const mockRooms: Room[] = [
  {
    id: "room2",
    name: "Phòng IT 08", 
    building: "B",
    floor: "1",
    roomNumber: "B108",
    status: RoomStatus.ACTIVE,
    unitId: "unit3",
    createdBy: "admin",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z"
  },
  {
    id: "room3",
    name: "Phòng IT 10",
    building: "B", 
    floor: "1",
    roomNumber: "B110",
    status: RoomStatus.ACTIVE,
    unitId: "unit3",
    createdBy: "admin",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z"
  },
  {
    id: "room4",
    name: "Phòng Họp A2",
    building: "A",
    floor: "1", 
    roomNumber: "A102",
    status: RoomStatus.ACTIVE,
    unitId: "unit1",
    createdBy: "admin",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z"
  }
];

interface RoomFormData {
  name: string;
  building: string;
  floor: string;
  roomNumber: string;
  unitId: string;
  status: RoomStatus;
  adjacentRooms: string[];
}

interface FormErrors {
  name?: string;
  building?: string;
  floor?: string;
  roomNumber?: string;
  unitId?: string;
}

export default function EditRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [formData, setFormData] = useState<RoomFormData>({
    name: mockRoom.name,
    building: mockRoom.building || '',
    floor: mockRoom.floor,
    roomNumber: mockRoom.roomNumber || mockRoom.name,
    unitId: mockRoom.unitId || '',
    status: mockRoom.status,
    adjacentRooms: mockRoom.adjacentRooms || []
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Tên phòng là bắt buộc";
    if (!formData.building.trim()) newErrors.building = "Tòa nhà là bắt buộc";
    if (!formData.floor.trim()) newErrors.floor = "Tầng là bắt buộc";
    if (!formData.roomNumber.trim()) newErrors.roomNumber = "Số phòng là bắt buộc";
    if (!formData.unitId) newErrors.unitId = "Đơn vị là bắt buộc";

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Updating room:", formData);
        router.push(`/unit/${mockRoom.unitId}/room`);
      } catch (error) {
        console.error("Error updating room:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleChange = (field: keyof RoomFormData, value: string | RoomStatus | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleToggleAdjacentRoom = (roomId: string) => {
    setFormData(prev => ({
      ...prev,
      adjacentRooms: prev.adjacentRooms.includes(roomId)
        ? prev.adjacentRooms.filter(id => id !== roomId)
        : [...prev.adjacentRooms, roomId]
    }));
  };

  const handleRemoveAdjacentRoom = (roomId: string) => {
    setFormData(prev => ({
      ...prev,
      adjacentRooms: prev.adjacentRooms.filter(id => id !== roomId)
    }));
  };

  // Lọc các phòng có thể chọn làm hàng xóm (cùng tòa hoặc cùng tầng)
  const getAvailableAdjacentRooms = () => {
    if (!formData.building && !formData.floor) return [];
    
    return mockRooms.filter(room => {
      // Loại bỏ chính phòng đang edit
      if (room.id === mockRoom.id) return false;
      
      // Loại bỏ phòng cùng unit để tránh chọn nhầm
      if (room.unitId === formData.unitId) return false;
      
      // Ưu tiên phòng cùng tòa nhà
      if (formData.building && room.building === formData.building) return true;
      
      // Hoặc cùng tầng (có thể khác tòa nhưng cùng tầng)
      if (formData.floor && room.floor === formData.floor) return true;
      
      return false;
    });
  };

  const currentUnit = mockUnits.find(u => u.id === formData.unitId);

  const statusVariant = 
    formData.status === RoomStatus.ACTIVE ? 'default' :
    formData.status === RoomStatus.INACTIVE ? 'destructive' : 'secondary';

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/unit/${mockRoom.unitId}/room`}>
          <Button variant="ghost" size="sm" className="p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cập nhật phòng</h1>
          <p className="text-gray-600">Chỉnh sửa thông tin: {mockRoom.roomNumber}</p>
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
                Thông tin cơ bản
              </h3>
              
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên phòng *
                  </label>
                  <Input
                    type="text"
                    className={errors.name ? 'border-red-500' : ''}
                    placeholder="Nhập tên phòng (VD: Phòng IT 09, Phòng Họp A1)"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Building */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tòa nhà *
                    </label>
                    <Input
                      type="text"
                      className={errors.building ? 'border-red-500' : ''}
                      placeholder="VD: A, B, C"
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
                      placeholder="VD: 1, 2, 3"
                      value={formData.floor}
                      onChange={(e) => handleChange('floor', e.target.value)}
                    />
                    {errors.floor && (
                      <p className="text-red-500 text-sm mt-1">{errors.floor}</p>
                    )}
                  </div>

                  {/* Room Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số phòng *
                    </label>
                    <Input
                      type="text"
                      className={errors.roomNumber ? 'border-red-500' : ''}
                      placeholder="VD: 101, B09"
                      value={formData.roomNumber}
                      onChange={(e) => handleChange('roomNumber', e.target.value)}
                    />
                    {errors.roomNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.roomNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Room Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Đơn vị & Trạng thái
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đơn vị quản lý *
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
                <Link2 className="h-5 w-5" />
                Phòng cạnh bên (tùy chọn)
              </h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <AdjacentRoomSelector
                  availableRooms={getAvailableAdjacentRooms()}
                  selectedRoomIds={formData.adjacentRooms}
                  onToggleRoom={handleToggleAdjacentRoom}
                  onRemoveRoom={handleRemoveAdjacentRoom}
                />
                
                {formData.building || formData.floor ? (
                  <p className="text-xs text-gray-600 mt-2">
                    Hiển thị các phòng cùng tòa "{formData.building}" hoặc cùng tầng "{formData.floor}"
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">
                    Nhập thông tin tòa nhà và tầng để xem các phòng có thể chọn làm hàng xóm
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật phòng"}
              </Button>
              <Link href={`/unit/${mockRoom.unitId}/room`} className="flex-1">
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
