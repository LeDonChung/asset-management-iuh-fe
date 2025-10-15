
"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Room, RoomStatus } from "@/types/asset";
import { Building, Edit, Trash2, Plus, ArrowLeftRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableColumn } from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { filterRoomByUnitId, RoomFilterRequest } from "@/lib/store/slices/unitSlice";
import toast from "react-hot-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";

const statusLabels = {
  [RoomStatus.ACTIVE]: "Đang hoạt động",
  [RoomStatus.INACTIVE]: "Ngừng hoạt động"
};

const statusVariants = {
  [RoomStatus.ACTIVE]: "default",
  [RoomStatus.INACTIVE]: "destructive"
};

// Room status options for filter dropdown
const roomStatusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: RoomStatus.ACTIVE, label: "Đang hoạt động" },
  { value: RoomStatus.INACTIVE, label: "Ngừng hoạt động" },
];

export default function RoomListPage() {
  const params = useParams();
  const unitId = params?.id as string;
  const dispatch = useAppDispatch();
  
  // Local state for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("");
  const [floorFilter, setFloorFilter] = useState("");

  // Redux state
  const { currentRoomFilter, filteredRooms, roomsLoading } = useAppSelector(state => state.unit);

  // Load rooms on component mount
  useEffect(() => {
    if (unitId) {
      const loadData = () => {
        try {
          dispatch(filterRoomByUnitId({ 
            unitId, 
            filterRequest: currentRoomFilter 
          }));
        } catch (e: any) {
          toast.error(e.message || "Có lỗi xảy ra khi tải dữ liệu phòng.");
        }
      };
      loadData();
    }
  }, [unitId, dispatch]);

  // Handle filter changes
  useEffect(() => {
    if (unitId) {
      handlerRender({
        ...currentRoomFilter,
        search: searchTerm || undefined,
        buildingFilter: buildingFilter || undefined,
        floorFilter: floorFilter || undefined,
      });
    }
  }, [searchTerm, buildingFilter, floorFilter, unitId]);

  const handlerRender = (filterRequest: RoomFilterRequest) => {
    dispatch(filterRoomByUnitId({ unitId, filterRequest }));
  };

  const handleEditRoom = (room: Room) => {
    window.location.href = `/unit/${unitId}/room/${room.id}/edit`;
  };

  const handleDeleteRoom = (room: Room) => {
    if (confirm(`Bạn có chắc chắn muốn xóa phòng "${room.name}"?`)) {
      // TODO: Implement actual delete API call
      console.log("Delete room:", room.id);
      toast.success("Xóa phòng thành công!");
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
      sortable: true,
    },
    {
      key: 'building',
      title: 'Vị trí',
      render: (_, record) => (
        <div className="text-sm">
          <div>Tòa {record.building}</div>
          <div className="text-gray-500">Tầng {record.floor}</div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'adjacentRooms',
      title: 'Phòng cạnh bên',
      render: (_, record) => (
        record.adjacentRooms && record.adjacentRooms.length > 0 ? (
          <div className="flex items-center gap-1">
            {
              record.adjacentRooms.map((adjacentRoom) => (
                <div key={adjacentRoom.id}>
                  <Badge variant="outline" className="text-xs">
                    {adjacentRoom.name}
                  </Badge>
                </div>
              ))
            }
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
      sortable: true,
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (_, record) => (
        <div className="flex justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="h-8 px-3 text-sm">
                Hành động
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditRoom(record);
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <span>Chỉnh sửa</span>
              </DropdownMenuItem>
    
              <DropdownMenuSeparator />
    
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteRoom(record);
                }}
                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-700"
              >
                <span>Xóa</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: 'text-right',
    }
    
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

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo tên phòng, mã phòng..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Building Filter */}
          <Input
            placeholder="Tòa nhà"
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="lg:w-48"
          />

          {/* Floor Filter */}
          <Input
            placeholder="Tầng"
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="lg:w-48"
          />
        </div>
      </div>

      {/* Rooms Table */}
      <Table<Room>
        columns={columns}
        data={filteredRooms.data || []}
        emptyText="Không có phòng nào"
        emptyIcon={<Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />}
        loading={roomsLoading}
        pagination={{
          current: filteredRooms?.pagination?.page || 1,
          pageSize: filteredRooms?.pagination?.limit || 10,
          total: filteredRooms?.pagination?.total || 0,
          onChange: (page, pageSize) => {
            handlerRender({
              ...currentRoomFilter,
              search: searchTerm || undefined,
              buildingFilter: buildingFilter || undefined,
              floorFilter: floorFilter || undefined,
              pagination: {
                currentPage: page,
                itemsPerPage: pageSize,
              },
            });
          },
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50],
          serverSide: true,
        }}
      />
    </div>
  );
}
