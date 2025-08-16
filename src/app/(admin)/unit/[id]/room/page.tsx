
"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Room, RoomStatus, Unit } from "@/types/asset";
import { Building, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  [RoomStatus.INACTIVE]: "Ngừng hoạt động",
  [RoomStatus.MAINTENANCE]: "Bảo trì"
};

const statusVariants = {
  [RoomStatus.ACTIVE]: "default",
  [RoomStatus.INACTIVE]: "destructive",
  [RoomStatus.MAINTENANCE]: "secondary"
};

export default function RoomListPage() {
  const params = useParams();
  const unitId = params?.id as string;
  const rooms = mockRooms.filter(room => room.unitId === unitId);

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
          <p className="text-gray-600">Các phòng thuộc đơn vị hiện tại</p>
        </div>
        <Link href={`/unit/${unitId}/room/create`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm phòng
          </Button>
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên phòng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tòa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tầng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">Không có phòng nào</td>
                </tr>
              ) : (
                rooms.map(room => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="font-medium text-gray-900">{room.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{room.building}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{room.floor}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={statusVariants[room.status] as any}>
                        {statusLabels[room.status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(room.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/unit/${unitId}/room/${room.id}/edit`}
                          title="Chỉnh sửa"
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
