"use client";

import React, { useState } from "react";
import { Search, Plus, Edit, Trash2, Building, Phone, Mail, User, Eye } from "lucide-react";
import Link from "next/link";
import { Unit, UnitType, UnitStatus } from "@/types/asset";
import { Room, RoomStatus } from "@/types/asset";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock data
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
  },
  {
    id: "unit4",
    name: "Khoa Kế toán",
    phone: "0234567893",
    email: "ketoan@iuh.edu.vn",
    type: UnitType.DON_VI_SU_DUNG,
    representativeId: "user4",
    status: UnitStatus.INACTIVE,
    createdBy: "admin",
    createdAt: "2024-01-13T08:00:00Z",
    updatedAt: "2024-01-13T08:00:00Z"
  }
];

const unitTypeLabels = {
  [UnitType.PHONG_KE_HOACH_DAU_TU]: "Phòng kế hoạch đầu tư",
  [UnitType.PHONG_QUAN_TRI]: "Phòng quản trị",
  [UnitType.DON_VI_SU_DUNG]: "Đơn vị sử dụng"
};

const statusColors = {
  [UnitStatus.ACTIVE]: "bg-green-100 text-green-800",
  [UnitStatus.INACTIVE]: "bg-red-100 text-red-800"
};

const statusLabels = {
  [UnitStatus.ACTIVE]: "Đang hoạt động",
  [UnitStatus.INACTIVE]: "Ngừng hoạt động"
};

// Mock rooms data
const mockRooms: Room[] = [
  {
    id: "room1",
    name: "Phòng IT 09",
    building: "B",
    floor: "1",
    roomNumber: "Phòng IT 09",
    status: RoomStatus.ACTIVE,
    unitId: "unit3",
    createdBy: "admin",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z"
  },
  {
    id: "room2",
    name: "Phòng Kế toán 10",
    building: "B",
    floor: "1",
    roomNumber: "Phòng Kế toán 10",
    status: RoomStatus.ACTIVE,
    unitId: "unit4",
    createdBy: "admin",
    createdAt: "2024-01-11T08:00:00Z",
    updatedAt: "2024-01-11T08:00:00Z"
  },
  {
    id: "room3",
    name: "Phòng Nhân sự 05",
    building: "B",
    floor: "2",
    roomNumber: "Phòng Nhân sự 05",
    status: RoomStatus.ACTIVE,
    unitId: "unit1",
    createdBy: "admin",
    createdAt: "2024-01-12T08:00:00Z",
    updatedAt: "2024-01-12T08:00:00Z"
  },
  {
    id: "room4",
    name: "Phòng họp 301",
    building: "A",
    floor: "3",
    roomNumber: "Phòng họp 301",
    status: RoomStatus.INACTIVE,
    unitId: "unit1",
    createdBy: "admin",
    createdAt: "2024-01-13T08:00:00Z",
    updatedAt: "2024-01-13T08:00:00Z"
  },
  {
    id: "room5",
    name: "Phòng thí nghiệm 01",
    building: "C",
    floor: "1",
    roomNumber: "Phòng thí nghiệm 01",
    status: RoomStatus.ACTIVE,
    unitId: "unit3",
    createdBy: "admin",
    createdAt: "2024-01-14T08:00:00Z",
    updatedAt: "2024-01-14T08:00:00Z"
  }
];

export default function UnitsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<UnitType | "">("");
  const [statusFilter, setStatusFilter] = useState<UnitStatus | "">("");
  const [openUnitId, setOpenUnitId] = useState<string | null>(null);
  const router = useRouter();
  const filteredUnits = mockUnits.filter(unit => {
    const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || unit.type === typeFilter;
    const matchesStatus = !statusFilter || unit.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });
  {
    filteredUnits.map((unit) => (
      <>
        <tr key={unit.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <Building className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                <div className="text-sm text-gray-500">ID: {unit.id}</div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">
              <div className="flex items-center mb-1">
                <Phone className="h-4 w-4 text-gray-400 mr-1" />
                {unit.phone}
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-1" />
                {unit.email}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {unitTypeLabels[unit.type]}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[unit.status]}`}>
              {statusLabels[unit.status]}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {new Date(unit.createdAt).toLocaleDateString('vi-VN')}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/unit/${unit.id}/edit`}
                className="text-blue-600 hover:text-blue-900"
                title="Chỉnh sửa"
              >
                <Edit className="h-4 w-4" />
              </Link>
              <button
                className="text-red-600 hover:text-red-900"
                title="Xóa"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>

      </>
    ))
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Đơn vị</h1>
          <p className="text-gray-600">Quản lý thông tin các đơn vị trong trường</p>
        </div>
        <Link href="/unit/create">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            Thêm đơn vị
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên đơn vị..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as UnitType | "")}
          >
            <option value="">Tất cả loại đơn vị</option>
            <option value={UnitType.PHONG_KE_HOACH_DAU_TU}>Phòng kế hoạch đầu tư</option>
            <option value={UnitType.PHONG_QUAN_TRI}>Phòng quản trị</option>
            <option value={UnitType.DON_VI_SU_DUNG}>Đơn vị sử dụng</option>
          </select>

          {/* Status Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as UnitStatus | "")}
          >
            <option value="">Tất cả trạng thái</option>
            <option value={UnitStatus.ACTIVE}>Đang hoạt động</option>
            <option value={UnitStatus.INACTIVE}>Ngừng hoạt động</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600 mb-4">
        Hiển thị {filteredUnits.length} trên tổng số {mockUnits.length} đơn vị
      </div>

      {/* Units Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên đơn vị
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại đơn vị
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUnits.map((unit) => (
                <React.Fragment key={unit.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                          <div className="text-sm text-gray-500">ID: {unit.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <Phone className="h-4 w-4 text-gray-400 mr-1" />
                          {unit.phone}
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-1" />
                          {unit.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {unitTypeLabels[unit.type]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={statusColors[unit.status]}>
                        {statusLabels[unit.status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(unit.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/unit/${unit.id}/edit`} title="Chỉnh sửa">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" title="Xóa">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Xem phòng"
                          onClick={() => {
                            setOpenUnitId(openUnitId === unit.id ? null : unit.id);
                            router.push(`/unit/${unit.id}/room`);
                          }}
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUnits.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đơn vị</h3>
            <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </div>
        )}
      </div>
    </div>
  );
}
