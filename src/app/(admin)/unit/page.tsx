"use client";

import React, { useState } from "react";
import { Search, Plus, Edit, Trash2, Building, Phone, Mail, Eye } from "lucide-react";
import Link from "next/link";
import { Unit, UnitType, UnitStatus } from "@/types/asset";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";

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

const statusLabels = {
  [UnitStatus.ACTIVE]: "Đang hoạt động",
  [UnitStatus.INACTIVE]: "Ngừng hoạt động"
};

export default function UnitsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<UnitType | "">("");
  const [statusFilter, setStatusFilter] = useState<UnitStatus | "">("");
  const router = useRouter();
  
  const filteredUnits = mockUnits.filter(unit => {
    const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || unit.type === typeFilter;
    const matchesStatus = !statusFilter || unit.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleEditUnit = (unit: Unit) => {
    router.push(`/unit/${unit.id}/edit`);
  };

  const handleViewRooms = (unit: Unit) => {
    router.push(`/unit/${unit.id}/room`);
  };

  const handleDeleteUnit = (unit: Unit) => {
    if (confirm(`Bạn có chắc chắn muốn xóa đơn vị "${unit.name}"?`)) {
      // Handle delete logic here
      console.log("Delete unit:", unit.id);
    }
  };

  const columns: TableColumn<Unit>[] = [
    {
      key: 'name',
      title: 'Tên đơn vị',
      render: (_, record) => (
        <div className="flex items-center">
          <Building className="h-5 w-5 text-gray-400 mr-3" />
          <div>
            <div className="text-sm font-medium text-gray-900">{record.name}</div>
            <div className="text-sm text-gray-500">ID: {record.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      title: 'Liên hệ',
      render: (_, record) => (
        <div className="text-sm text-gray-900">
          <div className="flex items-center mb-1">
            <Phone className="h-4 w-4 text-gray-400 mr-1" />
            {record.phone}
          </div>
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-gray-400 mr-1" />
            {record.email}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      title: 'Loại đơn vị',
      render: (_, record) => (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          {unitTypeLabels[record.type]}
        </Badge>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (_, record) => (
        <Badge 
          className={record.status === UnitStatus.ACTIVE ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
        >
          {statusLabels[record.status]}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      render: (_, record) => new Date(record.createdAt).toLocaleDateString('vi-VN'),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditUnit(record)}
            title="Chỉnh sửa"
          >
            <Edit className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewRooms(record)}
            title="Xem phòng"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteUnit(record)}
            title="Xóa"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

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
            <Input
              placeholder="Tìm kiếm theo tên đơn vị..."
              className="pl-10"
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
      <Table<Unit>
        columns={columns}
        data={filteredUnits}
        emptyText="Không tìm thấy đơn vị"
        emptyIcon={<Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
      />
    </div>
  );
}
