
"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Room, RoomStatus } from "@/types/asset";
import { Building, Edit, Trash2, Plus, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableColumn } from "@/components/ui/table";

// Mock data (có thể thay bằng API sau này)
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
  }
];

const statusLabels = {
  [RoomStatus.ACTIVE]: "Đang hoạt động",
  [RoomStatus.INACTIVE]: "Ngừng hoạt động"
};

const statusVariants = {
  [RoomStatus.ACTIVE]: "default",
  [RoomStatus.INACTIVE]: "destructive"
};

export default function RoomListPage() {
  const params = useParams();
  const unitId = params?.id as string;
  const [rooms, setRooms] = useState(mockRooms);
  const filteredRooms = rooms.filter(room => room.unitId === unitId);

  const handleEditRoom = (room: Room) => {
    window.location.href = `/unit/${unitId}/room/${room.id}/edit`;
  };

  const handleDeleteRoom = (room: Room) => {
    if (confirm(`Bạn có chắc chắn muốn xóa phòng "${room.name}"?`)) {
      setRooms(prev => prev.filter(r => r.id !== room.id));
    }
  };

  const columns: TableColumn<Room>[] = [
    {
      key: 'name',
      title: 'Tên phòng',
      render: (_, record) => (
        <div className="flex items-center">
          <Building className="h-5 w-5 text-gray-400 mr-3" />
          <span className="font-medium text-gray-900">{record.name}</span>
        </div>
      ),
    },
    {
      key: 'location',
      title: 'Vị trí',
      render: (_, record) => (
        <div className="text-sm">
          <div>Tòa {record.building}</div>
          <div className="text-gray-500">Tầng {record.floor}</div>
        </div>
      ),
    },
    {
      key: 'adjacentRooms',
      title: 'Phòng cạnh bên',
      render: (_, record) => (
        record.adjacentRooms && record.adjacentRooms.length > 0 ? (
          <div className="flex items-center gap-1">
            <ArrowLeftRight className="h-3 w-3 text-gray-400" />
            <Badge variant="outline" className="text-xs">
              {record.adjacentRooms.length} phòng
            </Badge>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Không có</span>
        )
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (_, record) => (
        <Badge variant={statusVariants[record.status] as any}>
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
            onClick={() => handleEditRoom(record)}
            title="Chỉnh sửa"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteRoom(record)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
            title="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href={`/unit`} className="inline-flex items-center gap-2">
          <Button variant="outline" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Quay lại danh sách đơn vị
          </Button>
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách phòng quản lý</h1>
          <p className="text-gray-600">Các phòng thuộc đơn vị hiện tại - Quản lý phòng và chọn phòng cạnh bên</p>
        </div>
        <Link href={`/unit/${unitId}/room/create`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm phòng
          </Button>
        </Link>
      </div>

      <Table<Room>
        columns={columns}
        data={filteredRooms}
        emptyText="Không có phòng nào"
        emptyIcon={<Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
      />
    </div>
  );
}
